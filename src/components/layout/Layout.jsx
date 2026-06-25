import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />

      {/* WhatsApp Float */}
      <motion.a
        href="https://wa.me/918962872285?text=Hi! I need help with a laptop"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-shadow duration-300"
      >
        <FaWhatsapp className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">1</span>
      </motion.a>
    </div>
  )
}
