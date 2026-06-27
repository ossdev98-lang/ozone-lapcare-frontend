import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiGift, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { offerAPI } from '../../api/services'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const emptyForm = { title: '', isActive: true, sortOrder: 0 }

export default function AdminOffers() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => offerAPI.getAdmin().then(r => r.data.data),
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = offer => { setEditing(offer); setForm({ ...offer }); setModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await offerAPI.update(editing.id, form)
      else await offerAPI.create(form)
      qc.invalidateQueries(['admin-offers'])
      setModal(false)
      toast.success(editing ? 'Offer updated!' : 'Offer created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this offer?')) return
    try {
      await offerAPI.delete(id)
      qc.invalidateQueries(['admin-offers'])
      toast.success('Offer deleted')
    } catch {
      toast.error('Failed')
    }
  }

  const toggleActive = async offer => {
    try {
      await offerAPI.update(offer.id, { ...offer, isActive: !offer.isActive })
      qc.invalidateQueries(['admin-offers'])
      toast.success(`Offer ${offer.isActive ? 'disabled' : 'enabled'}`)
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <>
      <Helmet><title>Offers – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2">
            <FiGift className="w-6 h-6 text-primary" /> Offers
          </h1>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" /> Add Offer</Button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Title</th><th>Status</th><th>Sort Order</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {isLoading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />) :
                  data?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-[#94a3b8]">
                          <FiGift className="w-10 h-10 opacity-30" />
                          <p className="text-sm font-medium">No offers found</p>
                        </div>
                      </td>
                    </tr>
                  ) :
                    data?.map(offer => (
                      <tr key={offer.id}>
                        <td className="font-semibold text-[#111827]">{offer.title}</td>
                        <td>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold capitalize
                            ${offer.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                            {offer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-sm text-[#64748B]">{offer.sortOrder}</td>
                        <td className="text-sm text-[#64748B]">{new Date(offer.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleActive(offer)}
                              className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer"
                              title={offer.isActive ? 'Disable' : 'Enable'}
                            >
                              {offer.isActive ? <FiToggleRight className="w-4 h-4 text-emerald-500" /> : <FiToggleLeft className="w-4 h-4" />}
                            </button>
                            <button onClick={() => openEdit(offer)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer">
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(offer.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
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
                <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Offer' : 'Create Offer'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Offer Text *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Limited offer book your first laptop service at just Rs 99" />
                </div>
                <Input label="Sort Order" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                  <select value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="premium-input">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" loading={saving} className="flex-1">Save Offer</Button>
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