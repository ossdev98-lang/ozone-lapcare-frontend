import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiSearch } from 'react-icons/fi'
import { productAPI, categoryAPI, brandAPI } from '../../api/services'
import { formatPrice } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const emptyForm = { name: '', shortDescription: '', description: '', price: '', comparePrice: '', stock: '', categoryId: '', brandId: '', condition: 'new', status: 'active', isFeatured: false, isFlashSale: false, flashSalePrice: '', sku: '', warrantyMonths: 12, gstPercent: 18, tags: '' }

export default function AdminProducts() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imgModal, setImgModal] = useState(null)
  const [imgFiles, setImgFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productAPI.getAll({ page, limit: 15, search }).then(r => r.data)
  })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll().then(r => r.data.data) })
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => brandAPI.getAll().then(r => r.data.data) })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = p => { setEditing(p); setForm({ ...p, tags: p.tags?.join(', ') || '' }); setModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] }
      if (editing) await productAPI.update(editing.id, payload)
      else await productAPI.create(payload)
      qc.invalidateQueries(['admin-products'])
      setModal(false)
      toast.success(editing ? 'Product updated!' : 'Product created!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this product?')) return
    try { await productAPI.delete(id); qc.invalidateQueries(['admin-products']); toast.success('Product deleted') }
    catch { toast.error('Delete failed') }
  }

  const handleUploadImages = async () => {
    if (!imgFiles.length || !imgModal) return
    setUploading(true)
    try {
      const fd = new FormData()
      imgFiles.forEach(f => fd.append('images', f))
      await productAPI.uploadImages(imgModal, fd)
      qc.invalidateQueries(['admin-products'])
      setImgModal(null); setImgFiles([])
      toast.success('Images uploaded!')
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const products = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <Helmet><title>Products – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Products</h1>
            <p className="text-[#64748B] text-sm">{pagination?.total || 0} total products</p>
          </div>
          <Button onClick={openCreate}><FiPlus className="w-4 h-4" />Add Product</Button>
        </div>

        {/* Search */}
        <div className="glass-card p-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search products..." className="premium-input pl-9 text-sm" />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {isLoading ? [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={6} />) :
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={p.thumbnail || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=50'} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div>
                            <p className="font-medium text-[#111827] text-sm max-w-48 truncate">{p.name}</p>
                            <p className="text-xs text-[#94a3b8]">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-sm text-[#64748B]">{p.category?.name || '–'}</span></td>
                      <td><span className="font-bold">{formatPrice(p.price)}</span></td>
                      <td>
                        <span className={`font-semibold text-sm ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td><Badge variant={p.status === 'active' ? 'success' : 'default'} className="capitalize">{p.status}</Badge></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setImgModal(p.id)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary transition-all cursor-pointer" title="Images">
                            <FiUpload className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary transition-all cursor-pointer">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-all cursor-pointer">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-white/20">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="premium-button-ghost text-sm px-4 py-2 disabled:opacity-40">Prev</button>
              <span className="flex items-center text-sm text-[#64748B]">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="premium-button-ghost text-sm px-4 py-2 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Product Name *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Category</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="premium-input">
                    <option value="">Select Category</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Brand</label>
                  <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))} className="premium-input">
                    <option value="">Select Brand</option>
                    {brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <Input label="Selling Price (₹) *" type="number" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                <Input label="Compare Price (₹)" type="number" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} />
                <Input label="Stock *" type="number" required value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                <Input label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Condition</label>
                  <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="premium-input">
                    <option value="new">New</option>
                    <option value="refurbished">Refurbished</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="premium-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Input label="Short Description" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="premium-input resize-none" />
                </div>
                <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFlashSale} onChange={e => setForm(f => ({ ...f, isFlashSale: e.target.checked }))} className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Flash Sale</span>
                  </label>
                </div>
                {form.isFlashSale && (
                  <Input label="Flash Sale Price (₹)" type="number" value={form.flashSalePrice} onChange={e => setForm(f => ({ ...f, flashSalePrice: e.target.value }))} />
                )}
                <div className="sm:col-span-2 flex gap-3 pt-2 border-t border-white/20">
                  <Button type="submit" loading={saving} className="flex-1">Save Product</Button>
                  <button type="button" onClick={() => setModal(false)} className="premium-button-ghost px-6">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {imgModal && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-modal w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-[#111827]">Upload Images</h2>
                <button onClick={() => { setImgModal(null); setImgFiles([]) }} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer"><FiX className="w-5 h-5" /></button>
              </div>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-white/40 rounded-2xl p-8 text-center hover:border-primary/60 transition-colors">
                  <FiUpload className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#111827]">Click to select images</p>
                  <p className="text-xs text-[#64748B] mt-1">PNG, JPG up to 5MB each</p>
                </div>
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImgFiles(Array.from(e.target.files))} />
              </label>
              {imgFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {imgFiles.map((f, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-xl bg-white/60 text-xs text-[#374151]">{f.name}</div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-5">
                <Button onClick={handleUploadImages} loading={uploading} disabled={!imgFiles.length} className="flex-1">Upload</Button>
                <button onClick={() => { setImgModal(null); setImgFiles([]) }} className="premium-button-ghost px-5">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
