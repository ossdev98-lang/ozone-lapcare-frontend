import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown } from 'react-icons/fi'

export default function Dropdown({ label, value, onChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  const selected = options?.find(o => o.value === value)

  useEffect(() => {
    const handle = (e) => {
      if (!open) return
      const target = e.target
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width })
    }
  }

  const handleTriggerClick = () => {
    if (!open) updatePosition()
    setOpen(o => !o)
  }

  const dropdownPanel = open && (
    createPortal(
      <div 
        ref={panelRef}
        className="fixed bg-white/95 max-h-60 overflow-y-auto p-1 rounded-xl shadow-2xl border border-white/40 overscroll-contain"
        style={{ top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
      >
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full px-3 py-2 rounded-lg text-sm text-left hover:bg-white/60 text-[#64748B]"
            >
              {placeholder}
            </button>
          </li>
          {options?.map(opt => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all cursor-pointer
                  ${value === opt.value ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-semibold' : 'hover:bg-white/60 text-[#111827]'}`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>,
      document.body
    )
  )

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <button
        type="button"
        onClick={handleTriggerClick}
        className="w-full premium-input justify-between text-left text-sm flex items-center cursor-pointer"
      >
        <span className={selected ? 'text-[#111827]' : 'text-[#94a3b8]'}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {dropdownPanel}
    </div>
  )
}