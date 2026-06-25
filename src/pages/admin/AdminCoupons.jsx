import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi'
import { couponAPI } from '../../api/services'
import { formatDate, formatPrice } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const emptyForm = { code: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', userLimit: 1, description: '', expiresAt: '', isActive: true }

export default function AdminCoupons() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: () => couponAPI.getAll().then(r => r.data.data) })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = c => { setEditing(c); setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '' }); setModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await couponAPI.update(editing.id, form)
      else await couponAPI.create(form)
      qc.invalidateQueries(['admin-coupons'])
      setModal(false)
      toast.success(editing ? 'Coupon updated!' : 'Coupon created!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this coupon?')) return
    try { await couponAPI.delete(id); qc.invalidateQueries(['admin-coupons']); toast.success('Coupon deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <>
      <Helmet><title>Coupons – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#111827]">Coupons</h1>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" />Add Coupon</Button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {isLoading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={8} />) :
                  data?.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span className="flex items-center gap-2 font-bold text-primary">
                          <FiTag className="w-3.5 h-3.5" />{c.code}
                        </span>
                      </td>
                      <td><Badge variant="info" className="capitalize">{c.type}</Badge></td>
                      <td className="font-bold">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                      <td>{formatPrice(c.minOrderAmount)}</td>
                      <td className="text-sm text-[#64748B]">{c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ''}</td>
                      <td className="text-sm text-[#64748B]">{c.expiresAt ? formatDate(c.expiresAt) : 'No expiry'}</td>
                      <td><Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer"><FiEdit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 grid sm:grid-cols-2 gap-4">
                <Input label="Coupon Code *" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE10" />
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="premium-input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <Input label={`Value (${form.type === 'percentage' ? '%' : '₹'}) *`} type="number" required value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                <Input label="Min Order Amount (₹)" type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} />
                <Input label="Max Discount (₹)" type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} />
                <Input label="Total Usage Limit" type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
                <Input label="Expiry Date" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                  <select value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="premium-input">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Get 10% off on all orders" />
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" loading={saving} className="flex-1">Save Coupon</Button>
                  <button type="button" onClick={() => setModal(false)} className="premium-button-ghost px-5">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
