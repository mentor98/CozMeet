import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Profile as ProfileType, Post } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { PostCardMemo } from '@/components/feed/PostCardMemo'
import { formatCount } from '@/utils/format'
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react'

export const Profile = () => {
  const { username } = useParams<{ username: string }>()
  const { profile: currentUserProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  // Batch fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .limit(1)

      if (profileError) throw profileError
      
      const profile = profileData && profileData.length > 0 ? profileData[0] : null
      setProfile(profile as ProfileType)

      if (profile) {
        // Fetch posts (always)
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profile.id)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(20)

        if (postsData && postsData.length > 0) {
          // Get all likes and comments at once
          const { data: allLikes } = await supabase
            .from('post_likes')
            .select('post_id, user_id')

          const { data: allComments } = await supabase
            .from('comments')
            .select('post_id')

          // Create lookup maps
          const likesMap = new Map<string, { count: number; userLiked: boolean }>()
          const commentsMap = new Map<string, number>()

          postsData.forEach(p => likesMap.set(p.id, { count: 0, userLiked: false }))
          postsData.forEach(p => commentsMap.set(p.id, 0))

          // Count likes and check if current user liked
          allLikes?.forEach(like => {
            const current = likesMap.get(like.post_id)!
            if (current) {
              current.count++
              if (currentUserProfile?.id && like.user_id === currentUserProfile.id) {
                current.userLiked = true
              }
            }
          })

          // Count comments
          allComments?.forEach(comment => {
            commentsMap.set(comment.post_id, (commentsMap.get(comment.post_id) || 0) + 1)
          })

          // Enrich posts with stats
          const enrichedPosts = postsData.map(post => {
            const likes = likesMap.get(post.id) || { count: 0, userLiked: false }
            return {
              ...post,
              user: profile,
              likes_count: likes.count,
              comments_count: commentsMap.get(post.id) || 0,
              is_liked: likes.userLiked,
            }
          })

          setPosts(enrichedPosts as Post[])
        } else {
          setPosts([])
        }

        // Check if current user follows this profile
        if (currentUserProfile?.id && profile.id !== currentUserProfile.id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUserProfile.id)
            .eq('following_id', profile.id)
            .limit(1)
          setIsFollowing(!!followData && followData.length > 0)
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }, [username, currentUserProfile?.id])

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username, fetchProfile])

  const isOwnProfile =
    currentUserProfile?.id === profile?.id ||
    (Boolean(currentUserProfile?.username && profile?.username) &&
      currentUserProfile?.username.toLowerCase() === profile?.username.toLowerCase())

  const handleFollow = async () => {
    if (!currentUserProfile?.id || !profile || isOwnProfile) return

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserProfile.id)
          .eq('following_id', profile.id)
        
        setIsFollowing(false)
        setProfile({
          ...profile,
          followers_count: Math.max(0, profile.followers_count - 1),
        })
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert([{
            follower_id: currentUserProfile.id,
            following_id: profile.id,
          }])
        
        setIsFollowing(true)
        setProfile({
          ...profile,
          followers_count: profile.followers_count + 1,
        })
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-dark-text font-medium">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light-gray min-h-screen animate-fade-in">
      {/* Cover Image - Facebook Style */}
      <div
        className="w-full h-80 bg-gradient-to-r from-primary-blue via-blue-400 to-blue-300 relative overflow-hidden"
        style={{
          backgroundImage: profile.cover_url
            ? `url(${profile.cover_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Profile Header - Facebook Style */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Avatar and Info Section */}
        <div className="relative -mt-20 mb-6 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            {/* Large Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-light-gray flex items-center justify-center">
                    <span className="text-6xl text-secondary-text">
                      {profile.display_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 pb-6">
              <div className="mb-4">
                <h1 className="text-4xl font-bold text-dark-text mb-1">
                  {profile.display_name}
                </h1>
                <p className="text-lg text-secondary-text mb-2">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-dark-text text-base mb-3">{profile.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-dark-text text-lg">
                    {formatCount(profile.posts_count)}
                  </span>
                  <span className="text-secondary-text ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-dark-text text-lg">
                    {formatCount(profile.followers_count)}
                  </span>
                  <span className="text-secondary-text ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-dark-text text-lg">
                    {formatCount(profile.following_count)}
                  </span>
                  <span className="text-secondary-text ml-1">Following</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!isOwnProfile && (
              <div className="pb-6">
                <button
                  onClick={handleFollow}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isFollowing
                      ? 'bg-light-gray text-dark-text border border-border-gray hover:bg-gray-200'
                      : 'bg-primary-blue text-white hover:bg-blue-600 hover:shadow-lg'
                  }`}
                >
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
              </div>
            )}

            {isOwnProfile && (
              <div className="pb-6">
                <a
                  href="/settings"
                  className="px-8 py-3 rounded-lg font-semibold bg-light-gray text-dark-text border border-border-gray hover:bg-gray-200 transition-all inline-block"
                >
                  ✎ Edit Profile
                </a>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border-gray mt-6" />
        </div>

        {/* Posts Section */}
        <div className="py-8">
          <h2 className="text-2xl font-bold text-dark-text mb-6">Posts</h2>
          
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="card p-12 text-center rounded-lg">
                <p className="text-secondary-text text-lg">
                  {isOwnProfile ? 'No posts yet. Create one to get started!' : 'No posts yet'}
                </p>
              </div>
            ) : (
              posts.map((post, idx) => (
                <div
                  key={post.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="animate-slide-up"
                >
                  <PostCardMemo
                    post={post}
                    currentUser={currentUserProfile}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
