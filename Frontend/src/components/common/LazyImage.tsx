import { useState, useEffect, useRef, memo } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
}

export const LazyImage = memo(({ src, alt, className = '', placeholder, onLoad }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current && !isLoaded) {
          imgRef.current.src = src
          setIsLoaded(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [src, isLoaded])

  return (
    <img
      ref={imgRef}
      alt={alt}
      src={placeholder}
      className={`${className} ${isLoaded ? 'animate-fade-in' : 'animate-pulse'}`}
      onLoad={() => {
        setIsLoaded(true)
        onLoad?.()
      }}
      onError={() => setError(true)}
    />
  )
})

LazyImage.displayName = 'LazyImage'
