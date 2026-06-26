import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <span className="text-white font-black">OL</span>
              </div>
              <div>
                <span className="font-black text-lg leading-none block">Ozone Lapcare</span>
                <span className="text-xs text-slate-400 leading-none">Your Laptop Care Experts</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Premium laptops, accessories, and repair services. Trusted by 1,000+ customers across India.
            </p>
            <div className="flex gap-3">
              {[{ icon: FiInstagram, href: '#' }, { icon: FiFacebook, href: '#' }, { icon: FiTwitter, href: '#' }, { icon: FiYoutube, href: '#' }].map(({ icon: Icon, href }, i) => (
                <motion.a key={i} href={href} whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary/60 flex items-center justify-center transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/repair', 'Repair Services'], ['/about', 'About Us'], ['/contact', 'Contact'], ['/warranty', 'Warranty Policy']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5">
              {[['Laptops', 'laptops'], ['Gaming Laptops', 'gaming-laptops'], ['Refurbished', 'refurbished'], ['SSD & RAM', 'laptop-parts'], ['Chargers', 'accessories'], ['Displays', 'accessories']].map(([label, slug]) => (
                <li key={`${slug}-${label}`}>
                  <Link to={`/category/${slug}`} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <FiMapPin className="w-4 h-4 mt-0.5 text-secondary shrink-0" />
                306 b-block, Silver Mall, RNT Marg Indore MP – 452001
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <FiPhone className="w-4 h-4 text-secondary shrink-0" />
                +91 8962872285
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <FiMail className="w-4 h-4 text-secondary shrink-0" />
                support@ozoneLapcare.com
              </li>
            </ul>
            <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Business Hours</p>
              <p className="text-sm font-medium">Mon - Sat: 10AM - 8PM</p>
              <p className="text-xs text-slate-400">Sunday: 10AM – 5PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">(c)  Copyright OZONESOFT Solutions {new Date().getFullYear()}. All right reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-slate-400 hover:text-white text-xs transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="text-slate-400 hover:text-white text-xs transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
