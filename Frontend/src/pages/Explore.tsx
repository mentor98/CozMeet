import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Profile, Post } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { Toast } from '@/components/common/Toast'
import { formatCount, formatTime } from '@/utils/format'
import { updateProfileStats } from '@/services/stats'
import { CommentInput } from '@/components/comments/CommentInput'
import { CommentList } from '@/components/comments/CommentList'
import {
  Compass,
  Users,
  Search,
  Heart,
  MessageCircle,
  Share2,
  X,
  Eye,
  Copy,
  Check,
} from 'lucide-react'

export const Explore = () => {
  const { profile: currentUser } = useAuth()
  const { posts, loading: postsLoading } = usePosts(undefined, 'popular')
  const [activeTab, setActiveTab] = useState<'posts' | 'people'>('posts')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Selected post for full modal view
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({})
  const [copiedLink, setCopiedLink] = useState(false)

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

  // Initialize liked map from posts
  useEffect(() => {
    if (posts && posts.length > 0) {
      const lMap: Record<string, boolean> = {}
      const cMap: Record<string, number> = {}
      posts.forEach((p) => {
        lMap[p.id] = !!p.is_liked
        cMap[p.id] = p.likes_count || 0
      })
      setLikedMap(lMap)
      setLikesCountMap(cMap)
    }
  }, [posts])

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
          console.error('Failed to fetch people:', err)
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
        updateProfileStats(targetUser.id)
        updateProfileStats(currentUser.id)
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
        updateProfileStats(targetUser.id)
        updateProfileStats(currentUser.id)
      }
    } catch (err: any) {
      setToastMessage(err?.message || 'Action failed')
    }
  }

  // Handle Likes inside modal or card
  const handleLikePost = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentUser?.id) {
      setToastMessage('Please log in to like posts')
      return
    }

    const isLiked = !!likedMap[postId]
    const nextLiked = !isLiked
    const currentCount = likesCountMap[postId] || 0
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1)

    setLikedMap((prev) => ({ ...prev, [postId]: nextLiked }))
    setLikesCountMap((prev) => ({ ...prev, [postId]: nextCount }))

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)
      } else {
        await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: currentUser.id }])
      }
    } catch (err) {
      console.error('Like toggle error:', err)
    }
  }

  // Handle Share Copy
  const handleCopyPostLink = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const url = `${window.location.origin}/explore#${postId}`
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setToastMessage('Post link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      setToastMessage('Could not copy link')
    }
  }

  // Filter posts by category
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'photography') return !!post.image_url
    const text = (post.caption || '').toLowerCase()
    return text.includes(selectedCategory)
  })

  // Filter people
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
    <div className="bg-light-gray min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}

        {/* Top Tab Bar: Posts vs People */}
        <div className="card p-2 mb-6 flex bg-white/90 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'posts'
                ? 'bg-primary-blue text-white shadow-xs'
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
                ? 'bg-primary-blue text-white shadow-xs'
                : 'text-secondary-text hover:text-dark-text'
            }`}
          >
            <Users size={17} />
            Discover People & Creators
          </button>
        </div>

        {/* POSTS TAB CONTENT */}
        {activeTab === 'posts' && (
          <div className="w-full">
            {/* Categories Bar */}
            <div className="card p-3 sm:p-4 mb-6 overflow-x-auto">
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-blue text-white shadow-xs'
                        : 'bg-light-gray text-dark-text hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid: Exactly 4 cards per row with identical equal heights */}
            {postsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="card h-[430px] p-4 animate-pulse flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-200 rounded w-24" />
                        <div className="h-2.5 bg-slate-200 rounded w-16" />
                      </div>
                    </div>
                    <div className="h-48 bg-slate-200 rounded-xl my-2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                    <div className="h-8 bg-slate-200 rounded-lg mt-2" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-secondary-text text-base">No posts found for this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredPosts.map((post) => {
                  const author = post.user as Profile | undefined
                  const isLiked = !!likedMap[post.id]
                  const likesCount = likesCountMap[post.id] ?? post.likes_count ?? 0

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="card h-[430px] flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-border-gray/70 bg-white"
                    >
                      {/* 1. Header (Fixed Height) */}
                      <div className="p-3.5 flex items-center justify-between border-b border-border-gray/50 flex-shrink-0 bg-white">
                        <Link
                          to={author?.username ? `/profile/${author.username}` : '#'}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2.5 min-w-0 hover:opacity-85"
                        >
                          <Avatar
                            src={author?.avatar_url || undefined}
                            size="sm"
                            alt={author?.display_name}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-dark-text truncate leading-tight group-hover:text-primary-blue transition-colors">
                              {author?.display_name || 'Community Member'}
                            </h4>
                            <p className="text-[11px] text-secondary-text truncate">
                              {author?.username ? `@${author.username} · ` : ''}
                              {formatTime(post.created_at)}
                            </p>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleCopyPostLink(post.id, e)}
                          className="p-1 text-secondary-text hover:text-dark-text rounded-md hover:bg-slate-100 transition-colors"
                          title="Copy link"
                        >
                          <Share2 size={15} />
                        </button>
                      </div>

                      {/* 2. Media / Visual Area (Fixed Height: 210px) */}
                      <div className="h-[210px] w-full flex-shrink-0 overflow-hidden relative bg-slate-100">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt="Post attachment"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 text-dark-text text-center select-none">
                            <p className="text-xs sm:text-sm font-medium italic line-clamp-6 leading-relaxed text-slate-700">
                              "{post.caption || 'Community Post'}"
                            </p>
                          </div>
                        )}
                        {/* Hover Overlay Badge */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/95 backdrop-blur-sm text-dark-text text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                            <Eye size={13} className="text-primary-blue" />
                            View Full Post
                          </span>
                        </div>
                      </div>

                      {/* 3. Caption / Snippet Area (Flex-1) */}
                      <div className="p-3 flex-1 flex flex-col justify-between overflow-hidden bg-white">
                        <p className="text-xs text-dark-text line-clamp-2 leading-relaxed">
                          {post.caption || <span className="text-secondary-text italic">No caption</span>}
                        </p>
                        {post.caption && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.caption.match(/#[\w]+/g)?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-primary-blue text-[11px] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 4. Footer (Fixed Height: 44px) */}
                      <div className="px-3.5 py-2.5 border-t border-border-gray/60 flex items-center justify-between text-xs text-secondary-text bg-slate-50/70 flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => handleLikePost(post.id, e)}
                            className={`flex items-center gap-1 transition-colors ${
                              isLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'
                            }`}
                          >
                            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                            <span>{likesCount}</span>
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            <span>{post.comments_count || 0}</span>
                          </span>
                        </div>

                        <span className="text-primary-blue text-xs font-semibold flex items-center gap-1 group-hover:underline">
                          <span>View</span>
                          <Eye size={12} />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
                    Follow other creators, browse community members, and grow your network.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text"
                  />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-border-gray rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                  />
                </div>
              </div>
            </div>

            {/* People Grid */}
            {peopleLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="card p-4 animate-pulse h-48 rounded-xl bg-white" />
                ))}
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-secondary-text">No people found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPeople.map((user) => {
                  const isFollowing = !!followingMap[user.id]
                  return (
                    <div
                      key={user.id}
                      className="card p-5 flex flex-col items-center text-center justify-between hover:shadow-md transition-shadow bg-white"
                    >
                      <Link
                        to={`/profile/${user.username}`}
                        className="flex flex-col items-center group w-full"
                      >
                        <Avatar
                          src={user.avatar_url || undefined}
                          size="lg"
                          alt={user.display_name}
                          className="mb-3 group-hover:scale-105 transition-transform"
                        />
                        <h4 className="font-bold text-sm text-dark-text group-hover:text-primary-blue transition-colors truncate max-w-full">
                          {user.display_name}
                        </h4>
                        <p className="text-xs text-secondary-text truncate max-w-full mb-2">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-secondary-text line-clamp-2 mb-3 px-2">
                            {user.bio}
                          </p>
                        )}
                        <span className="text-[11px] text-secondary-text font-medium mb-4">
                          {formatCount(user.followers_count || 0)} followers
                        </span>
                      </Link>

                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleFollow(user)}
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isFollowing
                              ? 'bg-slate-100 text-dark-text hover:bg-slate-200 border border-border-gray'
                              : 'btn-primary'
                          }`}
                        >
                          {isFollowing ? '✓ Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL POST DETAIL VIEW MODAL */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-border-gray animate-scale-in"
          >
            {/* Left Column: Post Media (if present) */}
            {selectedPost.image_url ? (
              <div className="md:w-3/5 bg-black flex items-center justify-center p-2 min-h-[300px] md:min-h-[500px] max-h-[50vh] md:max-h-[92vh]">
                <img
                  src={selectedPost.image_url}
                  alt="Post preview"
                  className="max-h-[48vh] md:max-h-[88vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>
            ) : null}

            {/* Right Column (or Full Width if text only): Post Details & Comments */}
            <div
              className={`flex flex-col h-full bg-white ${
                selectedPost.image_url ? 'md:w-2/5' : 'w-full max-w-2xl mx-auto'
              }`}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-border-gray flex items-center justify-between flex-shrink-0">
                <Link
                  to={
                    selectedPost.user?.username
                      ? `/profile/${selectedPost.user.username}`
                      : '#'
                  }
                  className="flex items-center gap-3 hover:opacity-85"
                >
                  <Avatar
                    src={selectedPost.user?.avatar_url || undefined}
                    size="md"
                    alt={selectedPost.user?.display_name}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-dark-text">
                      {selectedPost.user?.display_name || 'Community Member'}
                    </h4>
                    <p className="text-xs text-secondary-text">
                      {selectedPost.user?.username
                        ? `@${selectedPost.user.username} · `
                        : ''}
                      {formatTime(selectedPost.created_at)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleCopyPostLink(selectedPost.id, e)}
                    className="p-1.5 text-secondary-text hover:text-dark-text rounded-full hover:bg-slate-100"
                    title="Copy link"
                  >
                    {copiedLink ? (
                      <Check size={18} className="text-emerald-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-1.5 text-secondary-text hover:text-dark-text rounded-full hover:bg-slate-100"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content: Caption + Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Caption */}
                {selectedPost.caption && (
                  <div className="pb-3 border-b border-slate-100">
                    <p className="text-sm text-dark-text whitespace-pre-wrap leading-relaxed">
                      {selectedPost.caption}
                    </p>
                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedPost.caption.match(/#[\w]+/g)?.map((tag) => (
                        <span
                          key={tag}
                          className="text-primary-blue text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-secondary-text mb-3">
                    Comments
                  </h5>
                  <CommentList postId={selectedPost.id} />
                </div>
              </div>

              {/* Modal Footer: Actions + Comment Input */}
              <div className="p-3.5 border-t border-border-gray bg-slate-50/70 flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLikePost(selectedPost.id, e)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                        likedMap[selectedPost.id]
                          ? 'text-red-500'
                          : 'text-secondary-text hover:text-red-500'
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={likedMap[selectedPost.id] ? 'currentColor' : 'none'}
                      />
                      <span>{likesCountMap[selectedPost.id] ?? 0} likes</span>
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text">
                      <MessageCircle size={18} />
                      <span>{selectedPost.comments_count || 0} comments</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleCopyPostLink(selectedPost.id, e)}
                    className="text-xs text-primary-blue font-semibold hover:underline flex items-center gap-1"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>

                {currentUser && (
                  <CommentInput
                    postId={selectedPost.id}
                    currentUser={currentUser}
                    onCommentAdded={() => {
                      setToastMessage('Comment posted!')
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
