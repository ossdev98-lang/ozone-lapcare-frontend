import { motion } from 'framer-motion'

const variants = {
  primary: 'premium-button',
  outline: 'premium-button-outline',
  ghost: 'premium-button-ghost',
  danger: 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-red-500 text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer',
}

export default function Button({ children, variant = 'primary', className = '', loading = false, disabled = false, type = 'button', onClick, size = 'md', ...props }) {
  const sizeClass = { sm: 'px-4 py-2 text-xs', md: '', lg: 'px-8 py-4 text-base' }[size]
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      className={`${variants[variant]} ${sizeClass} ${className} ${disabled || loading ? 'opacity-60 pointer-events-none' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}
