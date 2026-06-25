export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))

export const getDiscount = (price, compare) =>
  compare ? Math.round(((compare - price) / compare) * 100) : 0

export const orderStatusColor = (status) => ({
  pending: 'warning', confirmed: 'info', packed: 'info',
  shipped: 'primary', delivered: 'success', cancelled: 'danger', returned: 'danger'
}[status] || 'info')

export const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '…' : str

export const classNames = (...classes) => classes.filter(Boolean).join(' ')
