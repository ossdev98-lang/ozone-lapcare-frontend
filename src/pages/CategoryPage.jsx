import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight, FiSearch, FiFilter, FiSliders, FiX, FiTag, FiChevronDown } from 'react-icons/fi'
import { categoryAPI, productAPI, brandAPI } from '../api/services'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { useState, useEffect } from 'react'

const sortOptions = [
  { value: 'createdAt-DESC', label: 'Latest' },
  { value: 'totalSold-DESC', label: 'Most Popular' },
  { value: 'price-ASC', label: 'Price: Low to High' },
  { value: 'price-DESC', label: 'Price: High to Low' },
  { value: 'avgRating-DESC', label: 'Top Rated' },
]

const priceRanges = [
  ['0', '20000', 'Under Rs. 20K'],
  ['20000', '50000', 'Rs. 20K - Rs. 50K'],
  ['50000', '100000', 'Rs. 50K - Rs. 1L'],
  ['100000', '', 'Rs. 1L+'],
]

const getFiltersFromParams = searchParams => {
  const sortParam = searchParams.get('sort') || 'createdAt'
  const orderParam = searchParams.get('order') || 'DESC'

  return {
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sort: sortParam,
    order: orderParam,
  }
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const initialFilters = getFiltersFromParams(searchParams)
  const [filters, setFilters] = useState(() => initialFilters)
  const [sortValue, setSortValue] = useState(() => `${initialFilters.sort}-${initialFilters.order}`)

  useEffect(() => {
    const nextFilters = getFiltersFromParams(searchParams)
    setFilters(nextFilters)
    setSortValue(`${nextFilters.sort}-${nextFilters.order}`)
    setPage(1)
  }, [searchParams])

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryAPI.getOne(slug).then(r => r.data.data)
  })

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandAPI.getAll().then(r => r.data.data)
  })

  const queryParams = { ...filters, category: category?.id, page, limit: 12 }
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'category', slug, queryParams],
    queryFn: () => productAPI.getAll(queryParams).then(r => r.data),
    enabled: !!category?.id
  })

  const products = data?.data || []
  const pagination = data?.pagination

  const handleSort = v => {
    setSortValue(v)
    const [sort, order] = v.split('-')
    setFilters(f => ({ ...f, sort, order }))
    setPage(1)
  }

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const setPriceRange = (min, max) => {
    setFilters(f => ({ ...f, minPrice: min, maxPrice: max }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ search: '', brand: '', minPrice: '', maxPrice: '', condition: '', sort: 'createdAt', order: 'DESC' })
    setSortValue('createdAt-DESC')
    setPage(1)
    setSearchParams({})
  }

  const handleSearch = e => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setFilter('search', searchQuery)
      setSearchQuery('')
    }
  }

  const selectedBrand = brands?.find(b => String(b.id) === String(filters.brand))
  const activeFilters = [
    filters.search && `Search: ${filters.search}`,
    selectedBrand && selectedBrand.name,
    filters.condition && filters.condition,
    filters.minPrice && `From Rs. ${Number(filters.minPrice).toLocaleString('en-IN')}`,
    filters.maxPrice && `To Rs. ${Number(filters.maxPrice).toLocaleString('en-IN')}`,
  ].filter(Boolean)

  return (
    <>
      <Helmet><title>{category?.name || 'Category'} – Ozone Lapcare</title></Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <section className="relative overflow-hidden border-b border-slate-100 bg-[#0b1220]">
          <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.20) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.20) 1px, transparent 1px)', backgroundSize: '54px 54px' }} />
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="max-w-3xl">
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs md:text-sm font-bold text-cyan-100 border border-white/15 backdrop-blur-md">
                <FiTag className="w-3.5 h-3.5 md:w-4 md:h-4" /> {category?.name || slug}
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-3 md:mt-5 text-2xl md:text-4xl font-black text-white tracking-tight">
                {category?.name || slug}
              </motion.h1>
              {pagination && <p className="mt-2 md:mt-4 text-slate-400 text-xs md:text-base">{pagination.total} products found</p>}
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-sm p-3 md:p-5 mb-4 md:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-400">
                  <FiTag className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {pagination ? `${pagination.total} products found` : 'Loading products'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search in category..."
                      className="w-40 md:w-48 rounded-xl border border-slate-100 bg-slate-50 pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                  </div>
                </form>

                <button onClick={() => setShowFilters(true)} className="lg:hidden inline-flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-bold text-slate-700">
                  <FiSliders className="w-3.5 h-3.5 md:w-4 md:h-4" /> Filters
                </button>

                <div className="relative min-w-[180px] md:min-w-[220px]">
                  <select value={sortValue} onChange={e => handleSort(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 px-3 md:px-4 py-2 md:py-3 pr-8 md:pr-10 text-xs md:text-sm font-bold text-slate-700 outline-none transition-all focus:border-primary focus:bg-white">
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5 md:gap-2">
                {activeFilters.map(filter => (
                  <span key={filter} className="inline-flex items-center rounded-full bg-blue-50 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold text-primary">{filter}</span>
                ))}
                <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                  Clear <FiX className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 flex items-center gap-2"><FiFilter className="w-4 h-4 text-primary" /> Filters</h3>
                  {activeFilters.length > 0 && <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-bold">Clear</button>}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Search</label>
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <input
                        value={filters.search}
                        onChange={e => setFilter('search', e.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(40,117,183,0.08)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Brand</label>
                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                      <button
                        onClick={() => setFilter('brand', '')}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${!filters.brand ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        All Brands
                      </button>
                      {brands?.map(b => (
                        <button
                          key={b.id}
                          onClick={() => setFilter('brand', b.id)}
                          className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${String(filters.brand) === String(b.id) ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price range</label>
                    <div className="grid grid-cols-2 gap-2">
                      {priceRanges.map(([min, max, label]) => (
                        <button
                          key={`${min}-${max}`}
                          type="button"
                          onClick={() => setPriceRange(min, max)}
                          className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${filters.minPrice === min && filters.maxPrice === max ? 'gradient-bg text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-primary'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Condition</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['', 'new', 'refurbished', 'used'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFilter('condition', c)}
                          className={`rounded-xl px-3 py-2.5 text-sm font-bold capitalize transition-all ${filters.condition === c ? 'gradient-bg text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-primary'}`}
                        >
                          {c || 'All'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <AnimatePresence>
              {showFilters && (
                <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
                  <motion.div initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }} transition={{ type: 'spring', damping: 25 }} className="absolute left-0 top-0 bottom-0 w-[88vw] max-w-sm bg-white p-6 overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-slate-900 flex items-center gap-2"><FiFilter className="w-4 h-4 text-primary" /> Filters</h3>
                      <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-slate-100"><FiX className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Search</label>
                        <div className="relative">
                          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                          <input
                            value={filters.search}
                            onChange={e => setFilter('search', e.target.value)}
                            placeholder="Search products..."
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Brand</label>
                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                          <button onClick={() => setFilter('brand', '')} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${!filters.brand ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>All Brands</button>
                          {brands?.map(b => (
                            <button key={b.id} onClick={() => setFilter('brand', b.id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${String(filters.brand) === String(b.id) ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>{b.name}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price range</label>
                        <div className="grid grid-cols-2 gap-2">
                          {priceRanges.map(([min, max, label]) => (
                            <button key={`${min}-${max}`} onClick={() => setPriceRange(min, max)} className={`rounded-xl px-3 py-2 text-xs font-bold ${filters.minPrice === min && filters.maxPrice === max ? 'gradient-bg text-white' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-primary'}`}>{label}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Condition</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['', 'new', 'refurbished', 'used'].map(c => (
                            <button key={c} onClick={() => setFilter('condition', c)} className={`rounded-xl px-3 py-2.5 text-sm font-bold capitalize ${filters.condition === c ? 'gradient-bg text-white' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-primary'}`}>{c || 'All'}</button>
                          ))}
                        </div>
                      </div>
                      <button onClick={clearFilters} className="w-full py-3 rounded-2xl border border-red-100 bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-colors">Clear all filters</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                  {[...Array(9)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-8 sm:p-12 md:p-16 text-center shadow-sm">
                  <div className="mx-auto mb-3 md:mb-5 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-blue-50 text-primary">
                    <FiSearch className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-1 md:mb-2">No Products Found</h3>
                  <p className="text-slate-500 text-xs md:text-base mb-4 md:mb-7">Try adjusting your filters or search terms.</p>
                  <button onClick={clearFilters} className="premium-button text-xs md:text-base px-4 md:px-6 py-2 md:py-3">Clear filters</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>

                  {pagination?.pages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-6 md:mt-10">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-slate-100 bg-white px-3 md:px-4 py-1.5 md:py-2.5 text-xs md:text-sm font-bold text-slate-600 shadow-sm hover:text-primary disabled:opacity-40">Prev</button>
                      {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                        const p = i + 1
                        return (
                          <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 md:w-10 md:h-10 rounded-xl text-xs md:text-sm font-bold transition-all ${page === p ? 'gradient-bg text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 border border-slate-100 hover:text-primary'}`}>
                            {p}
                          </button>
                        )
                      })}
                      <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="rounded-xl border border-slate-100 bg-white px-3 md:px-4 py-1.5 md:py-2.5 text-xs md:text-sm font-bold text-slate-600 shadow-sm hover:text-primary disabled:opacity-40">Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}