import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/index.jsx'
import { Toaster } from 'sonner'
import { Provider } from 'react-redux'
import { store } from './store/index.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store} >
      <BrowserRouter>
        <AppRouter />
        <Toaster richColors closeButton />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
