import { useState } from 'react'

interface FollowButtonProps {
  isFollowing: boolean
  onToggle?: (isFollowing: boolean) => void
}

export const FollowButton = ({ isFollowing, onToggle }: FollowButtonProps) => {
  const [following, setFollowing] = useState(isFollowing)

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
