import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Profile } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { Toast } from '@/components/common/Toast'
import { formatCount } from '@/utils/format'
import { updateProfileStats } from '@/services/stats'
import {
  Search,
  Users,
  UserCheck,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export const People = () => {
  const { profile: currentUser } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'following' | 'followers' | 'popular'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // Fetch all profiles and follow states
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true)
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('followers_count', { ascending: false })

        if (error) throw error

        if (profiles) {
          setUsers(profiles as Profile[])
        }

        // Fetch follow relationships for the current user
        if (currentUser?.id) {
          const { data: myFollows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUser.id)

          const map: Record<string, boolean> = {}
          myFollows?.forEach((f: any) => {
            map[f.following_id] = true
          })
          setFollowingMap(map)
        }
      } catch (err) {
        console.error('Error fetching people:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPeople()
  }, [currentUser?.id])

  const handleFollowToggle = async (targetUser: Profile) => {
    if (!currentUser?.id) {
      setToastMessage('Please log in to follow creators')
      return
    }

    // Strictly enforce: users cannot follow themselves
    if (currentUser.id === targetUser.id || currentUser.username === targetUser.username) {
      setToastMessage('You cannot follow yourself!')
      return
    }

    const isFollowing = !!followingMap[targetUser.id]
    setActionLoading((prev) => ({ ...prev, [targetUser.id]: true }))

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUser.id)

        setFollowingMap((prev) => ({ ...prev, [targetUser.id]: false }))
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, followers_count: Math.max(0, u.followers_count - 1) }
              : u
          )
        )
        setToastMessage(`Unfollowed @${targetUser.username}`)
        updateProfileStats(targetUser.id)
        updateProfileStats(currentUser.id)
      } else {
        // Follow
        const { error } = await supabase.from('follows').insert([
          {
            follower_id: currentUser.id,
            following_id: targetUser.id,
          },
        ])

        if (error) {
          setToastMessage(error.message)
          return
        }

        setFollowingMap((prev) => ({ ...prev, [targetUser.id]: true }))
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, followers_count: u.followers_count + 1 }
              : u
          )
        )
        setToastMessage(`Now following @${targetUser.username}! 🎉`)
        updateProfileStats(targetUser.id)
        updateProfileStats(currentUser.id)
      }
    } catch (err: any) {
      console.error('Error toggling follow:', err)
      setToastMessage(err?.message || 'Action failed')
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUser.id]: false }))
    }
  }

  // Filtered users list
  const filteredUsers = useMemo(() => {
    let list = [...users]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (u) =>
          (u.display_name && u.display_name.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.bio && u.bio.toLowerCase().includes(q))
      )
    }

    // Tab filter
    if (filter === 'following') {
      list = list.filter((u) => followingMap[u.id])
    } else if (filter === 'popular') {
      list.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
    }

    return list
  }, [users, searchQuery, filter, followingMap])

  return (
    <div className="bg-light-gray min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
        {/* Toast */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}

        {/* Page Header */}
        <div className="card p-6 sm:p-8 mb-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-blue mb-1">
                <Users size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Community Directory
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight mb-1">
                Discover Creators & Friends
              </h1>
              <p className="text-xs sm:text-sm text-secondary-text">
                Explore profiles across the community, connect with artists, designers, and friends.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text"
              />
              <input
                type="text"
                placeholder="Search by name, @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-gray text-sm text-dark-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'all'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-white text-secondary-text hover:text-dark-text border border-border-gray/70'
              }`}
            >
              <Sparkles size={14} />
              All Creators ({users.length})
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'following'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-white text-secondary-text hover:text-dark-text border border-border-gray/70'
              }`}
            >
              <UserCheck size={14} />
              Following ({Object.values(followingMap).filter(Boolean).length})
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'popular'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-white text-secondary-text hover:text-dark-text border border-border-gray/70'
              }`}
            >
              <Flame size={14} />
              Most Popular
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-light-gray" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-light-gray rounded w-2/3" />
                    <div className="h-3 bg-light-gray rounded w-1/3" />
                  </div>
                </div>
                <div className="h-10 bg-light-gray rounded mb-3" />
                <div className="h-9 bg-light-gray rounded" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary-blue flex items-center justify-center mx-auto mb-3">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-dark-text mb-1">No users found</h3>
            <p className="text-sm text-secondary-text mb-4">
              {searchQuery
                ? `No creators matched "${searchQuery}". Try a different keyword.`
                : 'No users found for this filter.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-outline text-xs px-4 py-2"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isCurrentUser =
                currentUser?.id === user.id ||
                (currentUser?.username &&
                  user.username &&
                  currentUser.username.toLowerCase() === user.username.toLowerCase())
              const isFollowing = !!followingMap[user.id]
              const isPending = !!actionLoading[user.id]

              return (
                <div
                  key={user.id}
                  className={`card p-5 flex flex-col justify-between hover:shadow-md transition-all ${
                    isCurrentUser ? 'ring-2 ring-primary-blue/30 bg-blue-50/20' : ''
                  }`}
                >
                  <div>
                    {/* Top User Info */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <Link
                        to={`/profile/${user.username}`}
                        className="hover:opacity-90 transition-opacity flex-shrink-0"
                      >
                        <Avatar
                          src={user.avatar_url || undefined}
                          size="lg"
                          alt={user.display_name}
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/profile/${user.username}`}
                            className="font-bold text-dark-text text-base truncate hover:text-primary-blue transition-colors block"
                          >
                            {user.display_name}
                          </Link>
                          {isCurrentUser && (
                            <span title="This is your own profile" className="flex-shrink-0">
                              <ShieldCheck size={16} className="text-primary-blue" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-text truncate">
                          @{user.username}
                        </p>
                        {isCurrentUser && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-primary-blue text-[10px] font-bold uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-dark-text/90 line-clamp-2 min-h-[2rem] mb-4">
                      {user.bio || 'Community member at CozMeet'}
                    </p>

                    {/* Stats counters */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-50 border border-border-gray/50 mb-4 text-center">
                      <div>
                        <div className="text-xs font-bold text-dark-text">
                          {formatCount(user.posts_count || 0)}
                        </div>
                        <div className="text-[10px] text-secondary-text uppercase">Posts</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-dark-text">
                          {formatCount(user.followers_count || 0)}
                        </div>
                        <div className="text-[10px] text-secondary-text uppercase">Followers</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-dark-text">
                          {formatCount(user.following_count || 0)}
                        </div>
                        <div className="text-[10px] text-secondary-text uppercase">Following</div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-border-gray/60 flex items-center justify-between gap-2">
                    <Link
                      to={`/profile/${user.username}`}
                      className="text-xs font-semibold text-secondary-text hover:text-primary-blue flex items-center gap-1 transition-colors"
                    >
                      <span>View Profile</span>
                      <ArrowRight size={13} />
                    </Link>

                    {/* FOLLOW / UNFOLLOW BUTTON OR 'YOU' BADGE */}
                    {isCurrentUser ? (
                      <span className="px-3.5 py-1.5 rounded-lg bg-gray-100 text-secondary-text text-xs font-medium cursor-not-allowed select-none">
                        Cannot follow self
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFollowToggle(user)}
                        disabled={isPending}
                        className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${
                          isFollowing
                            ? 'bg-light-gray text-dark-text border border-border-gray hover:bg-gray-200'
                            : 'bg-primary-blue text-white hover:bg-blue-600 shadow-sm'
                        }`}
                      >
                        {isPending
                          ? 'Updating...'
                          : isFollowing
                          ? '✓ Following'
                          : '+ Follow'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
