import { useState, useCallback } from 'react'
import GalaxyCard from '../components/GalaxyCard.jsx'
import { useToast } from '../components/Toast.jsx'
import { clients as clientStore, bookings as bookingStore, settings as settingsStore } from '../utils/storage.js'
import { generateMessage, analyzeProgress, generateEmailTemplate } from '../utils/aiService.js'

// ─── Shared Send Buttons ───────────────────────────────────────────────────────
const WA_ICON = <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
const TG_ICON = <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>

function SendButtons({ msg, client, onSent, sent }) {
  if (!msg) return null
  function wa() {
    if (!client.phone) return
    const phone = client.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    onSent()
  }
  function email() {
    window.open(`mailto:${client.email}?subject=Dein%20Coaching-Update&body=${encodeURIComponent(msg)}`, '_blank')
    onSent()
  }
  function copy() { navigator.clipboard.writeText(msg); onSent() }

  if (sent) return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
      <span>✓</span> Gesendet
    </span>
  )

  return (
    <div className="flex gap-1.5 flex-wrap">
      {client.phone && (
        <button onClick={wa} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366]/20 text-[11px] transition-all">
          {WA_ICON} WhatsApp
        </button>
      )}
      <button onClick={email} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 text-[11px] transition-all">
        ✉️ E-Mail
      </button>
      <button onClick={copy} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 text-[11px] transition-all">
        📋 Kopieren
      </button>
    </div>
  )
}

// ─── Campaign Definitions ──────────────────────────────────────────────────────
function buildCampaigns(clients, bookings) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  return [
    {
      id: 'monthly',
      icon: '🏆',
      title: 'Monatliches Highlight',
      desc: 'Fortschritts-Update an alle aktiven Clients',
      color: 'border-amber-500/30 bg-amber-500/5',
      accentColor: 'text-amber-400',
      msgType: 'checkIn',
      targets: clients.filter(c => c.status === 'active'),
      emptyHint: 'Keine aktiven Clients vorhanden.',
    },
    {
      id: 'reminder',
      icon: '📅',
      title: 'Session-Reminder',
      desc: 'Erinnerung für Sessions in den nächsten 24h',
      color: 'border-purple-500/30 bg-purple-500/5',
      accentColor: 'text-purple-400',
      msgType: 'reminder',
      targets: (() => {
        const clientIds = new Set(
          bookings
            .filter(b => (b.date === today || b.date === tomorrow) && b.status === 'scheduled')
            .map(b => b.clientId)
        )
        return clients.filter(c => clientIds.has(c.id)).map(c => ({
          ...c,
          _booking: bookings.find(b => b.clientId === c.id && (b.date === today || b.date === tomorrow) && b.status === 'scheduled'),
        }))
      })(),
      emptyHint: 'Keine Sessions in den nächsten 24h.',
    },
    {
      id: 'goalreset',
      icon: '🎯',
      title: 'Goal Reset',
      desc: 'Neue Ziele für Q3 – an alle aktiven Clients',
      color: 'border-cyan-500/30 bg-cyan-500/5',
      accentColor: 'text-cyan-400',
      msgType: 'goalReset',
      targets: clients.filter(c => c.status === 'active'),
      emptyHint: 'Keine aktiven Clients.',
    },
    {
      id: 'challenge',
      icon: '🤸',
      title: '30-Tage Challenge',
      desc: 'Re-Engagement für pausierte Clients',
      color: 'border-emerald-500/30 bg-emerald-500/5',
      accentColor: 'text-emerald-400',
      msgType: 'reEngagement',
      targets: clients.filter(c => c.status === 'paused'),
      emptyHint: 'Keine pausierten Clients.',
    },
    {
      id: 'nutrition',
      icon: '🍎',
      title: 'Ernährungs-Tipp',
      desc: 'Wöchentlicher Tipp – broadcast an alle aktiven Clients',
      color: 'border-rose-500/30 bg-rose-500/5',
      accentColor: 'text-rose-400',
      msgType: 'nutritionTip',
      targets: clients.filter(c => c.status === 'active'),
      broadcast: true,
      emptyHint: 'Keine aktiven Clients.',
    },
    {
      id: 'referral',
      icon: '🎁',
      title: 'Referral-Programm',
      desc: 'Treue Clients um Empfehlung bitten (ab 5 Sessions)',
      color: 'border-pink-500/30 bg-pink-500/5',
      accentColor: 'text-pink-400',
      msgType: 'referral',
      targets: clients.filter(c => c.status === 'active' && (c.sessions || 0) >= 5),
      emptyHint: 'Noch keine Clients mit 5+ Sessions.',
    },
  ]
}

