import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { FiStar, FiCheck, FiX } from 'react-icons/fi'
import { reviewAPI } from '../../api/services'
import { formatDate } from '../../utils/helpers'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => reviewAPI.getAll().then(r => r.data.data)
  })

  const toggleApproval = async (id, current) => {
    try {
      await reviewAPI.update(id, { isApproved: !current })
      qc.invalidateQueries(['admin-reviews'])
      toast.success(!current ? 'Review approved' : 'Review hidden')
    } catch { toast.error('Failed') }
  }

  return (
    <>
      <Helmet><title>Reviews – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-[#111827]">Reviews</h1>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {isLoading ? [...Array(6)].map((_, i) => <TableRowSkeleton key={i} cols={7} />) :
                  data?.map(r => (
                    <tr key={r.id}>
                      <td>
                        <p className="font-medium text-sm">{r.user?.name}</p>
                        <p className="text-xs text-[#94a3b8]">{r.user?.email}</p>
                      </td>
                      <td className="text-sm text-[#64748B] max-w-32 truncate">{r.product?.name}</td>
                      <td>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}
                        </div>
                      </td>
                      <td>
                        {r.title && <p className="text-xs font-semibold text-[#111827]">{r.title}</p>}
                        <p className="text-xs text-[#64748B] max-w-52 truncate">{r.body}</p>
                      </td>
                      <td className="text-xs text-[#64748B]">{formatDate(r.createdAt)}</td>
                      <td>
                        <Badge variant={r.isApproved ? 'success' : 'warning'}>{r.isApproved ? 'Approved' : 'Hidden'}</Badge>
                        {r.isVerified && <Badge variant="info" className="ml-1">Verified</Badge>}
                      </td>
                      <td>
                        <button onClick={() => toggleApproval(r.id, r.isApproved)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${r.isApproved ? 'hover:bg-red-50 text-[#64748B] hover:text-red-500' : 'hover:bg-emerald-50 text-[#64748B] hover:text-emerald-500'}`}>
                          {r.isApproved ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
