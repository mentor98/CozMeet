interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar = ({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }[size]

  return (
    <img
      src={src || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
      alt={alt}
      className={`${sizeClass} rounded-full object-cover bg-light-gray ${className}`}
    />
  )
}
