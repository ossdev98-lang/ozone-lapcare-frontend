import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchMe, setInitialized } from './store/authSlice'
import { fetchCart } from './store/cartSlice'

// Layout
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import AdminLayout from './components/admin/AdminLayout'

// Eager (above-fold critical pages)
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CartPage from './pages/CartPage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'

// Lazy pages
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrderDetailPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const WishlistPage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.WishlistPage })))
const RepairPage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.RepairPage })))
const MyRepairBookingsPage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.MyRepairBookingsPage })))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const BrandPage = lazy(() => import('./pages/BrandPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const StaticPages = lazy(() => import('./pages/StaticPages'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminRepair = lazy(() => import('./pages/admin/AdminRepair'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-[#64748B] font-medium">Loading...</p>
    </div>
  </div>
)

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, initialized } = useSelector(s => s.auth)
  if (!initialized) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      dispatch(fetchMe())
    } else {
      dispatch(setInitialized())
    }
  }, [dispatch])

  useEffect(() => {
    if (user) dispatch(fetchCart())
  }, [user, dispatch])

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/brand/:slug" element={<BrandPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/repair" element={<RepairPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/warranty" element={<StaticPages page="warranty" />} />
            <Route path="/terms" element={<StaticPages page="terms" />} />
            <Route path="/privacy" element={<StaticPages page="privacy" />} />

            {/* Protected Customer Routes */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/my-repairs" element={<ProtectedRoute><MyRepairBookingsPage /></ProtectedRoute>} />
          </Route>

          {/* Auth Pages */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="repair" element={<AdminRepair />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}


