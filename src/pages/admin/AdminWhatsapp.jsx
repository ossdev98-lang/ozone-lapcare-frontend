import { useState, useEffect, useRef } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { FiSend, FiUsers, FiInfo, FiChevronDown, FiCheck } from 'react-icons/fi'
import { adminAPI } from '../../api/services'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function AdminWhatsapp() {
  const [broadcastTypes, setBroadcastTypes] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [fields, setFields] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    adminAPI.getBroadcastTypes().then(r => setBroadcastTypes(r.data.data))
      .catch(() => toast.error('Failed to load broadcast types'))
  }, [])

  useEffect(() => {
    const handler = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTypeSelect = type => {
    setSelectedType(type)
    setDropdownOpen(false)
    setFields({})
    setResult(null)
  }

  const handleSend = async () => {
    if (!selectedType) { toast.error('Select a broadcast type'); return }
    const missing = selectedType.adminFields.filter(f => !fields[f.key]?.trim())
    if (missing.length) { toast.error(`Fill in: ${missing.map(f => f.label).join(', ')}`); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await adminAPI.sendWhatsappBroadcast({ broadcastType: selectedType.key, fields })
      setResult(res.data.data)
      toast.success(res.data.message)
      setFields({})
      setSelectedType(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
          <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#111827]">WhatsApp Broadcast</h1>
          <p className="text-sm text-[#64748B]">Customer name is auto-filled per user — just fill the campaign details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-5">

          {/* Custom Dropdown */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Broadcast Type <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                className={`w-full premium-input flex items-center justify-between text-left transition-all duration-200 ${dropdownOpen ? 'ring-2 ring-primary/30 border-primary/40' : ''}`}
              >
                <span className={selectedType ? 'text-[#111827] font-medium' : 'text-[#94a3b8]'}>
                  {selectedType ? selectedType.label : '— Select a template —'}
                </span>
                <FiChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown List */}
              {dropdownOpen && (
                <ul className="absolute z-50 mt-2 w-full glass-modal p-1.5 shadow-xl max-h-60 overflow-y-auto">
                  {broadcastTypes.length === 0 && (
                    <li className="px-3 py-2 text-sm text-[#94a3b8] text-center">No templates available</li>
                  )}
                  {broadcastTypes.map(t => (
                    <li
                      key={t.key}
                      onClick={() => handleTypeSelect(t)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150
                        ${selectedType?.key === t.key
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-[#374151] hover:bg-white/60 hover:text-[#111827]'}`}
                    >
                      <span>{t.label}</span>
                      {selectedType?.key === t.key && <FiCheck className="w-4 h-4 shrink-0" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Auto-filled badge */}
          {selectedType && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
              <FiUsers className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Customer Name</strong> is automatically personalized for each recipient — no need to enter it</span>
            </div>
          )}

          {/* Admin-only fields */}
          {selectedType && selectedType.adminFields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                {f.label} <span className="text-red-500">*</span>
              </label>
              <input
                value={fields[f.key] || ''}
                onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="premium-input"
              />
            </div>
          ))}

          {selectedType && (
            <Button onClick={handleSend} loading={loading} className="w-full py-3.5">
              <FiSend className="w-4 h-4" /> Send to All Active Customers
            </Button>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-[#111827] flex items-center gap-2 mb-3">
              <FiUsers className="w-4 h-4 text-primary" />Who receives it?
            </h3>
            <p className="text-sm text-[#64748B]">All <strong>active customers</strong> with a saved phone number. Each message is personalized with their own name.</p>
          </div>

          {result && (
            <div className="glass-card p-5 border border-[#25D366]/30">
              <h3 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <FaWhatsapp className="w-4 h-4 text-[#25D366]" />Last Broadcast
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#64748B]">Sent</span><span className="font-bold text-emerald-600">{result.sent}</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Skipped (no phone)</span><span className="font-bold text-amber-500">{result.skipped}</span></div>
              </div>
            </div>
          )}

          <div className="glass-card p-5 border border-amber-200/60">
            <h3 className="font-semibold text-[#111827] flex items-center gap-2 mb-3">
              <FiInfo className="w-4 h-4 text-amber-500" />Adding new templates
            </h3>
            <p className="text-xs text-[#64748B]">To add a new broadcast type, create & approve the template in Interakt, then add it to <strong>BROADCAST_TYPES</strong> in <code>misc.controller.js</code> with its variable mapping.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
