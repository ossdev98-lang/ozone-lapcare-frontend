import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Message sent! We\'ll reply within 24 hours.')
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    setLoading(false)
  }

  const contactInfo = [
    { icon: FiPhone, title: 'Call Us', info: '+91 8962872285', sub: 'Mon–Sat: 10AM–7PM', href: 'tel:+918962872285' },
    { icon: FiMail, title: 'Email Us', info: 'support@ozoneLapcare.com', sub: 'We reply within 24 hours', href: 'mailto:support@ozoneLapcare.com' },
    { icon: FaWhatsapp, title: 'WhatsApp', info: '+91 8962872285', sub: 'Quick support on WhatsApp', href: 'https://wa.me/918962872285' },
    { icon: FiMapPin, title: 'Visit Us', info: '306 b-block, Silver Mall, RNT Marg', sub: 'Indore MP – 452001', href: '#' },
  ]

  return (
    <>
      <Helmet><title>Contact Us – Ozone Lapcare</title></Helmet>

      <div className="bg-[#0F172A] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 40% 50%, #2875B7, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-black text-white mb-4">Get in <span className="gradient-text">Touch</span></h1>
            <p className="text-slate-400 text-lg">Our team is here to help you with anything</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {contactInfo.map((c, i) => (
            <motion.a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300 block group">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-[#111827] mb-1">{c.title}</h3>
              <p className="text-sm font-medium text-primary">{c.info}</p>
              <p className="text-xs text-[#64748B] mt-1">{c.sub}</p>
            </motion.a>
          ))}
        </div>

        {/* Form + Map */}
        <div className="grid lg:grid-cols-5 gap-8">
          <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="glass-card p-8">
              <h2 className="text-2xl font-black text-[#111827] mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="John Doe" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <Input label="Email Address" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="premium-input" required>
                      <option value="">Select subject</option>
                      <option>Order Inquiry</option>
                      <option>Product Question</option>
                      <option>Repair Service</option>
                      <option>Return & Refund</option>
                      <option>Technical Support</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5} placeholder="Tell us how we can help you..." required
                    className="premium-input resize-none" />
                </div>
                <Button type="submit" loading={loading} className="w-full py-4 text-base">
                  <FiSend className="w-5 h-5" /> Send Message
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-2 space-y-5" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="glass-card p-6">
              <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2"><FiClock className="w-4 h-4 text-primary" />Business Hours</h3>
              <div className="space-y-2 text-sm">
                {[['Monday – Friday', '9:00 AM – 7:00 PM'], ['Saturday', '9:00 AM – 6:00 PM'], ['Sunday', '10:00 AM – 5:00 PM']].map(([day, time]) => (
                  <div key={day} className="flex justify-between p-2.5 rounded-xl hover:bg-white/40 transition-colors">
                    <span className="text-[#374151] font-medium">{day}</span>
                    <span className="text-[#64748B]">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2"><FiMessageCircle className="w-4 h-4 text-primary" />Quick Support</h3>
              <p className="text-sm text-[#64748B] mb-4">Get instant support via WhatsApp for urgent queries</p>
              <a href="https://wa.me/918962872285?text=Hi! I need help" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold rounded-2xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                <FaWhatsapp className="w-5 h-5" /> Chat on WhatsApp
              </a>
            </div>

            <div className="glass-card overflow-hidden h-52 rounded-3xl">
             <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.3122953693155!2d75.87128107508228!3d22.71663097938933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fdb33441ce2f%3A0xadb626823b7e82b1!2sSilver%20Mall%20Indore%20-%20Laptops%20%26%20Computer!5e0!3m2!1sen!2sin!4v1782386931868!5m2!1sen!2sin" width="600" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="strict-origin-when-cross-origin"></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
