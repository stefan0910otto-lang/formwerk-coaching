import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend,
} from 'recharts'
import GalaxyCard, { StatCard } from '../components/GalaxyCard.jsx'
import { clients as clientStore, payments as paymentStore, bookings as bookingStore } from '../utils/storage.js'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}{p.unit || ''}</strong></p>)}
    </div>
  )
}

export default function Analytics() {
  const clients = clientStore.getAll()
  const payments = paymentStore.getAll()
  const bookings = bookingStore.getAll()

  const activeClients = clients.filter(c => c.status === 'active')
  const avgProgress = activeClients.length
    ? Math.round(activeClients.reduce((s, c) => s + (c.progress || 0), 0) / activeClients.length)
    : 0

  const retentionRate = clients.length
    ? Math.round((clients.filter(c => c.status !== 'completed').length / clients.length) * 100)
    : 0

  const completedSessions = bookings.filter(b => b.status === 'completed').length

  // Revenue over 6 months
  const revenueData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const rev = payments.filter(p => p.date?.startsWith(key) && p.status === 'paid').reduce((s, p) => s + p.amount, 0)
      const count = clients.filter(c => c.createdAt?.startsWith(key)).length
      return { month: MONTHS[d.getMonth()], Revenue: rev, Clients: count }
    })
  }, [payments, clients])

  // Plan distribution bar
  const planData = useMemo(() => {
    const counts = { 'Launch (59€)': 0, 'Starter (79€)': 0, 'Intensiv (149€)': 0 }
    clients.filter(c => c.status === 'active').forEach(c => {
      if (c.plan === 'launch') counts['Launch (59€)']++
      else if (c.plan === 'starter') counts['Starter (79€)']++
      else if (c.plan === 'intensive') counts['Intensiv (149€)']++
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [clients])

  // Goal distribution
  const goalData = useMemo(() => {
    const counts = {}
    clients.forEach(c => { counts[c.goal] = (counts[c.goal] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([subject, A]) => ({ subject, A, fullMark: 5 }))
  }, [clients])

  // Progress distribution
  const progressBuckets = useMemo(() => {
    const buckets = { '0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0 }
    activeClients.forEach(c => {
      const p = c.progress || 0
      if (p <= 25) buckets['0-25%']++
      else if (p <= 50) buckets['26-50%']++
      else if (p <= 75) buckets['51-75%']++
      else buckets['76-100%']++
    })
    return Object.entries(buckets).map(([name, value]) => ({ name, value }))
  }, [activeClients])

  const arpu = activeClients.length
    ? Math.round(activeClients.reduce((s, c) => s + (c.revenue || 0), 0) / activeClients.length)
    : 0

  return (
    <div className="fade-in space-y-5 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-slate-500 text-sm">Tiefe Einblicke in dein Coaching-Business</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Durchschn. Fortschritt" value={`${avgProgress}%`} icon="📈" color="cyan" sub="aktive Clients" />
        <StatCard label="Retention Rate" value={`${retentionRate}%`} icon="🔁" color="green" sub="bleiben dabei" />
        <StatCard label="Sessions absolviert" value={completedSessions} icon="✓" color="purple" />
        <StatCard label="ARPU" value={`${arpu}€`} icon="💡" color="amber" sub="Ø Revenue / Client" />
      </div>

      {/* Revenue + Client trend */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue-Trend (6 Monate)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GalaxyCard>

        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Paket-Verteilung (aktive Clients)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={planData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Clients" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GalaxyCard>
      </div>

      {/* Progress distribution + Goals radar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Fortschrittsverteilung</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={progressBuckets} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Clients" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GalaxyCard>

        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Ziele deiner Clients</h3>
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={goalData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke="rgba(30,41,59,0.8)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="Clients" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">Noch keine Daten</div>
          )}
        </GalaxyCard>
      </div>

      {/* Client health */}
      <GalaxyCard className="p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Client Health Score</h3>
        <div className="space-y-3">
          {activeClients.length === 0 ? (
            <div className="empty-state">Keine aktiven Clients</div>
          ) : activeClients.map(c => {
            const score = Math.min(100, Math.round(
              (c.progress || 0) * 0.4 +
              Math.min(c.sessions, 20) * 2 +
              (c.status === 'active' ? 20 : 0)
            ))
            const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#06b6d4' : '#f59e0b'

            return (
              <div key={c.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="w-24 shrink-0">
                  <div className="text-sm font-medium text-white truncate">{c.name}</div>
                </div>
                <div className="flex-1">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${score}%`, background: scoreColor }} />
                  </div>
                </div>
                <div className="text-sm font-bold w-10 text-right shrink-0" style={{ color: scoreColor }}>{score}</div>
              </div>
            )
          })}
        </div>
      </GalaxyCard>
    </div>
  )
}
