import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { formatTime } from '@/utils/format'
import { ActivitySkeleton } from '@/components/common/LoadingSkeleton'

interface ActivityCardProps {
  userId: string
}

export const ActivityCard = ({ userId }: ActivityCardProps) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // Fetch likes on user's posts
        const { data } = await supabase
          .from('post_likes')
          .select(`
            id,
            created_at,
            user:profiles(*)
          `)
          .eq('post_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (data) {
          const mappedActivities: Activity[] = (data as any[]).map((like) => ({
            id: like.id,
            user_id: userId,
            type: 'like',
            action_user_id: like.user?.id,
            created_at: like.created_at,
            action_user: like.user,
          }))
          setActivities(mappedActivities)
        }
      } catch (err) {
        console.error('Failed to fetch activity:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [userId])

  if (loading) return <ActivitySkeleton />

  const actionTexts: Record<string, string> = {
    like: 'liked your photo',
    follow: 'started following you',
    comment: 'commented on your post',
    share: 'shared your post',
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-dark-text">Activity</h3>
        <button className="text-primary-blue text-sm font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-secondary-text text-sm py-4">
            No activity yet
          </p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-light-gray rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Avatar
                  src={activity.action_user?.avatar_url}
                  size="sm"
                  alt={activity.action_user?.display_name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-text font-medium">
                    {activity.action_user?.display_name}
                  </p>
                  <p className="text-xs text-secondary-text truncate">
                    {actionTexts[activity.type] || 'interacted with you'} · {formatTime(activity.created_at)}
                  </p>
                </div>
              </div>
              <button className="btn-secondary text-xs py-1 px-3 flex-shrink-0">
                Follow
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
