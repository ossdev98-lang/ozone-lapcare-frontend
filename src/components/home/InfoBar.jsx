import { FiShield, FiTruck, FiHeadphones, FiUsers, FiBox, FiAward, FiClock } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { settingsAPI } from '../../api/services'

const stats = [
  [FiUsers, '10K+', 'Happy customers'],
  [FiBox, '5K+', 'Products sold'],
  [FiAward, '100+', 'Trusted brands'],
  [FiClock, '24/7', 'Expert support'],
]

export default function InfoBar() {
  const { data: settings } = useQuery({ queryKey: ['settings-public'], queryFn: () => settingsAPI.getPublic().then(r => r.data.data) })
  const threshold = settings?.freeShippingThreshold || 999

  const trustItems = [
    [FiShield, 'Genuine Products'],
    [FiTruck, `Free Delivery ₹${threshold}+`],
    [FiHeadphones, 'Expert Support'],
  ]

  return (
    <div className="relative bg-gradient-to-r from-[#1e5a9a] via-[#2875B7] to-[#1e5a9a]">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 20% 0%, #fff 0, transparent 30%), radial-gradient(circle at 80% 100%, #fff 0, transparent 30%)' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-3">
        <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
          {/* Trust row: left / center / right */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-6">
            {trustItems.map(([Icon, text], i) => (
              <div key={text}
                className={`group flex items-center gap-1 text-white ${i === 0 ? 'justify-start' : i === 1 ? 'justify-center' : 'justify-end'}`}>
                <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <Icon className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                </span>
                <span className="text-[8px] sm:text-xs font-semibold tracking-wide leading-tight whitespace-nowrap">{text}</span>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-white/15 hidden sm:block" />

          {/* Stats row: hidden on mobile, 4-pos on desktop */}
          <div className="hidden sm:grid sm:grid-cols-4 sm:gap-x-0 sm:justify-center">
            {stats.map(([Icon, num, label], i) => (
              <div key={label}
                className={`flex shrink-0 items-center gap-1.5 ${i === 0 ? 'sm:justify-start' : i === 1 ? 'sm:justify-center sm:pl-10' : i === 2 ? 'sm:justify-center sm:pr-10' : 'sm:justify-end'} justify-start`}>
                <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 text-white">
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
                <div className="leading-none">
                  <p className="text-xs sm:text-base font-extrabold text-white">{num}</p>
                  <p className="text-[8px] sm:text-[10px] font-medium uppercase tracking-wide text-white/75 whitespace-nowrap">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
