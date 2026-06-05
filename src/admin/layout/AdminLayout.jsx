import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import { ToastProvider } from '../components/Toast.jsx'

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/clients': 'Client Management',
  '/admin/bookings': 'Buchungen & Sessions',
  '/admin/payments': 'Zahlungen',
  '/admin/webhooks': 'Webhook Engine',
  '/admin/ai': 'AI Outreach',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Einstellungen',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Admin'

  return (
    <ToastProvider>
      <div className="flex h-screen galaxy-bg text-slate-100 overflow-hidden relative z-0">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
          <main className="flex-1 overflow-y-auto galaxy-scroll p-5 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
