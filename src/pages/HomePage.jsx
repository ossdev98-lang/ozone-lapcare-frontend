import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import Hero from '../components/home/Hero'
import Categories from '../components/home/Categories'
import { BrandsSection, FeaturedProducts, FlashSale } from '../components/home/Sections'
import { Testimonials, Newsletter } from '../components/home/Testimonials'
import AdPopup from '../components/home/AdPopup'
import InfoBar from '../components/home/InfoBar'
import { useQuery } from '@tanstack/react-query'
import { productAPI } from '../api/services'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function BestSellers() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: () => productAPI.getAll({ sort: 'totalSold', order: 'DESC', limit: 8 }).then(r => r.data.data)
  })
  return (
    <section className="py-4 md:py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-5 mb-3 md:mb-8">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-2 md:mb-3">Customer favourites</span>
            <h2 className="section-title text-xl md:text-2xl">Best <span className="gradient-text">Sellers</span></h2>
            <p className="text-[11px] md:text-sm text-slate-500 mt-1 md:mt-2 leading-relaxed max-w-xl">Most loved products from shoppers like you.</p>
          </motion.div>
          <Link to="/shop?sort=totalSold" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:hidden">
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
            {isLoading ? [...Array(8)].map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[calc(50%-0.625rem)]"><ProductCardSkeleton compact /></div>
            )) : (data || []).map(p => (
              <div key={p.id} className="snap-start shrink-0 w-[calc(50%-0.625rem)]"><ProductCard product={p} compact /></div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />) :
            (data || []).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productAPI.getAll({ sort: 'createdAt', order: 'DESC', limit: 4 }).then(r => r.data.data)
  })
  return (
    <section className="py-4 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-5 mb-3 md:mb-8">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-2 md:mb-3">Fresh stock</span>
            <h2 className="section-title text-xl md:text-2xl">New <span className="gradient-text">Arrivals</span></h2>
            <p className="text-[11px] md:text-sm text-slate-500 mt-1 md:mt-2 leading-relaxed max-w-xl">Recently added laptops, accessories and parts.</p>
          </motion.div>
          <Link to="/shop?sort=createdAt" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:hidden">
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
            {isLoading ? [...Array(4)].map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[calc(50%-0.625rem)]"><ProductCardSkeleton compact /></div>
            )) : (data || []).map(p => (
              <div key={p.id} className="snap-start shrink-0 w-[calc(50%-0.625rem)]"><ProductCard product={p} compact /></div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />) :
            (data || []).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Ozone Lapcare - Your Laptop Care Experts | Buy Laptops Online India</title>
        <meta name="description" content="Buy laptops, gaming laptops, refurbished laptops, parts and accessories. Expert repair services and dependable support in India." />
      </Helmet>
      <Hero />
      <InfoBar />
      <Categories />
      <BrandsSection />
      <FeaturedProducts />
      <FlashSale />
      <BestSellers />
      <NewArrivals />
      <Testimonials />
      <Newsletter />
      <AdPopup />
    </>
  )
}
