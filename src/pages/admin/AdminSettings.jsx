import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiUser, FiImage, FiGift, FiTag, FiSettings, FiChevronRight, FiMail, FiPhone, FiSave, FiLock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { settingsAPI, adAPI, couponAPI, offerAPI, adminAPI, authAPI } from '../../api/services'
import { fetchMe } from '../../store/authSlice'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const sections = [
  { id: 'profile', label: 'Personal Information', icon: FiUser, desc: 'Update your profile details' },
  { id: 'ads', label: 'Advertisements', icon: FiImage, desc: 'Manage banner ads' },
  { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, desc: 'Broadcast messages' },
  { id: 'offers', label: 'Offers', icon: FiGift, desc: 'Manage offers' },
  { id: 'coupons', label: 'Coupons', icon: FiTag, desc: 'Manage coupon codes' },
  { id: 'store', label: 'Store Settings', icon: FiSettings, desc: 'Configure store-wide settings' },
]

export default function AdminSettings() {
  const qc = useQueryClient()
  const [active, setActive] = useState('store')

  // Store settings
  const { data: settingsData } = useQuery({ queryKey: ['admin-settings'], queryFn: () => settingsAPI.getAll().then(r => r.data.data) })
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settingsData?.freeShippingThreshold || '999')
  const [shippingCharge, setShippingCharge] = useState(settingsData?.shippingCharge || '99')
  const [saving, setSaving] = useState(false)

  const updateSetting = useMutation({
    mutationFn: ({ key, value }) => settingsAPI.update(key, value),
    onSuccess: () => { qc.invalidateQueries(['admin-settings']); toast.success('Setting updated') }
  })

  const handleSaveStore = async () => {
    setSaving(true)
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'freeShippingThreshold', value: freeShippingThreshold }),
        updateSetting.mutateAsync({ key: 'shippingCharge', value: shippingCharge })
      ])
    } catch { toast.error('Failed to update settings') } finally { setSaving(false) }
  }

  return (
    <>
      <Helmet><title>Settings – Admin | Ozone Lapcare</title></Helmet>
      <div className="flex gap-6 min-h-[calc(100vh-140px)]">
        {/* Left Sidebar */}
        <div className="w-64 shrink-0 space-y-1">
          <div className="glass-card p-4">
            <h2 className="text-sm font-bold text-[#111827] mb-3 px-2">Settings Menu</h2>
            <nav className="space-y-0.5">
              {sections.map(s => {
                const Icon = s.icon
                const isActive = active === s.id
                return (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' : 'text-[#64748B] hover:text-[#111827] hover:bg-white/60'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate">{s.label}</p>
                    </div>
                    {isActive && <FiChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {active === 'profile' && (
              <ProfilePanel />
            )}

            {active === 'ads' && <AdsPanel />}
            {active === 'whatsapp' && <WhatsappPanel />}
            {active === 'offers' && <OffersPanel />}
            {active === 'coupons' && <CouponsPanel />}

            {active === 'store' && (
              <motion.div key="store" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-[#111827]">Store Settings</h1>
                  <Button onClick={handleSaveStore} loading={saving}><FiSettings className="w-4 h-4" />Save Settings</Button>
                </div>

                <div className="glass-card p-6 max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center"><FiSettings className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h2 className="font-bold text-[#111827]">Shipping Configuration</h2>
                      <p className="text-xs text-[#64748B]">Configure free delivery threshold and shipping charges</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Free Delivery Threshold (₹)" type="number" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(e.target.value)} helperText="Orders above this amount get free delivery" />
                    <Input label="Shipping Charge (₹)" type="number" value={shippingCharge} onChange={e => setShippingCharge(e.target.value)} helperText="Charge applied when threshold is not met" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

function AdsPanel() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-ads'], queryFn: () => adAPI.getAll().then(r => r.data.data) })
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', link: '', isActive: true, sortOrder: 0 })
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const openCreate = () => { setEditing(null); setForm({ title: '', link: '', isActive: true, sortOrder: 0 }); setPreview(null); setModal(true) }
  const openEdit = ad => { setEditing(ad); setForm({ title: ad.title, link: ad.link || '', isActive: ad.isActive, sortOrder: ad.sortOrder }); setPreview(ad.image); setModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('link', form.link || '')
    fd.append('isActive', String(form.isActive))
    fd.append('sortOrder', String(form.sortOrder))
    const file = fileRef.current?.files?.[0]
    if (file) fd.append('image', file)
    try {
      if (editing) await adAPI.update(editing.id, fd)
      else await adAPI.create(fd)
      qc.invalidateQueries(['admin-ads'])
      setModal(false)
      toast.success(editing ? 'Ad updated!' : 'Ad created!')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this ad?')) return
    try { await adAPI.delete(id); qc.invalidateQueries(['admin-ads']); toast.success('Ad deleted') }
    catch { toast.error('Failed') }
  }

  const toggleActive = async ad => {
    try { await adAPI.update(ad.id, { ...ad, isActive: !ad.isActive }); qc.invalidateQueries(['admin-ads']); toast.success(`Ad ${ad.isActive ? 'disabled' : 'enabled'}`) }
    catch { toast.error('Failed') }
  }

  return (
    <motion.div key="ads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#111827]">Advertisements</h1>
        <Button onClick={openCreate}><FiImage className="w-4 h-4" /> Add Ad</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead><tr><th>Preview</th><th>Title</th><th>Status</th><th>Sort</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5}><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                data?.length === 0 ? <tr><td colSpan={5} className="text-center py-16 text-[#94a3b8] text-sm">No ads found</td></tr> :
                  data?.map(ad => (
                    <tr key={ad.id}>
                      <td><img src={ad.image} alt={ad.title} className="w-16 h-12 rounded-xl object-cover bg-slate-100" /></td>
                      <td className="font-semibold text-[#111827]">{ad.title}</td>
                      <td><span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ${ad.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>{ad.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="text-sm text-[#64748B]">{ad.sortOrder}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActive(ad)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer" title={ad.isActive ? 'Disable' : 'Enable'}>{ad.isActive ? <span className="text-emerald-500">●</span> : <span className="text-slate-400">●</span>}</button>
                          <button onClick={() => openEdit(ad)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer"><FiImage className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(ad.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer">×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="glass-modal w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Ad' : 'Create Ad'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Ad Image *</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => setPreview(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                  {preview ? <img src={preview} alt="Preview" className="max-h-32 rounded-xl object-contain" /> : <><span className="text-slate-400 text-2xl">+</span><span className="text-sm text-[#64748B] font-medium">Click to upload image</span></>}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input label="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <Input label="Link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
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
                <Button type="submit" className="flex-1">Save Ad</Button>
                <button type="button" onClick={() => setModal(false)} className="premium-button-ghost px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function WhatsappPanel() {
  const [broadcastTypes, setBroadcastTypes] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [fields, setFields] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadTypes = async () => {
    try { const r = await adminAPI.getBroadcastTypes(); setBroadcastTypes(r.data.data) }
    catch { toast.error('Failed to load broadcast types') }
  }

  return (
    <motion.div key="whatsapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center"><FaWhatsapp className="w-5 h-5 text-[#25D366]" /></div>
        <div>
          <h1 className="text-2xl font-black text-[#111827]">WhatsApp Broadcast</h1>
          <p className="text-sm text-[#64748B]">Customer name is auto-filled per user</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Broadcast Type *</label>
            <div className="relative" ref={dropdownRef}>
              <button type="button" onClick={() => { setDropdownOpen(v => !v); if (!broadcastTypes.length) loadTypes() }}
                className="w-full premium-input flex items-center justify-between text-left">
                <span className={selectedType ? 'text-[#111827] font-medium' : 'text-[#94a3b8]'}>{selectedType ? selectedType.label : '— Select a template —'}</span>
                <span className="text-[#64748B]">{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <ul className="absolute z-50 mt-2 w-full glass-modal p-1.5 shadow-xl max-h-60 overflow-y-auto">
                  {broadcastTypes.map(t => (
                    <li key={t.key} onClick={() => { setSelectedType(t); setDropdownOpen(false); setFields({}) }}
                      className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-sm ${selectedType?.key === t.key ? 'bg-primary/10 text-primary font-semibold' : 'text-[#374151] hover:bg-white/60'}`}>
                      {t.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {selectedType && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                <span className="font-bold">Customer Name</span> is personalized automatically per recipient.
              </div>
              {selectedType.adminFields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">{f.label} *</label>
                  <input value={fields[f.key] || ''} onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="premium-input" />
                </div>
              ))}
              <Button onClick={async () => {
                setLoading(true)
                try {
                  const res = await adminAPI.sendWhatsappBroadcast({ broadcastType: selectedType.key, fields })
                  setResult(res.data.data)
                  toast.success(res.data.message)
                  setFields({})
                  setSelectedType(null)
                } catch (err) { toast.error(err.response?.data?.message || 'Broadcast failed') }
                finally { setLoading(false) }
              }} loading={loading} className="w-full">Send to All Active Customers</Button>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-[#111827] mb-2">Who receives it?</h3>
            <p className="text-sm text-[#64748B]">All active customers with a saved phone number. Each message is personalized.</p>
          </div>
          {result && (
            <div className="glass-card p-5 border border-[#25D366]/30">
              <h3 className="font-semibold text-[#111827] mb-3">Last Broadcast</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#64748B]">Sent</span><span className="font-bold text-emerald-600">{result.sent}</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Skipped</span><span className="font-bold text-amber-500">{result.skipped}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function OffersPanel() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-offers'], queryFn: () => offerAPI.getAdmin().then(r => r.data.data) })
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', isActive: true, sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await offerAPI.update(editing.id, form)
      else await offerAPI.create(form)
      qc.invalidateQueries(['admin-offers'])
      setModal(false)
      toast.success(editing ? 'Offer updated!' : 'Offer created!')
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this offer?')) return
    try { await offerAPI.delete(id); qc.invalidateQueries(['admin-offers']); toast.success('Offer deleted') }
    catch { toast.error('Failed') }
  }

  const toggleActive = async offer => {
    try { await offerAPI.update(offer.id, { ...offer, isActive: !offer.isActive }); qc.invalidateQueries(['admin-offers']); toast.success(`Offer ${offer.isActive ? 'disabled' : 'enabled'}`) }
    catch { toast.error('Failed') }
  }

  return (
    <motion.div key="offers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#111827]">Offers</h1>
        <Button onClick={() => { setEditing(null); setForm({ title: '', isActive: true, sortOrder: 0 }); setModal(true) }}>Add Offer</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead><tr><th>Title</th><th>Status</th><th>Sort</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={4}><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                data?.length === 0 ? <tr><td colSpan={4} className="text-center py-16 text-[#94a3b8] text-sm">No offers found</td></tr> :
                  data?.map(offer => (
                    <tr key={offer.id}>
                      <td className="font-semibold text-[#111827]">{offer.title}</td>
                      <td><span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ${offer.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>{offer.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="text-sm text-[#64748B]">{offer.sortOrder}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActive(offer)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer" title={offer.isActive ? 'Disable' : 'Enable'}>{offer.isActive ? <span className="text-emerald-500">●</span> : <span className="text-slate-400">●</span>}</button>
                          <button onClick={() => { setEditing(offer); setForm({ ...offer }); setModal(true) }} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer">✎</button>
                          <button onClick={() => handleDelete(offer.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer">×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="glass-modal w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Offer' : 'Create Offer'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid gap-4">
              <Input label="Offer Text *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Limited offer book your first laptop service at just Rs 99" />
              <Input label="Sort Order" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                <select value={String(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="premium-input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving} className="flex-1">Save Offer</Button>
                <button type="button" onClick={() => setModal(false)} className="premium-button-ghost px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function CouponsPanel() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: () => couponAPI.getAll().then(r => r.data.data) })
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', userLimit: 1, description: '', expiresAt: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const openCreate = () => { setEditing(null); setForm({ code: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', userLimit: 1, description: '', expiresAt: '', isActive: true }); setModal(true) }
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
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this coupon?')) return
    try { await couponAPI.delete(id); qc.invalidateQueries(['admin-coupons']); toast.success('Coupon deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <motion.div key="coupons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#111827]">Coupons</h1>
        <Button onClick={openCreate}>Add Coupon</Button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7}><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>) :
                data?.length === 0 ? <tr><td colSpan={7} className="text-center py-16 text-[#94a3b8] text-sm">No coupons found</td></tr> :
                  data?.map(c => (
                    <tr key={c.id}>
                      <td><span className="flex items-center gap-2 font-bold text-primary"><span className="text-[#64748B]">🏷</span>{c.code}</span></td>
                      <td><span className="capitalize text-sm">{c.type}</span></td>
                      <td className="font-bold">{c.type === 'percentage' ? `${c.value}%` : '₹' + c.value}</td>
                      <td className="text-sm text-[#64748B]">₹{c.minOrderAmount}</td>
                      <td className="text-sm text-[#64748B]">{c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ''}</td>
                      <td><span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ${c.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 rounded-xl hover:bg-white/60 text-[#64748B] hover:text-primary cursor-pointer">✎</button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#64748B] hover:text-red-500 cursor-pointer">×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="glass-modal w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-xl font-black text-[#111827]">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/40 cursor-pointer">✕</button>
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
              <Input label="Usage Limit" type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
              <Input label="Expiry Date" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Status</label>
                <select value={String(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="premium-input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" loading={saving} className="flex-1">Save Coupon</Button>
                <button type="button" onClick={() => setModal(false)} className="premium-button-ghost px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ProfilePanel() {
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
    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
      <h1 className="text-2xl font-black text-[#111827]">Personal Information</h1>
      <div className="glass-card p-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary/30">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-[#111827]">{user?.name}</h2>
            <p className="text-[#64748B]">{user?.email}</p>
            <span className="badge-primary mt-1 inline-block text-xs font-semibold px-2.5 py-1 rounded-xl">{user?.role}</span>
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

      <div className="glass-card p-6">
        <h3 className="font-bold text-[#111827] mb-5 flex items-center gap-2"><FiLock className="w-4 h-4 text-primary" />Change Password</h3>
        <form onSubmit={handlePassword} className="grid sm:grid-cols-2 gap-5">
          <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          <div className="sm:col-span-2">
            <Button type="submit" loading={pwLoading}>Update Password</Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
