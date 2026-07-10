import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPackage, FiEye, FiCheckCircle, FiDownload, FiStar } from 'react-icons/fi'
import { orderAPI, reviewAPI } from '../api/services'
import { formatPrice, formatDate, orderStatusColor } from '../utils/helpers'
import Badge from '../components/ui/Badge'
import { TableRowSkeleton } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

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
      <div className="min-h-screen py-4 md:py-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#111827]">My Orders</h1>
            <select value={status} onChange={e => setStatus(e.target.value)} className="premium-input w-auto text-xs md:text-sm">
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
            <div className="glass-card p-10 md:p-16 text-center">
              <FiPackage className="w-12 h-12 md:w-16 md:h-16 text-[#64748B] mx-auto mb-3 md:mb-4 opacity-50" />
              <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">No Orders Yet</h3>
              <p className="text-[#64748B] text-xs md:text-base mb-4 md:mb-6">Start shopping to see your orders here</p>
              <Link to="/shop" className="premium-button text-xs md:text-base px-4 md:px-6 py-2 md:py-3">Shop Now</Link>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {orders.map(order => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <p className="font-black text-[#111827] text-sm md:text-base">#{order.orderNumber}</p>
                        <Badge variant={orderStatusColor(order.status)} className="capitalize text-[10px] md:text-xs">{order.status}</Badge>
                        {order.paymentMethod === 'cod' ? <Badge variant="default" className="text-[10px] md:text-xs">COD</Badge> : <Badge variant="primary" className="text-[10px] md:text-xs">Online</Badge>}
                      </div>
                      <p className="text-xs md:text-sm text-[#64748B]">{order.items?.length} items · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                      <p className="text-lg md:text-xl font-black text-[#111827]">{formatPrice(order.total)}</p>
                      <Link to={`/orders/${order.id}`} className="premium-button-ghost text-xs md:text-sm">
                        <FiEye className="w-3.5 h-3.5 md:w-4 md:h-4" />View
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
  const queryClient = useQueryClient()
  const [reviewItem, setReviewItem] = useState(null) // item being reviewed
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOne(id).then(r => r.data.data)
  })

  const reviewMutation = useMutation({
    mutationFn: reviewAPI.create,
    onSuccess: () => {
      toast.success('Review submitted!')
      setReviewItem(null)
      setReviewForm({ rating: 5, title: '', body: '' })
      queryClient.invalidateQueries(['order', id])
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to submit review')
  })

  const handleReviewSubmit = e => {
    e.preventDefault()
    reviewMutation.mutate({ productId: reviewItem.productId, ...reviewForm })
  }

  const downloadInvoice = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    const W = 595
    const left = 40
    const right = W - 40
    const mid = W / 2

    const gstRate = 18

    const fmtRs = (n) => {
      const x = Number(n) || 0
      return `Rs. ${x.toFixed(2)}`
    }

    // ===== Header Section =====
    // Top blue bar with company logo area
    doc.setFillColor(25, 70, 120)
    doc.rect(0, 0, W, 90, 'F')
    doc.setFillColor(40, 100, 160)
    doc.rect(0, 82, W, 8, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.text('OZONE LAPCARE', left, 40)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setFillColor(35, 85, 140)
    doc.text('306 B-Block, Silver Mall, RNT Marg, Indore MP - 452001', left, 58)
    doc.text('Phone: +91 8962872285 | support@ozonelapcare.com', left, 72)

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('TAX INVOICE', right, 38, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Invoice No: ${order.orderNumber}`, right, 55, { align: 'right' })
    doc.text(`Date: ${formatDate(order.createdAt)}`, right, 68, { align: 'right' })

    // ===== Bill To & Order Info Section =====
    let y = 110

    // Left box - Bill To
    const leftBoxW = 260
    const rightBoxW = 260
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(200, 210, 220)
    doc.roundedRect(left, y, leftBoxW, 90, 4, 4, 'FD')

    doc.setTextColor(40, 70, 110)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('BILL TO', left + 14, y + 22)

    const addr = order.shippingAddress || {}
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(addr?.name || 'Customer', left + 14, y + 38)

    doc.setFont('helvetica', 'normal')
    doc.text(`${addr?.line1 || ''}${addr?.line2 ? ', ' + addr.line2 : ''}`.trim(), left + 14, y + 52)
    doc.text(`${addr?.city || ''}, ${addr?.state || ''} - ${addr?.pincode || ''}`.trim(), left + 14, y + 66)
    doc.text(`Phone: ${addr?.phone || ''}`, left + 14, y + 80)

    // Right box - Order Details
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(200, 210, 220)
    doc.roundedRect(left + leftBoxW + 20, y, rightBoxW, 90, 4, 4, 'FD')

    doc.setTextColor(40, 70, 110)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('ORDER DETAILS', left + leftBoxW + 34, y + 22)

    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Payment: ${(order.paymentMethod || '').toUpperCase()}`, left + leftBoxW + 34, y + 42)
    doc.text(`Status: ${(order.status || '').toUpperCase()}`, left + leftBoxW + 34, y + 56)
    if (order.trackingNumber) {
      doc.text(`Tracking: ${order.trackingNumber}`, left + leftBoxW + 34, y + 70)
    } else {
      doc.text(`Order: #${order.orderNumber}`, left + leftBoxW + 34, y + 70)
    }
    doc.text(`Items: ${order.items?.length || 0}`, left + leftBoxW + 34, y + 84)

    y += 108

    // ===== Items Table =====
    // Column x positions
    const xNo = left + 8
    const xProd = left + 40
    const xHsn = left + 270
    const xQty = left + 320
    const xUnit = left + 360
    const xGst = left + 420
    const xTotal = right - 10

    // Table Header
    doc.setFillColor(40, 70, 110)
    doc.roundedRect(left, y, right - left, 24, 3, 3, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)

    doc.text('#', xNo, y + 16, { align: 'center' })
    doc.text('Product', xProd, y + 16)
    doc.text('HSN', xHsn, y + 16)
    doc.text('Qty', xQty, y + 16, { align: 'center' })
    doc.text('Unit Price', xUnit, y + 16, { align: 'center' })
    doc.text(`GST (${gstRate}%)`, xGst, y + 16, { align: 'center' })
    doc.text('Total', xTotal, y + 16, { align: 'right' })

    y += 26

    let subtotalExGst = 0
    let totalGst = 0

    const maxRows = 18
    const items = order.items || []

    items.slice(0, maxRows).forEach((item, idx) => {
      const rowTotal = parseFloat(item.total) || 0
      const rowBase = rowTotal / (1 + gstRate / 100)
      const rowGst = rowTotal - rowBase

      subtotalExGst += rowBase
      totalGst += rowGst

      const inclUnit = parseFloat(item.price) || 0
      const baseUnit = inclUnit / (1 + gstRate / 100)

      // Alternating row background
      if (idx % 2 === 1) {
        doc.setFillColor(240, 243, 247)
        doc.rect(left, y - 3, right - left, 20, 'F')
      }

      doc.setTextColor(60, 60, 60)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

        doc.text(String(idx + 1), xNo, y + 13, { align: 'center' })

        const name = item.productName || ''
        const clipped = name.length > 30 ? name.slice(0, 30) + '...' : name
        doc.text(clipped, xProd, y + 13)

        doc.text('8471', xHsn, y + 13, { align: 'center' })
        doc.text(String(item.quantity), xQty, y + 13, { align: 'center' })
        doc.text(fmtRs(baseUnit), xUnit, y + 13, { align: 'center' })
        doc.text(fmtRs(rowGst), xGst, y + 13, { align: 'center' })

        doc.setFont('helvetica', 'bold')
        doc.text(fmtRs(rowTotal), xTotal, y + 13, { align: 'right' })
        doc.setFont('helvetica', 'normal')

      y += 20
    })

    // Row separator line
    doc.setDrawColor(180, 190, 200)
    doc.line(left, y + 4, right, y + 4)

    y += 18

    // ===== Totals Section =====
    const grandTotal = parseFloat(order.total) || 0
    const shipping = parseFloat(order.shippingCharge) || 0
    const discount = parseFloat(order.discount) || 0

    const itemsInclusive = (order.items || []).reduce((s, it) => s + (parseFloat(it.total) || 0), 0)
    const taxableInclusiveAfterDiscount = itemsInclusive - discount
    const baseAfterDiscount = taxableInclusiveAfterDiscount / (1 + gstRate / 100)
    const gstAfterDiscount = taxableInclusiveAfterDiscount - baseAfterDiscount

    // Summary box on right side
    const summaryW = 260
    const summaryX = right - summaryW
    const summaryRight = right

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(200, 210, 220)
    doc.roundedRect(summaryX, y - 8, summaryW, 110, 4, 4, 'FD')

    let totalY = y + 8

    const summaryItems = [
      { label: 'Subtotal (ex-GST)', value: fmtRs(baseAfterDiscount), bold: false },
      { label: `GST @ ${gstRate}%`, value: fmtRs(gstAfterDiscount), bold: false },
    ]

    summaryItems.forEach(item => {
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(item.label, summaryX + 14, totalY)

      doc.setTextColor(50, 50, 50)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(item.value, summaryRight - 14, totalY, { align: 'right' })
      totalY += 16
    })

    if (discount > 0) {
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Discount', summaryX + 14, totalY)

      doc.setTextColor(16, 140, 90)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(`-${fmtRs(discount)}`, summaryRight - 14, totalY, { align: 'right' })
      totalY += 16
    }

    doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Shipping', summaryX + 14, totalY)

    doc.setTextColor(shipping === 0 ? 16 : 50, shipping === 0 ? 140 : 50, shipping === 0 ? 90 : 50)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(shipping === 0 ? 'FREE' : fmtRs(shipping), summaryRight - 14, totalY, { align: 'right' })
    totalY += 18

    // Grand total bar
    doc.setFillColor(40, 70, 110)
    doc.roundedRect(summaryX + 6, totalY, summaryW - 12, 22, 3, 3, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('GRAND TOTAL', summaryX + 16, totalY + 14)

    doc.setFontSize(11)
    doc.text(fmtRs(grandTotal), summaryRight - 16, totalY + 14, { align: 'right' })

    totalY += 32

    // ===== GST Note =====
    doc.setTextColor(120, 120, 120)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.text('* Prices are GST-inclusive. GST is back-calculated from inclusive amount with discount applied.', left, totalY + 6)

    // ===== Footer =====
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 760, W, 80, 'F')
    doc.setDrawColor(200, 210, 220)
    doc.line(left, 760, right, 760)

    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Thank you for shopping with Ozone Lapcare!', mid, 784, { align: 'center' })
    doc.setFontSize(8)
    doc.text('www.ozonelapcare.com', mid, 800, { align: 'center' })
    doc.text('For queries, contact: support@ozonelapcare.com | +91 8962872285', mid, 814, { align: 'center' })

    doc.save(`Invoice_${order.orderNumber}.pdf`)
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!order) return null

  const isDelivered = order.status === 'delivered'
  const gstRate = 18

  // Products are stored as GST-inclusive prices.
  // So split each inclusive amount into (ex-GST base) + (GST part).
  const orderItemsInclusiveTotal = (order.items || []).reduce(
    (s, i) => s + (parseFloat(i.total) || 0),
    0
  )

  const discount = parseFloat(order.discount) || 0
  // inclusive taxable amount after discount
  const taxableInclusive = orderItemsInclusiveTotal - discount

  const baseAmount = taxableInclusive / (1 + gstRate / 100)
  const gstAmount = taxableInclusive - baseAmount

  const shipping = parseFloat(order.shippingCharge) || 0

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

          {/* Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#111827]">Order #{order.orderNumber}</h1>
                <p className="text-[#64748B] text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={orderStatusColor(order.status)} className="capitalize text-sm px-4 py-1.5">{order.status}</Badge>
                {isDelivered && (
                  <button onClick={downloadInvoice}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                    <FiDownload className="w-4 h-4" /> Invoice
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Order Items */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-[#111827] mb-3">Order Items</h3>
              <div className="flex flex-col">
                {order.items?.map(item => (
                  <div
                    key={item.id}
                    className="flex gap-3 py-3 border-b border-white/20 last:border-0 last:pb-0"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#111827] leading-tight truncate">{item.productName}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">Qty: {item.quantity} · {formatPrice(item.price)} each</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="font-bold text-sm text-[#111827]">{formatPrice(item.total)}</p>
                        {isDelivered && (
                          <button
                            onClick={() => {
                              setReviewItem(item)
                              setReviewForm({ rating: 5, title: '', body: '' })
                            }}
                            className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 font-semibold cursor-pointer"
                          >
                            <FiStar className="w-3.5 h-3.5" /> Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Right column */}
            <div className="space-y-4">
              {/* Payment Summary */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-[#111827] mb-4">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Base Price (ex-GST)</span>
                    <span>{formatPrice(baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>GST @ {gstRate}%</span>
                    <span>{formatPrice(gstAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#64748B]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-black text-[#111827] text-base pt-2 border-t border-white/20">
                    <span>Total (incl. GST)</span><span>{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded-xl bg-white/40 text-xs text-[#64748B] space-y-0.5">
                  <p>Payment: <span className="font-medium text-[#111827] uppercase">{order.paymentMethod}</span></p>
                  {order.trackingNumber && <p>Tracking: <span className="font-medium text-primary">{order.trackingNumber}</span></p>}
                </div>
              </div>

              {/* Delivery Address */}
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

          {/* Review Modal */}
          {reviewItem && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
              onClick={() => setReviewItem(null)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="glass-modal p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="font-black text-[#111827] text-lg mb-1">Write a Review</h3>
                <p className="text-sm text-[#64748B] mb-4 truncate">{reviewItem.productName}</p>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star rating */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          className="cursor-pointer">
                          <FiStar className={`w-7 h-7 transition-colors ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Title</label>
                    <input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Summarize your experience" required className="premium-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Review</label>
                    <textarea value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                      placeholder="Share details about the product..." rows={3} required className="premium-input resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" loading={reviewMutation.isPending} className="flex-1">Submit Review</Button>
                    <button type="button" onClick={() => setReviewItem(null)} className="premium-button-ghost px-4">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
