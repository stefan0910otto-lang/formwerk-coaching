import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import ClientPortal from './portal/ClientPortal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Client portal – public, token-protected */}
        <Route path="/portal/:token" element={<ClientPortal />} />
        {/* Admin panel */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Marketing website */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
