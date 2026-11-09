import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Could not find the #root element to mount the app.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
