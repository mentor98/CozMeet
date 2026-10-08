import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ShortcutsCard } from '@/components/profile/ShortcutsCard'
import { CreatePost } from '@/components/feed/CreatePost'
import { PostCardMemo } from '@/components/feed/PostCardMemo'
import { ActivityCard } from '@/components/activity/ActivityCard'
import { SuggestedUsers } from '@/components/suggestions/SuggestedUsers'
import { RecommendedPosts } from '@/components/suggestions/RecommendedPosts'
import { PostSkeleton } from '@/components/common/LoadingSkeleton'
import { Toast } from '@/components/common/Toast'
import { supabase } from '@/lib/supabase'
import { Post, Profile } from '@/types'
import { ChevronDown } from 'lucide-react'

export const Home = () => {
  const { profile, refreshProfile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'recent' | 'popular' | 'following'>('recent')
  const [refreshKey, setRefreshKey] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('posts')
        .select()

      if (filter === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (filter === 'popular') {
        query = query.order('updated_at', { ascending: false })
      }

      const { data: postsData, error: postsError } = await query.eq('visibility', 'public').limit(20)

      if (postsError) throw postsError

      if (!postsData || postsData.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      // Batch fetch all user data at once (instead of individual queries)
      const userIds = [...new Set(postsData.map(p => p.user_id))]
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      // Batch fetch all likes at once
      const postIds = postsData.map(p => p.id)
      const { data: allLikes } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds)

      // Batch fetch all comments at once
      const { data: allComments } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds)

      // Create lookup maps for O(1) access
      const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])
      const likesMap = new Map<string, { count: number; userLiked: boolean }>()
      const commentsMap = new Map<string, number>()

      // Populate likes map
      postIds.forEach(id => likesMap.set(id, { count: 0, userLiked: false }))
      allLikes?.forEach(like => {
        const current = likesMap.get(like.post_id)!
        current.count++
        if (profile?.id && like.user_id === profile.id) {
          current.userLiked = true
        }
      })

      // Populate comments map
      postIds.forEach(id => commentsMap.set(id, 0))
      allComments?.forEach(comment => {
        commentsMap.set(comment.post_id, (commentsMap.get(comment.post_id) || 0) + 1)
      })

      // Enrich posts with all data at once
      const enrichedPosts = postsData.map(post => {
        const likes = likesMap.get(post.id) || { count: 0, userLiked: false }
        const user = usersMap.get(post.user_id)
        
        return {
          ...post,
          user,
          likes_count: likes.count,
          comments_count: commentsMap.get(post.id) || 0,
          is_liked: likes.userLiked,
        }
      })

      setPosts(enrichedPosts as Post[])
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }, [filter, profile?.id])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts, refreshKey])

  const handlePostCreated = () => {
    // Recalculate stats and refresh feed when new post is created
    setRefreshKey((prev) => prev + 1)
    refreshProfile?.()
  }

  const handleEditPost = (postId: string, updatedData: Partial<Post>) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, ...updatedData } : p))
    )
    setToastMessage('Post updated successfully!')
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId))
    setToastMessage('Post deleted successfully!')
    refreshProfile?.()
  }

  const handleReportPost = (_postId: string, reason: string) => {
    setToastMessage(`Post reported (${reason}). Thank you for your feedback.`)
  }

  const handleLike = async (postId: string) => {
    if (!profile?.id) return

    try {
      const post = posts.find((p) => p.id === postId)
      if (!post) return

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id)

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, likes_count: (p.likes_count || 0) - 1, is_liked: false }
              : p
          )
        )
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: profile.id }])

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, likes_count: (p.likes_count || 0) + 1, is_liked: true }
              : p
          )
        )
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleShare = async (postId: string) => {
    if (!profile?.id) return

    try {
      const post = posts.find((p) => p.id === postId)
      if (!post?.user) return

      // Record share
      await supabase
        .from('post_shares')
        .insert([{ post_id: postId, user_id: profile.id }])

      // Copy link to clipboard
      const postUrl = `${window.location.origin}/post/${postId}`
      await navigator.clipboard.writeText(postUrl)
      
      setToastMessage('Post link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing post:', err)
    }
  }

  return (
    <div className="bg-light-gray min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
          {/* Left Sidebar */}
          <div className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col gap-5">
            {profile && <ProfileCard profile={profile} showEditButton={true} />}
            <ShortcutsCard shortcuts={[]} />
          </div>

          {/* Center Feed */}
          <div className="col-span-1 md:col-span-8 lg:col-span-6 flex flex-col gap-4 sm:gap-5 min-w-0">
            {profile && <CreatePost currentUser={profile} onPostCreated={handlePostCreated} />}

            {/* Feed Filter */}
            <div className="flex items-center justify-between px-4 py-3 card">
              <span className="text-secondary-text text-sm font-medium">Sort by:</span>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="appearance-none px-3.5 py-1.5 border border-border-gray rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm pr-8 font-medium text-dark-text cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option value="recent">Recent</option>
                  <option value="popular">Popular</option>
                  <option value="following">Following</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text"
                />
              </div>
            </div>

            {/* Posts */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {loading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : posts.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-secondary-text mb-2">No posts yet</p>
                  <p className="text-sm text-secondary-text">
                    Be the first to share something!
                  </p>
                </div>
              ) : (
                posts.map((post, idx) => (
                  <div key={post.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
                    <PostCardMemo
                      post={post}
                      currentUser={profile}
                      onLike={handleLike}
                      onComment={() => setRefreshKey((prev) => prev + 1)}
                      onShare={handleShare}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onReport={handleReportPost}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 animate-slide-right">
            {profile && <ActivityCard userId={profile.id} />}
            <RecommendedPosts currentUserId={profile?.id} />
            <SuggestedUsers currentUserId={profile?.id} />
          </div>
        </div>
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
