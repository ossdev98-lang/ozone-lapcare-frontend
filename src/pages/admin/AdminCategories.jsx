import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi'
import { categoryAPI, brandAPI } from '../../api/services'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

function CRUDModal({ title, fields, onSave, onClose, saving }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="glass-modal w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-black text-[#111827]">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          {fields}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">Save</Button>
            <button type="button" onClick={onClose} className="premium-button-ghost px-5">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export function AdminCategories() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '', sortOrder: 0 })
  const [imgFile, setImgFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll().then(r => r.data.data) })

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', icon: '', sortOrder: 0 }); setImgFile(null); setModal(true) }
  const openEdit = c => { setEditing(c); setForm({ name: c.name, description: c.description || '', icon: c.icon || '', sortOrder: c.sortOrder || 0 }); setImgFile(null); setModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imgFile) fd.append('image', imgFile)
      if (editing) await categoryAPI.update(editing.id, fd)
      else await categoryAPI.create(fd)
      qc.invalidateQueries(['categories'])
      setModal(false)
      toast.success(editing ? 'Category updated!' : 'Category created!')
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this category?')) return
    try { await categoryAPI.delete(id); qc.invalidateQueries(['categories']); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  return (
    <>
      <Helmet><title>Categories – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#111827]">Categories</h1>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" />Add Category</Button>
        </div>
        <div className="glass-card overflow-hidden">
          <table className="premium-table">
            <thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Sort</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={6} />) :
                data?.map(c => (
                  <tr key={c.id}>
                    <td>{c.image ? <img src={c.image} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-lg">{c.icon || '📦'}</div>}</td>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-[#64748B] text-sm">{c.slug}</td>
                    <td>{c.sortOrder}</td>
                    <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
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
      <AnimatePresence>
        {modal && (
          <CRUDModal title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setModal(false)} onSave={handleSave} saving={saving}
            fields={<>
              <Input label="Name *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <Input label="Icon (react-icons name)" placeholder="FiMonitor" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
              <Input label="Sort Order" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
              <label className="block cursor-pointer">
                <p className="text-sm font-medium text-[#374151] mb-1.5">Category Image</p>
                <div className="border-2 border-dashed border-white/40 rounded-xl p-4 text-center hover:border-primary/60 transition-colors">
                  <FiUpload className="w-5 h-5 text-[#64748B] mx-auto mb-1" />
                  <p className="text-xs text-[#64748B]">{imgFile ? imgFile.name : 'Click to upload'}</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setImgFile(e.target.files[0])} />
              </label>
            </>}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function AdminBrands() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', website: '', sortOrder: 0 })
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['brands'], queryFn: () => brandAPI.getAll().then(r => r.data.data) })

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', website: '', sortOrder: 0 }); setLogoFile(null); setModal(true) }
  const openEdit = b => { setEditing(b); setForm({ name: b.name, description: b.description || '', website: b.website || '', sortOrder: b.sortOrder || 0 }); setLogoFile(null); setModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logoFile) fd.append('logo', logoFile)
      if (editing) await brandAPI.update(editing.id, fd)
      else await brandAPI.create(fd)
      qc.invalidateQueries(['brands'])
      setModal(false)
      toast.success(editing ? 'Brand updated!' : 'Brand created!')
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this brand?')) return
    try { await brandAPI.delete(id); qc.invalidateQueries(['brands']); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <>
      <Helmet><title>Brands – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#111827]">Brands</h1>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" />Add Brand</Button>
        </div>
        <div className="glass-card overflow-hidden">
          <table className="premium-table">
            <thead><tr><th>Logo</th><th>Name</th><th>Slug</th><th>Website</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />) :
                data?.map(b => (
                  <tr key={b.id}>
                    <td>{b.logo ? <img src={b.logo} alt="" className="w-12 h-8 object-contain" /> : <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-[#64748B]">{b.name[0]}</div>}</td>
                    <td className="font-medium">{b.name}</td>
                    <td className="text-[#64748B] text-sm">{b.slug}</td>
                    <td>{b.website ? <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline truncate max-w-32 block">{b.website}</a> : '–'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(b)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer"><FiEdit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(b.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer"><FiTrash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {modal && (
          <CRUDModal title={editing ? 'Edit Brand' : 'Add Brand'} onClose={() => setModal(false)} onSave={handleSave} saving={saving}
            fields={<>
              <Input label="Brand Name *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <Input label="Website URL" type="url" placeholder="https://brand.com" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              <label className="block cursor-pointer">
                <p className="text-sm font-medium text-[#374151] mb-1.5">Brand Logo</p>
                <div className="border-2 border-dashed border-white/40 rounded-xl p-4 text-center hover:border-primary/60 transition-colors">
                  <FiUpload className="w-5 h-5 text-[#64748B] mx-auto mb-1" />
                  <p className="text-xs text-[#64748B]">{logoFile ? logoFile.name : 'Click to upload logo'}</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files[0])} />
              </label>
            </>}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminCategories
