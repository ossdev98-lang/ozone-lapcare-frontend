import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiCpu, FiHeadphones, FiMonitor, FiShield, FiTool, FiTruck } from 'react-icons/fi'
import heroImage from '../../assets/Dark Academia.jpg'
import { useQuery } from '@tanstack/react-query'
import { settingsAPI } from '../../api/services'

const quickLinks = [
  { label: 'Gaming Laptops', to: '/category/gaming-laptops', icon: FiMonitor },
  { label: 'Laptop Parts', to: '/category/laptop-parts', icon: FiCpu },
  { label: 'Repair Service', to: '/repair', icon: FiTool },
]

const stats = [
  ['10K+', 'Happy customers'],
  ['5K+', 'Products sold'],
  ['100+', 'Trusted brands'],
  ['24/7', 'Expert support'],
]

const trustItems = (threshold) => [
  [FiShield, 'Genuine Products'],
  [FiTruck, `Free Delivery on Rs. ${threshold}+`],
  [FiHeadphones, 'Expert Support'],
]

export default function Hero() {
  const { data: settings } = useQuery({ queryKey: ['settings-public'], queryFn: () => settingsAPI.getPublic().then(r => r.data.data) })
  const threshold = settings?.freeShippingThreshold || 999

  return (
    <section className="relative min-h-[60vh] md:min-h-[75vh] overflow-hidden bg-[#0b1220]">
      <img
        src={heroImage}
        alt="Premium laptop setup"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,13,26,0.96)_0%,rgba(8,13,26,0.82)_42%,rgba(8,13,26,0.40)_100%)]" />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 min-h-[60vh] md:min-h-[75vh] flex items-center">
        <div className="max-w-3xl w-full">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-md">
              <FiCheckCircle className="w-3.5 h-3.5 text-cyan-300" />
              Premium laptops, parts and repair in one place
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-4 text-xl md:text-2xl lg:text-3xl font-black text-white leading-[1.1] tracking-tight max-w-3xl"
          >
            Upgrade your laptop experience with confidence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-3 text-xs md:text-sm text-slate-200/85 leading-relaxed max-w-2xl"
          >
            Shop genuine laptops, performance parts, accessories and expert repair services from a team that understands everyday users, students, creators and businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-5 grid grid-cols-2 gap-2.5 max-w-md"
          >
            <Link to="/shop" className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#0f172a] font-bold text-xs shadow-[0_12px_30px_rgba(255,255,255,0.16)] hover:-translate-y-0.5 transition-all duration-300">
              Shop products <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/repair" className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs backdrop-blur-md hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300">
              Book repair
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="mt-4 grid grid-cols-3 gap-2 max-w-md"
          >
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link key={label} to={to} className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2.5 py-2.5 text-white/90 backdrop-blur-md hover:bg-white/15 transition-all duration-300">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-lg shadow-black/10">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-semibold leading-tight">{label}</span>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48 }}
            className="mt-6 grid grid-cols-4 gap-3 max-w-md"
          >
            {stats.map(([num, label]) => (
              <div key={label}>
                <p className="text-lg md:text-xl font-black text-white">{num}</p>
                <p className="mt-0.5 text-[10px] text-slate-300 uppercase tracking-wide font-semibold leading-tight">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#08101f]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 grid grid-cols-3 gap-3">
          {trustItems(threshold).map(([Icon, text]) => (
            <div key={text} className="flex items-center justify-center gap-1.5 text-slate-200 text-xs font-semibold">
              <Icon className="w-3.5 h-3.5 text-cyan-300" /> {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


