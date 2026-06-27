import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

const authPathsWithoutRefresh = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh-token',
]

const shouldSkipTokenRefresh = config => {
  const url = config?.url || ''
  return authPathsWithoutRefresh.some(path => url.includes(path))
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Set Content-Type for non-FormData requests
  if (!config.headers['Content-Type'] && config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    const refresh = localStorage.getItem('refreshToken')

    if (err.response?.status === 401 && original && !original._retry && refresh && !shouldSkipTokenRefresh(original)) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/auth/refresh-token', { refreshToken: refresh })
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  }
)

export default api
