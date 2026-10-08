import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { PostCard } from '@/components/feed/PostCard'
import { PostSkeleton } from '@/components/common/LoadingSkeleton'
import { Avatar } from '@/components/common/Avatar'
import { Toast } from '@/components/common/Toast'
import { formatCount } from '@/utils/format'
import { Compass, Users, Sparkles, Search, ArrowRight } from 'lucide-react'

export const Explore = () => {
  const { profile: currentUser } = useAuth()
  const { posts, loading: postsLoading } = usePosts(undefined, 'popular')
  const [activeTab, setActiveTab] = useState<'posts' | 'people'>('posts')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // People discovery state
  const [people, setPeople] = useState<Profile[]>([])
  const [peopleLoading, setPeopleLoading] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const [peopleSearch, setPeopleSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'trending', name: 'Trending' },
    { id: 'photography', name: 'Photography' },
    { id: 'art', name: 'Art' },
    { id: 'design', name: 'Design' },
    { id: 'tech', name: 'Tech' },
  ]

  // Fetch people when people tab is opened
  useEffect(() => {
    if (activeTab === 'people' && people.length === 0) {
      const fetchPeople = async () => {
        try {
          setPeopleLoading(true)
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('followers_count', { ascending: false })

          if (error) throw error
          if (data) setPeople(data as Profile[])

          if (currentUser?.id) {
            const { data: follows } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', currentUser.id)

            const map: Record<string, boolean> = {}
            follows?.forEach((f: any) => {
              map[f.following_id] = true
            })
            setFollowingMap(map)
          }
        } catch (err) {
          console.error('Error fetching people:', err)
        } finally {
          setPeopleLoading(false)
        }
      }

      fetchPeople()
    }
  }, [activeTab, people.length, currentUser?.id])

  const handleToggleFollow = async (targetUser: Profile) => {
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

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUser.id)

        setFollowingMap((prev) => ({ ...prev, [targetUser.id]: false }))
        setPeople((prev) =>
          prev.map((p) =>
            p.id === targetUser.id
              ? { ...p, followers_count: Math.max(0, p.followers_count - 1) }
              : p
          )
        )
        setToastMessage(`Unfollowed @${targetUser.username}`)
      } else {
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
        setPeople((prev) =>
          prev.map((p) =>
            p.id === targetUser.id
              ? { ...p, followers_count: p.followers_count + 1 }
              : p
          )
        )
        setToastMessage(`Now following @${targetUser.username}! 🎉`)
      }
    } catch (err: any) {
      setToastMessage(err?.message || 'Action failed')
    }
  }

  const filteredPeople = people.filter((u) => {
    if (!peopleSearch.trim()) return true
    const q = peopleSearch.toLowerCase().trim()
    return (
      (u.display_name && u.display_name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    )
  })

  return (
    <div className="bg-light-gray min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}

        {/* Top Tab Bar: Posts vs People */}
        <div className="card p-2 mb-6 flex bg-white/90 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'posts'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-secondary-text hover:text-dark-text'
            }`}
          >
            <Compass size={17} />
            Explore Posts
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'people'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-secondary-text hover:text-dark-text'
            }`}
          >
            <Users size={17} />
            Discover People & Creators
          </button>
        </div>

        {/* POSTS TAB CONTENT */}
        {activeTab === 'posts' && (
          <div className="max-w-2xl mx-auto">
            {/* Categories */}
            <div className="card p-4 mb-6 overflow-x-auto">
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-blue text-white'
                        : 'bg-light-gray text-dark-text hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-4">
              {postsLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : posts.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-secondary-text">No posts found</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={(postId) => console.log('Like:', postId)}
                    onComment={(postId) => console.log('Comment:', postId)}
                    onShare={(postId) => console.log('Share:', postId)}
                    onSave={(postId) => console.log('Save:', postId)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* PEOPLE TAB CONTENT */}
        {activeTab === 'people' && (
          <div className="space-y-6">
            {/* Search Bar & Banner */}
            <div className="card p-5 sm:p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-dark-text mb-1">
                    Connect With Members
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary-text">
                    Follow other creators to see their stories and posts in your feed
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text"
                  />
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-border-gray text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                  />
                </div>
              </div>
            </div>

            {/* People Grid */}
            {peopleLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-light-gray" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-light-gray rounded w-3/4" />
                        <div className="h-3 bg-light-gray rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-8 bg-light-gray rounded" />
                  </div>
                ))}
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-secondary-text">No creators found matching your query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPeople.map((user) => {
                  const isCurrentUser =
                    currentUser?.id === user.id ||
                    (currentUser?.username &&
                      user.username &&
                      currentUser.username.toLowerCase() === user.username.toLowerCase())
                  const isFollowing = !!followingMap[user.id]

                  return (
                    <div
                      key={user.id}
                      className={`card p-5 flex flex-col justify-between hover:shadow-md transition-all ${
                        isCurrentUser ? 'ring-2 ring-primary-blue/30 bg-blue-50/20' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Link
                            to={`/profile/${user.username}`}
                            className="hover:opacity-90 flex-shrink-0"
                          >
                            <Avatar
                              src={user.avatar_url || undefined}
                              size="md"
                              alt={user.display_name}
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/profile/${user.username}`}
                              className="font-bold text-dark-text text-sm truncate hover:text-primary-blue block"
                            >
                              {user.display_name}
                            </Link>
                            <p className="text-xs text-secondary-text truncate">
                              @{user.username}
                            </p>
                            {isCurrentUser && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-blue-100 text-primary-blue text-[10px] font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-dark-text/90 line-clamp-2 min-h-[2rem] mb-3">
                          {user.bio || 'Community creator at CozMeet'}
                        </p>

                        <div className="flex items-center justify-between text-xs text-secondary-text p-2 rounded-lg bg-gray-50 border border-border-gray/50 mb-4">
                          <span>
                            <strong className="text-dark-text">
                              {formatCount(user.followers_count || 0)}
                            </strong>{' '}
                            followers
                          </span>
                          <span>
                            <strong className="text-dark-text">
                              {formatCount(user.posts_count || 0)}
                            </strong>{' '}
                            posts
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-border-gray/60 flex items-center justify-between gap-2">
                        <Link
                          to={`/profile/${user.username}`}
                          className="text-xs font-semibold text-secondary-text hover:text-primary-blue flex items-center gap-1"
                        >
                          View
                          <ArrowRight size={12} />
                        </Link>

                        {/* FOLLOW / UNFOLLOW BUTTON OR 'YOU' BADGE */}
                        {isCurrentUser ? (
                          <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-secondary-text text-xs font-medium cursor-not-allowed select-none">
                            You
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleFollow(user)}
                            className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                              isFollowing
                                ? 'bg-light-gray text-dark-text hover:bg-gray-200'
                                : 'bg-primary-blue text-white hover:bg-blue-600 shadow-sm'
                            }`}
                          >
                            {isFollowing ? '✓ Following' : '+ Follow'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
