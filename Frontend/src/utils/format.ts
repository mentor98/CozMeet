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
