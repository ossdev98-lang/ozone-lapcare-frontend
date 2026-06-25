const map = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-cyan-100 text-cyan-700',
  default: 'bg-slate-100 text-slate-600',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge ${map[variant] || map.default} ${className}`}>{children}</span>
  )
}
