import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { clients as clientStore, bookings as bookingStore, portalTokens } from '../admin/utils/storage.js'

function ProgressRing({ pct, size = 80 }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,41,59,1)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#portalGrad)" strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="portalGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const PLAN_LABELS = { launch: 'Launch Offer (59€/Mo)', starter: 'Starter Coaching (79€/Mo)', intensive: '1:1 Intensiv (149€/Mo)' }
const TYPE_LABELS = { 'check-in': 'Check-in', training: 'Training', nutrition: 'Ernährung', kickoff: 'Kickoff' }

export default function ClientPortal() {
  const { token } = useParams()
  const clientId = useMemo(() => portalTokens.getClientId(token), [token])
  const client = useMemo(() => clientId ? clientStore.get(clientId) : null, [clientId])
  const today = new Date().toISOString().split('T')[0]

  const upcomingSessions = useMemo(() => {
    if (!client) return []
    return bookingStore.getAll()
      .filter(b => b.clientId === client.id && b.date >= today && b.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [client, today])

  if (!token || !clientId || !client) {
    return (
      <div className="min-h-screen galaxy-bg flex items-center justify-center p-6" style={{ background: '#020817' }}>
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Link ungültig</h1>
          <p className="text-slate-400 text-sm">Dieser Portal-Link ist nicht mehr gültig. Bitte wende dich an deinen Coach.</p>
        </div>
      </div>
    )
  }

  const scoreColor = client.progress >= 70 ? '#10b981' : client.progress >= 40 ? '#06b6d4' : '#f59e0b'

  return (
    <div className="min-h-screen text-slate-100" style={{ background: '#020817', backgroundImage: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.07) 0%, transparent 60%)' }}>
      {/* Header */}
      <header className="border-b border-slate-800/60 px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          FW
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">Formwerk Coaching</div>
          <div className="text-[10px] text-slate-500">Dein persönliches Portal</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        {/* Welcome */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {client.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-white">Hey {client.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 mt-1 text-sm">Hier siehst du deinen aktuellen Fortschritt</p>
        </div>

        {/* Progress circle */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <ProgressRing pct={client.progress || 0} size={100} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: scoreColor }}>{client.progress || 0}%</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Dein Fortschritt</h2>
              <p className="text-slate-400 text-sm mt-1">Ziel: {client.goal}</p>
              <p className="text-slate-500 text-xs mt-2">{client.sessions || 0} Sessions absolviert</p>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  client.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  client.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                  'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {client.status === 'active' ? 'Aktives Coaching' : client.status === 'pending' ? 'Startet demnächst' : client.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: client.sessions || 0, icon: '💪' },
            { label: 'Fortschritt', value: `${client.progress || 0}%`, icon: '📈' },
            { label: 'Paket', value: client.plan === 'intensive' ? 'Intensiv' : client.plan === 'starter' ? 'Starter' : 'Launch', icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming sessions */}
        {upcomingSessions.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">📅 Nächste Sessions</h3>
            <div className="space-y-2">
              {upcomingSessions.map(b => (
                <div key={b.id} className="flex items-center gap-3 py-2 border-b border-slate-800/40 last:border-0">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex flex-col items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white leading-none">{new Date(b.date).getDate()}</span>
                    <span className="text-[9px] text-slate-500">{new Date(b.date + 'T00:00:00').toLocaleDateString('de-DE', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">{TYPE_LABELS[b.type] || b.type}</div>
                    <div className="text-xs text-slate-500">{b.time} Uhr · {b.duration} Min.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Package */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Dein Paket</h3>
          <p className="text-cyan-400 font-medium">{PLAN_LABELS[client.plan]}</p>
          {client.startDate && (
            <p className="text-xs text-slate-500 mt-1">
              Dabei seit {new Date(client.startDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-600">
            Bei Fragen direkt anschreiben ·{' '}
            <a href="mailto:polgota.buisness@gmail.com" className="text-cyan-400 hover:text-cyan-300">polgota.buisness@gmail.com</a>
          </p>
          <p className="text-xs text-slate-700 mt-2">© Formwerk Coaching</p>
        </div>
      </main>
    </div>
  )
}
