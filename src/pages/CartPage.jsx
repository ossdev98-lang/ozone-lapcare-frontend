import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiTrash2, FiMinus, FiPlus, FiTag, FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { updateCartItem, removeFromCart, applyCoupon, removeCoupon } from '../store/cartSlice'
import { formatPrice } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal, tax, shipping, total, coupon, loading } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [discount, setDiscount] = useState(0)

  const handleQty = (id, qty) => dispatch(updateCartItem({ id, quantity: qty }))
  const handleRemove = id => dispatch(removeFromCart(id))

  const handleCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const result = await dispatch(applyCoupon(couponCode.trim())).unwrap()
      setDiscount(result.discount)
      toast.success(`Coupon applied! You saved ${formatPrice(result.discount)}`)
    } catch (err) { toast.error(err || 'Invalid coupon') } finally { setCouponLoading(false) }
  }

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon())
    setDiscount(0)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <FiShoppingBag className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-3">Your Cart is Empty</h2>
          <p className="text-[#64748B] mb-6">Please login to view your cart</p>
          <Link to="/login" className="premium-button">Sign In</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-black mb-3">Your Cart is Empty</h2>
          <p className="text-[#64748B] mb-6">Add some amazing products to get started!</p>
          <Link to="/shop" className="premium-button">Browse Products</Link>
        </div>
      </div>
    )
  }

  const grandTotal = total - discount

  return (
    <>
      <Helmet><title>Cart – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111827] mb-8">Shopping Cart <span className="text-[#64748B] text-lg font-normal">({items.length} items)</span></h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                    className="glass-card p-5 flex gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                      <img src={item.product?.thumbnail || item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200'}
                        alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?.slug}`} className="font-semibold text-[#111827] hover:text-primary transition-colors text-sm line-clamp-2">
                        {item.product?.name}
                      </Link>
                      <p className="text-xs text-[#64748B] mt-1">{item.product?.brand?.name}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl">
                          <button onClick={() => handleQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                            className="text-[#64748B] hover:text-primary disabled:opacity-40 cursor-pointer"><FiMinus className="w-3.5 h-3.5" /></button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => handleQty(item.id, item.quantity + 1)}
                            className="text-[#64748B] hover:text-primary cursor-pointer"><FiPlus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#111827]">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                          <p className="text-xs text-[#94a3b8]">{formatPrice(item.price)} each</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(item.id)}
                      className="p-2 rounded-xl text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-all self-start cursor-pointer">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2"><FiTag className="w-4 h-4 text-primary" />Coupon Code</h3>
                {coupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div>
                      <p className="text-sm font-bold text-emerald-700">{coupon.code}</p>
                      <p className="text-xs text-emerald-600">-{formatPrice(discount)} saved</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code" className="premium-input text-sm flex-1" />
                    <Button onClick={handleCoupon} loading={couponLoading} size="sm">Apply</Button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-[#111827] mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#374151]">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#374151]">
                    <span>Tax (18% GST)</span><span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-[#374151]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="border-t border-white/30 pt-3 flex justify-between font-black text-[#111827] text-lg">
                    <span>Total</span><span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Button onClick={() => navigate('/checkout')} className="w-full mt-6 py-4 text-base">
                  Proceed to Checkout <FiArrowRight className="w-5 h-5" />
                </Button>

                {shipping > 0 && (
                  <p className="text-xs text-[#64748B] text-center mt-3">Add ₹{formatPrice(999 - subtotal)} more for free shipping</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
