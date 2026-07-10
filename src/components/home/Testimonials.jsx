import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiStar, FiMail, FiArrowRight } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import toast from 'react-hot-toast'

const testimonials = [
  { id: 1, name: 'Arjun Sharma', role: 'Software Engineer', avatar: 'AS', rating: 5, text: "Got my Dell XPS 15 from here and the experience was amazing. Genuine product, fast delivery, and excellent after-sales support. Highly recommended!" },
  { id: 2, name: 'Priya Nair', role: 'Graphic Designer', avatar: 'PN', rating: 5, text: "My MacBook screen was cracked and they replaced it perfectly. Like brand new! The repair service is top-notch and very affordable." },
  { id: 3, name: 'Rahul Verma', role: 'Student', avatar: 'RV', rating: 5, text: "Bought a refurbished laptop for college and it's been running perfectly for 2 years. Great value for money and honest descriptions." },
  { id: 4, name: 'Sneha Patel', role: 'Content Creator', avatar: 'SP', rating: 5, text: "The gaming laptop I ordered arrived on time and in perfect condition. The team helped me choose the right spec for video editing. 10/10!" },
]

export function Testimonials() {
  return (
    <section className="py-8 md:py-16 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
        <h2 className="section-title text-xl md:text-2xl">What Our <span className="gradient-text">Customers Say</span></h2>
        <p className="text-[11px] md:text-sm text-slate-500 mt-1 md:mt-2">1,000+ happy customers trust Ozone Lapcare</p>
      </motion.div>
      <div className="max-w-4xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          spaceBetween={16}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: '.swiper-pagination-testimonials' }}
          loop
          breakpoints={{
            768: { slidesPerView: 1.2, centeredSlides: true },
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={t.id}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-5 md:p-8 flex flex-col gap-3 md:gap-4 testimonial-card">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <FiStar key={j} className="w-4 h-4 md:w-5 md:h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[#374151] text-sm md:text-base leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/30">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-[#111827] text-sm md:text-base">{t.name}</p>
                    <p className="text-xs md:text-sm text-[#64748B]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-pagination-testimonials flex items-center justify-center gap-2 mt-5" />
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
    <section className="py-8 md:py-16 px-2 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-5 md:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 gradient-bg rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl shadow-primary/30">
              <FiMail className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-[#111827] mb-2 md:mb-3">Get 10% Off Your First Order</h2>
            <p className="text-[#64748B] text-xs md:text-base mb-5 md:mb-8">Subscribe to our newsletter for exclusive deals, new arrivals, and tech tips.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 md:gap-3 max-w-md mx-auto">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="premium-input flex-1 text-sm"
              />
              <button type="submit" disabled={loading}
                className="premium-button px-5 py-2.5 md:px-6 md:py-3 shrink-0 text-sm">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="text-[10px] md:text-xs text-[#94a3b8] mt-3 md:mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
