export function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-52 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-white/20">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
      ))}
    </tr>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-7 w-2/3 rounded" />
        </div>
      </div>
    </div>
  )
}
