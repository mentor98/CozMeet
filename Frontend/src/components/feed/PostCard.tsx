import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Bookmark, Share2, MoreVertical } from 'lucide-react'
import { Post, Profile } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { formatTime } from '@/utils/format'
import { CommentInput } from '@/components/comments/CommentInput'
import { CommentList } from '@/components/comments/CommentList'

interface PostCardProps {
  post: Post
  currentUser?: Profile | null
  onLike?: (postId: string) => void
  onComment?: (postId: string, comment: string) => void
  onShare?: (postId: string) => void
  onSave?: (postId: string) => void
}

export const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onShare,
  onSave,
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const user = post.user as Profile | undefined

  // Check if caption is long (more than 300 characters)
  const isLongCaption = post.caption && post.caption.length > 300
  const displayCaption = isExpanded ? post.caption : post.caption?.slice(0, 300)

  return (
    <div className="card mb-4 overflow-hidden animate-fade-in hover:shadow-lg transition-shadow duration-300">
      {/* Post Header */}
      <div className="p-4 border-b border-border-gray flex items-center justify-between">
        <Link
          to={user?.username ? `/profile/${user.username}` : '#'}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
        >
          <Avatar src={user?.avatar_url} size="md" alt={user?.display_name} />
          <div>
            <h4 className="font-semibold text-dark-text hover:text-primary-blue transition-colors">
              {user?.display_name || 'Anonymous User'}
            </h4>
            <p className="text-secondary-text text-xs">
              {user?.username ? `@${user.username} · ` : ''}
              {formatTime(post.created_at)}
            </p>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-light-gray rounded-full transition-colors"
          >
            <MoreVertical size={20} className="text-secondary-text" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-border-gray rounded-lg shadow-lg py-2 z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-light-gray text-sm transition-colors">
                Edit
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-light-gray text-sm transition-colors">
                Delete
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-light-gray text-sm transition-colors">
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 space-y-3">
        {post.caption && (
          <div className="space-y-2">
            <p className="text-dark-text leading-relaxed whitespace-pre-wrap">
              {displayCaption}
              {isLongCaption && !isExpanded && '...'}
            </p>
            {isLongCaption && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary-blue font-semibold text-sm hover:underline transition-colors"
              >
                {isExpanded ? 'Show less' : 'View more'}
              </button>
            )}
          </div>
        )}

        {/* Image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg object-cover max-h-96 hover:opacity-95 transition-opacity"
          />
        )}

        {/* Hashtags */}
        {post.caption && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.caption.match(/#[\w]+/g)?.map((tag) => (
              <a
                key={tag}
                href={`/search?q=${tag}`}
                className="text-primary-blue text-sm hover:underline transition-colors badge"
              >
                {tag}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-border-gray gap-1">
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center gap-2 transition-colors flex-1 px-2 py-1 rounded-lg ${
            post.is_liked
              ? 'text-red-500 bg-red-50'
              : 'text-secondary-text hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Heart size={20} fill={post.is_liked ? 'currentColor' : 'none'} />
          <span className="text-sm">{post.likes_count || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-secondary-text hover:text-primary-blue transition-colors flex-1 px-2 py-1 rounded-lg hover:bg-blue-50"
        >
          <MessageCircle size={20} />
          <span className="text-sm">{post.comments_count || 0}</span>
        </button>
        <button
          onClick={() => onShare?.(post.id)}
          className="flex items-center gap-2 text-secondary-text hover:text-green-500 transition-colors flex-1 px-2 py-1 rounded-lg hover:bg-green-50"
        >
          <Share2 size={20} />
          <span className="text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border-gray p-4 space-y-4 bg-light-gray">
          <CommentList postId={post.id} />
          {currentUser && (
            <CommentInput
              postId={post.id}
              currentUser={currentUser}
              onCommentAdded={() => onComment?.(post.id, '')}
            />
          )}
        </div>
      )}
    </div>
  )
}
