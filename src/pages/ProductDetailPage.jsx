import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, FiRefreshCw, FiShare2, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { productAPI, reviewAPI, wishlistAPI, settingsAPI } from '../api/services'
import { addToCart } from '../store/cartSlice'
import { formatPrice, getDiscount } from '../utils/helpers'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [qty, setQty] = useState(1)
  const [selImg, setSelImg] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [tab, setTab] = useState('specs')
  const [cartLoading, setCartLoading] = useState(false)
  const [zoom, setZoom] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getOne(slug).then(r => r.data.data)
  })
  const { data: settings } = useQuery({ queryKey: ['settings-public'], queryFn: () => settingsAPI.getPublic().then(r => r.data.data) })
  const freeShippingThreshold = settings?.freeShippingThreshold || 999

  const { data: related } = useQuery({
    queryKey: ['related', product?.id],
    queryFn: () => productAPI.getRelated(product.id).then(r => r.data.data),
    enabled: !!product?.id
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => reviewAPI.getByProduct(product.id, { limit: 5 }).then(r => r.data),
    enabled: !!product?.id
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!product) return <div className="min-h-screen flex items-center justify-center text-[#64748B]">Product not found</div>

  const images = product.images?.length ? product.images : [{ url: product.thumbnail || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' }]
  const discount = getDiscount(product.price, product.comparePrice)
  const price = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price

  const handleCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); return }
    setCartLoading(true)
    try {
      await dispatch(addToCart({ productId: product.id, quantity: qty })).unwrap()
      toast.success(`${qty} item(s) added to cart!`)
    } catch (err) { toast.error(err || 'Failed to add') } finally { setCartLoading(false) }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return }
    try {
      await wishlistAPI.toggle({ productId: product.id })
      setWishlisted(w => !w)
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
    } catch { toast.error('Failed') }
  }

  return (
    <>
      <Helmet>
        <title>{product.name} – Ozone Lapcare</title>
        <meta name="description" content={product.shortDescription || product.description} />
      </Helmet>

      <div className="min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#64748B] mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <FiChevronRight className="w-3.5 h-3.5" />
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <FiChevronRight className="w-3.5 h-3.5" />
            {product.category && <><Link to={`/category/${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link><FiChevronRight className="w-3.5 h-3.5" /></>}
            <span className="text-[#111827] font-medium truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 mb-16">
            {/* Gallery */}
            <div>
              <motion.div
                className="glass-card overflow-hidden mb-4 cursor-zoom-in relative"
                onClick={() => setZoom(true)}
              >
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                  <motion.img
                    key={selImg}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={images[selImg]?.url}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-lg">
                      -{discount}%
                    </span>
                  )}
                </div>
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${selImg === i ? 'border-primary shadow-lg shadow-primary/30' : 'border-white/40 hover:border-primary/50'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Zoom Modal */}
              <AnimatePresence>
                {zoom && (
                  <motion.div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setZoom(false)}>
                    <motion.img src={images[selImg]?.url} alt={product.name}
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                      className="max-w-full max-h-full object-contain rounded-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.brand && <span className="badge-primary">{product.brand.name}</span>}
                  <span className={`badge ${product.condition === 'new' ? 'badge-success' : product.condition === 'refurbished' ? 'badge-warning' : 'badge-info'} capitalize`}>
                    {product.condition}
                  </span>
                  {product.stock <= 5 && product.stock > 0 && <span className="badge-warning">Only {product.stock} left</span>}
                  {product.stock === 0 && <span className="badge-danger">Out of Stock</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-[#111827] leading-tight">{product.name}</h1>
              </div>

              {product.avgRating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}
                  </div>
                  <span className="font-semibold text-[#111827]">{product.avgRating}</span>
                  <span className="text-[#64748B] text-sm">({product.totalReviews} reviews)</span>
                </div>
              )}

              <div className="glass-card p-5">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-black text-[#111827]">{formatPrice(price)}</span>
                  {product.comparePrice && <span className="text-xl text-[#94a3b8] line-through">{formatPrice(product.comparePrice)}</span>}
                  {discount > 0 && <span className="text-emerald-500 font-bold text-sm">You save {formatPrice(product.comparePrice - price)}</span>}
                </div>
                <p className="text-xs text-[#64748B]">Inclusive of all taxes. GST: {product.gstPercent}%</p>
              </div>

              {product.shortDescription && (
                <p className="text-[#374151] text-sm leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Quantity & Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-[#64748B] hover:text-primary transition-colors cursor-pointer"><FiMinus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-bold text-[#111827]">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} className="text-[#64748B] hover:text-primary transition-colors cursor-pointer disabled:opacity-40"><FiPlus className="w-4 h-4" /></button>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCart} disabled={cartLoading || product.stock === 0}
                  className="flex-1 premium-button py-4 text-base">
                  {cartLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiShoppingCart className="w-5 h-5" />{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</>}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleWishlist}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${wishlisted ? 'bg-red-50 border-red-400 text-red-500' : 'border-white/40 text-[#64748B] hover:border-red-400 hover:text-red-500 bg-white/60 backdrop-blur-sm'}`}>
                  <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                 {[[FiTruck, 'Free Delivery', `On orders ₹${freeShippingThreshold}+`], [FiShield, 'Genuine Product', 'Brand warranty'], [FiRefreshCw, 'Easy Returns', '7-day returns']].map(([Icon, title, sub]) => (
                  <div key={title} className="glass-card p-3 text-center">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-[#111827]">{title}</p>
                    <p className="text-[10px] text-[#64748B]">{sub}</p>
                  </div>
                ))}
              </div>

              {/* SKU & Warranty */}
              <div className="text-sm text-[#64748B] space-y-1">
                {product.sku && <p>SKU: <span className="text-[#111827] font-medium">{product.sku}</span></p>}
                {product.warrantyMonths && <p>Warranty: <span className="text-[#111827] font-medium">{product.warrantyMonths} months</span></p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card mb-10">
            <div className="flex border-b border-white/20 overflow-x-auto">
              {[['specs', 'Specifications'], ['desc', 'Description'], ['reviews', `Reviews (${product.totalReviews})`]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer ${tab === key ? 'border-primary text-primary' : 'border-transparent text-[#64748B] hover:text-[#111827]'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {tab === 'specs' && (
                  <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {product.specifications?.length ? (
                      <div className="space-y-2">
                        {product.specifications.map((s, index) => (
                          <div key={s.id} className="flex gap-3 p-3 rounded-xl bg-white/40">
                            <span className="text-sm text-[#64748B] w-8 shrink-0">{index + 1}.</span>
                            <span className="text-sm text-[#64748B] w-28 shrink-0">{s.key}</span>
                            <span className="text-sm font-medium text-[#111827]">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-[#64748B] text-sm">No specifications available</p>}
                  </motion.div>
                )}
                {tab === 'desc' && (
                  <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="text-[#374151] leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || 'No description available' }} />
                  </motion.div>
                )}
                {tab === 'reviews' && (
                  <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {reviewsData?.data?.length ? (
                      <div className="space-y-5">
                        {reviewsData.data.map(r => (
                          <div key={r.id} className="p-4 rounded-2xl bg-white/40 border border-white/30">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                                  {r.user?.name?.[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#111827]">{r.user?.name}</p>
                                  {r.isVerified && <span className="text-[10px] text-emerald-500">✓ Verified Purchase</span>}
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}
                              </div>
                            </div>
                            {r.title && <p className="font-semibold text-sm text-[#111827] mb-1">{r.title}</p>}
                            <p className="text-sm text-[#374151]">{r.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-[#64748B] text-sm">No reviews yet. Be the first to review!</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products */}
          {related?.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-[#111827] mb-6">Related <span className="gradient-text">Products</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
