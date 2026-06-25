import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'
import { categoryAPI, productAPI } from '../api/services'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { useState } from 'react'

export default function CategoryPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(1)

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryAPI.getOne(slug).then(r => r.data.data)
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'category', slug, page],
    queryFn: () => productAPI.getAll({ category: category?.id, page, limit: 12 }).then(r => r.data),
    enabled: !!category?.id
  })

  const products = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <Helmet><title>{category?.name || 'Category'} – Ozone Lapcare</title></Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1e2d4a] py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #2875B7, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <FiChevronRight className="w-3.5 h-3.5" />
            <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
            <FiChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{category?.name}</span>
          </nav>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white mb-2">{category?.name || slug}</motion.h1>
          {category?.description && <p className="text-slate-400 max-w-xl">{category.description}</p>}
          {pagination && <p className="text-slate-500 text-sm mt-2">{pagination.total} products</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading || !category ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="text-xl font-bold mb-2">No Products Found</h3>
            <p className="text-[#64748B] mb-6">No products in this category yet</p>
            <Link to="/shop" className="premium-button">Browse All Products</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {pagination?.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="premium-button-ghost text-sm px-4 py-2 disabled:opacity-40">Prev</button>
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold ${page === i + 1 ? 'gradient-bg text-white' : 'glass-card hover:bg-white'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="premium-button-ghost text-sm px-4 py-2 disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
