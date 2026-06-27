import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, FiMenu, FiX, FiChevronDown, FiLogOut, FiPackage, FiSettings, FiGrid, FiTool } from 'react-icons/fi'
import { logoutUser } from '../../store/authSlice'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'
export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { items } = useSelector(s => s.cart)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const navLinks = [
    { to: '/category/laptops', label: 'Laptops' },
    { to: '/category/accessories', label: 'Accessories' },
    { to: '/category/laptop-battery', label: 'Battery' },
    { to: '/repair', label: 'Repair' },
    { to: '/category/chargers', label: 'Chargers' },
    { to: '/shop', label: 'Shop' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = e => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/shop?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery('') }
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out')
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-navbar' : 'bg-transparent'}`}
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img src={logo} alt="Ozone Lapcare" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary' : 'text-[#64748B] hover:text-[#111827] hover:bg-white/60'}`}>
                  {l.label}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-primary hover:bg-white/60 transition-all duration-200">
                <FiSearch className="w-4.5 h-4.5" />
              </motion.button>

              {user && (
                <>
                  <Link to="/wishlist">
                    <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-primary hover:bg-white/60 transition-all duration-200">
                      <FiHeart className="w-4.5 h-4.5" />
                    </motion.div>
                  </Link>
                  <Link to="/notifications">
                    <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-primary hover:bg-white/60 transition-all duration-200">
                      <FiBell className="w-4.5 h-4.5" />
                    </motion.div>
                  </Link>
                </>
              )}

              {/* Cart */}
              <Link to="/cart">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-primary hover:bg-white/60 transition-all duration-200">
                  <FiShoppingCart className="w-4.5 h-4.5" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 gradient-bg text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </motion.div>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:shadow-md transition-all duration-200">
                    <div className="w-7 h-7 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#111827] hidden sm:block max-w-20 truncate">{user.name?.split(' ')[0]}</span>
                    <FiChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-modal overflow-hidden p-1.5 z-50"
                      >
                        <div className="px-3 py-2 border-b border-white/20 mb-1">
                          <p className="text-sm font-semibold text-[#111827]">{user.name}</p>
                          <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <MenuItem to="/admin" icon={FiGrid} label="Admin Panel" onClick={() => setUserMenuOpen(false)} />
                        )}
                        <MenuItem to="/profile" icon={FiUser} label="My Profile" onClick={() => setUserMenuOpen(false)} />
                        <MenuItem to="/orders" icon={FiPackage} label="My Orders" onClick={() => setUserMenuOpen(false)} />
                        <MenuItem to="/my-repairs" icon={FiTool} label="My Repairs" onClick={() => setUserMenuOpen(false)} />
                        <MenuItem to="/profile/settings" icon={FiSettings} label="Settings" onClick={() => setUserMenuOpen(false)} />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors duration-150 mt-1 border-t border-white/20 cursor-pointer">
                          <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <motion.span whileHover={{ scale: 1.02 }} className="premium-button text-xs px-4 py-2">
                    Sign In
                  </motion.span>
                </Link>
              )}

              {/* Mobile Menu */}
              <button onClick={() => setMobileOpen(v => !v)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-white/60 transition-all">
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass-navbar border-t border-white/20 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(l => (
                  <NavLink key={l.to} to={l.to} end={l.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-[#64748B]'}`}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.96 }}
              className="glass-modal p-4 w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex gap-3">
                <FiSearch className="w-5 h-5 text-[#64748B] mt-3.5 ml-1 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search laptops, accessories, parts..."
                  className="flex-1 bg-transparent text-lg outline-none text-[#111827] placeholder-[#94a3b8]"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 rounded-xl hover:bg-white/40 transition-colors cursor-pointer">
                  <FiX className="w-5 h-5 text-[#64748B]" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function MenuItem({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#374151] hover:bg-white/60 hover:text-primary transition-colors duration-150">
      <Icon className="w-4 h-4" /> {label}
    </Link>
  )
}
