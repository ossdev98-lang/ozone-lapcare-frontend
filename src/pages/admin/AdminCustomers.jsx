import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi'
import { adminAPI } from '../../api/services'
import { formatDate } from '../../utils/helpers'
import Badge from '../../components/ui/Badge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => adminAPI.getUsers({ page, limit: 15, search }).then(r => r.data)
  })

  const customers = data?.data || []
  const pagination = data?.pagination

  const toggleStatus = async (id, current) => {
    const next = current === 'active' ? 'banned' : 'active'
    try {
      await adminAPI.updateUserStatus(id, { status: next })
      qc.invalidateQueries(['admin-customers'])
      toast.success(`User ${next}`)
    } catch { toast.error('Failed') }
  }

  return (
    <>
      <Helmet><title>Customers – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Customers</h1>
            <p className="text-[#64748B] text-sm">{pagination?.total || 0} total customers</p>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search customers..." className="premium-input pl-9 text-sm" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {isLoading ? [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={6} />) :
                  customers.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-[#94a3b8]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-[#64748B]">{c.phone || '–'}</td>
                      <td className="text-sm text-[#64748B]">{formatDate(c.createdAt)}</td>
                      <td><Badge variant={c.isEmailVerified ? 'success' : 'warning'}>{c.isEmailVerified ? 'Verified' : 'Pending'}</Badge></td>
                      <td><Badge variant={c.status === 'active' ? 'success' : c.status === 'banned' ? 'danger' : 'default'} className="capitalize">{c.status}</Badge></td>
                      <td>
                        <button onClick={() => toggleStatus(c.id, c.status)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${c.status === 'active' ? 'hover:bg-red-50 text-[#64748B] hover:text-red-500' : 'hover:bg-emerald-50 text-[#64748B] hover:text-emerald-500'}`}
                          title={c.status === 'active' ? 'Ban user' : 'Activate user'}>
                          {c.status === 'active' ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
                        </button>
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
    </>
  )
}
