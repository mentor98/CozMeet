import { useState } from 'react'

interface FollowButtonProps {
  isFollowing: boolean
  targetUserId?: string
  currentUserId?: string
  isSelf?: boolean
  onToggle?: (isFollowing: boolean) => void
}

export const FollowButton = ({
  isFollowing,
  targetUserId,
  currentUserId,
  isSelf,
  onToggle,
}: FollowButtonProps) => {
  const [following, setFollowing] = useState(isFollowing)

  // Users cannot follow themselves
  const cannotFollow = isSelf || (targetUserId && currentUserId && targetUserId === currentUserId)
  if (cannotFollow) {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-secondary-text select-none">
        You
      </span>
    )
  }

  const handleClick = () => {
    setFollowing(!following)
    onToggle?.(!following)
  }

  return (
    <button
      onClick={handleClick}
      className={`text-sm font-medium py-1 px-4 rounded-lg transition-colors ${
        following
          ? 'bg-light-gray text-dark-text hover:bg-gray-200'
          : 'btn-primary'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
