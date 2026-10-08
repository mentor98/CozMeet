import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Profile as ProfileType, Post } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { PostCard } from '@/components/feed/PostCard'
import { FollowButton } from '@/components/common/FollowButton'
import { formatCount } from '@/utils/format'

export const Profile = () => {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .limit(1)

        if (profileError) throw profileError
        
        const profile = profileData && profileData.length > 0 ? profileData[0] : null
        setProfile(profile as ProfileType)

        if (profile) {
          const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })

          setPosts(postsData as Post[])
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Loading...</p>
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
    <div className="bg-light-gray min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cover Image */}
        <div
          className="h-40 bg-gradient-to-r from-primary-blue to-blue-400 rounded-b-2xl"
          style={{
            backgroundImage: profile.cover_url
              ? `url(${profile.cover_url})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Profile Info */}
        <div className="card mt-6 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="flex-shrink-0 -mt-24">
              <Avatar
                src={profile.avatar_url || undefined}
                size="lg"
                className="border-4 border-white"
              />
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-dark-text">
                  {profile.display_name}
                </h1>
                <p className="text-secondary-text">@{profile.username}</p>
                {profile.bio && <p className="text-dark-text mt-2">{profile.bio}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="font-bold text-dark-text">
                    {formatCount(profile.posts_count)}
                  </div>
                  <div className="text-sm text-secondary-text">Posts</div>
                </div>
                <div>
                  <div className="font-bold text-dark-text">
                    {formatCount(profile.followers_count)}
                  </div>
                  <div className="text-sm text-secondary-text">Followers</div>
                </div>
                <div>
                  <div className="font-bold text-dark-text">
                    {formatCount(profile.following_count)}
                  </div>
                  <div className="text-sm text-secondary-text">Following</div>
                </div>
              </div>
            </div>

            <FollowButton isFollowing={false} />
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-dark-text">Posts</h2>
          {posts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-secondary-text">No posts yet</p>
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
    </div>
  )
}
