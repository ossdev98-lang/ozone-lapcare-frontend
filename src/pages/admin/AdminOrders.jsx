import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  FiEye, FiX, FiTruck, FiSearch, FiShoppingBag,
  FiClock, FiCheckCircle, FiXCircle, FiPackage,
  FiChevronLeft, FiChevronRight, FiUser, FiMapPin,
  FiCreditCard, FiCalendar, FiHash
} from 'react-icons/fi'
import { orderAPI } from '../../api/services'
import { formatPrice, formatDate } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned']

const STATUS_TIMELINE = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']

const statusMeta = {
  pending:   { icon: FiClock,       color: 'from-amber-400 to-orange-400',   bg: 'bg-amber-50',   text: 'text-amber-700',  ring: 'ring-amber-200' },
  confirmed: { icon: FiCheckCircle, color: 'from-blue-400 to-cyan-400',      bg: 'bg-blue-50',    text: 'text-blue-700',   ring: 'ring-blue-200' },
  packed:    { icon: FiPackage,     color: 'from-violet-400 to-purple-400',  bg: 'bg-violet-50',  text: 'text-violet-700', ring: 'ring-violet-200' },
  shipped:   { icon: FiTruck,       color: 'from-indigo-400 to-blue-500',    bg: 'bg-indigo-50',  text: 'text-indigo-700', ring: 'ring-indigo-200' },
  delivered: { icon: FiCheckCircle, color: 'from-emerald-400 to-teal-400',   bg: 'bg-emerald-50', text: 'text-emerald-700',ring: 'ring-emerald-200' },
  cancelled: { icon: FiXCircle,     color: 'from-red-400 to-rose-400',       bg: 'bg-red-50',     text: 'text-red-700',    ring: 'ring-red-200' },
  returned:  { icon: FiXCircle,     color: 'from-slate-400 to-gray-400',     bg: 'bg-slate-50',   text: 'text-slate-700',  ring: 'ring-slate-200' },
}

