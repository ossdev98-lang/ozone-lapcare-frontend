import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiDollarSign, FiShoppingBag, FiPackage, FiUsers, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { adminAPI } from '../../api/services'
import { formatPrice, formatDate, orderStatusColor } from '../../utils/helpers'
import Badge from '../../components/ui/Badge'
import { StatCardSkeleton } from '../../components/ui/Skeleton'

const revenueData = [
  { month: 'Jan', revenue: 42000, orders: 28 },
  { month: 'Feb', revenue: 58000, orders: 35 },
  { month: 'Mar', revenue: 47000, orders: 30 },
  { month: 'Apr', revenue: 73000, orders: 48 },
  { month: 'May', revenue: 91000, orders: 60 },
  { month: 'Jun', revenue: 85000, orders: 55 },
  { month: 'Jul', revenue: 110000, orders: 72 },
]

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data.data)
  })

  const stats = [
    { label: 'Total Revenue', value: formatPrice(data?.totalRevenue || 0), icon: FiDollarSign, color: 'from-blue-500 to-cyan-500', change: '+12.5%', up: true },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: FiShoppingBag, color: 'from-violet-500 to-purple-500', change: '+8.2%', up: true },
    { label: 'Products', value: data?.totalProducts || 0, icon: FiPackage, color: 'from-emerald-500 to-teal-500', change: '+4.1%', up: true },
    { label: 'Customers', value: data?.totalCustomers || 0, icon: FiUsers, color: 'from-orange-500 to-red-500', change: '+18.7%', up: true },
  ]

  return (
    <>
      <Helmet><title>Dashboard – Admin | Ozone Lapcare</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Dashboard</h1>
          <p className="text-[#64748B] text-sm mt-1">Welcome to your store overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />) :
            stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="stat-card">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">{s.label}</p>
                  <p className="text-2xl font-black text-[#111827]">{s.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.up ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                    {s.change} this month
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-bold text-[#111827] mb-5">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2875B7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2875B7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2875B7" strokeWidth={2.5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Month */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-[#111827] mb-5">Orders / Month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px' }} />
                <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2BB7B2" />
                    <stop offset="100%" stopColor="#2875B7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="font-bold text-[#111827]">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentOrders?.map(o => (
                    <tr key={o.id}>
                      <td className="font-medium">#{o.orderNumber}</td>
                      <td>{o.user?.name || 'Guest'}</td>
                      <td className="font-bold">{formatPrice(o.total)}</td>
                      <td><Badge variant={orderStatusColor(o.status)} className="capitalize">{o.status}</Badge></td>
                    </tr>
                  ))}
                  {!data?.recentOrders?.length && (
                    <tr><td colSpan={4} className="text-center text-[#64748B] py-8">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="font-bold text-[#111827]">Top Products</h3>
            </div>
            <div className="p-4 space-y-3">
              {data?.topProducts?.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <img src={p.thumbnail || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=50'} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{p.name}</p>
                    <p className="text-xs text-[#64748B]">{p.totalSold} sold</p>
                  </div>
                  <p className="font-bold text-sm shrink-0">{formatPrice(p.price)}</p>
                </div>
              ))}
              {!data?.topProducts?.length && (
                <p className="text-center text-[#64748B] text-sm py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
