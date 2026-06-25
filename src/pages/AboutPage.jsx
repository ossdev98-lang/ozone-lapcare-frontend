import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiShield, FiTruck, FiHeadphones, FiAward, FiUsers, FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const team = [
  { name: 'Rajesh Kumar', role: 'Founder & CEO', avatar: 'RK', bio: '15+ years in laptop industry' },
  { name: 'Priya Sharma', role: 'Head of Operations', avatar: 'PS', bio: 'Expert in supply chain management' },
  { name: 'Anil Mehta', role: 'Lead Technician', avatar: 'AM', bio: 'Certified by Dell, HP & Lenovo' },
  { name: 'Sneha Iyer', role: 'Customer Success', avatar: 'SI', bio: 'Dedicated to your satisfaction' },
]

const values = [
  { icon: FiShield, title: 'Genuine Products', desc: 'We source directly from authorized distributors. Every product is 100% genuine.' },
  { icon: FiAward, title: 'Quality First', desc: 'Rigorous quality checks on all products before they reach you.' },
  { icon: FiHeadphones, title: 'Expert Support', desc: 'Our certified technicians are available 6 days a week to help you.' },
  { icon: FiTruck, title: 'Fast Delivery', desc: 'Same-day dispatch. Pan-India delivery in 2-5 business days.' },
]

export default function AboutPage() {
  return (
    <>
      <Helmet><title>About Us – Ozone Lapcare</title></Helmet>

      {/* Hero */}
      <div className="bg-[#0F172A] py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
              Est. 2018 · Bangalore, India
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              We're Ozone Lapcare
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
              India's most trusted laptop store. We believe everyone deserves a fast, reliable laptop — and we're here to make that happen.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[['10,000+', 'Happy Customers'], ['5,000+', 'Products Sold'], ['6+', 'Years Experience'], ['4.9★', 'Average Rating']].map(([num, label]) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-4xl font-black mb-1">{num}</p>
              <p className="text-white/80 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="section-title mb-6">Our <span className="gradient-text">Story</span></h2>
            <div className="space-y-4 text-[#374151] leading-relaxed">
              <p>Ozone Lapcare was founded in 2018 by Rajesh Kumar, a passionate technologist who saw a gap in the market — customers were being sold low-quality, fake laptops at premium prices with no after-sales support.</p>
              <p>Starting from a small shop in Electronic City, Bangalore, we've grown into one of India's most trusted laptop stores, serving customers across 500+ cities through our online platform.</p>
              <p>Today, we offer new, refurbished, and gaming laptops along with a complete range of parts, accessories, and our signature repair services — all backed by genuine warranties and expert support.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-3xl" />
            <div className="space-y-5">
              {[['2018', 'Founded in Bangalore'], ['2019', 'Launched online store'], ['2021', '5,000 customers milestone'], ['2023', 'Expanded to pan-India delivery'], ['2024', '10,000+ happy customers']].map(([year, event]) => (
                <div key={year} className="flex items-center gap-4">
                  <span className="badge-primary font-bold text-sm px-3 py-1 shrink-0">{year}</span>
                  <span className="text-[#374151] font-medium">{event}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our <span className="gradient-text">Values</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#111827] mb-2">{v.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Meet the <span className="gradient-text">Team</span></h2>
          <p className="section-subtitle">The people behind your laptop care</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-xl shadow-primary/20">
                {m.avatar}
              </div>
              <h3 className="font-bold text-[#111827]">{m.name}</h3>
              <p className="text-primary text-sm font-medium mt-0.5">{m.role}</p>
              <p className="text-[#64748B] text-xs mt-2">{m.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative">
            <h2 className="text-3xl font-black text-[#111827] mb-4">Ready to Experience the Difference?</h2>
            <p className="text-[#64748B] mb-8">Join 10,000+ customers who trust Ozone Lapcare</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop" className="premium-button px-8 py-4">Shop Now</Link>
              <Link to="/contact" className="premium-button-outline px-8 py-4">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
