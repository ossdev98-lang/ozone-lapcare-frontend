import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiSearch, FiEye, FiPackage, FiTag, FiStar, FiZap, FiFilter, FiFileText, FiPower, FiMoreVertical } from 'react-icons/fi'
import { productAPI, categoryAPI, brandAPI } from '../../api/services'
import { formatPrice } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Dropdown from '../../components/ui/Dropdown'
import Tabs from '../../components/ui/Tabs'
import RichTextEditor from '../../components/ui/RichTextEditor'
import Badge from '../../components/ui/Badge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const emptyForm = {
  name: '', shortDescription: '', description: '', price: '', comparePrice: '', stock: '',
  categoryId: '', brandId: '', condition: 'new', status: 'active', isFeatured: false,
  isFlashSale: false, flashSalePrice: '', sku: '', warrantyMonths: 12, gstPercent: 18, tags: '',
  specifications: [], images: []
}

export default function AdminProducts() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [condition, setCondition] = useState('')
  const [isFeatured, setIsFeatured] = useState('')
  const [isFlashSale, setIsFlashSale] = useState('')
  
  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [viewProduct, setViewProduct] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imgFiles, setImgFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [bulkSpecText, setBulkSpecText] = useState('')
  const [actionMenuId, setActionMenuId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, status, category, brand, condition, isFeatured, isFlashSale],
    queryFn: () => productAPI.getAll({
      page, limit: 12, search, status, category, brand, condition, isFeatured, isFlashSale
    }).then(r => r.data)
  })
  
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll().then(r => r.data.data) })
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => brandAPI.getAll().then(r => r.data.data) })

  const products = data?.data || []
  const pagination = data?.pagination

  // Stats
  const stats = {
    total: pagination?.total || 0,
    active: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.stock === 0).length,
    featured: products.filter(p => p.isFeatured).length,
    flashSale: products.filter(p => p.isFlashSale).length,
  }

  useEffect(() => {
    const handleClick = () => setActionMenuId(null)
    if (actionMenuId !== null) document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [actionMenuId])

  const resetFilters = () => {
    setSearch(''); setStatus(''); setCategory(''); setBrand(''); setCondition('');
    setIsFeatured(''); setIsFlashSale(''); setPage(1);
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setImgFiles([]); setExistingImages([]); setRemovedImageIds([]); setModal(true) }
  const openEdit = p => {
    setEditing(p)
    setForm({ ...p, tags: p.tags?.join(', ') || '', specifications: p.specifications || [], images: [] })
    setImgFiles([])
    setExistingImages(p.images || [])
    setRemovedImageIds([])
    setModal(true)
  }
  const openView = p => { setViewProduct(p); setViewModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      // Build payload with proper type handling
      const payload = { ...form }
      payload.tags = form.tags ? form.tags.split(',').map(t => t.trim()) : []
      payload.specifications = form.specifications
      
      // Clean up optional/maybe-empty fields
      if (payload.comparePrice === '') payload.comparePrice = null
      // Clean up optional/maybe-empty fields
      if (payload.comparePrice === '') payload.comparePrice = null
      if (!form.isFlashSale || payload.flashSalePrice === '') delete payload.flashSalePrice
      if (payload.stock === '') delete payload.stock
      if (payload.categoryId === '') delete payload.categoryId
      if (payload.brandId === '') delete payload.brandId
      
      // Ensure numeric fields are numbers with defaults
      if (payload.warrantyMonths === '' || payload.warrantyMonths === 0) delete payload.warrantyMonths
      if (payload.gstPercent === '' || payload.gstPercent === 0) delete payload.gstPercent
      
      if (editing) {
        await productAPI.update(editing.id, payload)
        // Upload images for existing product
        if (imgFiles.length > 0) {
          try {
            const fd = new FormData()
            imgFiles.forEach(f => fd.append('images', f))
            await productAPI.uploadImages(editing.id, fd)
          } catch {
            toast.error('Product updated but image upload failed')
          }
        }
        // Delete removed images
        if (removedImageIds.length > 0) {
          try {
            await Promise.all(removedImageIds.map(id => productAPI.deleteImage(editing.id, id)))
          } catch {
            toast.error('Some images could not be deleted')
          }
        }
        qc.invalidateQueries(['admin-products'])
        setModal(false)
        toast.success('Product updated!')
      } else {
        const response = await productAPI.create(payload)
        const productId = response.data.data.id
        // Upload images if any
        if (imgFiles.length > 0) {
          try {
            const fd = new FormData()
            imgFiles.forEach(f => fd.append('images', f))
            await productAPI.uploadImages(productId, fd)
          } catch {
            toast.error('Product created but image upload failed')
          }
        }
        qc.invalidateQueries(['admin-products'])
        setModal(false)
        toast.success('Product created!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this product?')) return
    try {
      await productAPI.delete(id)
      qc.invalidateQueries(['admin-products'])
      toast.success('Product deleted')
    } catch {
      toast.error('Delete failed')
    }
  }
  const handleMarkSold = async id => {
    if (!confirm('Mark this product as sold? Stock will be set to 0.')) return
    try {
      await productAPI.markAsSold(id)
      qc.invalidateQueries(['admin-products'])
      toast.success('Marked as sold')
    } catch {
      toast.error('Failed')
    }
  }
  const handleDeactivate = async id => {
    if (!confirm('Deactivate this product?')) return
    try {
      await productAPI.deactivate(id)
      qc.invalidateQueries(['admin-products'])
      toast.success('Product deactivated')
    } catch {
      toast.error('Failed')
    }
  }
  const handleActivate = async id => {
    if (!confirm('Activate this product?')) return
    try {
      await productAPI.activate(id)
      qc.invalidateQueries(['admin-products'])
      toast.success('Product activated')
    } catch {
      toast.error('Failed')
    }
  }

  const addSpec = () => setForm(f => ({ ...f, specifications: [...(f.specifications || []), { key: '', value: '' }] }))
  const updateSpec = (idx, field, val) => setForm(f => {
    const specs = [...(f.specifications || [])]
    specs[idx][field] = val
    return { ...f, specifications: specs }
  })
  const removeSpec = idx => setForm(f => ({ ...f, specifications: f.specifications?.filter((_, i) => i !== idx) || [] }))
  const clearSpecs = () => setForm(f => ({ ...f, specifications: [] }))
  const importSpecs = () => {
    const text = bulkSpecText.trim()
    if (!text) return
    const lines = text.split('\n')
    const newSpecs = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      let idx = trimmed.indexOf(':')
      if (idx !== -1) {
        newSpecs.push({ key: trimmed.slice(0, idx).trim(), value: trimmed.slice(idx + 1).trim() })
        continue
      }
      idx = trimmed.indexOf('=')
      if (idx !== -1) {
        newSpecs.push({ key: trimmed.slice(0, idx).trim(), value: trimmed.slice(idx + 1).trim() })
        continue
      }
      const tabIdx = trimmed.indexOf('\t')
      if (tabIdx !== -1) {
        newSpecs.push({ key: trimmed.slice(0, tabIdx).trim(), value: trimmed.slice(tabIdx + 1).trim() })
        continue
      }
      const dashParts = trimmed.split('-')
      if (dashParts.length >= 2) {
        newSpecs.push({ key: dashParts[0].trim(), value: dashParts.slice(1).join('-').trim() })
        continue
      }
      newSpecs.push({ key: trimmed, value: '' })
    }
    setForm(f => ({ ...f, specifications: [...(f.specifications || []), ...newSpecs] }))
    setBulkSpecText('')
  }

  const pageNums = []
  if (pagination?.pages) {
    for (let i = 1; i <= pagination.pages; i++) {
      if (i === 1 || i === pagination.pages || Math.abs(i - page) <= 1) pageNums.push(i)
      else if (pageNums[pageNums.length - 1] !== '...') pageNums.push('...')
    }
  }

  return (
    <>
      <Helmet><title>Products – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-6">
        
        {/* Header & Stats */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#111827]">Products</h1>
              <p className="text-[#64748B] text-sm">Manage your product catalog</p>
            </div>
            <Button onClick={openCreate}><FiPlus className="w-4 h-4" /> Add Product</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Total</p>
                <p className="text-lg font-black text-[#111827]">{stats.total}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <FiTag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Active</p>
                <p className="text-lg font-black text-emerald-700">{stats.active}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Out of Stock</p>
                <p className="text-lg font-black text-red-600">{stats.outOfStock}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <FiStar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Featured</p>
                <p className="text-lg font-black text-amber-700">{stats.featured}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Flash Sale</p>
                <p className="text-lg font-black text-violet-700">{stats.flashSale}</p>
              </div>
            </div>
          </div>
        </motion.div>

{/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-[#111827] flex items-center gap-2">
              <FiFilter className="w-4 h-4" /> Filters
            </p>
            <button onClick={resetFilters} className="premium-button-ghost text-xs px-3 py-1.5">Reset</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search products..." className="premium-input pl-9 text-sm" />
            </div>
            <Dropdown
              placeholder="All Status"
              value={status}
              onChange={v => { setStatus(v); setPage(1) }}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
            <Dropdown
              placeholder="All Categories"
              value={category}
              onChange={v => { setCategory(v); setPage(1) }}
              options={categories?.map(c => ({ value: c.id.toString(), label: c.name })) || []}
            />
            <Dropdown
              placeholder="All Brands"
              value={brand}
              onChange={v => { setBrand(v); setPage(1) }}
              options={brands?.map(b => ({ value: b.id.toString(), label: b.name })) || []}
            />
            <Dropdown
              placeholder="All Conditions"
              value={condition}
              onChange={v => { setCondition(v); setPage(1) }}
              options={[
                { value: 'new', label: 'New' },
                { value: 'refurbished', label: 'Refurbished' },
                { value: 'used', label: 'Used' },
              ]}
            />
            <Dropdown
              placeholder="All Featured"
              value={isFeatured}
              onChange={v => { setIsFeatured(v); setPage(1) }}
              options={[
                { value: 'true', label: 'Featured' },
                { value: 'false', label: 'Not Featured' },
              ]}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={7} />) :
                  products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-[#94a3b8]">
                          <FiPackage className="w-12 h-12 opacity-30" />
                          <p className="text-sm font-medium">No products found</p>
                        </div>
                      </td>
                    </tr>
                  ) :
                    products.map((p, i) => (
                      <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img src={p.thumbnail || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60'} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                            <div>
                              <p className="font-semibold text-[#111827] text-sm max-w-48 truncate">{p.name}</p>
                              <p className="text-xs text-[#94a3b8]">{p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="text-sm text-[#64748B]">{p.category?.name || '–'}</span></td>
                        <td><span className="text-sm text-[#64748B]">{p.brand?.name || '–'}</span></td>
                        <td>
                          <div>
                            <span className="font-bold text-[#111827]">{formatPrice(p.price)}</span>
                            {p.comparePrice && p.comparePrice > p.price && (
                              <span className="text-xs text-red-500 line-through ml-1">{formatPrice(p.comparePrice)}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`font-semibold text-sm ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'default'}>
                              {p.status}
                            </Badge>
                            {p.isFeatured && <FiStar className="w-3 h-3 text-amber-500" />}
                            {p.isFlashSale && <FiZap className="w-3 h-3 text-violet-500" />}
                          </div>
                        </td>
                        <td>
                          <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === p.id ? null : p.id) }} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary transition-all cursor-pointer">
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            {actionMenuId === p.id && (
                              <ul className="absolute right-0 top-full mt-1 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden z-50 py-1.5 space-y-0.5">
                                <li><button onClick={() => { openView(p); setActionMenuId(null) }} className="w-full px-4 py-2.5 text-left text-sm text-[#374151] hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"><FiEye className="w-4 h-4" />View</button></li>
                                <li><button onClick={() => { openEdit(p); setActionMenuId(null) }} className="w-full px-4 py-2.5 text-left text-sm text-[#374151] hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer"><FiEdit2 className="w-4 h-4" />Edit</button></li>
                                {p.status === 'inactive' ? (
                                  <li><button onClick={() => { handleActivate(p.id); setActionMenuId(null) }} className="w-full px-4 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-3 cursor-pointer"><FiPower className="w-4 h-4" />Activate</button></li>
                                ) : (
                                  <>
                                    <li><button onClick={() => { handleMarkSold(p.id); setActionMenuId(null) }} className="w-full px-4 py-2.5 text-left text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-3 cursor-pointer"><FiPackage className="w-4 h-4" />Mark Sold</button></li>
                                    <li><button onClick={() => { handleDeactivate(p.id); setActionMenuId(null) }} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer"><FiPower className="w-4 h-4" />Deactivate</button></li>
                                  </>
                                )}
                                <li className="border-t border-white/30 pt-1.5 mt-1"><button onClick={() => { handleDelete(p.id); setActionMenuId(null) }} className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"><FiTrash2 className="w-4 h-4" />Delete</button></li>
                              </ul>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/20">
              <span className="text-xs text-[#94a3b8]">
                Page {page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className="premium-button-ghost text-xs px-2 py-1">First</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="premium-button-ghost text-xs px-2 py-1">Prev</button>
                {pageNums.map((n, i) => typeof n === 'number' ? (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer
                      ${page === n ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-md' : 'bg-white/60 hover:bg-white border border-white/40 text-[#64748B]'}`}>
                    {n}
                  </button>
                ) : <span key={`dot-${i}`} className="w-6 text-center text-xs text-[#94a3b8]">…</span>)}
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="premium-button-ghost text-xs px-2 py-1">Next</button>
                <button onClick={() => setPage(pagination.pages)} disabled={page === pagination.pages} className="premium-button-ghost text-xs px-2 py-1">Last</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Product View Modal */}
      <AnimatePresence>
        {viewModal && viewProduct && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setViewModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/20" style={{ background: 'linear-gradient(135deg, rgba(40,117,183,0.06), rgba(43,183,178,0.06))' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <FiPackage className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#111827]">{viewProduct.name}</h2>
                      <p className="text-xs text-[#64748B] flex items-center gap-2">
                        {viewProduct.sku && <span>SKU: {viewProduct.sku}</span>}
                        <span className={`w-2 h-2 rounded-full ${viewProduct.status === 'active' ? 'bg-emerald-500' : viewProduct.status === 'draft' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        {viewProduct.status}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setViewModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Images Gallery */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Product Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <img src={viewProduct.thumbnail} alt={viewProduct.name} className="col-span-1 sm:col-span-2 rounded-2xl object-cover aspect-video shadow-md" />
                    {viewProduct.images?.map(img => (
                      <img key={img.id} src={img.url} alt="" className="rounded-2xl object-cover aspect-square shadow-sm hover:scale-105 transition-transform duration-300" />
                    ))}
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                    <p className="text-xs text-[#64748B]">Price</p>
                    <p className="text-xl font-black text-[#111827]">{formatPrice(viewProduct.price)}</p>
                  </div>
                  {viewProduct.comparePrice && viewProduct.comparePrice > viewProduct.price && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                      <p className="text-xs text-red-600">Compare Price</p>
                      <p className="text-xl font-black text-red-600 line-through">{formatPrice(viewProduct.comparePrice)}</p>
                    </div>
                  )}
                  {viewProduct.isFlashSale && viewProduct.flashSalePrice && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                      <p className="text-xs text-violet-600">Flash Sale</p>
                      <p className="text-xl font-black text-violet-600">{formatPrice(viewProduct.flashSalePrice)}</p>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl ${viewProduct.stock === 0 ? 'bg-red-50 border border-red-100' : viewProduct.stock <= 5 ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                    <p className="text-xs text-[#64748B]">Stock</p>
                    <p className={`text-xl font-black ${viewProduct.stock === 0 ? 'text-red-600' : viewProduct.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>{viewProduct.stock}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/40">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Category</p>
                    <p className="font-medium text-[#111827] mt-1">{viewProduct.category?.name || '–'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Brand</p>
                    <p className="font-medium text-[#111827] mt-1">{viewProduct.brand?.name || '–'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Condition</p>
                    <p className="font-medium text-[#111827] mt-1 capitalize">{viewProduct.condition}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Warranty</p>
                    <p className="font-medium text-[#111827] mt-1">{viewProduct.warrantyMonths} months</p>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Short Description</p>
                  <p className="text-sm text-[#111827] bg-white/40 p-4 rounded-xl">{viewProduct.shortDescription}</p>
                </div>

                {/* Specifications */}
                {viewProduct.specifications?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Specifications</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewProduct.specifications.map(spec => (
                        <div key={spec.id} className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/40 border border-white/30">
                          <span className="text-sm text-[#64748B] font-medium">{spec.key}</span>
                          <span className="text-sm font-semibold text-[#111827]">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Description</p>
                  <div className="prose prose-sm max-w-none text-[#111827] bg-white/40 p-4 rounded-xl" dangerouslySetInnerHTML={{ __html: viewProduct.description }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal with Tabs */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
<motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
               className="glass-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain"
               style={{ position: 'relative', zIndex: 60 }}>
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
<form onSubmit={handleSave} className="p-6">
                <Tabs tabs={[
                  {
                    key: 'basic',
                    label: 'Basic Info',
                    content: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Input label="Product Name *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#374151] mb-1.5">Category *</label>
                            <Dropdown
                              placeholder="Select Category"
                              value={form.categoryId}
                              onChange={v => setForm(f => ({ ...f, categoryId: v }))}
                              options={categories?.map(c => ({ value: c.id.toString(), label: c.name })) || []}
                            />
                          </div>
                          
                           <div>
                             <label className="block text-sm font-medium text-[#374151] mb-1.5">Brand</label>
                             <Dropdown
                               placeholder="Select Brand"
                               value={form.brandId}
                               onChange={v => setForm(f => ({ ...f, brandId: v }))}
                               options={[{ value: '', label: 'All' }, ...(brands?.map(b => ({ value: b.id.toString(), label: b.name })) || [])]}
                             />
                           </div>
                          
                          <Input label="Selling Price (₹) *" type="number" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                          <Input label="Compare Price (₹)" type="number" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} />
                          <Input label="Stock *" type="number" required value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                          <Input label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                          
                          <div>
                            <label className="block text-sm font-medium text-[#374151] mb-1.5">Condition</label>
                            <Dropdown
                              placeholder="Select Condition"
                              value={form.condition}
                              onChange={v => setForm(f => ({ ...f, condition: v }))}
                              options={[
                                { value: 'new', label: 'New' },
                                { value: 'refurbished', label: 'Refurbished' },
                                { value: 'used', label: 'Used' },
                              ]}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                            <Dropdown
                              placeholder="Select Status"
                              value={form.status}
                              onChange={v => setForm(f => ({ ...f, status: v }))}
                              options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'draft', label: 'Draft' },
                              ]}
                            />
                          </div>
                          
                          <Input label="Warranty (months)" type="number" value={form.warrantyMonths} onChange={e => setForm(f => ({ ...f, warrantyMonths: parseInt(e.target.value) || 0 }))} />
                          <Input label="GST %" type="number" value={form.gstPercent} onChange={e => setForm(f => ({ ...f, gstPercent: parseFloat(e.target.value) || 0 }))} />
                          <div className="sm:col-span-2">
                            <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. gaming, ssd, upgrade" />
                          </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'specs',
                    label: 'Specifications',
                    content: (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/30 border border-white/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                              <FiFileText className="w-3.5 h-3.5" /> Bulk Import
                            </p>
                            <span className="text-[10px] text-[#94a3b8]">Format: Key: Value (one per line)</span>
                          </div>
                          <textarea
                            value={bulkSpecText}
                            onChange={e => setBulkSpecText(e.target.value)}
                            placeholder={`RAM: 16GB DDR4\nStorage: 512GB SSD\nDisplay: 15.6" FHD\nProcessor: Intel i7 12th Gen`}
                            className="w-full h-28 rounded-xl border border-white/40 bg-white/60 p-3 text-sm text-[#111827] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono"
                          />
                          <div className="flex justify-end mt-2">
                            <Button type="button" size="sm" onClick={importSpecs}><FiPlus className="w-3 h-3" /> Import Specs</Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#111827]">Product Specifications</p>
                          <div className="flex gap-2">
                            {form.specifications?.length > 0 && (
                              <button type="button" onClick={clearSpecs} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 cursor-pointer">Clear All</button>
                            )}
                            <Button type="button" size="sm" onClick={addSpec}><FiPlus className="w-3 h-3" /> Add Spec</Button>
                          </div>
                        </div>
                        {form.specifications?.map((spec, idx) => (
                          <div key={idx} className="flex gap-2 items-end">
                            <Input label={idx === 0 ? 'Label' : ''} placeholder="e.g. RAM" value={spec.key} onChange={e => updateSpec(idx, 'key', e.target.value)} />
                            <Input label={idx === 0 ? 'Value' : ''} placeholder="e.g. 16GB DDR4" value={spec.value} onChange={e => updateSpec(idx, 'value', e.target.value)} />
                            <button type="button" onClick={() => removeSpec(idx)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 mb-1 cursor-pointer">
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {!form.specifications?.length && <p className="text-sm text-[#94a3b8] text-center py-4">No specifications added</p>}
                      </div>
                    )
                  },
                  {
                    key: 'desc',
                    label: 'Description',
                    content: (
                      <div className="space-y-4">
                        <Input label="Short Description" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Brief summary shown in listings" />
                        <RichTextEditor label="Full Description" value={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} />
                        
                        {/* Image Upload in Description Tab */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-[#374151] mb-1.5">Product Images</label>
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-white/40 rounded-2xl p-6 text-center hover:border-primary/60 transition-colors">
                              <FiUpload className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
                              <p className="text-sm font-medium text-[#111827]">Click to select images</p>
                              <p className="text-xs text-[#64748B] mt-1">PNG, JPG, GIF up to 5MB each</p>
                            </div>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImgFiles([...imgFiles, ...Array.from(e.target.files)])} />
                          </label>
                          
                          {/* Existing Images Preview */}
                          {existingImages.filter(img => !removedImageIds.includes(img.id)).length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Existing Images</p>
                              <div className="flex flex-wrap gap-3">
                                {existingImages.filter(img => !removedImageIds.includes(img.id)).map(img => (
                                  <div key={img.id} className="relative group">
                                    <img src={img.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/40 shadow-sm" />
                                    <button type="button" onClick={() => setRemovedImageIds(ids => [...ids, img.id])} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md">
                                      <FiX className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Files Preview */}
                          {imgFiles.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">New Images</p>
                              <div className="flex flex-wrap gap-3">
                                {imgFiles.map((f, i) => (
                                  <div key={i} className="relative group">
                                    <img src={URL.createObjectURL(f)} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/40 shadow-sm" />
                                    <button type="button" onClick={() => setImgFiles(files => files.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md">
                                      <FiX className="w-3 h-3" />
                                    </button>
                                    <p className="text-[10px] text-[#64748B] mt-1 truncate w-24">{f.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-6 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-primary w-4 h-4" />
                            <span className="text-sm font-medium">Featured Product</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFlashSale} onChange={e => setForm(f => ({ ...f, isFlashSale: e.target.checked }))} className="accent-primary w-4 h-4" />
                            <span className="text-sm font-medium">Flash Sale</span>
                          </label>
                        </div>
                        {form.isFlashSale && (
                          <Input label="Flash Sale Price (₹)" type="number" value={form.flashSalePrice} onChange={e => setForm(f => ({ ...f, flashSalePrice: e.target.value }))} />
                        )}
                      </div>
                    )
                  }
                ]} />

                <div className="flex gap-3 pt-6 border-t border-white/20">
                  <Button type="submit" loading={saving} className="flex-1">Save Product</Button>
<button type="button" onClick={() => setModal(false)} className="premium-button-ghost px-6">Cancel</button>
                 </div>
               </form>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </>
   )
 }