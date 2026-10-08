import { useState } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/feed/PostCard'
import { PostSkeleton } from '@/components/common/LoadingSkeleton'

export const Explore = () => {
  const { posts, loading } = usePosts(undefined, 'popular')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'trending', name: 'Trending' },
    { id: 'photography', name: 'Photography' },
    { id: 'art', name: 'Art' },
    { id: 'design', name: 'Design' },
    { id: 'tech', name: 'Tech' },
  ]

  return (
    <div className="bg-light-gray min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Categories */}
        <div className="card p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-blue text-white'
                    : 'bg-light-gray text-dark-text hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-4">
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-secondary-text">No posts found</p>
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
