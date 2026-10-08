import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Avatar } from '@/components/common/Avatar'

interface SuggestedUsersProps {
  currentUserId?: string
}

export const SuggestedUsers = ({ currentUserId }: SuggestedUsersProps) => {
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)

        // Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .limit(10)

        if (profiles) {
          // Strictly exclude the current user
          const filtered = (profiles as Profile[]).filter(
            (p) => p.id !== currentUserId
          )
          setSuggestions(filtered.slice(0, 5))

          // Check which users are already followed
          if (currentUserId) {
            const { data: follows } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', currentUserId)

            const followMap: Record<string, boolean> = {}
            filtered.forEach((p) => {
              followMap[p.id] = follows?.some((f: any) => f.following_id === p.id) || false
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
    if (!currentUserId || currentUserId === userId) return

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
        <button
          onClick={() => navigate('/people')}
          className="text-primary-blue text-xs font-semibold hover:underline"
        >
          See all
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-secondary-text text-sm py-2">Loading...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-center text-secondary-text text-sm py-2">No new suggestions</p>
        ) : (
          suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 hover:bg-light-gray rounded-xl transition-colors"
            >
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-3 flex-1 min-w-0 mr-2"
              >
                <Avatar
                  src={user.avatar_url || undefined}
                  size="sm"
                  alt={user.display_name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-text truncate hover:text-primary-blue transition-colors">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-secondary-text truncate">
                    @{user.username}
                  </p>
                </div>
              </Link>

              {user.id !== currentUserId && (
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    followingMap[user.id]
                      ? 'bg-light-gray text-dark-text hover:bg-gray-300'
                      : 'bg-primary-blue text-white hover:bg-blue-600'
                  }`}
                >
                  {followingMap[user.id] ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
