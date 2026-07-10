import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-4 md:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10 mb-6 md:mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">OL</span>
              </div>
              <div>
                <span className="font-black text-base leading-none block">Ozone Lapcare</span>
                <span className="text-[10px] text-slate-400 leading-none">Your Laptop Care Experts</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-3 hidden md:block">
              Premium laptops, accessories, and repair services. Trusted by 1,000+ customers across India.
            </p>
            <div className="flex gap-2">
              {[{ icon: FiInstagram, href: '#' }, { icon: FiFacebook, href: '#' }, { icon: FiTwitter, href: '#' }, { icon: FiYoutube, href: '#' }].map(({ icon: Icon, href }, i) => (
                <motion.a key={i} href={href} whileHover={{ scale: 1.1, y: -2 }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary/60 flex items-center justify-center transition-all duration-200">
                  <Icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-2.5 md:mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2.5">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/repair', 'Repair Services'], ['/about', 'About Us'], ['/contact', 'Contact'], ['/warranty', 'Warranty Policy']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-white text-[11px] md:text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-2.5 md:mb-4 text-xs uppercase tracking-wider">Categories</h4>
            <ul className="space-y-1.5 md:space-y-2.5">
              {[['Laptops', 'laptops'], ['Gaming Laptops', 'gaming-laptops'], ['Refurbished', 'refurbished'], ['SSD & RAM', 'laptop-parts'], ['Chargers', 'accessories'], ['Displays', 'accessories']].map(([label, slug]) => (
                <li key={`${slug}-${label}`}>
                  <Link to={`/category/${slug}`} className="text-slate-400 hover:text-white text-[11px] md:text-sm transition-colors duration-200 hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-2.5 md:mb-4 text-xs uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-1.5 md:space-y-2.5">
              <li className="flex items-start gap-2 text-slate-400 text-[11px] md:text-sm">
                <FiMapPin className="w-3.5 h-3.5 mt-0.5 text-secondary shrink-0" />
                <span className="hidden md:inline">306 b-block, Silver Mall, RNT Marg Indore MP – 452001</span>
                <span className="md:hidden">306 b-block, Silver Mall, Indore – 452001</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-[11px] md:text-sm">
                <FiPhone className="w-3.5 h-3.5 text-secondary shrink-0" />
                +91 8962872285
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-[11px] md:text-sm">
                <FiMail className="w-3.5 h-3.5 text-secondary shrink-0" />
                support@ozoneLapcare.com
              </li>
            </ul>
            <div className="mt-3 md:mt-5 p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-400 mb-0.5 md:mb-1">Business Hours</p>
              <p className="text-xs md:text-sm font-medium leading-tight md:leading-normal">Mon - Sat: 10AM - 8PM</p>
              <p className="text-[10px] md:text-xs text-slate-400">Sunday: 10AM – 5PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 md:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4">
          <p className="text-slate-400 text-[10px] md:text-xs">(c) Copyright OZONESOFT Solutions {new Date().getFullYear()}. All right reserved.</p>
          <div className="flex gap-3 md:gap-4">
            <Link to="/terms" className="text-slate-400 hover:text-white text-[10px] md:text-xs transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="text-slate-400 hover:text-white text-[10px] md:text-xs transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
