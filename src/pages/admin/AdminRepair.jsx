import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  FiEye, FiX, FiUser, FiMail, FiPhone, FiTool, FiMonitor,
  FiMessageSquare, FiCalendar, FiCreditCard, FiCheckCircle, FiEdit3,
  FiSearch, FiSliders, FiFilter, FiClock, FiRefreshCw
} from 'react-icons/fi'
import { repairAPI } from '../../api/services'
import { formatDate, formatPrice } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const statusDot = {
  pending: 'bg-amber-400', confirmed: 'bg-cyan-400',
  in_progress: 'bg-violet-500', completed: 'bg-emerald-500', cancelled: 'bg-red-400'
}
const statusStyle = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  in_progress: 'bg-violet-50 text-violet-700 border-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}
const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const payments = ['paid', 'pending']

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status] || 'bg-slate-400'}`} />
      {String(status).replace('_', ' ')}
    </span>
  )
}

export default function AdminRepair() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('info')
  const [newStatus, setNewStatus] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [confirmBookingAmount, setConfirmBookingAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  // Filters
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [payment, setPayment] = useState('all')
  const [service, setService] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-repairs'],
    queryFn: () => repairAPI.getAll().then(r => r.data.data),
    staleTime: 60_000,
  })

  const rows = data || []

  const isPaid = b => b?.paymentStatus === 'paid'

  const derived = useMemo(() => {
    const q = query.trim().toLowerCase()
    const s = service.trim().toLowerCase()

    const filtered = rows.filter(b => {
      if (status !== 'all' && b.status !== status) return false

      if (payment !== 'all') {
        const paid = isPaid(b)
        if (payment === 'paid' && !paid) return false
        if (payment === 'pending' && paid) return false
      }

      if (s) {
        const serviceText = b?.service?.name || ''
        if (!serviceText.toLowerCase().includes(s)) return false
      }

      if (q) {
        const hay = [
          b?.name,
          b?.phone,
          b?.email,
          b?.service?.name,
          b?.laptopBrand,
          b?.laptopModel,
          b?.issue,
        ]
          .filter(Boolean)
          .join(' | ')
          .toLowerCase()

        if (!hay.includes(q)) return false
      }

      if (fromDate) {
        const from = new Date(fromDate)
        const created = new Date(b.createdAt)
        if (created < from) return false
      }
      if (toDate) {
        const to = new Date(toDate)
        to.setHours(23, 59, 59, 999)
        const created = new Date(b.createdAt)
        if (created > to) return false
      }

      return true
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    const end = start + pageSize

    return {
      filtered,
      total,
      totalPages,
      page: safePage,
      items: filtered.slice(start, end),
      start,
      end: Math.min(end, total),
    }
  }, [rows, query, status, payment, service, fromDate, toDate, page, pageSize])

  const statCards = useMemo(() => {
    const all = rows.length
    const counts = {
      total: all,
      pending: rows.filter(b => b.status === 'pending').length,
      active: rows.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length,
      completed: rows.filter(b => b.status === 'completed').length,
      paid: rows.filter(b => isPaid(b)).length,
    }
    return counts
  }, [rows])

  const openBooking = b => {
    setSelected(b)
    setTab('info')
    setNewStatus(b.status)
    setEstimatedCost(b.estimatedCost || '')
    setConfirmBookingAmount(b.confirmBookingAmount || '')
    setNotes(b.notes || '')
  }

  const handleUpdate = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await repairAPI.update(selected.id, {
        status: newStatus,
        estimatedCost,
        confirmBookingAmount,
        notes,
      })
      qc.invalidateQueries(['admin-repairs'])
      toast.success('Booking updated!')
      setSelected(null)
    } catch {
      toast.error('Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setPayment('all')
    setService('')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  const hasAnyFilter = Boolean(query.trim() || status !== 'all' || payment !== 'all' || service.trim() || fromDate || toDate)

  return (
    <>
      <Helmet><title>Repair Bookings – Admin | Ozone Lapcare</title></Helmet>

      <div className="space-y-5">
        {/* Premium Header */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111827]">Repair Bookings</h1>
              <p className="text-[#64748B] text-sm mt-1">
                {rows.length} total · Showing {derived.total} after filters
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all cursor-pointer ${
                  hasAnyFilter
                    ? 'bg-white/60 border-white/40 text-[#0f172a] hover:bg-white/90'
                    : 'bg-white/30 border-white/20 text-slate-400 cursor-default'
                }`}
                onClick={resetFilters}
                disabled={!hasAnyFilter}
              >
                <FiRefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="stat-card">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/50 flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-black text-[#111827]">{statCards.total}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/10 border border-white/50 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-black text-[#111827]">{statCards.pending}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/10 border border-white/50 flex items-center justify-center">
                <FiSliders className="w-5 h-5 text-cyan-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active</p>
                <p className="text-2xl font-black text-[#111827]">{statCards.active}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-white/50 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-black text-[#111827]">{statCards.completed}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-white/50 flex items-center justify-center">
                <FiCreditCard className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paid</p>
                <p className="text-2xl font-black text-[#111827]">{statCards.paid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="glass-card p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search customer, laptop, service or issue..."
                  className="premium-input pl-10"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Tip: Try “Dell”, “WiFi”, phone number, or email.</p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="min-w-[160px]">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Status</label>
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    value={status}
                    onChange={e => { setStatus(e.target.value); setPage(1) }}
                    className="premium-input pl-10 appearance-none cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="min-w-[160px]">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Payment</label>
                <select
                  value={payment}
                  onChange={e => { setPayment(e.target.value); setPage(1) }}
                  className="premium-input appearance-none cursor-pointer"
                >
                  <option value="all">All payments</option>
                  {payments.map(p => (
                    <option key={p} value={p}>{p === 'paid' ? 'Paid' : 'Pending'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Service</label>
              <input
                value={service}
                onChange={e => { setService(e.target.value); setPage(1) }}
                placeholder="e.g., Screen Repair"
                className="premium-input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">From</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => { setFromDate(e.target.value); setPage(1) }}
                  className="premium-input pl-10 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">To</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => { setToDate(e.target.value); setPage(1) }}
                  className="premium-input pl-10 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table + Pagination */}
        <div className="glass-card overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-white/40">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/50 border border-white/40">
                <FiSliders className="w-4 h-4 text-[#2875B7]" />
                {isLoading ? 'Loading…' : `${derived.start + 1}-${derived.end} of ${derived.total}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rows</span>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                  className="premium-input py-2 px-3 w-28 cursor-pointer"
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={derived.page <= 1}
                  className="premium-button-ghost px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-600 px-2">{derived.page} / {derived.totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(derived.totalPages, p + 1))}
                  disabled={derived.page >= derived.totalPages}
                  className="premium-button-ghost px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Laptop</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(6)].map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                  : derived.items.map(b => (
                    <tr key={b.id}>
                      <td className="text-xs text-slate-400 font-mono">#{b.id}</td>
                      <td>
                        <p className="font-semibold text-sm text-[#111827]">{b.name}</p>
                        <p className="text-xs text-[#94a3b8]">{b.phone}</p>
                      </td>
                      <td className="text-sm text-[#64748B]">{b.service?.name || '—'}</td>
                      <td>
                        <p className="text-sm font-medium text-[#111827]">{b.laptopBrand} {b.laptopModel}</p>
                        <p className="text-xs text-[#94a3b8] truncate max-w-36">{b.issue}</p>
                      </td>
                      <td className="text-sm text-[#64748B] whitespace-nowrap">{formatDate(b.createdAt)}</td>
                      <td>
                        <StatusPill status={b.status} />
                      </td>
                      <td>
                        {b.confirmBookingAmount != null && b.confirmBookingAmount !== '' ? (
                          isPaid(b)
                            ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <FiCheckCircle className="w-3 h-3" />Paid
                              </span>
                            )
                            : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                <FiCreditCard className="w-3 h-3" />Pending
                              </span>
                            )
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => openBooking(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-600 transition-all cursor-pointer"
                        >
                          <FiEye className="w-3.5 h-3.5" />View
                        </button>
                      </td>
                    </tr>
                  ))}

                {!isLoading && derived.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <div className="glass-card inline-flex flex-col items-center gap-2 px-6 py-5">
                        <FiSearch className="w-6 h-6 text-[#2875B7]" />
                        <p className="font-semibold text-slate-700">No bookings match your filters.</p>
                        <p className="text-xs text-slate-500">Adjust filters or try a different search term.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-modal w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
                    <FiTool className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#111827] leading-tight">Booking #{selected.id}</h2>
                    <p className="text-xs text-slate-400">{selected.name} · {formatDate(selected.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={selected.status} />
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/60 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/40 px-6">
                {[
                  ['info', FiEye, 'Details'],
                  ['edit', FiEdit3, 'Update'],
                ].map(([key, Icon, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer
                      ${tab === key ? 'border-violet-500 text-violet-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6">
                {tab === 'info' ? (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-white/40 bg-white/30 p-4 space-y-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                        <InfoRow icon={FiUser} label="Name" value={selected.name} />
                        <InfoRow icon={FiMail} label="Email" value={selected.email} />
                        <InfoRow icon={FiPhone} label="Phone" value={selected.phone} />
                      </div>
                      <div className="rounded-xl border border-white/40 bg-white/30 p-4 space-y-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Device</p>
                        <InfoRow icon={FiTool} label="Service" value={selected.service?.name} />
                        <InfoRow
                          icon={FiMonitor}
                          label="Laptop"
                          value={`${selected.laptopBrand || ''} ${selected.laptopModel || ''}`.trim()}
                        />
                        <InfoRow icon={FiCalendar} label="Booked On" value={formatDate(selected.createdAt)} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/40 bg-white/25 p-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Issue Description</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{selected.issue}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/40 bg-white/30 p-4 text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Estimated</p>
                        <p className="text-lg font-black text-slate-800">
                          {selected.estimatedCost
                            ? formatPrice(selected.estimatedCost)
                            : <span className="text-slate-300 text-sm font-medium">Not set</span>}
                        </p>
                      </div>
                      <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-center">
                        <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wide mb-2">Booking Amt</p>
                        <p className="text-lg font-black text-violet-800">
                          {selected.confirmBookingAmount
                            ? formatPrice(selected.confirmBookingAmount)
                            : <span className="text-slate-300 text-sm font-medium">Not set</span>}
                        </p>
                      </div>
                      <div
                        className={`rounded-xl border p-4 text-center ${isPaid(selected) ? 'border-emerald-200 bg-emerald-50/40' : 'border-orange-200 bg-orange-50/40'}`}
                      >
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wide mb-2 ${isPaid(selected) ? 'text-emerald-600' : 'text-orange-600'}`}
                        >
                          Payment
                        </p>
                        {isPaid(selected) ? (
                          <>
                            <FiCheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                            <p className="text-sm font-black text-emerald-700">Paid</p>
                          </>
                        ) : (
                          <>
                            <FiCreditCard className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-orange-600">
                              {selected.confirmBookingAmount ? 'Awaiting' : 'No Amount'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {isPaid(selected) && selected.paymentId && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-700">Payment Received</p>
                          <p className="text-[11px] font-mono text-emerald-600 mt-0.5">{selected.paymentId}</p>
                        </div>
                      </div>
                    )}

                    {selected.notes && (
                      <div className="rounded-xl border border-white/40 bg-white/25 p-4">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <FiMessageSquare className="w-3.5 h-3.5" />Admin Notes
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{selected.notes}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setTab('edit')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200/80 text-sm font-semibold text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-all cursor-pointer bg-white/20"
                    >
                      <FiEdit3 className="w-4 h-4" />Edit this booking
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</label>
                      <div className="grid grid-cols-5 gap-2">
                        {statuses.map(s => (
                          <button
                            key={s}
                            onClick={() => setNewStatus(s)}
                            className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize border-2 transition-all cursor-pointer
                              ${newStatus === s ? `${statusStyle[s]} border-current` : 'border-white/40 text-slate-500 bg-white/20 hover:border-white/60'}`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Estimated Cost (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                          <input
                            value={estimatedCost}
                            onChange={e => setEstimatedCost(e.target.value)}
                            type="number"
                            className="premium-input pl-7 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Confirm Booking Amount (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                          <input
                            value={confirmBookingAmount}
                            onChange={e => setConfirmBookingAmount(e.target.value)}
                            type="number"
                            className="premium-input pl-7 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Admin Notes</label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={4}
                        className="premium-input resize-none text-sm"
                        placeholder="Internal notes visible to the customer..."
                      />
                    </div>

                    <div
                      className={`rounded-xl p-3 flex items-center gap-3 ${isPaid(selected) ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}
                    >
                      {isPaid(selected)
                        ? <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        : <FiCreditCard className="w-4 h-4 text-slate-400 shrink-0" />}
                      <p className={`text-xs font-semibold ${isPaid(selected) ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {isPaid(selected)
                          ? `Payment received · ${selected.paymentId}`
                          : 'Payment not yet received from customer'}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Button onClick={handleUpdate} loading={updating} className="flex-1">Save Changes</Button>
                      <button onClick={() => setTab('info')} className="premium-button-ghost px-5 text-sm">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

