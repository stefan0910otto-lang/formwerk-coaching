import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications as notifStore } from '../utils/storage.js'

export default function TopBar({ onMenuClick, title }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState(() => notifStore.getAll())
  const unread = notifs.filter(n => !n.read).length
  const navigate = useNavigate()

  function markAllRead() {
    notifStore.markAllRead()
    setNotifs(notifStore.getAll())
  }

  const typeIcon = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
  const typeColor = {
    success: 'text-emerald-400', error: 'text-red-400',
    info: 'text-cyan-400', warning: 'text-amber-400',
  }

  return (
    <header className="h-16 border-b border-slate-800/60 flex items-center gap-4 px-5 shrink-0 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button onClick={onMenuClick} className="lg:hidden btn-ghost text-xl p-1">☰</button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-slate-300 hidden sm:block">{title}</h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Quick add client */}
        <button
          onClick={() => navigate('/admin/clients?new=1')}
          className="btn-primary text-xs py-1.5 px-3 hidden sm:flex items-center gap-1.5"
        >
          <span>+</span> Client
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            onClick={() => { setShowNotifs(v => !v); setNotifs(notifStore.getAll()) }}
          >
            🔔
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-white">Benachrichtigungen</span>
                <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300">Alle lesen</button>
              </div>
              <div className="max-h-72 overflow-y-auto galaxy-scroll">
                {notifs.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">Keine Benachrichtigungen</p>
                ) : notifs.slice(0, 20).map(n => (
                  <div key={n.id} className={`flex gap-3 px-4 py-2.5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${!n.read ? 'bg-slate-800/20' : ''}`}>
                    <span className={`text-xs mt-0.5 ${typeColor[n.type] || typeColor.info}`}>{typeIcon[n.type] || '•'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{n.msg}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{new Date(n.createdAt).toLocaleString('de-DE')}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          S
        </div>
      </div>
    </header>
  )
}
