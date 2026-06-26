import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiShield, FiUsers, FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { FiTool, FiStar, FiThumbsUp, FiRefreshCw, FiCheck, FiPhone } from 'react-icons/fi'

const stats = [
  ['10,000+', 'Happy Customers'],
  ['5,000+', 'Laptops & Accessories Sold'],
  ['6+', 'Years of Industry Experience'],
  ['4.9★', 'Customer Satisfaction Rating'],
]

const timeline = [
  ['2020', 'OZONE LAPCARE established with laptop repair services'],
  ['2021', 'Expanded into refurbished laptop sales'],
  ['2022', 'Introduced genuine accessories and upgrade solutions'],
  ['2023', 'Served 5,000+ satisfied customers'],
  ['2024', 'Expanded services for businesses and institutions'],
  ['2025', 'Continuing to deliver affordable and reliable laptop solutions'],
  
  ['2026', 'E-commerce platform launch for nationwide reach'],
]

const values = [
  { icon: FiShield, title: 'Genuine Products', desc: 'We use authentic components and trusted brands to ensure long-lasting performance and reliability.' },
  { icon: FiStar, title: 'Quality First', desc: 'Every refurbished laptop and repaired device undergoes rigorous quality checks before delivery.' },
  { icon: FiTool, title: 'Expert Technicians', desc: 'Our experienced engineers specialize in diagnostics, chip-level repairs, upgrades, and preventive maintenance.' },
  { icon: FiRefreshCw, title: 'Transparent Pricing', desc: 'No hidden charges—just honest estimates and cost-effective solutions.' },
  { icon: FiThumbsUp, title: 'Customer Satisfaction', desc: 'We prioritize responsive support, quick turnaround times, and dependable after-sales service.' },
  { icon: FiUsers, title: 'Sustainable Technology', desc: 'By refurbishing and repairing devices, we help reduce e-waste and promote environmentally responsible technology use.' },
]

const team = [
  { name: 'Vipin Jain', role: 'Founder & CEO', avatar: 'VJ', bio: '18+ years in laptop industry' },
  { name: 'Parmanand Kushwah', role: 'Head of Operations', avatar: 'PK', bio: 'Expert in supply chain management' },
  { name: 'Shivam Choudhary', role: 'Lead Technician', avatar: 'SC', bio: 'Certified Expert' },
  { name: 'Palak Shah', role: 'Customer Success', avatar: 'PS', bio: 'Dedicated to your satisfaction' },
]

const whyChoose = [
  'High-quality refurbished laptops at affordable prices',
  'Genuine spare parts and accessories',
  'Chip-level motherboard repair by experienced technicians',
  'Fast diagnostics and reliable repair services',
  'SSD, RAM, battery, and keyboard upgrades',
  'Data recovery and software support',
  'Warranty-backed products and services',
  'Trusted by students, professionals, businesses, and institutions',
]

export default function AboutPage() {
  return (
    <>
      <Helmet><title>About Us – Ozone Lapcare</title></Helmet>

      {/* Hero */}
      <div className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
              We're OZONE LAPCARE
            </h1>
            <p className="text-slate-300 text-lg md:text-xl leading-snug max-w-5xl mx-auto mb-3">
              Your Trusted Partner for Laptop Sales & Expert Repair Services
            </p>
            <p className="text-slate-400 text-base md:text-lg leading-snug max-w-5xl mx-auto mb-5">
              At OZONE LAPCARE, we believe every laptop deserves a second life and every customer deserves reliable technology. We specialize in high-quality refurbished laptops, genuine accessories, and professional repair services backed by skilled technicians and transparent support.
            </p>
            <p className="text-primary text-lg md:text-xl font-bold tracking-wide">
              Repair - Upgrade - Renew - Perform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {stats.map(([num, label]) => (
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
              <p>OZONE LAPCARE was founded with a simple mission: to make quality technology affordable, reliable, and accessible for everyone.</p>
              <p>What started as a local laptop service center has grown into a trusted destination for refurbished laptops, laptop accessories, and professional repair solutions. From students and working professionals to businesses and educational institutions, we've helped thousands of customers extend the life of their devices while saving money.</p>
              <p>Today, OZONE LAPCARE offers comprehensive solutions including laptop sales, chip-level repairs, SSD and RAM upgrades, data recovery, motherboard repair, annual maintenance contracts (AMC), and genuine replacement parts—all delivered with a commitment to quality and customer satisfaction.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-3xl" />
            <div className="space-y-5">
              {timeline.map(([year, event]) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <v.icon className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="font-bold text-[#111827]">{v.title}</h3>
                </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Why Choose Us */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose <span className="gradient-text">OZONE LAPCARE</span>?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {whyChoose.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20">
              <FiCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-[#374151]">{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative">
            <h2 className="text-3xl font-black text-[#111827] mb-4">Ready to Upgrade or Repair Your Laptop?</h2>
            <p className="text-[#64748B] mb-8">Whether you're looking to buy a reliable refurbished laptop or need expert repair services, OZONE LAPCARE is here to help.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop" className="premium-button px-8 py-4">
                <FiPackage className="w-5 h-5 inline mr-2" /> Explore Products
              </Link>
              <Link to="/repair" className="premium-button-outline px-8 py-4">
                <FiTool className="w-5 h-5 inline mr-2" /> Book a Repair
              </Link>
              <Link to="/contact" className="premium-button-ghost px-8 py-4 border border-primary/20">
                <FiPhone className="w-5 h-5 inline mr-2" /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
