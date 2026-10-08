import { memo } from 'react'
import { PostCard as PostCardBase } from './PostCard'
import { Post, Profile } from '@/types'

interface PostCardMemoProps {
  post: Post
  currentUser?: Profile | null
  onLike?: (postId: string) => void
  onComment?: (postId: string, comment: string) => void
  onShare?: (postId: string) => void
  onSave?: (postId: string) => void
  onEdit?: (postId: string, updatedData: Partial<Post>) => void
  onDelete?: (postId: string) => void
  onReport?: (postId: string, reason: string) => void
}

// Memoized PostCard with custom comparison to prevent unnecessary re-renders
export const PostCardMemo = memo(
  PostCardBase,
  (prevProps, nextProps) => {
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.caption === nextProps.post.caption &&
      prevProps.post.image_url === nextProps.post.image_url &&
      prevProps.post.likes_count === nextProps.post.likes_count &&
      prevProps.post.comments_count === nextProps.post.comments_count &&
      prevProps.post.is_liked === nextProps.post.is_liked &&
      prevProps.currentUser?.id === nextProps.currentUser?.id
    )
  }
) as React.FC<PostCardMemoProps>
