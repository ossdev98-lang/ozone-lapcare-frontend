import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowLeft, FiCheckCircle, FiLock, FiMail, FiShield } from 'react-icons/fi'
import { authAPI } from '../api/services'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import loginImage from '../assets/login page image.png'

const floatingOrbs = [
  { size: 420, top: '-8%', left: '-12%', color: 'from-blue-600/40 to-cyan-500/20', duration: 9 },
  { size: 350, bottom: '-10%', right: '-8%', color: 'from-violet-600/40 to-purple-400/20', duration: 11 },
  { size: 200, top: '42%', right: '12%', color: 'from-cyan-400/25 to-blue-300/10', duration: 7 },
]

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Forgot Password - Ozone Lapcare</title></Helmet>

      <div className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-br from-[#FCFBF8] via-[#F8F6F3] to-[#F3F4F6] flex items-center justify-center py-8">
        {floatingOrbs.map((orb, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
            className={`absolute rounded-full bg-gradient-radial ${orb.color} blur-[80px] pointer-events-none`}
            style={{ width: orb.size, height: orb.size, top: orb.top, left: orb.left, bottom: orb.bottom, right: orb.right }}
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
          style={{ minHeight: 600 }}
        >
          <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
            <img src={loginImage} alt="Ozone Lapcare" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

            <div className="absolute top-8 left-8 z-20 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <span className="text-white text-sm font-medium">Secure Account Recovery</span>
            </div>

            <div className="absolute bottom-12 left-10 right-10 z-20">
              <h2 className="text-white text-5xl font-extrabold leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                Recover Access
                <br />
                With Confidence
              </h2>
              <p className="mt-5 text-lg text-white/90 max-w-md leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                We will send a secure reset link to your registered email so you can get back to shopping quickly.
              </p>

              <div className="mt-8 flex gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-5 py-4">
                  <FiShield className="text-white text-2xl mb-2" />
                  <p className="text-white/75 text-sm">Protected reset</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-5 py-4">
                  <FiMail className="text-white text-2xl mb-2" />
                  <p className="text-white/75 text-sm">Email delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[48%] bg-gradient-to-br from-[#fafafa] via-[#f4f5fb] to-[#eceef8] flex flex-col justify-center px-6 sm:px-10 py-10 lg:py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 lg:hidden" />

            <div className="flex justify-center mb-7 lg:hidden">
              <img src={logo} alt="Ozone Lapcare" className="h-10 object-contain" />
            </div>

            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 font-semibold mb-7 transition-colors">
              <FiArrowLeft className="w-4 h-4" /> Back to login
            </Link>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
                  <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-5">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">Check your email</h1>
                  <p className="text-gray-400 mt-1.5 text-sm leading-relaxed">
                    We sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>.
                  </p>

                  <div className="mt-8 space-y-4">
                    <Button onClick={() => setSent(false)} variant="outline" className="w-full py-3.5 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-all duration-200">
                      Send to another email
                    </Button>
                    <Link to="/login" className="flex items-center justify-center w-full py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300">
                      Back to sign in
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                    <FiLock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">Forgot password?</h1>
                  <p className="text-gray-400 mt-1.5 text-sm">Enter your email and we will send a reset link</p>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 22 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Email address</label>
                      <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${focusedField === 'email' ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                        <FiMail className={`absolute left-4 w-[17px] h-[17px] transition-colors duration-200 ${focusedField === 'email' ? 'text-blue-500' : 'text-gray-300'}`} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="you@example.com"
                          className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none rounded-2xl"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" loading={loading} className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-300">
                      Send reset link -&gt;
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
