import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ShortcutsCard } from '@/components/profile/ShortcutsCard'
import { CreatePost } from '@/components/feed/CreatePost'
import { PostCard } from '@/components/feed/PostCard'
import { ActivityCard } from '@/components/activity/ActivityCard'
import { SuggestedUsers } from '@/components/suggestions/SuggestedUsers'
import { PostSkeleton } from '@/components/common/LoadingSkeleton'
import { supabase } from '@/lib/supabase'
import { Post, Profile } from '@/types'
import { ChevronDown } from 'lucide-react'

export const Home = () => {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'recent' | 'popular' | 'following'>('recent')
  const [refreshKey, setRefreshKey] = useState(0)

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

      const { data: postsData, error: postsError } = await query.eq('visibility', 'public')

      if (postsError) throw postsError

      // Fetch user info for each post
      const enrichedPosts = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', post.user_id)
            .limit(1)

          // Fetch likes count
          const { count: likesCount } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          // Fetch comments count
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          // Check if current user liked this post
          let isLiked = false
          if (profile?.id) {
            const { data: likeData } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', profile.id)
              .limit(1)
            isLiked = !!likeData && likeData.length > 0
          }

          return {
            ...post,
            user: userData && userData.length > 0 ? userData[0] : null,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            is_liked: isLiked,
          }
        })
      )

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
    // Recalculate stats when new post is created
    setRefreshKey((prev) => prev + 1)
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
      
      alert('Post link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing post:', err)
    }
  }

  return (
    <div className="bg-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:flex md:col-span-1 flex-col gap-4">
            {profile && <ProfileCard profile={profile} showEditButton={true} />}
            <ShortcutsCard shortcuts={[]} />
          </div>

          {/* Center Feed */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-4">
            {profile && <CreatePost currentUser={profile} onPostCreated={handlePostCreated} />}

            {/* Feed Filter */}
            <div className="flex items-center gap-2 px-4 py-3 card">
              <span className="text-secondary-text text-sm">Sort by:</span>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="appearance-none px-3 py-2 border border-border-gray rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm pr-8"
                >
                  <option value="recent">Recent</option>
                  <option value="popular">Popular</option>
                  <option value="following">Following</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text"
                />
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
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
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={profile}
                    onLike={handleLike}
                    onComment={() => setRefreshKey((prev) => prev + 1)}
                    onShare={handleShare}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
            {profile && <ActivityCard userId={profile.id} />}
            <SuggestedUsers currentUserId={profile?.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
