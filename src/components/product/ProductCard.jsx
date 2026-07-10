import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { wishlistAPI } from '../../api/services'
import { formatPrice, getDiscount } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ProductCard({ product, compact }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const [wishlisted, setWishlisted] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  const discount = getDiscount(product.price, product.comparePrice)
  const img = product.thumbnail || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'
  const productHref = `/product/${product.slug}`

  const handleCardClick = () => {
    navigate(productHref)
  }

  const handleCardKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(productHref)
    }
  }

  const handleQuickView = e => {
    e.stopPropagation()
    navigate(productHref)
  }

  const handleCart = async e => {
    e.stopPropagation()
    setCartLoading(true)
    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity: 1,
        product: {
          name: product.name,
          thumbnail: product.thumbnail || product.images?.[0]?.url,
          slug: product.slug,
          price: product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price,
          brand: product.brand
        }
      })).unwrap()
      toast.success('Added to cart!')
    } catch (err) { toast.error(err || 'Failed') } finally { setCartLoading(false) }
  }

  const handleWishlist = async e => {
    e.stopPropagation()
    if (!user) { toast.error('Please login'); return }
    try {
      await wishlistAPI.toggle({ productId: product.id })
      setWishlisted(w => !w)
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    } catch { toast.error('Failed') }
  }

  if (compact) {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="product-card block group cursor-pointer w-full"
          onClick={handleCardClick}
          onKeyDown={handleCardKeyDown}
          role="link"
          tabIndex={0}
        >
          <div className="product-img-wrap relative">
            <img src={img} alt={product.name} loading="lazy" />
            {discount > 0 && (
              <span className="absolute top-2 left-2 badge bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                -{discount}%
              </span>
            )}
          </div>
          <div className="p-2.5">
            <p className="text-[10px] text-[#64748B] mb-0.5 font-medium truncate">{product.brand?.name || product.category?.name}</p>
            <h3 className="font-semibold text-[#111827] text-xs leading-tight mb-1.5 line-clamp-2 min-h-[1.75rem]">{product.name}</h3>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-sm font-bold text-[#111827] truncate block">{formatPrice(product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price)}</span>
                {product.comparePrice && (
                  <span className="text-[10px] text-[#94a3b8] line-through">{formatPrice(product.comparePrice)}</span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleCart}
                disabled={cartLoading || product.stock === 0}
                className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg shadow-md shadow-primary/30 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              >
                {cartLoading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiShoppingCart className="w-3 h-3" />{product.stock === 0 ? 'Out' : 'Add'}</>}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="product-card block group cursor-pointer w-full"
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="link"
        tabIndex={0}
      >
        <div className="product-img-wrap relative">
          <img src={img} alt={product.name} loading="lazy" />
          {discount > 0 && (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 badge bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 badge bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg animate-pulse">
              ⚡ Flash
            </span>
          )}
          {product.condition === 'refurbished' && (
            <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 badge bg-emerald-500/90 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-sm">
              Refurbished
            </span>
          )}
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-[#64748B] hover:text-red-500'}`}>
              <FiHeart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleCart}
              disabled={cartLoading}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg text-[#64748B] hover:text-primary transition-all duration-200">
              {cartLoading ? <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <FiShoppingCart className="w-4 h-4" />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleQuickView}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg text-[#64748B] hover:text-primary transition-all duration-200">
              <FiEye className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-[#64748B] mb-0.5 sm:mb-1 font-medium truncate">{product.brand?.name || product.category?.name}</p>
          <h3 className="font-semibold text-[#111827] text-xs sm:text-sm leading-tight mb-1.5 sm:mb-2 line-clamp-2 min-h-[2rem] sm:min-h-auto">{product.name}</h3>

          {product.avgRating > 0 && (
            <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
              <span className="text-[10px] sm:text-xs text-[#64748B] ml-1">({product.totalReviews})</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-bold text-[#111827] truncate block">{formatPrice(product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price)}</span>
              {product.comparePrice && (
                <span className="text-[10px] sm:text-xs text-[#94a3b8] line-through ml-1 sm:ml-2">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleCart}
              disabled={cartLoading || product.stock === 0}
              className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-primary to-secondary text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-md shadow-primary/30 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
              {product.stock === 0 ? 'Out' : 'Add'}
            </motion.button>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] sm:text-xs text-amber-500 mt-1 sm:mt-1.5 font-medium">Only {product.stock} left!</p>
          )}
          {product.stock === 0 && (
            <p className="text-[10px] sm:text-xs text-red-500 mt-1 sm:mt-1.5 font-medium">Out of stock</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
