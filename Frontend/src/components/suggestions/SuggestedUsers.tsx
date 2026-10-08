import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Profile, Post } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { formatTime } from '@/utils/format'
import { updateProfileStats } from '@/services/stats'
import { Heart, MessageCircle, Sparkles, UserPlus, FileText, Image as ImageIcon } from 'lucide-react'

interface SuggestedUsersProps {
  currentUserId?: string
}

type SuggestedPost = Post & {
  user?: Profile
  isNew?: boolean
}

export const SuggestedUsers = ({ currentUserId }: SuggestedUsersProps) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'posts' | 'creators'>('posts')
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [otherPosts, setOtherPosts] = useState<SuggestedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  // Fetch suggestions and posts by other users
  const fetchSuggestionsAndPosts = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Fetch other profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)

      if (profiles) {
        const filtered = (profiles as Profile[]).filter(
          (p) => p.id !== currentUserId
        )
        setSuggestions(filtered.slice(0, 5))

        if (currentUserId) {
          const { data: follows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUserId)

          const followMap: Record<string, boolean> = {}
          filtered.forEach((p) => {
            followMap[p.id] =
              follows?.some((f: any) => f.following_id === p.id) || false
          })
          setFollowingMap(followMap)
        }
      }

      // 2. Fetch posts by other users
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(6)

      if (currentUserId) {
        postsQuery = postsQuery.neq('user_id', currentUserId)
      }

      const { data: postsData } = await postsQuery

      if (postsData && postsData.length > 0) {
        // Enrich posts with likes & comments count
        const postIds = postsData.map((p) => p.id)
        const [likesRes, commentsRes] = await Promise.all([
          supabase.from('post_likes').select('post_id').in('post_id', postIds),
          supabase.from('comments').select('post_id').in('post_id', postIds),
        ])

        const likesCountMap: Record<string, number> = {}
        const commentsCountMap: Record<string, number> = {}

        likesRes.data?.forEach((l: any) => {
          likesCountMap[l.post_id] = (likesCountMap[l.post_id] || 0) + 1
        })
        commentsRes.data?.forEach((c: any) => {
          commentsCountMap[c.post_id] = (commentsCountMap[c.post_id] || 0) + 1
        })

        const enriched = postsData.map((p: any) => ({
          ...p,
          likes_count: likesCountMap[p.id] || 0,
          comments_count: commentsCountMap[p.id] || 0,
        }))

        setOtherPosts(enriched)
      } else {
        setOtherPosts([])
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchSuggestionsAndPosts()

    // 3. Set up real-time subscription for new posts by other users
    const channel = supabase
      .channel('suggested_posts_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          const newRow = payload.new as Post
          if (newRow && newRow.user_id !== currentUserId && newRow.visibility === 'public') {
            // Fetch author profile
            const { data: authorData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newRow.user_id)
              .limit(1)

            const author = authorData && authorData.length > 0 ? authorData[0] : undefined

            const freshPost: SuggestedPost = {
              ...newRow,
              user: author,
              likes_count: 0,
              comments_count: 0,
              isNew: true,
            }

            setOtherPosts((prev) => [freshPost, ...prev.filter((p) => p.id !== freshPost.id).slice(0, 5)])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSuggestionsAndPosts, currentUserId])

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

      // Sync stats in database
      updateProfileStats(userId)
      updateProfileStats(currentUserId)
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={16} className="text-primary-blue" />
          <h3 className="font-bold text-dark-text text-sm">Suggested For you</h3>
        </div>
        <button
          onClick={() => navigate(activeTab === 'posts' ? '/explore' : '/people')}
          className="text-primary-blue text-xs font-semibold hover:underline"
        >
          See all
        </button>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'posts'
              ? 'bg-white text-primary-blue font-bold shadow-xs'
              : 'text-secondary-text hover:text-dark-text'
          }`}
        >
          <FileText size={13} />
          <span>Other Posts ({otherPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('creators')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'creators'
              ? 'bg-white text-primary-blue font-bold shadow-xs'
              : 'text-secondary-text hover:text-dark-text'
          }`}
        >
          <UserPlus size={13} />
          <span>Creators ({suggestions.length})</span>
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      ) : activeTab === 'posts' ? (
        /* POSTS BY OTHER USERS */
        <div className="space-y-3">
          {otherPosts.length === 0 ? (
            <p className="text-center text-secondary-text text-xs py-4">
              No posts from other users yet. When members post, they will appear here!
            </p>
          ) : (
            otherPosts.map((post) => {
              const author = post.user
              const isFollowing = author?.id ? !!followingMap[author.id] : false

              return (
                <div
                  key={post.id}
                  className={`p-3 rounded-xl border transition-all hover:border-primary-blue/30 hover:shadow-xs bg-white ${
                    post.isNew ? 'border-primary-blue/40 bg-blue-50/20' : 'border-border-gray'
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Link
                      to={author?.username ? `/profile/${author.username}` : '#'}
                      className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-85"
                    >
                      <Avatar src={author?.avatar_url || undefined} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-dark-text truncate leading-tight">
                          {author?.display_name || 'Community Member'}
                        </p>
                        <p className="text-[10px] text-secondary-text truncate">
                          {author?.username ? `@${author.username} · ` : ''}
                          {formatTime(post.created_at)}
                        </p>
                      </div>
                    </Link>

                    {author?.id && author.id !== currentUserId && (
                      <button
                        onClick={() => handleFollow(author.id)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors flex-shrink-0 ${
                          isFollowing
                            ? 'bg-slate-100 text-dark-text hover:bg-slate-200'
                            : 'bg-primary-blue text-white hover:bg-blue-600'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  {/* Caption Snippet */}
                  {post.caption && (
                    <p className="text-xs text-dark-text line-clamp-2 mb-2 leading-relaxed">
                      {post.caption}
                    </p>
                  )}

                  {/* Image Attachment Preview */}
                  {post.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-border-gray/80 bg-black/5 max-h-36">
                      <img
                        src={post.image_url}
                        alt="Post thumbnail"
                        className="w-full object-cover max-h-36 hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-secondary-text">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart size={12} className="text-red-400" />
                        <span>{post.likes_count || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} className="text-blue-400" />
                        <span>{post.comments_count || 0}</span>
                      </span>
                    </div>

                    <Link
                      to={author?.username ? `/profile/${author.username}#${post.id}` : '#'}
                      className="text-primary-blue font-semibold hover:underline"
                    >
                      View post
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* CREATORS LIST */
        <div className="space-y-2">
          {suggestions.length === 0 ? (
            <p className="text-center text-secondary-text text-xs py-4">No creators found</p>
          ) : (
            suggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
              >
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-2.5 flex-1 min-w-0 mr-2"
                >
                  <Avatar
                    src={user.avatar_url || undefined}
                    size="sm"
                    alt={user.display_name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark-text truncate hover:text-primary-blue transition-colors">
                      {user.display_name}
                    </p>
                    <p className="text-[11px] text-secondary-text truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleFollow(user.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 ${
                      followingMap[user.id]
                        ? 'bg-slate-100 text-dark-text hover:bg-slate-200'
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
      )}
    </div>
  )
}
