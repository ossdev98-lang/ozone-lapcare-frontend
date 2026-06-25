import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiStar, FiMail, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'

const testimonials = [
  { id: 1, name: 'Arjun Sharma', role: 'Software Engineer', avatar: 'AS', rating: 5, text: "Got my Dell XPS 15 from here and the experience was amazing. Genuine product, fast delivery, and excellent after-sales support. Highly recommended!" },
  { id: 2, name: 'Priya Nair', role: 'Graphic Designer', avatar: 'PN', rating: 5, text: "My MacBook screen was cracked and they replaced it perfectly. Like brand new! The repair service is top-notch and very affordable." },
  { id: 3, name: 'Rahul Verma', role: 'Student', avatar: 'RV', rating: 5, text: "Bought a refurbished laptop for college and it's been running perfectly for 2 years. Great value for money and honest descriptions." },
  { id: 4, name: 'Sneha Patel', role: 'Content Creator', avatar: 'SP', rating: 5, text: "The gaming laptop I ordered arrived on time and in perfect condition. The team helped me choose the right spec for video editing. 10/10!" },
]

export function Testimonials() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <h2 className="section-title">What Our <span className="gradient-text">Customers Say</span></h2>
        <p className="section-subtitle">10,000+ happy customers trust Ozone Lapcare</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => <FiStar key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-[#374151] text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/30">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
              <div>
                <p className="font-semibold text-[#111827] text-sm">{t.name}</p>
                <p className="text-xs text-[#64748B]">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Subscribed! Check your email for 10% off coupon.')
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
              <FiMail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#111827] mb-3">Get 10% Off Your First Order</h2>
            <p className="text-[#64748B] mb-8">Subscribe to our newsletter for exclusive deals, new arrivals, and tech tips.</p>
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="premium-input flex-1"
              />
              <button type="submit" disabled={loading}
                className="premium-button px-6 py-3 shrink-0">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="text-xs text-[#94a3b8] mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
