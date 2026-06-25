import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../store/authSlice'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import loginImage from '../assets/login page image.png'
import logo from '../assets/logo.png'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter valid phone number').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

const floatingOrbs = [
  { size: 420, top: '-8%', left: '-12%', color: 'from-blue-600/40 to-cyan-500/20', duration: 9 },
  { size: 350, bottom: '-10%', right: '-8%', color: 'from-violet-600/40 to-purple-400/20', duration: 11 },
  { size: 200, top: '42%', right: '12%', color: 'from-cyan-400/25 to-blue-300/10', duration: 7 },
]

const benefits = [
  'Fast checkout and saved details',
  'Order tracking from your dashboard',
  'Exclusive offers on laptops and accessories',
]

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async data => {
    const result = await dispatch(registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password }))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Check your email for the OTP.')
      navigate('/verify-email?email=' + encodeURIComponent(data.email))
    }
  }

  return (
    <>
      <Helmet><title>Create Account - Ozone Lapcare</title></Helmet>

      <div className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-br from-[#FCFBF8] via-[#F8F6F3] to-[#F3F4F6] flex items-center justify-center py-8">
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

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-5xl mx-4 flex rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.45)]"
          style={{ minHeight: 640 }}
        >
          <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
            <img
              src={loginImage}
              alt="Ozone Lapcare"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

            <div className="absolute top-8 left-8 z-20">
              <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <span className="text-white text-sm font-medium">Premium Laptop Store</span>
              </div>
            </div>

            <div className="absolute bottom-12 left-10 right-10 z-20">
              <h2 className="text-white text-5xl font-extrabold leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                Start Your
                <br />
                Smarter Tech Journey
              </h2>
              <p className="mt-5 text-lg text-white/90 max-w-md leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                Create an account for faster shopping, easy order tracking and trusted laptop care solutions.
              </p>

              <div className="mt-8 space-y-3">
                {benefits.map(benefit => (
                  <div key={benefit} className="flex items-center gap-3 text-white/90">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                      <FiCheckCircle className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[48%] bg-gradient-to-br from-[#fafafa] via-[#f4f5fb] to-[#eceef8] flex flex-col justify-center px-6 sm:px-10 py-10 lg:py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 lg:hidden" />

            <div className="flex justify-center mb-7 lg:hidden">
              <img src={logo} alt="Ozone Lapcare" className="h-10 object-contain" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">
                Create your account
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">Join Ozone Lapcare and shop smarter in minutes</p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 18 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                    <span className="mt-0.5 text-red-500">!</span>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Full name</label>
                  <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                    errors.name ? 'border-red-400 bg-red-50/60' :
                    focusedField === 'name' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' :
                    'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                    <FiUser className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-500' : 'text-gray-300'}`} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                      {...register('name')}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Phone</label>
                  <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                    errors.phone ? 'border-red-400 bg-red-50/60' :
                    focusedField === 'phone' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' :
                    'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                    <FiPhone className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'phone' ? 'text-blue-500' : 'text-gray-300'}`} />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                      {...register('phone')}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                      {errors.phone.message}
                    </motion.p>
                  )}
                </div>
              </div>

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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Password</label>
                  <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                    errors.password ? 'border-red-400 bg-red-50/60' :
                    focusedField === 'password' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' :
                    'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                    <FiLock className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-500' : 'text-gray-300'}`} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 6 chars"
                      className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                      {...register('password')}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
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

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Confirm</label>
                  <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50/60' :
                    focusedField === 'confirmPassword' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' :
                    'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                    <FiLock className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'confirmPassword' ? 'text-blue-500' : 'text-gray-300'}`} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter"
                      className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                      {...register('confirmPassword')}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-4 text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Create account -&gt;
                </Button>
              </div>
            </motion.form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300 font-medium">Already registered?</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-all duration-200 group"
            >
              Sign in to your account
              <span className="group-hover:translate-x-1 transition-transform duration-200">-&gt;</span>
            </Link>

            <p className="text-center text-[11px] text-gray-300 mt-5">
              Secure signup with encrypted account protection
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}


