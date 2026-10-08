import { formatDistanceToNow, format } from 'date-fns'

export const formatTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return 'Unknown'
  }
}

export const formatDate = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return 'Unknown'
  }
}

export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

export const extractHashtags = (text: string): string[] => {
  const regex = /#[\w]+/g
  const matches = text.match(regex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}

export const generateShareUrl = (postId: string): string => {
  return `${window.location.origin}/post/${postId}`
}

export const combinePostContent = (
  title: string | null | undefined,
  body: string | null | undefined
): string => {
  const cleanTitle = (title || '').trim()
  const cleanBody = (body || '').trim()

  if (cleanTitle && cleanBody) {
    return `# ${cleanTitle}\n\n${cleanBody}`
  }
  if (cleanTitle) {
    return `# ${cleanTitle}`
  }
  return cleanBody
}

export const parsePostContent = (
  caption: string | null | undefined
): { title: string | null; body: string | null } => {
  if (!caption || !caption.trim()) {
    return { title: null, body: null }
  }

  const text = caption.trim()

  // Case 0: Explicit Markdown Header # Title
  if (text.startsWith('# ')) {
    const firstNewline = text.indexOf('\n')
    if (firstNewline !== -1) {
      const extractedTitle = text.slice(2, firstNewline).trim()
      const remainingBody = text.slice(firstNewline + 1).trim()
      return {
        title: extractedTitle || null,
        body: remainingBody || null,
      }
    } else {
      return {
        title: text.slice(2).trim(),
        body: null,
      }
    }
  }

  // Case 1: Double newline separation: Title\n\nBody
  if (text.includes('\n\n')) {
    const splitIndex = text.indexOf('\n\n')
    const firstPart = text.slice(0, splitIndex).trim()
    const remainingPart = text.slice(splitIndex + 2).trim()
    if (firstPart && remainingPart && firstPart.length <= 180) {
      return { title: firstPart, body: remainingPart }
    }
  }

  // Case 2: Single newline separation: Title\nBody
  if (text.includes('\n')) {
    const lines = text.split('\n')
    const firstLine = lines[0].trim()
    const restLines = lines.slice(1).join('\n').trim()
    if (firstLine && restLines && firstLine.length <= 140) {
      return { title: firstLine, body: restLines }
    }
  }

  // Case 3: Short single-line title (e.g. "Web Dev", "Programmers", "Forex Trading")
  if (text.length <= 90 && !text.includes('.')) {
    return { title: text, body: null }
  }

  // Case 4: Long text without line breaks
  return { title: null, body: text }
}
