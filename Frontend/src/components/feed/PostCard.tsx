import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit3,
  Trash2,
  Flag,
  Copy,
  Check,
  X,
  Loader,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
} from 'lucide-react'
import { Post, Profile } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { formatTime, parsePostContent, combinePostContent } from '@/utils/format'
import { CommentInput } from '@/components/comments/CommentInput'
import { CommentList } from '@/components/comments/CommentList'
import { supabase } from '@/lib/supabase'
import { updateProfileStats } from '@/services/stats'

interface PostCardProps {
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

export const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onShare,
  onSave,
  onEdit,
  onDelete,
  onReport,
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Parse title and blog post body
  const parsed = parsePostContent(post.caption)
  const postTitle = parsed.title
  const postBody = parsed.body

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(parsed.title || '')
  const [editedBody, setEditedBody] = useState(parsed.body || (parsed.title ? '' : post.caption || ''))
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('Spam or scam')
  const [reportDetails, setReportDetails] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const user = post.user as Profile | undefined

  const isAuthor = Boolean(
    currentUser?.id &&
      (post.user_id === currentUser.id ||
        (user?.id && user.id === currentUser.id) ||
        (user?.username &&
          currentUser.username &&
          user.username.toLowerCase() === currentUser.username.toLowerCase()))
  )

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showMenu])

  // Sync edited caption if post prop changes
  useEffect(() => {
    const p = parsePostContent(post.caption)
    setEditedTitle(p.title || '')
    setEditedBody(p.body || (p.title ? '' : post.caption || ''))
  }, [post.caption])

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/profile/${user?.username || 'post'}#${post.id}`
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => {
        setCopiedLink(false)
        setShowMenu(false)
      }, 1500)
    } catch {
      setShowMenu(false)
    }
  }

  // Handle Save Edited Post
  const handleSaveEdit = async () => {
    if (!currentUser?.id) return
    setIsUpdating(true)
    setActionError(null)

    try {
      const newImageUrl = removeExistingImage ? null : post.image_url
      const newCaption = combinePostContent(editedTitle, editedBody).trim()

      if (!newCaption && !newImageUrl) {
        setActionError('A post must have either text or an image.')
        setIsUpdating(false)
        return
      }

      const { error } = await supabase
        .from('posts')
        .update({
          caption: newCaption || null,
          image_url: newImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (error) throw error

      onEdit?.(post.id, {
        caption: newCaption || null,
        image_url: newImageUrl,
      })

      setIsEditing(false)
      setShowMenu(false)
    } catch (err: any) {
      console.error('Failed to update post:', err)
      setActionError(err?.message || 'Could not save changes to post')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle Delete Post
  const handleConfirmDelete = async () => {
    if (!currentUser?.id) return
    setIsDeleting(true)
    setActionError(null)

    try {
      // 1. Delete associated post likes and comments first if cascade isn't configured
      try {
        await supabase.from('post_likes').delete().eq('post_id', post.id)
        await supabase.from('comments').delete().eq('post_id', post.id)
      } catch (childErr) {
        console.warn('Notice while cleaning post relations:', childErr)
      }

      // 2. Delete the post row
      const { error } = await supabase.from('posts').delete().eq('id', post.id)
      if (error) throw error

      // 3. Recalculate author's profile stats
      if (currentUser.id) {
        updateProfileStats(currentUser.id)
      }

      setShowDeleteModal(false)
      setShowMenu(false)
      onDelete?.(post.id)
    } catch (err: any) {
      console.error('Failed to delete post:', err)
      setActionError(err?.message || 'Failed to delete post')
      setIsDeleting(false)
    }
  }

  // Handle Report Post
  const handleConfirmReport = async () => {
    setIsSubmittingReport(true)
    try {
      // Store report in localStorage log
      const existingReports = JSON.parse(
        localStorage.getItem('cozmeet_reports') || '[]'
      )
      existingReports.push({
        id: `rep-${Date.now()}`,
        post_id: post.id,
        reporter_id: currentUser?.id || 'anonymous',
        reason: reportReason,
        details: reportDetails.trim(),
        created_at: new Date().toISOString(),
      })
      localStorage.setItem('cozmeet_reports', JSON.stringify(existingReports))

      onReport?.(post.id, reportReason)
      setReportSuccess(true)
      setTimeout(() => {
        setReportSuccess(false)
        setShowReportModal(false)
        setShowMenu(false)
      }, 1500)
    } catch (err) {
      console.error('Report submission note:', err)
      setShowReportModal(false)
    } finally {
      setIsSubmittingReport(false)
    }
  }

  // Check if body is long (more than 300 characters)
  const isLongBody = postBody && postBody.length > 300
  const displayBody = isExpanded ? postBody : postBody?.slice(0, 300)

  return (
    <div className="card overflow-hidden animate-fade-in hover:shadow-lg transition-shadow duration-300 relative">
      {/* Post Header */}
      <div className="p-4 border-b border-border-gray flex items-center justify-between">
        <Link
          to={user?.username ? `/profile/${user.username}` : '#'}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
        >
          <Avatar src={user?.avatar_url} size="md" alt={user?.display_name} />
          <div>
            <h4 className="font-semibold text-dark-text hover:text-primary-blue transition-colors text-sm">
              {user?.display_name || 'Anonymous User'}
            </h4>
            <p className="text-secondary-text text-xs">
              {user?.username ? `@${user.username} · ` : ''}
              {formatTime(post.created_at)}
            </p>
          </div>
        </Link>

        {/* Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-light-gray rounded-full transition-colors text-secondary-text hover:text-dark-text"
            title="Post options"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-border-gray rounded-xl shadow-xl py-1.5 z-20 animate-scale-in">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-medium text-dark-text transition-colors"
                  >
                    <Edit3 size={15} className="text-primary-blue" />
                    <span>Edit Post</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 hover:bg-red-50 text-xs font-medium text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                    <span>Delete Post</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                </>
              ) : null}

              <button
                onClick={() => {
                  setShowDetailModal(true)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-medium text-dark-text transition-colors"
              >
                <Eye size={15} className="text-primary-blue" />
                <span>View Full Post</span>
              </button>

              <button
                onClick={() => {
                  setShowReportModal(true)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 hover:bg-amber-50 text-xs font-medium text-amber-700 transition-colors"
              >
                <Flag size={15} />
                <span>Report Post</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-medium text-secondary-text transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check size={15} className="text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content or Edit Form */}
      <div className="p-4 space-y-3">
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg flex items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {isEditing ? (
          /* Inline Editor */
          <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-xs font-bold text-dark-text flex items-center gap-1.5 uppercase tracking-wide">
                <Edit3 size={14} className="text-primary-blue" />
                Edit Post
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditedTitle(postTitle || '')
                  setEditedBody(postBody || (postTitle ? '' : post.caption || ''))
                  setRemoveExistingImage(false)
                  setActionError(null)
                }}
                className="text-secondary-text hover:text-dark-text p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1">
                Title of the post
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter post title..."
                className="w-full px-3.5 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm font-semibold text-dark-text bg-white"
                disabled={isUpdating}
              />
            </div>

            {/* Blog Post Content */}
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1">
                Blog post content
              </label>
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                placeholder="Write your blog post content..."
                className="w-full px-3.5 py-2.5 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm text-dark-text bg-white resize-none leading-relaxed"
                rows={4}
                disabled={isUpdating}
              />
            </div>

            {/* Existing image management */}
            {post.image_url && (
              <div className="relative border border-border-gray rounded-lg p-2.5 bg-white flex items-center gap-3">
                {!removeExistingImage ? (
                  <>
                    <img
                      src={post.image_url}
                      alt="Attachment"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-dark-text">Current Image</p>
                      <button
                        type="button"
                        onClick={() => setRemoveExistingImage(true)}
                        className="text-red-600 hover:underline mt-1 font-medium flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remove image from post
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-xs py-1 text-amber-700 flex items-center justify-between">
                    <span>Image will be removed upon saving.</span>
                    <button
                      type="button"
                      onClick={() => setRemoveExistingImage(false)}
                      className="text-primary-blue hover:underline font-semibold"
                    >
                      Undo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditedTitle(postTitle || '')
                  setEditedBody(postBody || (postTitle ? '' : post.caption || ''))
                  setRemoveExistingImage(false)
                  setActionError(null)
                }}
                disabled={isUpdating}
                className="btn-secondary text-xs py-1.5 px-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="btn-primary text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5 font-bold"
              >
                {isUpdating ? <Loader size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Display Mode */
          <div className="space-y-3">
            {/* Title */}
            {postTitle && (
              <h3
                onClick={() => setShowDetailModal(true)}
                className="font-bold text-dark-text text-base sm:text-lg leading-snug tracking-tight hover:text-primary-blue cursor-pointer transition-colors"
              >
                {postTitle}
              </h3>
            )}

            {/* Blog Post Content */}
            {postBody && (
              <div className="space-y-1.5">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {displayBody}
                  {isLongBody && !isExpanded && '...'}
                </p>
                {isLongBody && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary-blue font-semibold text-xs hover:underline transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'View more'}
                  </button>
                )}
              </div>
            )}

            {/* Fallback if no parsed title/body */}
            {!postTitle && !postBody && post.caption && (
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
                {post.caption}
              </p>
            )}

            {/* Image */}
            {post.image_url && (
              <div
                onClick={() => setShowDetailModal(true)}
                className="rounded-xl overflow-hidden border border-border-gray/60 bg-black/5 cursor-pointer group/img"
              >
                <img
                  src={post.image_url}
                  alt={postTitle || 'Post'}
                  className="w-full object-contain max-h-[500px] group-hover/img:opacity-95 transition-opacity"
                />
              </div>
            )}

            {/* Hashtags */}
            {post.caption && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.caption.match(/#[\w]+/g)?.map((tag) => (
                  <span
                    key={tag}
                    className="text-primary-blue text-xs font-semibold badge"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between p-3 border-t border-border-gray gap-1">
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center justify-center gap-2 transition-colors flex-1 py-1.5 rounded-lg text-xs font-semibold ${
            post.is_liked
              ? 'text-red-500 bg-red-50'
              : 'text-secondary-text hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} />
          <span>{post.likes_count || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-2 text-secondary-text hover:text-primary-blue transition-colors flex-1 py-1.5 rounded-lg hover:bg-blue-50 text-xs font-semibold"
        >
          <MessageCircle size={18} />
          <span>{post.comments_count || 0}</span>
        </button>

        <button
          onClick={() => onShare?.(post.id)}
          className="flex items-center justify-center gap-2 text-secondary-text hover:text-green-500 transition-colors flex-1 py-1.5 rounded-lg hover:bg-green-50 text-xs font-semibold"
        >
          <Share2 size={18} />
          <span>Share</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border-gray animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-center text-dark-text mb-2">
              Delete Post?
            </h3>
            <p className="text-xs text-secondary-text text-center mb-6 leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone and will be permanently removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 btn-secondary py-2.5 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader size={14} className="animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-gray animate-scale-in">
            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-3">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-base font-bold text-dark-text mb-1">
                  Report Received
                </h3>
                <p className="text-xs text-secondary-text">
                  Thank you for keeping our community safe. Our team will review this content.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-border-gray mb-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Flag size={18} />
                    <h3 className="font-bold text-sm text-dark-text">Report Post</h3>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-secondary-text hover:text-dark-text p-1 rounded-md"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-secondary-text mb-3">
                  Please select why this post violates community guidelines:
                </p>

                <div className="space-y-2 mb-4">
                  {[
                    'Spam or scam',
                    'Harassment or hate speech',
                    'Violence or dangerous content',
                    'Inappropriate media',
                    'False information',
                    'Other violation',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        reportReason === reason
                          ? 'border-primary-blue bg-blue-50/50 text-dark-text font-semibold'
                          : 'border-border-gray hover:bg-slate-50 text-secondary-text'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                        className="text-primary-blue focus:ring-primary-blue"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-[11px] font-semibold text-secondary-text mb-1">
                    Additional details (optional):
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide any context that helps explain the violation..."
                    rows={2}
                    className="w-full px-3 py-2 border border-border-gray rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    disabled={isSubmittingReport}
                    className="flex-1 btn-secondary py-2 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReport}
                    disabled={isSubmittingReport}
                    className="flex-1 btn-primary py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingReport && <Loader size={13} className="animate-spin" />}
                    <span>{isSubmittingReport ? 'Submitting...' : 'Submit Report'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Full Post Detail View Modal */}
      {showDetailModal && (
        <div
          onClick={() => setShowDetailModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-border-gray animate-scale-in"
          >
            {/* Left Column: Image (if attached) */}
            {post.image_url && (
              <div className="md:w-3/5 bg-black flex items-center justify-center p-2 min-h-[280px] md:min-h-[500px] max-h-[48vh] md:max-h-[92vh]">
                <img
                  src={post.image_url}
                  alt={postTitle || 'Post attachment'}
                  className="max-h-[46vh] md:max-h-[88vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>
            )}

            {/* Right Column (or Full Width): Post Content & Comments */}
            <div
              className={`flex flex-col h-full bg-white ${
                post.image_url ? 'md:w-2/5' : 'w-full max-w-2xl mx-auto'
              }`}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-border-gray flex items-center justify-between flex-shrink-0">
                <Link
                  to={user?.username ? `/profile/${user.username}` : '#'}
                  className="flex items-center gap-3 hover:opacity-85"
                >
                  <Avatar
                    src={user?.avatar_url || undefined}
                    size="md"
                    alt={user?.display_name}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-dark-text">
                      {user?.display_name || 'Community Member'}
                    </h4>
                    <p className="text-xs text-secondary-text">
                      {user?.username ? `@${user.username} · ` : ''}
                      {formatTime(post.created_at)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 text-secondary-text hover:text-dark-text rounded-full hover:bg-slate-100 transition-colors"
                    title="Copy link"
                  >
                    {copiedLink ? (
                      <Check size={18} className="text-emerald-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 text-secondary-text hover:text-dark-text rounded-full hover:bg-slate-100 transition-colors"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content: Title + Blog Post + Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Title */}
                {postTitle && (
                  <h2 className="text-lg sm:text-xl font-bold text-dark-text tracking-tight leading-snug">
                    {postTitle}
                  </h2>
                )}

                {/* Blog Post Content */}
                {postBody && (
                  <div className="pb-3 border-b border-slate-100">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {postBody}
                    </p>
                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {post.caption?.match(/#[\w]+/g)?.map((tag) => (
                        <span
                          key={tag}
                          className="text-primary-blue text-xs font-semibold px-2 py-0.5 bg-blue-50 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!postTitle && !postBody && post.caption && (
                  <div className="pb-3 border-b border-slate-100">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Comments List */}
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-secondary-text mb-3">
                    Comments
                  </h5>
                  <CommentList postId={post.id} />
                </div>
              </div>

              {/* Modal Footer: Action bar & Comment Input */}
              <div className="p-3.5 border-t border-border-gray bg-slate-50/70 flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onLike?.(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                        post.is_liked
                          ? 'text-red-500'
                          : 'text-secondary-text hover:text-red-500'
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={post.is_liked ? 'currentColor' : 'none'}
                      />
                      <span>{post.likes_count || 0} likes</span>
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text">
                      <MessageCircle size={18} />
                      <span>{post.comments_count || 0} comments</span>
                    </span>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="text-xs text-primary-blue font-semibold hover:underline flex items-center gap-1"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>

                {currentUser && (
                  <CommentInput
                    postId={post.id}
                    currentUser={currentUser}
                    onCommentAdded={() => onComment?.(post.id, '')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
