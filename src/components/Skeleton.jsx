/** Animated skeleton placeholder components used during data loading */

export function TaskSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm animate-pulse flex items-stretch min-h-[72px] overflow-hidden">
      <div className="w-1.5 bg-gray-200 rounded-l-xl" />
      <div className="flex-1 p-3 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export function TaskSkeletonList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  )
}

export function NoteSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm animate-pulse p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-4/5" />
          <div className="h-3 bg-gray-100 rounded-full w-2/3" />
          <div className="flex gap-1.5 mt-1">
            <div className="h-4 bg-gray-100 rounded-full w-10" />
            <div className="h-4 bg-gray-100 rounded-full w-14" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoteSkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <NoteSkeleton key={i} />
      ))}
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-gray-100 rounded-xl p-3 text-center animate-pulse">
      <div className="h-6 bg-gray-200 rounded-full w-8 mx-auto mb-1.5" />
      <div className="h-2.5 bg-gray-200 rounded-full w-12 mx-auto" />
    </div>
  )
}

export function DashboardTaskSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm animate-pulse flex items-stretch min-h-[60px] overflow-hidden">
      <div className="w-1.5 bg-gray-200 rounded-l-xl" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-full w-2/3" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  )
}
