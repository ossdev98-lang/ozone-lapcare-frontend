import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { categoryAPI } from '../../api/services'
import { FiMonitor, FiZap, FiCpu, FiPackage, FiHardDrive, FiWifi, FiArrowRight } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const iconMap = { FiMonitor, FiZap, FiCpu, FiPackage, FiHardDrive, FiWifi }
const defaultIcons = [FiMonitor, FiZap, FiCpu, FiPackage, FiHardDrive, FiWifi]
const gradients = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-fuchsia-500',
  'from-amber-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-indigo-500 to-blue-500',
  'from-slate-700 to-slate-900',
]

export default function Categories() {
  const { data } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll().then(r => r.data.data) })

  const categories = data?.length ? data : [
    { id: 1, name: 'Laptops', slug: 'laptops' },
    { id: 2, name: 'Gaming Laptops', slug: 'gaming-laptops' },
    { id: 3, name: 'Laptop Parts', slug: 'laptop-parts' },
    { id: 4, name: 'Accessories', slug: 'accessories' },
    { id: 5, name: 'SSDs & Storage', slug: 'ssd-storage' },
    { id: 6, name: 'Networking', slug: 'networking' },
  ]

  return (
    <section className="py-2 md:py-4 px-0 md:px-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-5 mb-3 md:mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-3">Shop faster</span>
            <h2 className="section-title">Explore by <span className="gradient-text">Category</span></h2>
            <p className="section-subtitle">Jump straight into the products and services your laptop needs.</p>
          </motion.div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            Browse all products <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="md:hidden pb-4">
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={3}
          spaceBetween={12}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
          loop
        >
          {categories.slice(0, 6).map((cat, i) => {
            const Icon = iconMap[cat.icon] || defaultIcons[i % defaultIcons.length]
            return (
              <SwiperSlide key={cat.id}>
                <Link to={`/category/${cat.slug}`} className="group relative block overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-slate-900 leading-tight">{cat.name}</span>
                    <FiArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-white/80" />
                </Link>
              </SwiperSlide>
            )
          })}
        </Swiper>
        <div className="swiper-pagination-custom flex items-center justify-center gap-1.5 mt-4" />
      </div>

      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat, i) => {
            const Icon = iconMap[cat.icon] || defaultIcons[i % defaultIcons.length]
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/category/${cat.slug}`} className="group relative block overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-5 min-h-40 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <span className="text-sm font-extrabold text-slate-900 leading-tight">{cat.name}</span>
                    <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-white/80" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
