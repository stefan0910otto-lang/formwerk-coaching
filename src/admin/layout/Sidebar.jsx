import { NavLink } from 'react-router-dom'
import { leads as leadsStore } from '../utils/storage.js'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '⚡', end: true },
  { to: '/admin/clients', label: 'Clients', icon: '👥' },
  { to: '/admin/kanban', label: 'Kanban', icon: '🗂' },
  { to: '/admin/leads', label: 'Leads', icon: '📬', badge: true },
  { to: '/admin/bookings', label: 'Buchungen', icon: '📅' },
  { to: '/admin/payments', label: 'Zahlungen', icon: '💳' },
  { to: '/admin/webhooks', label: 'Webhooks', icon: '🔗' },
  { to: '/admin/ai', label: 'AI Outreach', icon: '🤖' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar({ mobile, onClose }) {
  const leadsCount = leadsStore.getUnreadCount()
  return (
    <aside className={`${mobile ? 'fixed inset-y-0 left-0 z-40 w-60' : 'hidden lg:flex'} flex-col w-60 galaxy-bg border-r border-slate-800/60 galaxy-scroll overflow-y-auto`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
          FW
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">Formwerk</div>
          <div className="text-[10px] text-slate-500 leading-tight">Master OS</div>
        </div>
        {mobile && (
          <button onClick={onClose} className="ml-auto btn-ghost text-lg">✕</button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        <div className="mb-1 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigation</span>
        </div>
        {NAV.map(({ to, label, icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-200 nav-item ${isActive ? 'nav-active font-medium' : 'text-slate-400'}`
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge && leadsCount > 0 && (
              <span className="w-4 h-4 bg-cyan-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {leadsCount > 9 ? '9+' : leadsCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Marketing site link */}
      <div className="p-3 border-t border-slate-800/60">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
        >
          <span>🌐</span>
          <span>Zur Website</span>
          <span className="ml-auto">↗</span>
        </a>
      </div>
    </aside>
  )
}
