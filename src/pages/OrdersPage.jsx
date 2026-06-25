import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPackage, FiEye, FiCheckCircle } from 'react-icons/fi'
import { orderAPI } from '../api/services'
import { formatPrice, formatDate, orderStatusColor } from '../utils/helpers'
import Badge from '../components/ui/Badge'
import { TableRowSkeleton } from '../components/ui/Skeleton'

const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']

export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page, status],
    queryFn: () => orderAPI.getMy({ page, limit: 10, status }).then(r => r.data)
  })

  const orders = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <Helmet><title>My Orders – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-[#111827]">My Orders</h1>
            <select value={status} onChange={e => setStatus(e.target.value)} className="premium-input w-auto text-sm">
              <option value="">All Orders</option>
              {['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map(s => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="glass-card overflow-hidden">
              <table className="premium-table">
                <tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</tbody>
              </table>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <FiPackage className="w-16 h-16 text-[#64748B] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
              <p className="text-[#64748B] mb-6">Start shopping to see your orders here</p>
              <Link to="/shop" className="premium-button">Shop Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-[#111827]">#{order.orderNumber}</p>
                        <Badge variant={orderStatusColor(order.status)} className="capitalize">{order.status}</Badge>
                        {order.paymentMethod === 'cod' ? <Badge variant="default">COD</Badge> : <Badge variant="primary">Online</Badge>}
                      </div>
                      <p className="text-sm text-[#64748B]">{order.items?.length} items · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-black text-[#111827]">{formatPrice(order.total)}</p>
                      <Link to={`/orders/${order.id}`} className="premium-button-ghost text-sm">
                        <FiEye className="w-4 h-4" />View
                      </Link>
                    </div>
                  </div>

                  {/* Status tracker */}
                  {!['cancelled', 'returned'].includes(order.status) && (
                    <div className="mt-4 flex items-center gap-0">
                      {statusSteps.map((step, i) => {
                        const activeIdx = statusSteps.indexOf(order.status)
                        const isActive = i <= activeIdx
                        const isCurrent = i === activeIdx
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${isActive ? 'gradient-bg text-white shadow-md' : 'bg-slate-200 text-slate-400'} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                              {isActive ? <FiCheckCircle className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div className={`flex-1 h-0.5 ${i < activeIdx ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-slate-200'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              ))}

              {pagination?.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="premium-button-ghost text-sm px-4 py-2 disabled:opacity-40">Prev</button>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="premium-button-ghost text-sm px-4 py-2 disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOne(id).then(r => r.data.data)
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!order) return null

  return (
    <>
      <Helmet><title>Order #{order.orderNumber} – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center mb-8 border-2 border-emerald-200 bg-emerald-50/50">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-[#111827] mb-2">Order Placed Successfully!</h2>
              <p className="text-[#64748B]">Thank you for shopping with Ozone Lapcare. We'll send you updates via email.</p>
            </motion.div>
          )}

          <div className="glass-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#111827]">Order #{order.orderNumber}</h1>
                <p className="text-[#64748B] text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={orderStatusColor(order.status)} className="capitalize text-sm px-4 py-1.5">{order.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Items */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-[#111827] mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-white/20 last:border-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <img src={item.productImage || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#111827]">{item.productName}</p>
                      <p className="text-xs text-[#64748B]">Qty: {item.quantity} · {formatPrice(item.price)} each</p>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Address */}
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="font-bold text-[#111827] mb-4">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#64748B]"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                  <div className="flex justify-between text-[#64748B]"><span>Tax</span><span>{formatPrice(order.taxAmount)}</span></div>
                  <div className="flex justify-between text-[#64748B]"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span></div>
                  <div className="flex justify-between font-black text-[#111827] text-lg pt-2 border-t border-white/20">
                    <span>Total</span><span>{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-white/40 text-xs text-[#64748B]">
                  Payment: <span className="font-medium text-[#111827] uppercase">{order.paymentMethod}</span>
                  {order.trackingNumber && <><br />Tracking: <span className="font-medium text-primary">{order.trackingNumber}</span></>}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="glass-card p-5">
                  <h3 className="font-bold text-[#111827] mb-3">Delivery Address</h3>
                  <p className="font-semibold text-sm text-[#111827]">{order.shippingAddress.name}</p>
                  <p className="text-sm text-[#64748B] mt-1">{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
                  <p className="text-sm text-[#64748B]">{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                  <p className="text-sm text-[#64748B] mt-1">📞 {order.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