function StatusPill({ s, active, onClick }) {
  const m = statusMeta[s] || {}
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-200 cursor-pointer whitespace-nowrap
        ${active
          ? `bg-gradient-to-r ${m.color} text-white shadow-md scale-105`
          : `${m.bg} ${m.text} hover:scale-105 hover:shadow-sm`
        }`}
    >
      {s}
    </button>
  )
}

function StatCard({ icon: Icon, label, value, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="stat-card"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-[#64748B]">{label}</p>
        <p className="text-2xl font-black text-[#111827]">{value}</p>
      </div>
    </motion.div>
  )
}

function OrderTimeline({ currentStatus }) {
  const idx = STATUS_TIMELINE.indexOf(currentStatus)
  if (idx === -1) return null
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {STATUS_TIMELINE.map((s, i) => {
        const done = i <= idx
        const m = statusMeta[s]
        return (
          <div key={s} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${done ? `bg-gradient-to-br ${m.color} shadow-md` : 'bg-slate-100'}`}>
                <m.icon className={`w-3.5 h-3.5 ${done ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[10px] font-medium capitalize text-center leading-tight ${done ? m.text : 'text-slate-400'}`}>{s}</span>
            </div>
            {i < STATUS_TIMELINE.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-300 ${i < idx ? `bg-gradient-to-r ${m.color}` : 'bg-slate-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AdminOrders() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [dateRange, setDateRange] = useState('30') // days; 0 = all
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')

  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [tracking, setTracking] = useState('')

  // Debounced search (smooth UX for large tables)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])


  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: () => orderAPI.getAll({ page, limit: 12, status }).then(r => r.data)
  })

  const allOrders = data?.data || []
  const pagination = data?.pagination

  const orders = useMemo(() => {
    let res = allOrders

    // Client-side filters refine results on the current fetched page.
    if (paymentMethod) res = res.filter(o => (o.paymentMethod || '').toLowerCase() === paymentMethod.toLowerCase())

    if (dateRange && dateRange !== '0') {
      const days = Number(dateRange)
      if (Number.isFinite(days) && days > 0) {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        res = res.filter(o => {
          const t = new Date(o.createdAt).getTime()
          return Number.isFinite(t) && t >= cutoff
        })
      }
    }

    const min = amountMin === '' ? null : Number(amountMin)
    const max = amountMax === '' ? null : Number(amountMax)
    if (min !== null && Number.isFinite(min)) res = res.filter(o => Number(o.total) >= min)
    if (max !== null && Number.isFinite(max)) res = res.filter(o => Number(o.total) <= max)

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      res = res.filter(o =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        (o.trackingNumber || '').toLowerCase().includes(q)
      )
    }

    return res
  }, [allOrders, debouncedSearch, paymentMethod, dateRange, amountMin, amountMax])


  // Derive stat counts from current page data (best effort without extra API)
  const statCounts = useMemo(() => {
    // total is global from server; other counts are best-effort for the current fetched page
    return {
      total: pagination?.total || 0,
      pending: allOrders.filter(o => o.status === 'pending').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
    }
  }, [allOrders, pagination])

  const handleUpdateStatus = async () => {
    if (!newStatus || !selected) return
    setUpdating(true)
    try {
      await orderAPI.updateStatus(selected.id, { status: newStatus, trackingNumber: tracking })
      qc.invalidateQueries(['admin-orders'])
      toast.success('Order status updated!')
      setSelected(null)
    } catch { toast.error('Update failed') } finally { setUpdating(false) }
  }

  const openOrder = o => { setSelected(o); setNewStatus(o.status); setTracking(o.trackingNumber || '') }

  const pageNums = useMemo(() => {
    if (!pagination?.pages) return []
    const total = pagination.pages
    const cur = page
    const delta = 1
    const range = []
    for (let i = Math.max(2, cur - delta); i <= Math.min(total - 1, cur + delta); i++) range.push(i)
    if (cur - delta > 2) range.unshift('...')
    if (cur + delta < total - 1) range.push('...')
    if (total > 1) { range.unshift(1); range.push(total) }
    else range.unshift(1)
    return range
  }, [pagination, page])

  return (
    <>
      <Helmet><title>Orders – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <FiShoppingBag className="w-4 h-4 text-white" />
              </span>
              Orders
            </h1>
            <p className="text-[#64748B] text-sm mt-1">{pagination?.total || 0} total orders across all time</p>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={FiShoppingBag} label="Total Orders"    value={statCounts.total}     gradient="from-blue-500 to-cyan-500"     delay={0} />
          <StatCard icon={FiClock}       label="Pending"         value={statCounts.pending}   gradient="from-amber-400 to-orange-400"  delay={0.05} />
          <StatCard icon={FiTruck}       label="Shipped"         value={statCounts.shipped}   gradient="from-indigo-500 to-blue-500"   delay={0.1} />
          <StatCard icon={FiCheckCircle} label="Delivered"       value={statCounts.delivered} gradient="from-emerald-500 to-teal-500"  delay={0.15} />
        </div>

        {/* Filters Row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card p-4 flex flex-col gap-3">

          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-black text-[#111827]">Filters</p>
              <p className="text-xs text-[#64748B] mt-0.5">Status is server-side. Other filters refine results on the current page.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setStatus('')
                  setSearch('')
                  setPaymentMethod('')
                  setDateRange('30')
                  setAmountMin('')
                  setAmountMax('')
                  setPage(1)
                }}
                className="premium-button-ghost text-xs px-3 py-2"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order #, customer name or email…"
              className="premium-input pl-10 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748B] cursor-pointer">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Payment</p>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="premium-input text-sm cursor-pointer">
                <option value="">All methods</option>
                <option value="cash on delivery">Cash on delivery</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Date</p>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="premium-input text-sm cursor-pointer">
                <option value="0">All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Amount min</p>
              <input
                value={amountMin}
                onChange={e => setAmountMin(e.target.value)}
                placeholder="0"
                className="premium-input text-sm"
              />
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Amount max</p>
              <input
                value={amountMax}
                onChange={e => setAmountMax(e.target.value)}
                placeholder="5000"
                className="premium-input text-sm"
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 flex-wrap">

            <button
              onClick={() => { setStatus(''); setPage(1) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer
                ${status === '' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md scale-105' : 'bg-slate-100 text-slate-600 hover:scale-105'}`}
            >
              All
            </button>
            {statuses.map(s => (
              <StatusPill key={s} s={s} active={status === s} onClick={() => { setStatus(s); setPage(1) }} />
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                  : orders.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3 text-[#94a3b8]">
                            <FiShoppingBag className="w-10 h-10 opacity-30" />
                            <p className="text-sm font-medium">No orders found</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : orders.map((o, i) => {
                      const m = statusMeta[o.status] || {}
                      return (
                        <motion.tr key={o.id}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="group">
                          <td>
                            <span className="font-black text-primary text-sm tracking-tight">#{o.orderNumber}</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-black text-primary">{o.user?.name?.[0]?.toUpperCase() || '?'}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-[#111827]">{o.user?.name}</p>
                                <p className="text-[11px] text-[#94a3b8]">{o.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                              <FiCalendar className="w-3 h-3 shrink-0" />
                              {formatDate(o.createdAt)}
                            </div>
                          </td>
                          <td className="font-black text-[#111827]">{formatPrice(o.total)}</td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <FiCreditCard className="w-3 h-3 text-[#94a3b8]" />
                              <span className="uppercase text-[11px] font-bold text-[#64748B] tracking-wide">{o.paymentMethod}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ring-1 ${m.bg} ${m.text} ${m.ring}`}>
                              {m.icon && <m.icon className="w-3 h-3" />}
                              {o.status}
                            </span>
                          </td>
                          <td className="text-right pr-4">
                            <button
                              onClick={() => openOrder(o)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-gradient-to-r hover:from-primary hover:to-secondary text-[#64748B] hover:text-white text-xs font-semibold border border-white/40 hover:border-transparent shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              View
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/20">
              <span className="text-xs text-[#94a3b8]">
                Showing page <span className="font-semibold text-[#64748B]">{page}</span> of <span className="font-semibold text-[#64748B]">{pagination.pages}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-xl bg-white/60 hover:bg-white border border-white/40 flex items-center justify-center text-[#64748B] hover:text-primary disabled:opacity-30 transition-all cursor-pointer"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                {pageNums.map((n, i) =>
                  n === '...'
                    ? <span key={`dot-${i}`} className="w-8 text-center text-xs text-[#94a3b8]">…</span>
                    : (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer
                          ${page === n
                            ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-md'
                            : 'bg-white/60 hover:bg-white border border-white/40 text-[#64748B] hover:text-primary'}`}>
                        {n}
                      </button>
                    )
                )}

                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="w-8 h-8 rounded-xl bg-white/60 hover:bg-white border border-white/40 flex items-center justify-center text-[#64748B] hover:text-primary disabled:opacity-30 transition-all cursor-pointer"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 24 }}
              className="glass-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/20"
                style={{ background: 'linear-gradient(135deg, rgba(40,117,183,0.06), rgba(43,183,178,0.06))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <FiHash className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#111827]">Order #{selected.orderNumber}</h2>
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" /> {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl hover:bg-white/50 flex items-center justify-center text-[#64748B] hover:text-[#111827] transition-all cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Status Timeline */}
                <div className="p-4 rounded-2xl bg-white/40 border border-white/30">
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Order Progress</p>
                  <OrderTimeline currentStatus={selected.status} />
                  {(selected.status === 'cancelled' || selected.status === 'returned') && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-xs font-semibold bg-red-50 px-3 py-2 rounded-xl">
                      <FiXCircle className="w-3.5 h-3.5" />
                      This order was {selected.status}
                    </div>
                  )}
                </div>

                {/* Customer & Address */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/40 border border-white/30 space-y-1.5">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <FiUser className="w-3.5 h-3.5" /> Customer
                    </p>
                    <p className="font-bold text-[#111827] text-sm">{selected.user?.name}</p>
                    <p className="text-xs text-[#64748B]">{selected.user?.email}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40 border border-white/30 space-y-1.5">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <FiMapPin className="w-3.5 h-3.5" /> Shipping
                    </p>
                    {selected.shippingAddress ? (
                      <p className="text-sm font-medium text-[#111827] leading-relaxed">
                        {selected.shippingAddress.name}<br />
                        {selected.shippingAddress.line1}, {selected.shippingAddress.city}<br />
                        <span className="text-[#64748B]">{selected.shippingAddress.phone}</span>
                      </p>
                    ) : <p className="text-xs text-[#94a3b8]">No address provided</p>}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Order Items</p>
                  <div className="space-y-2">
                    {selected.items?.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/30 hover:bg-white/70 transition-all">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60'}
                          alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111827] truncate">{item.productName}</p>
                          <p className="text-xs text-[#64748B]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="font-black text-sm text-[#111827] shrink-0">{formatPrice(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Status */}
                <div className="p-4 rounded-2xl border border-white/30 space-y-3"
                  style={{ background: 'linear-gradient(135deg, rgba(40,117,183,0.04), rgba(43,183,178,0.04))' }}>
                  <p className="font-bold text-[#111827] flex items-center gap-2 text-sm">
                    <FiTruck className="w-4 h-4 text-primary" /> Update Order Status
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="premium-input text-sm">
                      {statuses.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <input value={tracking} onChange={e => setTracking(e.target.value)}
                      placeholder="Tracking number (optional)" className="premium-input text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleUpdateStatus} loading={updating} size="sm">Update Status</Button>
                    <button onClick={() => setSelected(null)} className="premium-button-ghost text-sm px-4 py-2">Cancel</button>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                    <FiCreditCard className="w-4 h-4" />
                    <span className="uppercase font-bold tracking-wide text-xs">{selected.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#94a3b8]">Order Total</p>
                    <p className="text-2xl font-black gradient-text">{formatPrice(selected.total)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
