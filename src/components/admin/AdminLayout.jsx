import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiStar, FiTool, FiMenu, FiLogOut, FiList, FiAward, FiBell, FiSearch, FiChevronRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { logoutUser } from '../../store/authSlice'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/categories', icon: FiList, label: 'Categories' },
  { to: '/admin/brands', icon: FiAward, label: 'Brands' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: FiUsers, label: 'Customers' },
  { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
  { to: '/admin/coupons', icon: FiTag, label: 'Coupons' },
  { to: '/admin/repair', icon: FiTool, label: 'Repair Bookings' },
  { to: '/admin/whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
]

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out')
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/20">
        <img src={logo} alt="Ozone Lapcare" className="h-9 w-auto object-contain" />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' : 'text-[#64748B] hover:text-[#111827] hover:bg-white/60'}`}
            onClick={() => setSidebarOpen(false)}>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/20">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/40 mb-2">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">{user?.name}</p>
            <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 glass-sidebar flex-col fixed top-0 bottom-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-60 glass-sidebar">
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Top Bar */}
        <header className="glass-navbar px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/40 cursor-pointer transition-colors">
              <FiMenu className="w-5 h-5 text-[#64748B]" />
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
                <FiGrid className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-[#111827]">Admin Console</p>
                <p className="text-[11px] text-[#64748B]">Manage orders, bookings & inventory</p>
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="text-sm text-[#64748B] font-medium">
              Welcome back,
              <span className="text-[#111827] font-semibold"> {user?.name?.split(' ')[0]}</span>
            </div>
            <span className="hidden lg:block w-1 h-1 rounded-full bg-[#2875B7] opacity-80" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-white/40">
              <div className="relative">
                <FiBell className="w-4 h-4 text-[#2875B7]" />
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#2BB7B2] rounded-full text-[10px] text-white font-bold flex items-center justify-center">1</span>
              </div>
              <span className="hidden xl:inline text-xs font-medium text-[#111827]">Notifications</span>
            </div>

          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Premium Search (client-side placeholder) */}
            <div className="hidden sm:flex items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 border border-white/40 backdrop-blur-sm">
                <FiSearch className="w-4 h-4 text-[#64748B]" />
                <input
                  placeholder="Quick search..."
                  className="bg-transparent outline-none text-sm text-[#111827] placeholder-[#94a3b8] w-44"
                />
              </div>
            </div>

            <NavLink
              to="/"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-[#2875B7] hover:text-white transition-all px-3 py-2 rounded-2xl bg-white/40 hover:bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20 border border-white/30"
            >
              <FiChevronRight className="w-4 h-4" /> View Store
            </NavLink>
          </div>
        </header>


        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
