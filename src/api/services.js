import api from './axios'

// Auth
export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: d => api.put('/auth/me', d),
  changePassword: d => api.put('/auth/change-password', d),
  forgotPassword: d => api.post('/auth/forgot-password', d),
  resetPassword: d => api.post('/auth/reset-password', d),
  verifyEmail: token => api.get(`/auth/verify-email?token=${token}`),
  verifyEmailOtp: d => api.post('/auth/verify-email', d),
}

// Products
export const productAPI = {
  getAll: params => api.get('/products', { params }),
  getOne: slug => api.get(`/products/${slug}`),
  getRelated: id => api.get(`/products/${id}/related`),
  create: d => api.post('/products', d),
  update: (id, d) => api.put(`/products/${id}`, d),
  delete: id => api.delete(`/products/${id}`),
  uploadImages: (id, fd) => api.post(`/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id, imgId) => api.delete(`/products/${id}/images/${imgId}`),
}

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: slug => api.get(`/categories/${slug}`),
  create: fd => api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, fd) => api.put(`/categories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: id => api.delete(`/categories/${id}`),
}

// Brands
export const brandAPI = {
  getAll: () => api.get('/brands'),
  getOne: slug => api.get(`/brands/${slug}`),
  create: fd => api.post('/brands', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, fd) => api.put(`/brands/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: id => api.delete(`/brands/${id}`),
}

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  add: d => api.post('/cart', d),
  update: (id, d) => api.put(`/cart/${id}`, d),
  remove: id => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
  applyCoupon: d => api.post('/cart/coupon', d),
  removeCoupon: () => api.delete('/cart/coupon'),
}

// Orders
export const orderAPI = {
  create: d => api.post('/orders', d),
  getMy: params => api.get('/orders', { params }),
  getOne: id => api.get(`/orders/${id}`),
  cancel: (id, d) => api.put(`/orders/${id}/cancel`, d),
  verifyPayment: d => api.post('/orders/verify-payment', d),
  getAll: params => api.get('/admin/orders', { params }),
  updateStatus: (id, d) => api.put(`/admin/orders/${id}/status`, d),
}

// Reviews
export const reviewAPI = {
  create: d => api.post('/reviews', d),
  getByProduct: (id, params) => api.get(`/reviews/${id}`, { params }),
  getAll: () => api.get('/admin/reviews'),
  update: (id, d) => api.put(`/admin/reviews/${id}`, d),
}

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: d => api.post('/wishlist', d),
}

// Addresses
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  create: d => api.post('/addresses', d),
  update: (id, d) => api.put(`/addresses/${id}`, d),
  delete: id => api.delete(`/addresses/${id}`),
}

// Coupons
export const couponAPI = {
  validate: d => api.post('/coupons/validate', d),
  getAll: () => api.get('/admin/coupons'),
  create: d => api.post('/admin/coupons', d),
  update: (id, d) => api.put(`/admin/coupons/${id}`, d),
  delete: id => api.delete(`/admin/coupons/${id}`),
}

// Repair
export const repairAPI = {
  getServices: () => api.get('/repair-services'),
  book: d => api.post('/repair-bookings', d),
  getMy: () => api.get('/repair-bookings/my'),
  getAll: () => api.get('/admin/repair-bookings'),
  update: (id, d) => api.put(`/admin/repair-bookings/${id}`, d),
  getMyOne: id => api.get(`/repair-bookings/${id}`),
  createPaymentOrder: id => api.post(`/repair-bookings/${id}/payment/create-order`),
  verifyPayment: (id, d) => api.post(`/repair-bookings/${id}/payment/verify`, d),
}

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: id => api.put(`/notifications/${id}/read`),
}

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: params => api.get('/admin/users', { params }),
  updateUserStatus: (id, d) => api.put(`/admin/users/${id}/status`, d),
  sendWhatsappBroadcast: d => api.post('/admin/whatsapp/broadcast', d),
  getBroadcastTypes: () => api.get('/admin/whatsapp/broadcast-types'),
}


