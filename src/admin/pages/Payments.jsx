import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import GalaxyCard, { StatCard } from '../components/GalaxyCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import InvoiceModal from '../components/InvoiceModal.jsx'
import { payments as store, clients as clientStore } from '../utils/storage.js'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}€</strong></p>
      ))}
    </div>
  )
}

export default function Payments() {
  const all = store.getAll()
  const clients = clientStore.getAll()
  const [invoicePayment, setInvoicePayment] = useState(null)

  const totalRevenue = useMemo(() => all.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0), [all])
  const monthRevenue = useMemo(() => {
    const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    return all.filter(p => p.date?.startsWith(key) && p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  }, [all])

  const pendingRevenue = useMemo(() => all.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0), [all])
  const activeMonthly = useMemo(() => clients.filter(c => c.status === 'active').reduce((s, c) => s + (c.revenue || 0), 0), [clients])

  const chartData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const paid = all.filter(p => p.date?.startsWith(key) && p.status === 'paid').reduce((s, p) => s + p.amount, 0)
      const pending = all.filter(p => p.date?.startsWith(key) && p.status === 'pending').reduce((s, p) => s + p.amount, 0)
      return { month: MONTHS[d.getMonth()], Einnahmen: paid, Ausstehend: pending }
    })
  }, [all])

  const recentPayments = [...all].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)

  return (
    <div className="fade-in space-y-5 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-white">Zahlungen</h2>
        <p className="text-slate-500 text-sm">Umsatzübersicht und Transaktionsverlauf</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gesamtumsatz" value={`${totalRevenue}€`} icon="💰" color="green" sub="alle Zeit" />
        <StatCard label="Dieser Monat" value={`${monthRevenue}€`} icon="📅" color="cyan" change={15} />
        <StatCard label="Monatlich (ARR)" value={`${activeMonthly}€`} icon="♻️" color="purple" sub="aktive Clients" />
        <StatCard label="Ausstehend" value={`${pendingRevenue}€`} icon="⏳" color="amber" sub="noch nicht bezahlt" />
      </div>

      {/* Revenue chart */}
      <GalaxyCard className="p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue (letzte 6 Monate)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Einnahmen" stroke="#10b981" strokeWidth={2} fill="url(#paidGrad)" />
            <Area type="monotone" dataKey="Ausstehend" stroke="#f59e0b" strokeWidth={2} fill="url(#pendGrad)" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </GalaxyCard>

      {/* Transactions table */}
      <GalaxyCard className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold text-white">Transaktionen</h3>
          <a
            href={`https://dashboard.stripe.com/payments`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Stripe Dashboard ↗
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="galaxy-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Paket</th>
                <th>Betrag</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Stripe ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state">Keine Zahlungen</div></td></tr>
              ) : recentPayments.map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-white">{p.clientName}</td>
                  <td className="text-slate-400">{p.plan}</td>
                  <td className={`font-semibold ${p.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{p.amount}€</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="text-slate-500">{new Date(p.date).toLocaleDateString('de-DE')}</td>
                  <td>
                    {p.stripeId ? (
                      <code className="text-xs text-slate-500 font-mono">{p.stripeId.slice(0, 20)}...</code>
                    ) : (
                      <span className="text-slate-600 text-xs">–</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setInvoicePayment(p)}
                      className="btn-ghost text-xs text-slate-500 hover:text-cyan-400"
                      title="Rechnung erstellen"
                    >🧾</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GalaxyCard>

      <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />
    </div>
  )
}