// ─── Templates for new message types ─────────────────────────────────────────
function getTemplate(type, client, booking) {
  const first = client.name.split(' ')[0]
  switch (type) {
    case 'reminder':
      return `Hey ${first}! 📅\n\nKurze Erinnerung: ${booking?.date === new Date().toISOString().split('T')[0] ? 'Heute' : 'Morgen'} haben wir unsere ${booking?.type === 'training' ? 'Training' : booking?.type === 'nutrition' ? 'Ernährungs' : 'Check-in'}-Session um ${booking?.time || '?'} Uhr.\n\nKomm ausgeruht und gut hydriert – ich freue mich! 💪\n\nStefan`
    case 'goalReset':
      return `Hey ${first}! 🎯\n\nEin neues Quartal startet – perfekte Zeit, um deine Ziele zu schärfen.\n\nDu hast bei "${client.goal}" schon ${client.progress || 0}% erreicht. Ich würde gerne mit dir besprechen, was als nächstes kommt und ob wir den Plan anpassen.\n\nWann passt dir ein kurzes 15-Min-Gespräch? ✨\n\nStefan`
    case 'nutritionTip':
      return `Hey ${first}! 🍎\n\n📌 Dein Ernährungs-Tipp der Woche:\n\nProtein first! Starte jede Mahlzeit mit deiner Proteinquelle (Fleisch, Fisch, Hülsenfrüchte). Das sättigt länger, stabilisiert den Blutzucker und unterstützt deinen Muskelaufbau.\n\nZiel: ${Math.round(70 * 2)}g Protein täglich – verteilt auf 3-4 Mahlzeiten. 🥩\n\nFragen? Einfach melden!\nStefan`
    case 'referral':
      return `Hey ${first}! 🎁\n\nDu bist jetzt schon ${client.sessions || 0} Sessions dabei – das ist richtig stark!\n\nIch möchte dich für deine Treue belohnen: Empfiehl mir einen Freund, der mit dem Coaching startet, und du bekommst einen ganzen Monat kostenlos dazu.\n\nHast du jemanden im Kopf, dem ich helfen könnte? 😊\n\nStefan`
    default:
      return `Hey ${first}! 👋\n\nKurze Nachricht von mir – wie läuft's?\n\nStefan`
  }
}

