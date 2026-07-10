import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiMapPin, FiPlus, FiCheck, FiCreditCard, FiTruck } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { addressAPI, orderAPI } from '../api/services'
import { formatPrice } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const paymentMethods = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: FiTruck },
  { id: 'razorpay', label: 'Pay Online (Razorpay)', desc: 'Cards, UPI, Net Banking', icon: FiCreditCard },
  // { id: 'cashfree', label: 'Pay Online (Cashfree)', desc: 'Cards, UPI, Wallets', icon: FiCreditCard },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, tax, shipping, total, discount } = useSelector(s => s.cart)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.getAll().then(r => r.data.data)
  })

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', type: 'home', isDefault: false })
  const [addressLoading, setAddressLoading] = useState(false)

  const handleAddAddress = async e => {
    e.preventDefault()
    setAddressLoading(true)
    try {
      await addressAPI.create(addressForm)
      toast.success('Address added')
      setShowAddressForm(false)
      refetchAddresses()
    } catch { toast.error('Failed to add address') } finally { setAddressLoading(false) }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    if (items.length === 0) { toast.error('Cart is empty'); return }
    setLoading(true)
    try {
      if (paymentMethod === 'cod') {
        const res = await orderAPI.create({ addressId: selectedAddress, paymentMethod, notes })
        toast.success('Order placed successfully!')
        navigate(`/orders/${res.data.data.id}?success=true`)
      } else if (paymentMethod === 'razorpay') {
        const res = await orderAPI.create({ addressId: selectedAddress, paymentMethod, notes })
        const order = res.data.data
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.razorpayAmount || Math.round(grandTotal * 100),
          currency: 'INR',
          name: 'Ozone Lapcare',
          description: `Order #${order.id}`,
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              await orderAPI.verifyPayment({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              toast.success('Payment successful!')
              navigate(`/orders/${order.id}?success=true`)
            } catch { toast.error('Payment verification failed') }
          },
          prefill: { name: '', email: '', contact: '' },
          theme: { color: '#6366f1' },
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'))
        rzp.open()
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order') } finally { setLoading(false) }
  }

  const grandTotal = total

  return (
    <>
      <Helmet><title>Checkout – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-black text-[#111827] mb-5 md:mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6 min-w-0">
              {/* Delivery Address */}
              <div className="glass-card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-[#111827] flex items-center gap-2"><FiMapPin className="w-5 h-5 text-primary" />Delivery Address</h2>
                  <button onClick={() => setShowAddressForm(v => !v)} className="text-sm text-primary flex items-center gap-1 hover:underline cursor-pointer">
                    <FiPlus className="w-4 h-4" />Add New
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 rounded-2xl bg-white/40 border border-white/30">
                      {[['name', 'Full Name', 'sm:col-span-2'], ['phone', 'Phone Number', ''], ['line1', 'Address Line 1', 'sm:col-span-2'], ['line2', 'Address Line 2 (Optional)', 'sm:col-span-2'], ['city', 'City', ''], ['state', 'State', ''], ['pincode', 'Pincode', '']].map(([key, label, cls]) => (
                      <div key={key} className={cls}>
                        <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
                        <input value={addressForm[key]} onChange={e => setAddressForm(f => ({ ...f, [key]: e.target.value }))}
                          className="premium-input text-sm" required={key !== 'line2'} />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex gap-3 mt-1">
                      <Button type="submit" loading={addressLoading} size="sm">Save Address</Button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="premium-button-ghost text-sm px-4 py-2">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                  {addresses?.map(addr => (
                    <div key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                      className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative min-w-0 ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-white/40 bg-white/40 hover:border-primary/40'}`}>
                      {selectedAddress === addr.id && (
                        <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-5 h-5 gradient-bg rounded-full flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <p className="font-semibold text-sm text-[#111827] break-words">{addr.name}</p>
                      <p className="text-xs text-[#64748B] mt-1 break-words">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} – {addr.pincode}</p>
                      <p className="text-xs text-[#64748B] mt-0.5 break-words">📞 {addr.phone}</p>
                      <span className="badge-info mt-2 inline-block capitalize">{addr.type}</span>
                    </div>
                  ))}
                  {!addresses?.length && !showAddressForm && (
                    <div className="sm:col-span-2 text-center py-8 text-[#64748B]">
                      <FiMapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No saved addresses. Add one to continue.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-card p-4 sm:p-6">
                <h2 className="font-bold text-[#111827] flex items-center gap-2 mb-5"><FiCreditCard className="w-5 h-5 text-primary" />Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map(m => (
                    <div key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-white/40 bg-white/40 hover:border-primary/40'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === m.id ? 'border-primary bg-primary' : 'border-[#d1d5db]'}`}>
                        {paymentMethod === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <m.icon className={`w-5 h-5 shrink-0 ${paymentMethod === m.id ? 'text-primary' : 'text-[#64748B]'}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#111827]">{m.label}</p>
                        <p className="text-xs text-[#64748B]">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="glass-card p-4 sm:p-5">
                <label className="block font-semibold text-sm text-[#111827] mb-2">Order Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3} className="premium-input resize-none" />
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-4 sm:p-6 h-fit lg:sticky lg:top-24 min-w-0">
              <h2 className="font-bold text-[#111827] mb-4 md:mb-5">Order Summary</h2>
              <div className="space-y-3 mb-4 md:mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <img src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#111827] truncate">{item.product?.name}</p>
                      <p className="text-xs text-[#64748B]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/30 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#64748B]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-[#64748B]"><span>Tax (GST)</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between text-[#64748B]"><span>Shipping</span><span className={shipping === 0 ? 'text-emerald-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between font-black text-[#111827] text-lg pt-2 border-t border-white/30">
                  <span>Total</span><span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Button onClick={handlePlaceOrder} loading={loading} className="w-full mt-5 py-3 sm:py-4 text-sm sm:text-base">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
