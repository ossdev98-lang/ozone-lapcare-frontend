import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiToggleLeft, FiToggleRight, FiUpload } from 'react-icons/fi'
import { adAPI } from '../../api/services'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const emptyForm = { title: '', link: '', isActive: true, sortOrder: 0 }

export default function AdminAds() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: () => adAPI.getAll().then(r => r.data.data),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setPreview(null)
    setModal(true)
  }
  const openEdit = ad => {
    setEditing(ad)
    setForm({ title: ad.title, link: ad.link || '', isActive: ad.isActive, sortOrder: ad.sortOrder })
    setPreview(ad.image)
    setModal(true)
  }

  const handleFile = e => {
    const f = e.target.files[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('link', form.link || '')
      fd.append('isActive', String(form.isActive))
      fd.append('sortOrder', String(form.sortOrder))
      const file = fileRef.current?.files?.[0]
      if (file) fd.append('image', file)

      if (editing) await adAPI.update(editing.id, fd)
      else await adAPI.create(fd)
      qc.invalidateQueries(['admin-ads'])
      setModal(false)
      toast.success(editing ? 'Ad updated!' : 'Ad created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this ad?')) return
    try {
      await adAPI.delete(id)
      qc.invalidateQueries(['admin-ads'])
      toast.success('Ad deleted')
    } catch {
      toast.error('Failed')
    }
  }

  const toggleActive = async ad => {
    try {
      await adAPI.update(ad.id, { ...ad, isActive: !ad.isActive })
      qc.invalidateQueries(['admin-ads'])
      toast.success(`Ad ${ad.isActive ? 'disabled' : 'enabled'}`)
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <>
      <Helmet><title>Ads – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2">
            <FiImage className="w-6 h-6 text-primary" /> Ad Management
          </h1>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" /> Add Ad</Button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Preview</th><th>Title</th><th>Status</th><th>Sort</th><th>Actions</th></tr></thead>
              <tbody>
                {isLoading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />) :
                  data?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-[#94a3b8]">
                          <FiImage className="w-10 h-10 opacity-30" />
                          <p className="text-sm font-medium">No ads found</p>
                        </div>
                      </td>
                    </tr>
                  ) : data?.map(ad => (
                    <tr key={ad.id}>
                      <td>
                        <img src={ad.image} alt={ad.title} className="w-16 h-12 rounded-xl object-cover bg-slate-100" />
                      </td>
                      <td className="font-semibold text-[#111827]">{ad.title}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold capitalize
                          ${ad.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-sm text-[#64748B]">{ad.sortOrder}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActive(ad)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer" title={ad.isActive ? 'Disable' : 'Enable'}>
                            {ad.isActive ? <FiToggleRight className="w-4 h-4 text-emerald-500" /> : <FiToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEdit(ad)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(ad.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer">
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
          <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Ad' : 'Create Ad'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Ad Image *</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-32 rounded-xl object-contain" />
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-[#64748B] font-medium">Click to upload image</span>
                      </>
                    )}
                  </button>
                </div>
                <Input label="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Sale" />
                <Input label="Link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Sort Order" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                    <select value={String(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="premium-input">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={saving} className="flex-1">Save Ad</Button>
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
