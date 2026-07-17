import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { heroBannerAPI } from '../../api/services'

export default function Hero() {
  const { data: banners, isLoading } = useQuery({
    queryKey: ['hero-banners'],
    queryFn: () => heroBannerAPI.getActive().then(r => r.data.data || []),
    staleTime: 5 * 60 * 1000,
  })

  const list = banners?.length ? banners : []
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (list.length <= 1) return
    timer.current = setInterval(() => setIndex(i => (i + 1) % list.length), 10000)
    return () => clearInterval(timer.current)
  }, [list.length])

  if (isLoading) {
    return <div className="w-full bg-slate-100 animate-pulse aspect-[1780/516]" />
  }

  if (!list.length) {
    return (
      <section className="w-full bg-gradient-to-r from-[#1e5a9a] to-[#2875B7] flex items-center justify-center aspect-[1780/516]">
        <p className="text-white/80 text-sm font-medium">No hero banner configured</p>
      </section>
    )
  }

  return (
    <section className="relative w-full overflow-hidden bg-slate-100">
      {list.map((b, i) => {
        const img = b.link ? (
          <Link to={b.link} className="block w-full">
            <img src={b.image} alt={b.title} className="w-full h-auto object-contain" />
          </Link>
        ) : (
          <img src={b.image} alt={b.title} className="w-full h-auto object-contain" />
        )
        return (
          <div key={b.id}
            className={`w-full ${i === index ? 'relative' : 'absolute inset-0'}`}
            style={{ visibility: i === index ? 'visible' : 'hidden' }}>
            {img}
          </div>
        )
      })}

      {list.length > 1 && (
        <>
          <button onClick={() => setIndex(i => (i - 1 + list.length) % list.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-700 flex items-center justify-center shadow cursor-pointer">‹</button>
          <button onClick={() => setIndex(i => (i + 1) % list.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-700 flex items-center justify-center shadow cursor-pointer">›</button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {list.map((b, i) => (
              <button key={b.id} onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${i === index ? 'bg-white w-5' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
