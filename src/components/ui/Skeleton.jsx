export function ProductCardSkeleton({ compact } = {}) {
  return (
    <div className="glass-card overflow-hidden w-full">
      <div className={`skeleton bg-slate-200 ${compact ? 'h-28' : 'h-40 sm:h-52'} w-full`} />
      <div className={`${compact ? 'p-2.5 space-y-2' : 'p-3 sm:p-4 space-y-2 sm:space-y-3'}`}>
        <div className={`skeleton bg-slate-200 rounded ${compact ? 'h-2.5 w-1/3' : 'h-2.5 sm:h-3 w-1/3'}`} />
        <div className={`skeleton bg-slate-200 rounded ${compact ? 'h-3 w-full' : 'h-3 sm:h-4 w-full'}`} />
        <div className={`skeleton bg-slate-200 rounded ${compact ? 'h-3 w-2/3' : 'h-3 sm:h-4 w-2/3'}`} />
        <div className="flex justify-between items-center">
          <div className={`skeleton bg-slate-200 rounded ${compact ? 'h-4 w-1/3' : 'h-5 sm:h-6 w-1/3'}`} />
          <div className={`skeleton bg-slate-200 rounded ${compact ? 'h-7 w-12' : 'h-7 sm:h-8 w-14 sm:w-16'}`} />
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
