import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { adAPI } from '../../api/services'

export default function AdPopup() {
  const [open, setOpen] = useState(false)
  const dismissed = sessionStorage.getItem('ozone_ad_dismissed_v1') === '1'

  const { data } = useQuery({
    queryKey: ['active-ads'],
    queryFn: () => adAPI.getActive().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const activeAd = data?.[0]
  const isExternal = activeAd?.link?.startsWith('http://') || activeAd?.link?.startsWith('https://')

  useEffect(() => {
    if (!activeAd || dismissed) return
    const timer = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(timer)
  }, [activeAd, dismissed])

  const handleClose = () => {
    setOpen(false)
    sessionStorage.setItem('ozone_ad_dismissed_v1', '1')
  }

  const handleClick = () => {
    handleClose()
    if (!activeAd?.link) return
    if (isExternal) {
      window.open(activeAd.link, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = activeAd.link
    }
  }

  if (!activeAd || dismissed) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-[480px] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 bg-transparent cursor-pointer"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            onClick={handleClick}
          >
            <button
              onClick={e => { e.stopPropagation(); handleClose() }}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <img
              src={activeAd.image}
              alt={activeAd.title}
              className="w-full h-auto max-h-[85vh] object-contain bg-transparent pointer-events-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
