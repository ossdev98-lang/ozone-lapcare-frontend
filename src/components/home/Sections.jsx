import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { brandAPI, productAPI } from '../../api/services'
import ProductCard from '../product/ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const brandLogos = {
  dell: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Dell_Logo.png/100px-Dell_Logo.png',
  hp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/100px-HP_logo_2012.svg.png',
  lenovo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/150px-Lenovo_logo_2015.svg.png',
  asus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/150px-ASUS_Logo.svg.png',
  acer: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Acer_2011.svg/100px-Acer_2011.svg.png',
  apple: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/80px-Apple_logo_black.svg.png',
}

export function BrandsSection() {
  const { data } = useQuery({ queryKey: ['brands'], queryFn: () => brandAPI.getAll().then(r => r.data.data) })
  const brands = data?.length ? data : Object.keys(brandLogos).map((b, i) => ({ id: i, name: b, slug: b, logo: brandLogos[b] }))

  return (
    <section className="py-2 md:py-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-3 mb-3 md:mb-6">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-3">Authorized selection</span>
            <h2 className="section-title text-xl md:text-2xl">Shop trusted <span className="gradient-text">Brands</span></h2>
            <p className="text-[11px] md:text-sm text-slate-500 mt-1 md:mt-2 leading-relaxed max-w-xl">Explore laptops and accessories from names customers already rely on.</p>
          </motion.div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200">
            Explore catalog <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {brands.slice(0, 6).map((brand, i) => (
            <motion.div key={brand.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/brand/${brand.slug}`} className="group flex h-16 md:h-24 items-center justify-center rounded-xl md:rounded-2xl border border-slate-100 bg-white px-2 md:px-6 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-6 md:max-h-10 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-65 group-hover:opacity-100" />
                ) : (
                  <span className="font-extrabold text-sm md:text-lg text-slate-500 group-hover:text-primary transition-colors capitalize">{brand.name}</span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productAPI.getAll({ isFeatured: true, limit: 8 }).then(r => r.data.data)
  })

  return (
    <section className="py-4 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-5 mb-4 md:mb-8">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-3">Editor picks</span>
            <h2 className="section-title text-xl md:text-2xl">Featured <span className="gradient-text">Products</span></h2>
            <p className="text-[11px] md:text-sm text-slate-500 mt-1 md:mt-2 leading-relaxed max-w-xl">Handpicked laptops, parts and accessories worth checking first.</p>
          </motion.div>
          <Link to="/shop?isFeatured=true" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:hidden">
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={2}
            spaceBetween={10}
            grid={{ rows: 2, fill: 'row' }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.swiper-pagination-featured' }}
          >
            {isLoading ? [...Array(8)].map((_, i) => <SwiperSlide key={i}><ProductCardSkeleton compact /></SwiperSlide>) :
              (data || []).map(p => <SwiperSlide key={p.id}><ProductCard product={p} compact /></SwiperSlide>)}
          </Swiper>
          <div className="swiper-pagination-featured flex items-center justify-center gap-1.5 mt-4" />
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />) :
            (data || []).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

export function FlashSale() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'flash'],
    queryFn: () => productAPI.getAll({ isFlashSale: true, limit: 5 }).then(r => r.data.data)
  })
  if (!data?.length && !isLoading) return null

  return (
    <section className="py-8 md:py-12 bg-slate-100 overflow-hidden">
      <div className="max-w-[94rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 px-6 sm:px-8 lg:px-10 pt-36 pb-10 sm:pb-12 shadow-[0_24px_70px_rgba(40,117,183,0.25)] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(34rem,78vw)] bg-white px-6 pt-6 pb-8 text-center rounded-b-[4.5rem] shadow-[0_12px_35px_rgba(40,117,183,0.18)]">
            <motion.div initial={{ opacity: 0, y: -14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">
                Best Selling <span className="text-primary">Products</span>
              </h2>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm md:text-base font-bold text-primary">
                <FiClock className="w-4 h-4" /> Up to 69% discount for limited time
              </p>
            </motion.div>
          </div>

          <div className="absolute top-7 left-7 hidden lg:block h-16 w-16 rounded-full bg-primary/15" />
          <div className="absolute bottom-10 right-10 hidden lg:block h-24 w-24 rounded-full bg-secondary/15" />

          <div className="relative flex justify-end mb-6">
            <Link to="/shop?isFlashSale=true" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-extrabold text-primary shadow-sm backdrop-blur-sm hover:bg-white hover:gap-3 transition-all">
              View sale <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="md:hidden">
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              spaceBetween={16}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true, el: '.swiper-pagination-flash' }}
              className="w-full"
            >
              {isLoading ? [...Array(5)].map((_, i) => (
                <SwiperSlide key={i} className="w-full"><ProductCardSkeleton compact /></SwiperSlide>
              )) : (
                (data || []).slice(0, 5).map(p => (
                  <SwiperSlide key={p.id} className="w-full"><ProductCard product={p} compact /></SwiperSlide>
                ))
              )}
            </Swiper>
            <div className="swiper-pagination-flash flex items-center justify-center gap-1.5 mt-4" />
          </div>
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-5">
            {isLoading ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />) :
              (data || []).slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </section>
  )
}


