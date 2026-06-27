import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import Hero from '../components/home/Hero'
import Categories from '../components/home/Categories'
import { BrandsSection, FeaturedProducts, FlashSale } from '../components/home/Sections'
import { Testimonials, Newsletter } from '../components/home/Testimonials'
import OfferSlider from '../components/home/OfferSlider'
import { useQuery } from '@tanstack/react-query'
import { productAPI } from '../api/services'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { FiArrowRight, FiAward, FiRefreshCcw, FiTool, FiTruck } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function SectionHeader({ eyebrow, title, highlight, subtitle, to }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
      <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
        {eyebrow && <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-3">{eyebrow}</span>}
        <h2 className="section-title">{title} <span className="gradient-text">{highlight}</span></h2>
        <p className="section-subtitle">{subtitle}</p>
      </motion.div>
      {to && (
        <Link to={to} className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
          View all <FiArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function PromiseBand() {
  const items = [
    { icon: FiAward, title: 'Genuine stock', text: 'Clear product details and dependable sourcing.' },
    { icon: FiTool, title: 'Repair expertise', text: 'Support for upgrades, parts and laptop care.' },
    { icon: FiTruck, title: 'Fast fulfilment', text: 'Delivery and pickup options for smoother buying.' },
    { icon: FiRefreshCcw, title: 'After-sale help', text: 'Guidance after purchase, not just before checkout.' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BestSellers() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: () => productAPI.getAll({ sort: 'totalSold', order: 'DESC', limit: 8 }).then(r => r.data.data)
  })
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Customer favourites" title="Best" highlight="Sellers" subtitle="Most loved products from shoppers like you." to="/shop?sort=totalSold" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Fresh stock" title="New" highlight="Arrivals" subtitle="Recently added laptops, accessories and parts." to="/shop?sort=createdAt" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <OfferSlider />
      <PromiseBand />
      <Categories />
      <BrandsSection />
      <FeaturedProducts />
      <FlashSale />
      <BestSellers />
      <NewArrivals />
      <Testimonials />
      <Newsletter />
    </>
  )
}
