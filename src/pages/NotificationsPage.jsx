import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiBell, FiCheck } from 'react-icons/fi'
import { notificationAPI } from '../api/services'
import { formatDate } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then(r => r.data.data)
  })

  const markAllRead = async () => {
    await notificationAPI.markRead('all')
    qc.invalidateQueries(['notifications'])
    toast.success('All notifications marked as read')
  }

  const markRead = async id => {
    await notificationAPI.markRead(id)
    qc.invalidateQueries(['notifications'])
  }

  const typeIcon = type => ({ order: '📦', promotion: '🎁', system: '🔔', review: '⭐' }[type] || '🔔')

  return (
    <>
      <Helmet><title>Notifications – Ozone Lapcare</title></Helmet>
      <div className="min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-[#111827] flex items-center gap-3">
              <FiBell className="w-7 h-7 text-primary" /> Notifications
            </h1>
            {data?.some(n => !n.isRead) && (
              <Button onClick={markAllRead} variant="ghost" size="sm">
                <FiCheck className="w-4 h-4" />Mark all read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : !data?.length ? (
            <div className="glass-card p-16 text-center">
              <FiBell className="w-14 h-14 text-[#64748B] mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold mb-2">No Notifications</h3>
              <p className="text-[#64748B]">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`glass-card p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:shadow-xl ${!n.isRead ? 'border-l-4 border-primary' : ''}`}>
                  <span className="text-2xl shrink-0">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827]">{n.title}</p>
                    <p className="text-sm text-[#64748B] mt-0.5">{n.message}</p>
                    <p className="text-xs text-[#94a3b8] mt-2">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2.5 h-2.5 gradient-bg rounded-full mt-1.5 shrink-0" />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
