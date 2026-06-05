import { useState } from 'react'
import GalaxyCard from '../components/GalaxyCard.jsx'
import { useToast } from '../components/Toast.jsx'
import { settings as store, clients, payments, bookings, webhooks, webhookLogs } from '../utils/storage.js'

function Section({ title, icon, children }) {
  return (
    <GalaxyCard className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </GalaxyCard>
  )
}

export default function Settings() {
  const toast = useToast()
  const [s, setS] = useState(() => store.get())
  const [showAiKey, setShowAiKey] = useState(false)

  function save() {
    store.set(s)
    toast('Einstellungen gespeichert', 'success')
  }

  function exportData() {
    const data = {
      exportDate: new Date().toISOString(),
      clients: clients.getAll(),
      payments: payments.getAll(),
      bookings: bookings.getAll(),
      webhooks: webhooks.getAll(),
      webhookLogs: webhookLogs.getAll(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formwerk-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Daten exportiert', 'success')
  }

  function clearLogs() {
    if (!confirm('Alle Webhook-Logs löschen?')) return
    webhookLogs.clear()
    toast('Webhook-Logs gelöscht', 'info')
  }

  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fade-in space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-white">Einstellungen</h2>
        <p className="text-slate-500 text-sm">Konfiguriere dein Formwerk Master-OS</p>
      </div>

      {/* Profile */}
      <Section title="Profil" icon="👤">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Name</label>
            <input className="galaxy-input" value={s.adminName} onChange={e => set('adminName', e.target.value)} />
          </div>
          <div>
            <label className="form-label">E-Mail</label>
            <input className="galaxy-input" type="email" value={s.adminEmail} onChange={e => set('adminEmail', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* AI */}
      <Section title="AI Integration (Claude)" icon="🤖">
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-xs text-purple-300">
            Füge deinen Anthropic API Key hinzu, um echte KI-Generierung für Nachrichten und Analysen zu nutzen.
            Ohne Key werden hochwertige Templates verwendet.
          </p>
        </div>
        <div>
          <label className="form-label">Anthropic API Key</label>
          <div className="flex gap-2">
            <input
              className="galaxy-input flex-1 font-mono text-xs"
              type={showAiKey ? 'text' : 'password'}
              value={s.anthropicKey}
              onChange={e => set('anthropicKey', e.target.value)}
              placeholder="sk-ant-..."
            />
            <button onClick={() => setShowAiKey(v => !v)} className="btn-secondary shrink-0">
              {showAiKey ? '🙈' : '👁'}
            </button>
          </div>
          {s.anthropicKey && (
            <p className="text-xs text-emerald-400 mt-1.5">✓ API Key gesetzt – Claude AI aktiv</p>
          )}
        </div>
      </Section>

      {/* Supabase / Leads Connection */}
      <Section title="Supabase – Live Leads Verbindung" icon="🗄️">
        {(() => {
          const supaUrl = import.meta.env.VITE_SUPABASE_URL
          const supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY
          const connected = !!(supaUrl && supaKey)
          return (
            <div className="space-y-4">
              {connected ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full pulse-glow shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Supabase verbunden ✓</p>
                    <p className="text-xs text-slate-400 mt-0.5 break-all">{supaUrl}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm font-semibold text-amber-400 mb-1">⚠ Nicht konfiguriert — Leads nur im lokalen Browser sichtbar</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Wenn Besucher dein Formular auf der echten Website ausfüllen, erscheinen die Leads <strong className="text-white">nicht</strong> in deinem Admin-Panel — weil localStorage browser-spezifisch ist. Mit Supabase funktioniert die Verbindung geräteübergreifend.
                  </p>
                </div>
              )}

              {!connected && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Setup in 3 Schritten:</p>
                  {[
                    { n: '1', title: 'Supabase-Projekt erstellen', desc: 'Kostenloses Konto auf supabase.com → New Project', href: 'https://supabase.com/dashboard/new' },
                    { n: '2', title: 'SQL-Schema ausführen', desc: 'Im Supabase SQL Editor das Schema aus src/admin/utils/supabaseAdapter.js einfügen und ausführen' },
                    { n: '3', title: '.env befüllen', desc: 'Project URL + anon key in .env (lokal) und in Vercel Environment Variables (Produktion) eintragen' },
                  ].map(step => (
                    <div key={step.n} className="flex gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{step.n}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                        {step.href && (
                          <a href={step.href} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block">→ {step.href}</a>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs font-mono text-slate-400 mb-1">.env (und Vercel → Settings → Environment Variables):</p>
                    <pre className="text-xs text-cyan-300 font-mono leading-relaxed">{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}</pre>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </Section>

      {/* Webhooks */}
      <Section title="Webhook-Konfiguration" icon="🔗">
        <div className="space-y-3">
          <div>
            <label className="form-label">Webhook Secret</label>
            <input className="galaxy-input font-mono text-xs" value={s.webhookSecret} onChange={e => set('webhookSecret', e.target.value)} />
            <p className="text-xs text-slate-600 mt-1">Wird als X-Formwerk-Secret Header mitgesendet.</p>
          </div>
        </div>
      </Section>

      {/* Integrations */}
      <Section title="Integrationen" icon="🔌">
        <div className="space-y-3">
          <div>
            <label className="form-label">Stripe Public Key</label>
            <input className="galaxy-input font-mono text-xs" value={s.stripeKey || import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''} onChange={e => set('stripeKey', e.target.value)} placeholder="pk_live_..." />
          </div>
          <div className="grid sm:grid-cols-4 gap-3 pt-2">
            {[
              { name: 'Supabase', href: 'https://supabase.com/dashboard', icon: '🗄️', status: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) },
              { name: 'Stripe', href: 'https://dashboard.stripe.com', icon: '💳', status: !!import.meta.env.VITE_STRIPE_PUBLIC_KEY },
              { name: 'Calendly', href: import.meta.env.VITE_CALENDLY_URL, icon: '📅', status: !!import.meta.env.VITE_CALENDLY_URL },
              { name: 'Formspree', href: 'https://formspree.io', icon: '📬', status: true },
            ].map(({ name, href, icon, status }) => (
              <a
                key={name}
                href={href}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{name}</div>
                  <div className={`text-xs ${status ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {status ? '✓ Verbunden' : 'Nicht konfiguriert'}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Benachrichtigungen" icon="🔔">
        <div className="space-y-3">
          {[
            { key: 'notifyOnNewClient', label: 'Neuer Client hinzugefügt' },
            { key: 'notifyOnPayment', label: 'Zahlung eingegangen' },
            { key: 'notifyOnBooking', label: 'Neue Session gebucht' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-sm text-slate-300">{label}</span>
              <div
                className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${s[key] ? 'bg-cyan-500' : 'bg-slate-700'}`}
                onClick={() => set(key, !s[key])}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s[key] ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Data */}
      <Section title="Daten & Export" icon="💾">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="btn-secondary flex items-center gap-2">
            <span>⬇️</span> Alle Daten exportieren (JSON)
          </button>
          <button onClick={clearLogs} className="btn-danger flex items-center gap-2">
            <span>🗑</span> Webhook-Logs leeren
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-3">Alle Daten werden lokal im Browser gespeichert (localStorage). Für eine echte Datenbank empfiehlt sich Supabase oder Firebase.</p>
      </Section>

      {/* About */}
      <Section title="Über Formwerk Master-OS" icon="⚡">
        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex justify-between"><span>Version</span><span className="text-slate-300">1.0.0</span></div>
          <div className="flex justify-between"><span>Stack</span><span className="text-slate-300">React 19 · Vite 8 · Tailwind 4 · Recharts</span></div>
          <div className="flex justify-between"><span>AI</span><span className="text-slate-300">Claude (Anthropic)</span></div>
          <div className="flex justify-between"><span>Storage</span><span className="text-slate-300">localStorage (Browser)</span></div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={save} className="btn-primary px-8">✓ Einstellungen speichern</button>
      </div>
    </div>
  )
}
