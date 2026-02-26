function SkeletonBar({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <SkeletonBar className="h-6 w-32" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonBar
                key={j}
                className={`h-4 ${j === 0 ? "w-20" : j === cols - 1 ? "w-16" : "flex-1"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <SkeletonBar className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-6 w-16" />
            <SkeletonBar className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBar className="h-4 w-20" />
            <SkeletonBar className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
