export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  posts_count: number
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  caption: string | null
  image_url: string | null
  video_url: string | null
  visibility: string
  created_at: string
  updated_at: string
  user?: Profile
  likes_count?: number
  comments_count?: number
  shares_count?: number
  saves_count?: number
  is_liked?: boolean
  is_saved?: boolean
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id: string | null
  created_at: string
  updated_at: string
  user?: Profile
  likes_count?: number
  is_liked?: boolean
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface PostSave {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostShare {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  actor_id: string
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SHARE' | 'MENTION'
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
  actor?: Profile
  post?: Post
}

export interface Shortcut {
  id: string
  user_id: string
  name: string
  image_url: string | null
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: string
  action_user_id: string
  post_id?: string
  created_at: string
  action_user?: Profile
  post?: Post
}
