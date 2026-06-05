import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './admin.css'
import AdminLayout from './layout/AdminLayout.jsx'
import AdminLock, { useAdminLock } from './pages/AdminLock.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import Kanban from './pages/Kanban.jsx'
import Leads from './pages/Leads.jsx'
import Webhooks from './pages/Webhooks.jsx'
import AIOutreach from './pages/AIOutreach.jsx'
import Bookings from './pages/Bookings.jsx'
import Payments from './pages/Payments.jsx'
import Analytics from './pages/Analytics.jsx'
import Settings from './pages/Settings.jsx'

function AdminGuard({ children }) {
  const { locked } = useAdminLock()
  const [unlocked, setUnlocked] = useState(!locked)
  if (!unlocked) return <AdminLock onUnlock={() => setUnlocked(true)} />
  return children
}

export default function AdminApp() {
  return (
    <AdminGuard>
      {/* Nested Routes use paths RELATIVE to the parent /admin/* match */}
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="leads" element={<Leads />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="webhooks" element={<Webhooks />} />
          <Route path="ai" element={<AIOutreach />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminGuard>
  )
}