// ─── Campaign Panel ────────────────────────────────────────────────────────────
function CampaignPanel({ campaign, onBack }) {
  const toast = useToast()
  const [messages, setMessages] = useState({})
  const [loadingMap, setLoadingMap] = useState({})
  const [sentMap, setSentMap] = useState({})
  const [generatingAll, setGeneratingAll] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastLoading, setBroadcastLoading] = useState(false)

  const setMsg = (id, text) => setMessages(m => ({ ...m, [id]: text }))
  const setLoading = (id, val) => setLoadingMap(m => ({ ...m, [id]: val }))
  const setSent = (id) => setSentMap(m => ({ ...m, [id]: true }))

  async function generateOne(client) {
    setLoading(client.id, true)
    try {
      const msg = await generateMessage(campaign.msgType, client, client._booking)
        .catch(() => getTemplate(campaign.msgType, client, client._booking))
      setMsg(client.id, msg)
    } finally {
      setLoading(client.id, false)
    }
  }

  async function generateAll() {
    setGeneratingAll(true)
    if (campaign.broadcast) {
      setBroadcastLoading(true)
      try {
        const msg = await generateMessage(campaign.msgType, campaign.targets[0] || { name: 'Client', goal: 'Fitness', plan: 'starter' })
          .catch(() => getTemplate(campaign.msgType, campaign.targets[0] || {}))
        setBroadcastMsg(msg)
      } finally {
        setBroadcastLoading(false)
      }
    } else {
      for (const client of campaign.targets) {
        await generateOne(client)
      }
    }
    setGeneratingAll(false)
    toast(`${campaign.targets.length} Nachrichten generiert`, 'success')
  }

  const sentCount = Object.values(sentMap).filter(Boolean).length

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost text-lg px-2">←</button>
        <span className="text-2xl">{campaign.icon}</span>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">{campaign.title}</h3>
          <p className="text-xs text-slate-500">{campaign.targets.length} Empfänger · {sentCount} gesendet</p>
        </div>
        <button
          onClick={generateAll}
          disabled={generatingAll || campaign.targets.length === 0}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          {generatingAll ? <><span className="animate-spin">⏳</span> Generiere…</> : <><span>✨</span> Alle generieren</>}
        </button>
      </div>

      {campaign.targets.length === 0 ? (
        <GalaxyCard className="p-8">
          <div className="empty-state">
            <span className="text-3xl">{campaign.icon}</span>
            <p className="text-slate-400">{campaign.emptyHint}</p>
          </div>
        </GalaxyCard>
      ) : campaign.broadcast ? (
        /* Broadcast: one message for all */
        <div className="space-y-3">
          <GalaxyCard className="p-4">
            <p className="text-xs text-slate-500 mb-2">Broadcast-Nachricht (wird an alle {campaign.targets.length} Clients individuell angepasst)</p>
            {broadcastLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4"><span className="animate-spin">⏳</span> Generiere…</div>
            ) : broadcastMsg ? (
              <>
                <textarea
                  className="galaxy-input text-sm font-sans leading-relaxed min-h-32 resize-y"
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { navigator.clipboard.writeText(broadcastMsg); toast('Kopiert!', 'success') }} className="btn-secondary text-xs">📋 Kopieren</button>
                </div>
              </>
            ) : (
              <p className="text-slate-600 text-sm py-4 text-center">Klicke "Alle generieren" um die Broadcast-Nachricht zu erstellen</p>
            )}
          </GalaxyCard>

          {broadcastMsg && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 px-1">Jetzt an jeden Client senden:</p>
              {campaign.targets.map(client => (
                <GalaxyCard key={client.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{client.name}</div>
                      <div className="text-xs text-slate-500">{client.email}</div>
                    </div>
                    <SendButtons
                      msg={broadcastMsg.replace(/Hey \w+/g, `Hey ${client.name.split(' ')[0]}`)}
                      client={client}
                      onSent={() => setSent(client.id)}
                      sent={sentMap[client.id]}
                    />
                  </div>
                </GalaxyCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Individual: one message per client */
        <div className="space-y-3">
          {campaign.targets.map(client => (
            <GalaxyCard key={client.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                  {client.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Client info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{client.name}</span>
                    <span className="text-[10px] text-slate-500">{client.email}</span>
                    {client._booking && (
                      <span className="chip text-[10px]">
                        {client._booking.date === new Date().toISOString().split('T')[0] ? 'Heute' : 'Morgen'} {client._booking.time}
                      </span>
                    )}
                  </div>

                  {/* Message area */}
                  {loadingMap[client.id] ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2"><span className="animate-spin">⏳</span> Generiere…</div>
                  ) : messages[client.id] ? (
                    <div className="space-y-2">
                      <textarea
                        className="galaxy-input text-xs font-sans leading-relaxed min-h-24 resize-y"
                        value={messages[client.id]}
                        onChange={e => setMsg(client.id, e.target.value)}
                      />
                      <SendButtons
                        msg={messages[client.id]}
                        client={client}
                        onSent={() => setSent(client.id)}
                        sent={sentMap[client.id]}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => generateOne(client)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      ✨ Nachricht generieren
                    </button>
                  )}
                </div>
              </div>
            </GalaxyCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const MESSAGE_TYPES = [
  { id: 'welcome', label: 'Willkommensnachricht', icon: '👋', desc: 'Für neue Clients' },
  { id: 'checkIn', label: 'Check-in', icon: '📊', desc: 'Fortschrittsbewertung' },
  { id: 'planSuggestion', label: 'Trainingsplan', icon: '💪', desc: 'Plan-Vorschlag' },
  { id: 'reEngagement', label: 'Re-Engagement', icon: '🔄', desc: 'Nach Pause' },
]

export default function AIOutreach() {
  const toast = useToast()
  const clients = clientStore.getAll()
  const bookings = bookingStore.getAll()
  const { anthropicKey } = settingsStore.get()
  const campaigns = buildCampaigns(clients, bookings)

  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '')
  const [msgType, setMsgType] = useState('welcome')
  const [generatedMsg, setGeneratedMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContext, setEmailContext] = useState('')
  const [emailResult, setEmailResult] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [activeCampaign, setActiveCampaign] = useState(null)

  const client = clients.find(c => c.id === selectedClient)

  async function generate() {
    if (!client) return toast('Bitte Client auswählen', 'warning')
    setLoading(true); setGeneratedMsg('')
    try { setGeneratedMsg(await generateMessage(msgType, client)) }
    catch (err) { toast(`Fehler: ${err.message}`, 'error') }
    finally { setLoading(false) }
  }

  async function analyze() {
    if (!client) return toast('Bitte Client auswählen', 'warning')
    setAnalysisLoading(true); setAnalysis('')
    try { setAnalysis(await analyzeProgress(client)) }
    catch (err) { toast(`Fehler: ${err.message}`, 'error') }
    finally { setAnalysisLoading(false) }
  }

  async function generateEmail() {
    if (!emailSubject.trim()) return toast('Betreff eingeben', 'warning')
    setEmailLoading(true); setEmailResult('')
    try { setEmailResult(await generateEmailTemplate(emailSubject, emailContext)) }
    catch (err) { toast(`Fehler: ${err.message}`, 'error') }
    finally { setEmailLoading(false) }
  }

  function copy(text) { navigator.clipboard.writeText(text); toast('Kopiert!', 'success') }

  if (activeCampaign) {
    return (
      <div className="fade-in max-w-3xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white">AI Outreach</h2>
          <p className="text-slate-500 text-sm">Kampagne ausführen</p>
        </div>
        <CampaignPanel campaign={activeCampaign} onBack={() => setActiveCampaign(null)} />
      </div>
    )
  }

  return (
    <div className="fade-in space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">AI Outreach</h2>
          <p className="text-slate-500 text-sm">Nachrichten generieren · Kampagnen ausführen</p>
        </div>
        {!anthropicKey ? (
          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">⚠ Template-Modus – API Key in Einstellungen</span>
        ) : (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Claude AI aktiv</span>
        )}
      </div>

      {/* Individual + Analysis */}
      <div className="grid lg:grid-cols-2 gap-5">
        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">💬 Einzelnachricht</h3>
          <div className="mb-4">
            <label className="form-label">Client</label>
            <select className="galaxy-input galaxy-select" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              <option value="">– auswählen –</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {MESSAGE_TYPES.map(t => (
              <button key={t.id} onClick={() => setMsgType(t.id)}
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${msgType === t.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}>
                <span className="text-base shrink-0">{t.icon}</span>
                <div>
                  <div className={`text-xs font-medium ${msgType === t.id ? 'text-cyan-300' : 'text-slate-300'}`}>{t.label}</div>
                  <div className="text-[10px] text-slate-500">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={loading || !client} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin">⏳</span> Generiere…</> : <>✨ Nachricht generieren</>}
          </button>
          {generatedMsg && (
            <div className="mt-4 space-y-2">
              <textarea className="galaxy-input text-sm font-sans leading-relaxed min-h-28 resize-y w-full"
                value={generatedMsg} onChange={e => setGeneratedMsg(e.target.value)} />
              <div className="flex flex-wrap gap-1.5">
                {client?.phone && (
                  <button onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g,'')}?text=${encodeURIComponent(generatedMsg)}`, '_blank')}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] text-[11px]">{WA_ICON} WhatsApp</button>
                )}
                <a href={`mailto:${client?.email}?body=${encodeURIComponent(generatedMsg)}`}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 text-[11px]">✉️ E-Mail</a>
                <button onClick={() => copy(generatedMsg)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 text-[11px]">📋 Kopieren</button>
              </div>
            </div>
          )}
        </GalaxyCard>

        <GalaxyCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">📈 Fortschrittsanalyse</h3>
          {client ? (
            <div className="mb-4 bg-slate-800/40 rounded-lg p-3 space-y-1.5">
              {[['Name', client.name], ['Ziel', client.goal], ['Fortschritt', `${client.progress}%`], ['Sessions', client.sessions], ['Status', client.status]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-500">{k}</span><span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          ) : <div className="mb-4 p-3 text-xs text-slate-600 text-center border border-slate-800 rounded-lg">Client auswählen</div>}
          <button onClick={analyze} disabled={analysisLoading || !client} className="btn-primary w-full flex items-center justify-center gap-2">
            {analysisLoading ? <><span className="animate-spin">⏳</span> Analysiere…</> : <>🔍 Analyse starten</>}
          </button>
          {analysis && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-500">Analyse</span>
                <button onClick={() => copy(analysis)} className="text-xs text-cyan-400">📋</button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-800/60 border border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto galaxy-scroll">{analysis}</pre>
            </div>
          )}
        </GalaxyCard>
      </div>

      {/* Email Generator */}
      <GalaxyCard className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">📧 E-Mail-Generator</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="form-label">Betreff</label>
            <input className="galaxy-input" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="z.B. Dein neuer Trainingsplan" />
          </div>
          <div>
            <label className="form-label">Kontext</label>
            <input className="galaxy-input" value={emailContext} onChange={e => setEmailContext(e.target.value)} placeholder="z.B. Makros angepasst, +10% Protein" />
          </div>
        </div>
        <button onClick={generateEmail} disabled={emailLoading} className="btn-primary flex items-center gap-2">
          {emailLoading ? <><span className="animate-spin">⏳</span> Generiere…</> : <>✉️ E-Mail erstellen</>}
        </button>
        {emailResult && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Generierte E-Mail</span>
              <button onClick={() => copy(emailResult)} className="text-xs text-cyan-400">📋 Kopieren</button>
            </div>
            <textarea className="galaxy-input text-sm font-sans leading-relaxed min-h-32 resize-y w-full" value={emailResult} onChange={e => setEmailResult(e.target.value)} />
          </div>
        )}
      </GalaxyCard>

      {/* Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">🚀 Kampagnen</h3>
          <span className="text-xs text-slate-500">Klicken zum Ausführen</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaigns.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCampaign(c)}
              className={`flex items-start gap-3 p-4 rounded-xl border ${c.color} hover:opacity-90 transition-all text-left group`}
            >
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-white">{c.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.desc}</div>
                <div className={`text-[11px] font-medium mt-2 ${c.accentColor}`}>
                  {c.targets.length} Empfänger → Starten
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
