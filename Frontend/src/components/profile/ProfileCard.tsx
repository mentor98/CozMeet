import { Link } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { Profile } from '@/types'
import { formatCount } from '@/utils/format'

interface ProfileCardProps {
  profile: Profile
  showEditButton?: boolean
}

export const ProfileCard = ({ profile, showEditButton = false }: ProfileCardProps) => {
  return (
    <div className="card overflow-hidden">
      {/* Cover Image */}
      <div
        className="h-32 bg-gradient-to-r from-primary-blue via-blue-400 to-light-blue"
        style={{
          backgroundImage: profile.cover_url
            ? `url(${profile.cover_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-center -mt-16 mb-4">
          <Avatar
            src={profile.avatar_url || undefined}
            size="lg"
            className="border-4 border-white shadow-lg"
          />
        </div>

        {/* Name and Handle */}
        <div className="text-center mb-2">
          <h3 className="text-xl font-bold text-dark-text">{profile.display_name}</h3>
          <p className="text-sm text-secondary-text">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-secondary-text text-center text-sm mb-4 leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6 py-4 border-t border-b border-border-gray">
          <div className="stat-card">
            <div className="text-base font-bold text-dark-text">{formatCount(profile.posts_count)}</div>
            <div className="text-xs text-secondary-text uppercase tracking-wide">Posts</div>
          </div>
          <div className="stat-card">
            <div className="text-base font-bold text-dark-text">{formatCount(profile.followers_count)}</div>
            <div className="text-xs text-secondary-text uppercase tracking-wide">Followers</div>
          </div>
          <div className="stat-card">
            <div className="text-base font-bold text-dark-text">{formatCount(profile.following_count)}</div>
            <div className="text-xs text-secondary-text uppercase tracking-wide">Following</div>
          </div>
        </div>

        {/* Action Button */}
        {showEditButton ? (
          <Link to="/settings" className="btn-primary w-full text-center block font-semibold">
            ✎ Edit Profile
          </Link>
        ) : (
          <Link
            to={`/profile/${profile.username}`}
            className="btn-secondary w-full text-center block font-semibold"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  )
}
