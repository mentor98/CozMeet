import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { FollowButton } from '@/components/common/FollowButton'

interface SuggestedUsersProps {
  currentUserId?: string
}

export const SuggestedUsers = ({ currentUserId }: SuggestedUsersProps) => {
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)

        // Fetch users not followed by current user
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUserId || '')
          .limit(5)

        if (profiles) {
          setSuggestions(profiles as Profile[])

          // Check which users are already followed
          if (currentUserId) {
            const { data: follows } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', currentUserId)

            const followMap: Record<string, boolean> = {}
            profiles.forEach((p) => {
              followMap[p.id] = follows?.some((f) => f.following_id === p.id) || false
            })
            setFollowingMap(followMap)
          }
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err)
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      fetchSuggestions()
    }
  }, [currentUserId])

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return

    try {
      if (followingMap[userId]) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)

        setFollowingMap((prev) => ({ ...prev, [userId]: false }))
      } else {
        // Follow
        await supabase.from('follows').insert([
          {
            follower_id: currentUserId,
            following_id: userId,
          },
        ])

        setFollowingMap((prev) => ({ ...prev, [userId]: true }))
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-dark-text">Suggested For you</h3>
        <button className="text-primary-blue text-sm font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-secondary-text text-sm">Loading...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-center text-secondary-text text-sm">No suggestions</p>
        ) : (
          suggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 hover:bg-light-gray rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Avatar
                  src={user.avatar_url || undefined}
                  size="sm"
                  alt={user.display_name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-text">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-secondary-text">
                    @{user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(user.id)}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  followingMap[user.id]
                    ? 'bg-light-gray text-dark-text hover:bg-gray-300'
                    : 'bg-primary-blue text-white hover:bg-blue-600'
                }`}
              >
                {followingMap[user.id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
