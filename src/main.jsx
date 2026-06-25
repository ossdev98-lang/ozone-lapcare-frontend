import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { store } from './store/index.js'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '14px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: { iconTheme: { primary: '#2BB7B2', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)
