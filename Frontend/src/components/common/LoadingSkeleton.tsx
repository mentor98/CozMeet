export const PostSkeleton = () => (
  <div className="card p-4 space-y-4">
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </div>
    <div className="skeleton h-64 rounded-lg" />
    <div className="flex gap-2">
      <div className="skeleton h-8 flex-1 rounded" />
      <div className="skeleton h-8 flex-1 rounded" />
      <div className="skeleton h-8 flex-1 rounded" />
    </div>
  </div>
)

export const ProfileSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-24 w-full" />
    <div className="relative px-4 pb-4">
      <div className="skeleton w-16 h-16 rounded-full mx-auto -mt-8 mb-4" />
      <div className="skeleton h-4 w-20 mx-auto mb-2 rounded" />
      <div className="skeleton h-3 w-16 mx-auto mb-4 rounded" />
      <div className="flex justify-around mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="skeleton h-4 w-8 rounded mx-auto mb-1" />
            <div className="skeleton h-3 w-12 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="skeleton h-10 w-full rounded-lg" />
    </div>
  </div>
)

export const ActivitySkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 hover:bg-light-gray rounded-lg">
        <div className="flex items-center gap-3 flex-1">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
        <div className="skeleton h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
)
