import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'
import { brandAPI, productAPI } from '../api/services'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { useState } from 'react'

export default function BrandPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(1)

  const { data: brand } = useQuery({
    queryKey: ['brand', slug],
    queryFn: () => brandAPI.getOne(slug).then(r => r.data.data)
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'brand', slug, page],
    queryFn: () => productAPI.getAll({ brand: brand?.id, page, limit: 12 }).then(r => r.data),
    enabled: !!brand?.id
  })

  const products = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <Helmet><title>{brand?.name || 'Brand'} Laptops – Ozone Lapcare</title></Helmet>

      <div className="bg-gradient-to-br from-[#0F172A] to-[#1e2d4a] py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #2BB7B2, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-3 md:mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <FiChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <Link to="/shop" className="hover:text-white">Shop</Link>
            <FiChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="text-white">{brand?.name}</span>
          </nav>
          <div className="flex items-center gap-3 md:gap-5">
            {brand?.logo && (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white flex items-center justify-center p-2 md:p-3 shadow-xl">
                <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl font-black text-white">{brand?.name}</motion.h1>
              {brand?.description && <p className="text-slate-400 text-xs md:text-base mt-0.5 md:mt-1 line-clamp-2 md:line-clamp-none">{brand.description}</p>}
              {pagination && <p className="text-slate-500 text-xs md:text-sm mt-1 md:mt-2">{pagination.total} products</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
        {isLoading || !brand ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-8 md:p-16 text-center">
            <p className="text-4xl md:text-5xl mb-3 md:mb-4">📦</p>
            <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">No Products Found</h3>
            <Link to="/shop" className="premium-button mt-4 md:mt-6 text-xs md:text-base px-4 md:px-6 py-2 md:py-3 inline-block">Browse All</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {pagination?.pages > 1 && (
              <div className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="premium-button-ghost text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 disabled:opacity-40">Prev</button>
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold ${page === i + 1 ? 'gradient-bg text-white' : 'glass-card'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="premium-button-ghost text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
