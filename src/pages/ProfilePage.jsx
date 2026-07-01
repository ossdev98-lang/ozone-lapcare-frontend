import { useSelector, useDispatch } from 'react-redux'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiUser, FiMail, FiPhone, FiSave, FiHeart, FiTrash2, FiTool,
  FiMonitor, FiBattery, FiCpu, FiHardDrive, FiSettings, FiWifi,
  FiZap, FiThumbsUp, FiShield, FiCheckCircle, FiClock, FiStar,
  FiPackage, FiPhoneCall, FiTruck, FiArrowRight,
  FiChevronDown, FiChevronUp, FiFileText, FiDownloadCloud,
  FiSliders, FiTerminal, FiRefreshCw, FiPower,
  FiAlertCircle, FiDollarSign, FiMessageSquare, FiCalendar, FiDownload } from 'react-icons/fi'
import { authAPI, wishlistAPI, repairAPI } from '../api/services'
import { fetchMe } from '../store/authSlice'
import { formatPrice } from '../utils/helpers'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const handleUpdate = async e => {
    e.preventDefault()
    setLoading(true)
    try { await authAPI.updateProfile(form); dispatch(fetchMe()); toast.success('Profile updated!') }
    catch { toast.error('Update failed') } finally { setLoading(false) }
  }

  const handlePassword = async e => {
    e.preventDefault()
    if (pwForm.newPassword.length < 6) { toast.error('Password must be 6+ characters'); return }
    setPwLoading(true)
    try { await authAPI.changePassword(pwForm); toast.success('Password changed!'); setPwForm({ currentPassword: '', newPassword: '' }) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setPwLoading(false) }
  }

  return (
    <>
      <Helmet><title>Profile – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111827] mb-8">My Profile</h1>

          <div className="glass-card p-8 mb-6">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary/30">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-[#111827]">{user?.name}</h2>
                <p className="text-[#64748B]">{user?.email}</p>
                <span className={`badge mt-1 ${user?.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>{user?.role}</span>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="grid sm:grid-cols-2 gap-5">
              <Input label="Full Name" icon={FiUser} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Phone Number" icon={FiPhone} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[#64748B]">
                  <FiMail className="w-4 h-4" />{user?.email}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" loading={loading}><FiSave className="w-4 h-4" />Save Changes</Button>
              </div>
            </form>
          </div>

          <div className="glass-card p-8">
            <h3 className="font-bold text-[#111827] mb-5">Change Password</h3>
            <form onSubmit={handlePassword} className="grid sm:grid-cols-2 gap-5">
              <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
              <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
              <Button type="submit" loading={pwLoading}>Update Password</Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export function WishlistPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: () => wishlistAPI.get().then(r => r.data.data) })

  const removeItem = async productId => {
    await wishlistAPI.toggle({ productId })
    qc.invalidateQueries(['wishlist'])
    toast.success('Removed from wishlist')
  }

  return (
    <>
      <Helmet><title>Wishlist – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111827] mb-8 flex items-center gap-3"><FiHeart className="w-7 h-7 text-red-500" />My Wishlist</h1>

          {isLoading ? <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-20" /> :
            data?.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <div className="text-6xl mb-4">💝</div>
                <h3 className="text-xl font-bold mb-2">Your Wishlist is Empty</h3>
                <p className="text-[#64748B] mb-6">Save products you love for later</p>
                <Link to="/shop" className="premium-button">Browse Products</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden group">
                    <div className="h-44 bg-slate-50 overflow-hidden">
                      <img src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'}
                        alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <Link to={`/product/${item.product?.slug}`} className="font-semibold text-[#111827] hover:text-primary text-sm line-clamp-2">{item.product?.name}</Link>
                      <p className="text-lg font-black text-[#111827] mt-2">{formatPrice(item.product?.price)}</p>
                      <div className="flex gap-2 mt-3">
                        <Link to={`/product/${item.product?.slug}`} className="premium-button text-xs px-4 py-2 flex-1 text-center">Add to Cart</Link>
                        <button onClick={() => removeItem(item.productId)} className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer"><FiTrash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
        </div>
      </div>
    </>
  )
}

export function MyRepairBookingsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['my-repairs'],
    queryFn: () => repairAPI.getMy().then(r => r.data.data),
  })
  const [selected, setSelected] = useState(null)
  const [payingId, setPayingId] = useState(null)

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  const handlePayNow = async (b) => {
    setPayingId(b.id)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Payment gateway failed to load'); return }
      const { data: res } = await repairAPI.createPaymentOrder(b.id)
      const orderData = res.data
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Ozone Lapcare',
        description: `Repair Booking – ${b.service?.name || 'Service'}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await repairAPI.verifyPayment(b.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success('Payment successful!')
            qc.invalidateQueries(['my-repairs'])
          } catch { toast.error('Payment verification failed') }
        },
        prefill: { name: b.name, email: b.email, contact: b.phone },
        theme: { color: '#7c3aed' },
      }
      new window.Razorpay(options).open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment')
    } finally {
      setPayingId(null)
    }
  }

  const formatDate = date => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const downloadRepairInvoice = async (b) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = 595
    const left = 40
    const right = W - 40

    const gstRate = 18
    const total = parseFloat(b.confirmBookingAmount) || 0
    const baseAmount = total / (1 + gstRate / 100)
    const gstAmount = total - baseAmount

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
    doc.text('306 B-Block, Silver Mall, RNT Marg, Indore MP - 452001', left, 58)
    doc.text('Phone: +91 8962872285 | support@ozonelapcare.com', left, 72)

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('REPAIR INVOICE', right, 38, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Invoice No: RB-${b.id}`, right, 55, { align: 'right' })
    doc.text(`Date: ${formatDate(b.createdAt)}`, right, 68, { align: 'right' })

    let y = 110

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(200, 210, 220)
    doc.roundedRect(left, y, right - left, 90, 4, 4, 'FD')

    doc.setTextColor(40, 70, 110)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('BILL TO', left + 14, y + 22)

    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(b.name || 'Customer', left + 14, y + 38)
    doc.setFont('helvetica', 'normal')
    doc.text(`Email: ${b.email || ''}`, left + 14, y + 52)
    doc.text(`Phone: ${b.phone || ''}`, left + 14, y + 66)

    y += 108

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(200, 210, 220)
    doc.roundedRect(left, y, right - left, 120, 4, 4, 'FD')

    let ty = y + 10
    doc.setTextColor(40, 70, 110)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('SERVICE DETAILS', left + 14, ty)

    ty += 20
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Service: ${b.service?.name || 'Repair'}`, left + 14, ty)
    ty += 16
    doc.text(`Laptop: ${b.laptopBrand || ''} ${b.laptopModel || ''}`, left + 14, ty)
    ty += 16
    doc.text(`Issue: ${b.issue || ''}`, left + 14, ty)
    ty += 16

    ty += 10
    const summaryW = 260
    const summaryX = right - summaryW
    doc.roundedRect(summaryX, y + 80, summaryW - 12, 50, 4, 4, 'FD')

    let totalY = y + 88
    doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Subtotal (ex-GST)', summaryX + 14, totalY)
    doc.text(`₹${baseAmount.toFixed(2)}`, right - 14, totalY, { align: 'right' })
    totalY += 16
    doc.text(`GST @ ${gstRate}%`, summaryX + 14, totalY)
    doc.text(`₹${gstAmount.toFixed(2)}`, right - 14, totalY, { align: 'right' })
    totalY += 24
    doc.setFillColor(40, 70, 110)
    doc.roundedRect(summaryX + 6, totalY, summaryW - 12, 22, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL', summaryX + 16, totalY + 14)
    doc.text(`₹${total.toFixed(2)}`, right - 16, totalY + 14, { align: 'right' })

    doc.setTextColor(120, 120, 120)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.text('* Prices are GST-inclusive', left, 760)

    doc.setFillColor(248, 250, 252)
    doc.rect(0, 760, W, 80, 'F')
    doc.setDrawColor(200, 210, 220)
    doc.line(left, 760, right, 760)

    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Thank you for choosing Ozone Lapcare!', W/2, 784, { align: 'center' })

    doc.save(`Repair_Invoice_RB-${b.id}.pdf`)
  }

  const statusColor = {
    pending:     { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-400' },
    confirmed:   { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400' },
    in_progress: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-400' },
    completed:   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-400' },
    cancelled:   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400' },
  }

  const sc = s => statusColor[s] || statusColor.pending

  return (
    <>
      <Helmet><title>My Repair Bookings – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111827] mb-2 flex items-center gap-3">
            <FiTool className="w-7 h-7 text-blue-500" />My Repair Bookings
          </h1>
          <p className="text-[#64748B] mb-8">Track your repair status and admin responses</p>

          {isLoading ? (
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-20" />
          ) : !data?.length ? (
            <div className="glass-card p-16 text-center">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-bold mb-2">No Repair Bookings Yet</h3>
              <p className="text-[#64748B] mb-6">Book a repair service and track it here</p>
              <Link to="/repair" className="premium-button">Book a Repair</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <FiTool className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#111827]">{b.service?.name || 'Repair Service'}</p>
                        <p className="text-sm text-[#64748B]">{b.laptopBrand} {b.laptopModel}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <FiCalendar className="w-3 h-3 text-[#94a3b8]" />
                          <span className="text-xs text-[#94a3b8]">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc(b.status).bg} ${sc(b.status).text} ${sc(b.status).border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc(b.status).dot}`} />
                        {b.status.replace('_', ' ')}
                      </span>
                      <button onClick={() => setSelected(selected?.id === b.id ? null : b)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 cursor-pointer">
                        {selected?.id === b.id ? 'Hide' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {selected?.id === b.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 px-5 pb-5 pt-4 grid sm:grid-cols-2 gap-4">

                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-slate-50">
                          <p className="text-xs font-semibold text-[#64748B] mb-1 flex items-center gap-1.5"><FiAlertCircle className="w-3.5 h-3.5" />Issue Reported</p>
                          <p className="text-sm text-[#374151]">{b.issue}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50">
                          <p className="text-xs font-semibold text-[#64748B] mb-1">Contact</p>
                          <p className="text-sm text-[#374151]">{b.email}</p>
                          <p className="text-sm text-[#374151]">{b.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
{b.estimatedCost ? (
                           <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                             <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" />Estimated Cost</p>
                             <p className="text-lg font-black text-blue-700">₹{b.estimatedCost}</p>
                           </div>
                         ) : (
                           <div className="p-3 rounded-xl bg-slate-50">
                             <p className="text-xs font-semibold text-[#64748B] mb-1">Estimated Cost</p>
                             <p className="text-sm text-[#94a3b8] italic">Pending assessment</p>
                           </div>
                         )}

                         {/* Confirm Booking Amount with GST breakdown */}
                         {b.confirmBookingAmount != null && b.confirmBookingAmount !== '' ? (
                           <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                             <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" />Payment Breakdown</p>
                             <div className="space-y-1 text-xs">
                               <div className="flex justify-between">
                                 <span className="text-emerald-600">Amount (ex-GST)</span>
                                 <span className="font-bold text-emerald-800">₹{(parseFloat(b.confirmBookingAmount) / 1.18).toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-emerald-600">GST @ 18%</span>
                                 <span className="font-bold text-emerald-800">₹{(parseFloat(b.confirmBookingAmount) - (parseFloat(b.confirmBookingAmount) / 1.18)).toFixed(2)}</span>
                               </div>
                             </div>
                           </div>
                         ) : null}

                        {/* Confirm Booking Amount (admin accepted booking) */}
                        <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                              <FiDollarSign className="w-3.5 h-3.5" />Confirm Booking Amount
                            </p>

                            {b.confirmBookingAmount != null && b.confirmBookingAmount !== '' ? (
                              <button
                                onClick={() => handlePayNow(b)}
                                disabled={b.paymentStatus === 'paid' || b.status === 'completed' || b.status === 'cancelled' || payingId === b.id}
                                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {payingId === b.id ? 'Loading...' : b.paymentStatus === 'paid' ? 'Paid ✓' : 'Pay now'}
                              </button>
                            ) : null}
                          </div>

{b.confirmBookingAmount != null && b.confirmBookingAmount !== '' ? (
                             <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                               <div className="flex items-center justify-between gap-3">
                                 <p className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                                   <FiDollarSign className="w-3.5 h-3.5" />Confirm Booking Amount
                                 </p>
                               </div>
                               <div className="mt-2 space-y-1 text-xs">
                                 <div className="flex justify-between">
                                   <span className="text-violet-600">Amount (ex-GST)</span>
                                   <span className="font-bold text-violet-800">₹{(parseFloat(b.confirmBookingAmount) / 1.18).toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span className="text-violet-600">GST @ 18%</span>
                                   <span className="font-bold text-violet-800">₹{(parseFloat(b.confirmBookingAmount) - (parseFloat(b.confirmBookingAmount) / 1.18)).toFixed(2)}</span>
                                 </div>
                                 <div className="pt-1 border-t border-violet-200 flex justify-between">
                                   <span className="font-semibold text-violet-800">Total</span>
                                   <span className="font-black text-violet-800">₹{b.confirmBookingAmount}</span>
                                 </div>
                               </div>
                               {b.paymentStatus === 'paid' && (
                                 <button
                                   onClick={() => downloadRepairInvoice(b)}
                                   className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                                 >
                                   <FiDownload className="w-3.5 h-3.5" /> Invoice
                                 </button>
                               )}
                             </div>
                           ) : (
                             <div className="p-3 rounded-xl bg-slate-50">
                               <p className="text-xs font-semibold text-[#64748B] mb-1 flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" />Confirm Booking Amount</p>
                               <p className="text-sm text-[#94a3b8] italic">Pending admin confirmation</p>
                             </div>
                           )}
                        </div>

                        {b.notes ? (
                          <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                            <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1.5"><FiMessageSquare className="w-3.5 h-3.5" />Admin Response</p>
                            <p className="text-sm text-[#374151]">{b.notes}</p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-50">
                            <p className="text-xs font-semibold text-[#64748B] mb-1 flex items-center gap-1.5"><FiMessageSquare className="w-3.5 h-3.5" />Admin Response</p>
                            <p className="text-sm text-[#94a3b8] italic">No response yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
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

const ICON_MAP = {
  FiMonitor, FiBattery, FiCpu, FiHardDrive, FiSettings, FiWifi,
  FiTool, FiZap, FiThumbsUp, FiShield, FiPackage, FiStar,
  FiCheckCircle, FiClock, FiTruck, FiPhoneCall,
  // aliases for invalid icon names that may come from DB
  FiType: FiFileText,
  FiDownload: FiDownloadCloud,
  FiFileText, FiDownloadCloud, FiSliders, FiTerminal, FiRefreshCw, FiPower,
}

function ServiceIcon({ icon, className = 'w-6 h-6' }) {
  // If it's already an emoji or non-string, render as-is
  if (!icon) return <FiTool className={className} />
  const Component = ICON_MAP[icon]
  if (Component) return <Component className={className} />
  // Emoji or unknown string — render as text span
  return <span className="text-2xl leading-none">{icon}</span>
}

const stats = [
  { value: '1,000+', label: 'Devices Repaired' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24hr', label: 'Avg. Turnaround' },
  { value: '98%', label: 'Customer Satisfaction' },
]

const processSteps = [
  { icon: FiPhoneCall, title: 'Book Online', desc: 'Fill the form or call us' },
  { icon: FiTruck, title: 'Free Pickup', desc: 'We collect from your doorstep' },
  { icon: FiTool, title: 'Expert Repair', desc: 'Certified techs fix your device' },
  { icon: FiPackage, title: 'Delivery', desc: 'Returned safe & warranty sealed' },
]

const faqs = [
  { q: 'How long does a repair take?', a: 'Most repairs are completed within 24 hours. Complex motherboard repairs may take up to 48–72 hours.' },
  { q: 'Do you use genuine parts?', a: 'Yes, we use only OEM or certified-equivalent parts, and every repair comes with a 90-day warranty.' },
  { q: 'Is there a free diagnosis?', a: 'Absolutely. We offer a free diagnostic check before any repair work begins.' },
  { q: 'Do you offer doorstep pickup?', a: 'Yes! We offer free pickup and drop-off within the city for all repair bookings.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <div className="max-w-2xl mx-auto mt-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-[#111827] mb-2">Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Questions</span></h2>
        <p className="text-[#64748B]">Everything you need to know before booking</p>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="font-semibold text-[#111827] text-sm">{f.q}</span>
              {open === i
                ? <FiChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                : <FiChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            {open === i && (
              <div className="px-6 pb-4 text-sm text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const mockServices = [
  { id: 1, name: 'Screen Replacement', description: 'Cracked or damaged screen repair', price: 2999, priceType: 'starting_from', icon: 'FiMonitor' },
  { id: 2, name: 'Battery Replacement', description: 'Replace old or swollen battery', price: 1499, priceType: 'starting_from', icon: 'FiBattery' },
  { id: 3, name: 'Keyboard Repair', description: 'Fix or replace damaged keys', price: 1999, priceType: 'starting_from', icon: 'FiSettings' },
  { id: 4, name: 'RAM Upgrade', description: 'Boost performance with more RAM', price: 999, priceType: 'starting_from', icon: 'FiCpu' },
  { id: 5, name: 'SSD Upgrade', description: 'Faster storage upgrade', price: 1499, priceType: 'starting_from', icon: 'FiHardDrive' },
  { id: 6, name: 'Motherboard Repair', description: 'Complex hardware repairs', price: 3999, priceType: 'starting_from', icon: 'FiZap' },
]

export function RepairPage() {
  const { data: services } = useQuery({ queryKey: ['repair-services'], queryFn: () => repairAPI.getServices().then(r => r.data.data) })
  const [form, setForm] = useState({ name: '', email: '', phone: '', laptopBrand: '', laptopModel: '', issue: '', serviceId: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try { await repairAPI.book(form); setSubmitted(true); toast.success('Repair booking submitted!') }
    catch { toast.error('Booking failed. Please try again.') } finally { setLoading(false) }
  }

  const displayServices = services?.length ? services : mockServices

  return (
    <>
      <Helmet><title>Repair Services – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen bg-[#f8f9fc]">

        {/* ── Hero ── */}
        <div className="bg-[#0F172A] pt-14 pb-5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(40,117,183,0.25) 0%, transparent 55%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 30%, rgba(139,92,246,0.15) 0%, transparent 50%)' }} />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-6">
                <FiTool className="w-3.5 h-3.5" />Expert Repair Services
              </span>
              <h1 className="text-5xl font-black text-white mb-5 leading-tight">
                Laptop Repair <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Made Easy</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-8">
                Professional repairs by certified technicians. Fast turnaround, genuine parts, and warranty on every job.
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                {stats.map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-black text-white">{value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-10">

          {/* ── Services Grid ── */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#111827] mb-2">Our <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Services</span></h2>
            <p className="text-[#64748B]">Transparent pricing, expert hands</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {displayServices.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                onClick={() => setForm(f => ({ ...f, serviceId: String(s.id) }))}
                className={`relative bg-white rounded-2xl p-5 text-center border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  form.serviceId === String(s.id)
                    ? 'border-blue-500 shadow-blue-100 shadow-lg'
                    : 'border-slate-100 hover:border-blue-200'
                }`}>
                {form.serviceId === String(s.id) && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <FiCheckCircle className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                  form.serviceId === String(s.id)
                    ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                    : 'bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100'
                }`}>
                  <ServiceIcon icon={s.icon} className={`w-5 h-5 ${form.serviceId === String(s.id) ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <h3 className="font-bold text-xs text-[#111827] mb-1 leading-tight">{s.name}</h3>
                <p className="text-[10px] text-[#94a3b8] mb-2 leading-snug">{s.description}</p>
                <p className="font-black text-blue-600 text-xs">
                  {s.priceType === 'starting_from' ? 'From ' : ''}{formatPrice(s.price)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── How It Works ── */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#111827] mb-2">How It <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Works</span></h2>
            <p className="text-[#64748B]">Simple, transparent, hassle-free</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
            {processSteps.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-2 relative">
                {i < 3 && <FiArrowRight className="hidden md:block absolute -right-3 top-5 w-4 h-4 text-slate-300" />}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-100">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-[10px] font-black text-blue-600">{i + 1}</div>
                <p className="font-bold text-[#111827] text-sm">{title}</p>
                <p className="text-xs text-[#64748B]">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Booking Form ── */}
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
                  <FiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-[#111827] mb-2">Booking Confirmed!</h3>
                <p className="text-[#64748B] mb-8">We'll call you within 2 hours to confirm your appointment and schedule a pickup.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/my-repairs" className="premium-button">View My Bookings</Link>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', laptopBrand: '', laptopModel: '', issue: '', serviceId: '' }) }}
                    className="premium-button-ghost px-6">
                    Book Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                    <FiTool className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#111827]">Book a Repair</h3>
                    <p className="text-xs text-[#64748B]">Fill in the details and we'll get back to you shortly</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="John Doe" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <Input label="Email" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Service Type</label>
                    <select value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))} required className="premium-input">
                      <option value="">Select a service</option>
                      {displayServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <Input label="Laptop Brand" placeholder="Dell, HP, Lenovo..." value={form.laptopBrand} onChange={e => setForm(f => ({ ...f, laptopBrand: e.target.value }))} />
                  <Input label="Laptop Model" placeholder="Inspiron 15 3520" value={form.laptopModel} onChange={e => setForm(f => ({ ...f, laptopModel: e.target.value }))} />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Describe the Issue</label>
                    <textarea value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} required rows={4}
                      placeholder="Please describe the problem in detail..." className="premium-input resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" loading={loading} className="w-full py-3.5 text-sm font-bold">
                      <FiTool className="w-4 h-4" />Submit Booking
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
          <FAQ />
        </div>
      </div>
    </>
  )
}
