import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, Profile } from '@/types'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { formatTime } from '@/utils/format'

interface RecommendedPostsProps {
  currentUserId?: string
}

export const RecommendedPosts = ({ currentUserId }: RecommendedPostsProps) => {
  const [posts, setPosts] = useState<(Post & { user: Profile })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        // Fetch popular posts (with most likes, but not from current user)
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('visibility', 'public')
          .neq('user_id', currentUserId)
          .limit(5)

        if (!postsData) {
          setLoading(false)
          return
        }

        // Enrich with user data and stats
        const enriched = await Promise.all(
          postsData.map(async (post) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', post.user_id)
              .limit(1)

            const { count: likesCount } = await supabase
              .from('post_likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)

            return {
              ...post,
              user: userData?.[0],
              likes_count: likesCount || 0,
              comments_count: 0,
              is_liked: false,
            }
          })
        )

        setPosts(enriched)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching recommended posts:', err)
        setLoading(false)
      }
    }

    fetchRecommendedPosts()
  }, [currentUserId])

  if (loading) {
    return (
      <div className="card p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-light-gray rounded w-1/2"></div>
        <div className="h-20 bg-light-gray rounded"></div>
        <div className="h-4 bg-light-gray rounded w-1/3"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-dark-text px-4">✨ Recommended Posts</h3>
      
      {posts.map((post, idx) => (
        <div
          key={post.id}
          className="card p-4 hover:shadow-md transition-all duration-300 animate-fade-in"
          style={{
            animationDelay: `${idx * 100}ms`,
          }}
        >
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={post.user?.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-dark-text truncate">
                {post.user?.display_name}
              </h4>
              <p className="text-xs text-secondary-text">
                {formatTime(post.created_at)}
              </p>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-dark-text mb-2 line-clamp-2">
              {post.caption}
            </p>
          )}

          {/* Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="w-full rounded-lg mb-3 object-cover max-h-40 hover:opacity-90 transition-opacity"
            />
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-secondary-text pt-2 border-t border-border-gray">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Heart size={14} /> {post.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} /> {post.comments_count}
              </span>
            </div>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-secondary-text text-sm">No recommended posts yet</p>
        </div>
      )}
    </div>
  )
}
