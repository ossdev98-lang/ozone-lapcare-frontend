import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiGift } from 'react-icons/fi'
import { offerAPI } from '../../api/services'

export default function OfferSlider() {
  const { data: offers } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerAPI.getAll().then(r => r.data.data || []),
    staleTime: 5 * 60 * 1000,
  })

  const [duration, setDuration] = useState(20)
  useEffect(() => {
    const update = () => setDuration(window.innerWidth < 640 ? 8 : 14)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!offers?.length) return null

  const loopItems = offers.concat(offers)

  return (
    <div className="bg-[#FEFCE8] py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <FiGift className="w-4 h-4 text-[#EAB308] shrink-0" />
          <div className="relative flex-1 h-6 overflow-hidden">
            <motion.div
              className="absolute whitespace-nowrap will-change-transform"
              animate={{ x: ['40%', '-100%'] }}
              transition={{ duration, repeat: Infinity, ease: 'linear' }}
            >
              <span className="text-xs sm:text-sm font-semibold text-[#854D0E] inline-block px-4">
                {loopItems.map((offer, i) => (
                  <span key={i} className="mx-4 sm:mx-8">
                    {offer.title}
                  </span>
                ))}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}