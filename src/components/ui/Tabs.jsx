import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/40 border border-white/40 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
              ${activeTab === i 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-[#64748B] hover:text-[#111827]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tabs[activeTab]?.content}
      </motion.div>
    </div>
  )
}