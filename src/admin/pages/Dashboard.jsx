import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import GalaxyCard, { StatCard } from '../components/GalaxyCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { clients as clientStore, bookings as bookingStore, payments as paymentStore, webhookLogs } from '../utils/storage.js'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#10b981']

function buildRevenueData(payments) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = payments
      .filter(p => p.date?.startsWith(monthKey) && p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0)
    return { month: MONTHS[d.getMonth()], revenue: total }
  })
}

function buildClientGrowth(clients) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const count = clients.filter(c => c.createdAt?.startsWith(monthKey)).length
    return { month: MONTHS[d.getMonth()], clients: count }
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' && p.name === 'Revenue' ? `${p.value}€` : p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const clients = clientStore.getAll()
  const bookings = bookingStore.getAll()
  const payments = paymentStore.getAll()
  const logs = webhookLogs.getAll()

  const activeClients = clients.filter(c => c.status === 'active').length
  const monthRevenue = useMemo(() => {
    const now = new Date()
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return payments.filter(p => p.date?.startsWith(key) && p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  }, [payments])

  const upcomingBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0]
    return b.date >= today && b.status === 'scheduled'
  }).length

  const revenueData = useMemo(() => buildRevenueData(payments), [payments])
  const clientGrowthData = useMemo(() => buildClientGrowth(clients), [clients])

  const planDistribution = useMemo(() => {
    const counts = { intensive: 0, starter: 0, launch: 0 }
    clients.filter(c => c.status === 'active').forEach(c => { counts[c.plan] = (counts[c.plan] || 0) + 1 })
    return [
      { name: '1:1 Intensiv', value: counts.intensive },
      { name: 'Starter', value: counts.starter },
      { name: 'Launch', value: counts.launch },
    ].filter(d => d.value > 0)
  }, [clients])

  const recentActivity = useMemo(() => {
    const events = [
      ...clients.slice(0, 5).map(c => ({ type: 'client', label: `${c.name} hinzugefügt`, time: c.createdAt, icon: '👤', color: 'text-cyan-400' })),
      ...bookings.slice(0, 5).map(b => ({ type: 'booking', label: `Session mit ${b.clientName}`, time: b.createdAt, icon: '📅', color: 'text-purple-400' })),
      ...logs.slice(0, 5).map(l => ({ type: 'webhook', label: `Webhook "${l.webhookName}" – ${l.event}`, time: l.timestamp, icon: '🔗', color: l.status === 'success' ? 'text-emerald-400' : 'text-red-400' })),
    ]
    return events.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8)
  }, [clients, bookings, logs])

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="fade-in space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Willkommen zurück, Stefan 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">{new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/admin/clients?new=1')} className="btn-primary">+ Neuer Client</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Aktive Clients" value={activeClients} icon="👥" color="cyan" change={20} sub={`${clients.length} gesamt`} onClick={() => navigate('/admin/clients')} />
        <StatCard label="Monatsrevenue" value={`${monthRevenue}€`} icon="💳" color="green" change={12} sub="dieser Monat" onClick={() => navigate('/admin/payments')} />
        <StatCard label="Bevorstehend" value={upcomingBookings} icon="📅" color="purple" sub="Sessions geplant" onClick={() => navigate('/admin/bookings')} />
        <StatCard label="Gesamtumsatz" value={`${totalRevenue}€`} icon="📈" color="amber" sub="alle Zeit" onClick={() => navigate('/admin/analytics')} />
      </div>

      {/* Quick Actions */}
      <GalaxyCard className="p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Neuer Client', to: '/admin/clients?new=1', icon: '👤', color: 'btn-primary' },
            { label: 'Session buchen', to: '/admin/bookings', icon: '📅', color: 'btn-secondary' },
            { label: 'Zahlung erfassen', to: '/admin/payments', icon: '💳', color: 'btn-secondary' },
            { label: 'Leads ansehen', to: '/admin/leads', icon: '📬', color: 'btn-secondary' },
            { label: 'AI Nachricht', to: '/admin/ai', icon: '🤖', color: 'btn-secondary' },
            { label: 'Kanban Board', to: '/admin/kanban', icon: '🗂', color: 'btn-ghost' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.to)} className={`${a.color} text-xs flex items-center gap-1.5`}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </GalaxyCard>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <GalaxyCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue (letzte 6 Monate)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GalaxyCard>

        {/* Plan distribution */}
        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Plan-Verteilung</h3>
          {planDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {planDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {planDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-400">{d.name}</span>
                    </div>
                    <span className="text-slate-300 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state text-slate-600 text-sm">Noch keine Clients</div>
          )}
        </GalaxyCard>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Client growth */}
        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Neue Clients</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={clientGrowthData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="clients" name="Clients" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GalaxyCard>

        {/* Recent activity */}
        <GalaxyCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Letzte Aktivitäten</h3>
          {recentActivity.length === 0 ? (
            <div className="empty-state">Keine Aktivitäten</div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-800/40 last:border-0">
                  <span className="text-base w-6 text-center">{act.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${act.color}`}>{act.label}</p>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(act.time).toLocaleDateString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GalaxyCard>
      </div>

      {/* Quick actions */}
      <GalaxyCard className="p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Client hinzufügen', icon: '👤', action: () => navigate('/admin/clients?new=1'), color: 'border-cyan-500/20 hover:border-cyan-500/50' },
            { label: 'Session buchen', icon: '📅', action: () => navigate('/admin/bookings?new=1'), color: 'border-purple-500/20 hover:border-purple-500/50' },
            { label: 'AI Nachricht', icon: '🤖', action: () => navigate('/admin/ai'), color: 'border-emerald-500/20 hover:border-emerald-500/50' },
            { label: 'Webhook testen', icon: '🔗', action: () => navigate('/admin/webhooks'), color: 'border-amber-500/20 hover:border-amber-500/50' },
          ].map(({ label, icon, action, color }) => (
            <button
              key={label}
              onClick={action}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${color} bg-slate-800/30 hover:bg-slate-800/60 transition-all text-sm text-slate-300 hover:text-white`}
            >
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </GalaxyCard>
    </div>
  )
}
