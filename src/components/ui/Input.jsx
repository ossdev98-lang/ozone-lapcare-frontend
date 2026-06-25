import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[#374151] mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />}
      <input
        ref={ref}
        className={`premium-input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 bg-red-50/50' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">{error}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input
