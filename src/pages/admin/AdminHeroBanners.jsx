import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiToggleLeft, FiToggleRight, FiUpload, FiAlertCircle } from 'react-icons/fi'
import { heroBannerAPI } from '../../api/services'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const REC_W = 1780
const REC_H = 516
const emptyForm = { title: '', link: '', isActive: true, sortOrder: 0 }

function checkDimensions(file) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = URL.createObjectURL(file)
  })
}

export default function AdminHeroBanners() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [dimWarn, setDimWarn] = useState(false)
  const fileRef = useRef()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-hero-banners'],
    queryFn: () => heroBannerAPI.getAll().then(r => r.data.data),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setPreview(null)
    setDimWarn(false)
    setModal(true)
  }
  const openEdit = b => {
    setEditing(b)
    setForm({ title: b.title, link: b.link || '', isActive: b.isActive, sortOrder: b.sortOrder })
    setPreview(b.image)
    setDimWarn(false)
    setModal(true)
  }

  const handleFile = async e => {
    const f = e.target.files[0]
    if (!f) return
    setPreview(URL.createObjectURL(f))
    const dims = await checkDimensions(f)
    setDimWarn(!dims || dims.w !== REC_W || dims.h !== REC_H)
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

      if (editing) await heroBannerAPI.update(editing.id, fd)
      else await heroBannerAPI.create(fd)
      qc.invalidateQueries(['admin-hero-banners'])
      qc.invalidateQueries(['hero-banners'])
      setModal(false)
      toast.success(editing ? 'Banner updated!' : 'Banner created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this banner?')) return
    try {
      await heroBannerAPI.delete(id)
      qc.invalidateQueries(['admin-hero-banners'])
      qc.invalidateQueries(['hero-banners'])
      toast.success('Banner deleted')
    } catch {
      toast.error('Failed')
    }
  }

  const toggleActive = async b => {
    try {
      await heroBannerAPI.update(b.id, { ...b, isActive: !b.isActive })
      qc.invalidateQueries(['admin-hero-banners'])
      qc.invalidateQueries(['hero-banners'])
      toast.success(`Banner ${b.isActive ? 'disabled' : 'enabled'}`)
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <>
      <Helmet><title>Hero Banners – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2">
            <FiImage className="w-6 h-6 text-primary" /> Hero Banners
          </h1>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" /> Add Banner</Button>
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
                          <p className="text-sm font-medium">No banners found</p>
                        </div>
                      </td>
                    </tr>
                  ) : data?.map(b => (
                    <tr key={b.id}>
                      <td>
                        <img src={b.image} alt={b.title} className="w-24 h-7 rounded-lg object-cover bg-slate-100" />
                      </td>
                      <td className="font-semibold text-[#111827]">{b.title}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold capitalize
                          ${b.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-sm text-[#64748B]">{b.sortOrder}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActive(b)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer" title={b.isActive ? 'Disable' : 'Enable'}>
                            {b.isActive ? <FiToggleRight className="w-4 h-4 text-emerald-500" /> : <FiToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEdit(b)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer">
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
                <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Banner' : 'Create Banner'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Banner Image *</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full max-h-40 rounded-xl object-contain" />
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-[#64748B] font-medium">Click to upload image</span>
                      </>
                    )}
                  </button>
                  <p className="mt-1.5 text-xs text-[#64748B]">
                    Recommended size: <span className="font-semibold text-primary">1780 × 516 px</span>. The full image will be displayed in this ratio on the hero section.
                  </p>
                  {dimWarn && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Your image is not 1780 × 516. It will still be displayed full-width (may be cropped/stretched). For best results, upload at the recommended ratio.</span>
                    </div>
                  )}
                </div>
                <Input label="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Sale" />
                <Input label="Link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://... or /shop" />
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
                  <Button type="submit" loading={saving} className="flex-1">Save Banner</Button>
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
