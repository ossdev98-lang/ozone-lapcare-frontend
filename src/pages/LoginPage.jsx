import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../store/authSlice'
import { fetchCart, mergeGuestCart } from '../store/cartSlice'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import loginImage from '../assets/login page image.png'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const floatingOrbs = [
  { size: 420, top: '-8%', left: '-12%', color: 'from-blue-600/40 to-cyan-500/20', duration: 9 },
  { size: 350, bottom: '-10%', right: '-8%', color: 'from-violet-600/40 to-purple-400/20', duration: 11 },
  { size: 200, top: '40%', right: '10%', color: 'from-cyan-400/25 to-blue-300/10', duration: 7 },
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector(s => s.auth)
  const [showPass, setShowPass] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const from = location.state?.from || '/'

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async data => {
    const result = await dispatch(loginUser(data))
    if (loginUser.fulfilled.match(result)) {
      dispatch(fetchCart())
      dispatch(mergeGuestCart())
      toast.success('Welcome back!')
      navigate(result.payload.role === 'ADMIN' ? '/admin' : from, { replace: true })
    } else if (loginUser.rejected.match(result) && /verify your email/i.test(result.payload || '')) {
      toast.error('Please verify your email to continue')
      navigate('/verify-email?email=' + encodeURIComponent(data.email), { replace: true })
    }
  }

  return (
    <>
      <Helmet><title>Login – Ozone Lapcare</title></Helmet>

      <div className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-br from-[#FCFBF8] via-[#F8F6F3] to-[#F3F4F6] flex items-center justify-center">

        {/* Animated background orbs */}
        {floatingOrbs.map((orb, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
            className={`absolute rounded-full bg-gradient-radial ${orb.color} blur-[80px] pointer-events-none`}
            style={{
              width: orb.size, height: orb.size,
              top: orb.top, left: orb.left,
              bottom: orb.bottom, right: orb.right,
            }}
          />
        ))}

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-5xl mx-4 flex rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
          style={{ minHeight: 600 }}
        >

         
          {/* ── LEFT PANEL — IMAGE WITH CONTENT ── */}
<div className="hidden lg:block lg:w-[52%] relative overflow-hidden">

  <img
    src={loginImage}
    alt="Ozone Lapcare"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />

  {/* Glass Badge */}
  <div className="absolute top-8 left-8 z-20">
    <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
      <span className="text-white text-sm font-medium">
        Premium Laptop Store
      </span>
    </div>
  </div>

  {/* Content */}
  <div className="absolute bottom-12 left-10 right-10 z-20">

    <h2
      className="
        text-white
        text-5xl
        font-extrabold
        leading-tight
        drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]
      "
    >
      Upgrade Your
      <br />
      Digital Experience
    </h2>

    <p
      className="
        mt-5
        text-lg
        text-white/90
        max-w-md
        leading-relaxed
        drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]
      "
    >
      Discover premium laptops, hardware components,
      accessories and professional IT solutions all in
      one place.
    </p>

    {/* Stats Card */}
    <div className="mt-8 flex gap-4">

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-5 py-4">
        <p className="text-white text-2xl font-bold">
          5000+
        </p>
        <p className="text-white/70 text-sm">
          Happy Customers
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-5 py-4">
        <p className="text-white text-2xl font-bold">
          100%
        </p>
        <p className="text-white/70 text-sm">
          Genuine Products
        </p>
      </div>

    </div>
  </div>

</div>

          {/* ── RIGHT PANEL ── */}
          <div className="w-full lg:w-[48%] bg-gradient-to-br from-[#fafafa] via-[#f4f5fb] to-[#eceef8] flex flex-col justify-center px-10 py-12 relative overflow-hidden">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 lg:hidden" />

            {/* Mobile logo */}
            <div className="flex justify-center mb-8 lg:hidden">
              <img src={logo} alt="Ozone Lapcare" className="h-10 object-contain" />
            </div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">
                Welcome back 👋
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">Sign in to your account to continue</p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                    <span className="mt-0.5 text-red-500">⚠</span>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Email address</label>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                  errors.email ? 'border-red-400 bg-red-50/60' :
                  focusedField === 'email' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' :
                  'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}>
                  <FiMail className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'email' ? 'text-blue-500' : 'text-gray-300'}`} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                    {...register('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                  errors.password ? 'border-red-400 bg-red-50/60' :
                  focusedField === 'password' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' :
                  'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}>
                  <FiLock className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-500' : 'text-gray-300'}`} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                  >
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign in to account →
                </Button>
              </div>
            </motion.form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300 font-medium">New to Ozone Lapcare?</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Register CTA */}
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-all duration-200 group"
            >
              Create a free account
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>

            {/* Trust line */}
            <p className="text-center text-[11px] text-gray-300 mt-6">
              🔒 Secured with 256-bit SSL encryption
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
