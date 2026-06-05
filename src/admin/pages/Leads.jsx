import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GalaxyCard from '../components/GalaxyCard.jsx'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { leads as store, clients as clientStore } from '../utils/storage.js'
import { fire, EVENTS } from '../utils/webhookEngine.js'

const PLAN_SUGGESTION = {
  'Muskelaufbau': 'intensive',
  'Fettverlust': 'starter',
  'Gewichtsabnahme': 'starter',
  'Allgemein fitter werden': 'launch',
  'Struktur in Training und Ernährung': 'starter',
  default: 'starter',
}

function exportLeadsCSV(leads) {
  const header = ['Name', 'E-Mail', 'Alter', 'Ziel', 'Erfahrung', 'Angebot', 'Status', 'Datum', 'Nachricht']
  const rows = leads.map(l => [
    l.name, l.email, l.age || '', l.goal || '', l.experience || '',
    l.offer || '', l.status, new Date(l.createdAt).toLocaleDateString('de-DE'),
    (l.message || '').replace(/\n/g, ' '),
  ])
  const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function Leads() {
  const toast = useToast()
  const navigate = useNavigate()
  const [all, setAll] = useState(() => store.getAll())
  const [selected, setSelected] = useState(null)
  const [converting, setConverting] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refresh = useCallback(() => {
    setAll(store.getAll())
    setLastUpdated(new Date())
  }, [])

  // Cross-tab: standard storage event. Same-tab: custom event from App.jsx
  useEffect(() => {
    function onStorage(e) {
      if (!e.key || e.key === 'fw_leads') refresh()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('fw_lead_added', refresh)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('fw_lead_added', refresh)
    }
  }, [refresh])

  function open(lead) {
    store.markRead(lead.id)
    refresh()
    setSelected(lead)
  }

  function deleteLead(id) {
    store.remove(id)
    refresh()
    setSelected(null)
    toast('Lead gelöscht', 'info')
  }

  async function convertToClient(lead) {
    const client = clientStore.add({
      name: lead.name,
      email: lead.email,
      phone: '',
      age: lead.age || '',
      goal: lead.goal || 'Fitness allgemein',
      plan: PLAN_SUGGESTION[lead.goal] || PLAN_SUGGESTION.default,
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      revenue: { launch: 59, starter: 79, intensive: 149 }[PLAN_SUGGESTION[lead.goal] || 'starter'],
      sessions: 0,
      progress: 0,
      notes: `Ursprung: Kontaktformular\nNachricht: ${lead.message || ''}`,
    })
    store.remove(lead.id)
    refresh()
    setConverting(null)
    toast(`${lead.name} als Client angelegt!`, 'success')
    const results = await fire(EVENTS.CLIENT_CREATED, { client, source: 'lead-conversion' })
    const fired = results.filter(r => r?.success).length
    if (fired > 0) toast(`✓ ${fired} Outreach-Webhook(s) ausgelöst`, 'success')
  }

  function addTestLead() {
    const testLead = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: 'Test Anfrage',
      email: 'test@example.com',
      age: '28',
      goal: 'Muskelaufbau',
      experience: 'Wenig Erfahrung',
      message: 'Dies ist ein Test-Lead um die Pipeline zu überprüfen.',
      offer: 'Starter Coaching',
      status: 'new',
      source: 'test',
      createdAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('fw_leads') || '[]')
    localStorage.setItem('fw_leads', JSON.stringify([testLead, ...existing]))
    refresh()
    toast('Test-Lead eingefügt ✓', 'success')
  }

  const newCount = all.filter(l => l.status === 'new').length

  return (
    <div className="fade-in space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Leads</h2>
          <p className="text-slate-500 text-sm">
            {all.length} gesamt · <span className="text-cyan-400 font-medium">{newCount} neu</span>
            <span className="ml-2 text-slate-600">· Aktualisiert {lastUpdated.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {all.length > 0 && (
            <button onClick={() => exportLeadsCSV(all)} className="btn-secondary text-xs flex items-center gap-1.5">
              📥 CSV
            </button>
          )}
          <button onClick={addTestLead} className="btn-secondary text-xs flex items-center gap-1.5" title="Test-Lead einfügen um Pipeline zu prüfen">
            🧪 Test
          </button>
          <button onClick={refresh} className="btn-ghost text-xs flex items-center gap-1.5" title="Neu laden">
            🔄
          </button>
        </div>
      </div>

      {newCount === 0 && all.length === 0 && (
        <GalaxyCard className="p-3" glow="none">
          <p className="text-xs text-slate-500 text-center">
            Neue Anfragen von <code className="text-cyan-400">/#kontakt</code> erscheinen hier automatisch.
            Verwende den Button oben rechts zum manuellen Aktualisieren.
          </p>
        </GalaxyCard>
      )}

      {all.length === 0 ? (
        <GalaxyCard className="p-12">
          <div className="empty-state">
            <span className="text-4xl">📬</span>
            <p className="text-slate-400 font-medium">Noch keine Leads</p>
            <p className="text-sm text-slate-600">Wenn jemand das Kontaktformular auf deiner Website ausfüllt, erscheint er hier.</p>
          </div>
        </GalaxyCard>
      ) : (
        <div className="space-y-2">
          {all.map(lead => (
            <GalaxyCard
              key={lead.id}
              glow={lead.status === 'new' ? 'cyan' : 'none'}
              className="p-4 cursor-pointer"
              onClick={() => open(lead)}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${lead.status === 'new' ? 'bg-cyan-400 pulse-glow' : 'bg-slate-600'}`} />
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {lead.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{lead.name}</div>
                    <div className="text-xs text-slate-500 truncate">{lead.email}</div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm text-slate-400">
                  <span>🎯 {lead.goal}</span>
                  {lead.phone && <span className="text-xs text-slate-500">📱 {lead.phone}</span>}
                  {lead.offer && <span className="chip">{lead.offer}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-600">
                    {new Date(lead.createdAt).toLocaleDateString('de-DE')}
                  </span>
                  {lead.status === 'new' && <span className="chip">Neu</span>}
                  {/* Quick actions — stop propagation so they don't open modal */}
                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent('Deine Anfrage bei Formwerk Coaching')}&body=${encodeURIComponent(`Hallo ${lead.name},\n\nvielen Dank für deine Anfrage! Ich freue mich, dir bei deinem Ziel "${lead.goal}" zu helfen.\n\nBeste Grüße,\nStefan`)}`}
                    onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
                    title="E-Mail antworten"
                  >✉️</a>
                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hallo ${lead.name?.split(' ')[0]}, vielen Dank für deine Anfrage bei Formwerk Coaching! Ich melde mich kurz wegen deiner Anfrage 😊`)}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-all text-xs"
                      title="WhatsApp"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </GalaxyCard>
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Lead Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {selected.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <p className="text-slate-400">{selected.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['E-Mail', selected.email],
                ['Telefon', selected.phone || '–'],
                ['Ziel', selected.goal],
                ['Alter', selected.age || '–'],
                ['Erfahrung', selected.experience || '–'],
                ['Angebot-Interesse', selected.offer || '–'],
                ['Datum', new Date(selected.createdAt).toLocaleString('de-DE')],
                ['Quelle', selected.source || 'Kontaktformular'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-800/40 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                  <div className="text-sm text-slate-200">{v}</div>
                </div>
              ))}
            </div>

            {selected.message && (
              <div className="bg-slate-800/40 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Nachricht</div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selected.message}</p>
              </div>
            )}

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-xs text-cyan-300">
                💡 Empfohlenes Paket: <strong>{
                  { launch: 'Launch Offer (59€)', starter: 'Starter Coaching (79€)', intensive: '1:1 Intensiv (149€)' }[PLAN_SUGGESTION[selected.goal] || 'starter']
                }</strong>
              </p>
            </div>

            <div className="flex justify-between gap-3 pt-2 flex-wrap">
              <button onClick={() => deleteLead(selected.id)} className="btn-danger">Löschen</button>
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent('Deine Anfrage bei Formwerk Coaching')}&body=${encodeURIComponent(`Hallo ${selected.name?.split(' ')[0]},\n\nvielen Dank für deine Anfrage! Ich würde mich gern mit dir über dein Ziel "${selected.goal}" austauschen.\n\nWann passt dir ein kurzes Gespräch?\n\nViele Grüße,\nStefan`)}`}
                  className="btn-secondary"
                >✉️ E-Mail</a>
                {selected.phone && (
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hallo ${selected.name?.split(' ')[0]}! 👋 Ich bin Stefan von Formwerk Coaching. Danke für deine Anfrage! Ich würde mich gern kurz mit dir über dein Ziel "${selected.goal}" unterhalten. Wann hast du ein paar Minuten?`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366]/20 text-sm font-medium transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                )}
                <button onClick={() => { setConverting(selected); setSelected(null) }} className="btn-primary">
                  👤 Als Client anlegen
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Convert confirmation */}
      <Modal open={!!converting} onClose={() => setConverting(null)} title="Lead zu Client konvertieren?">
        {converting && (
          <div className="space-y-4">
            <p className="text-slate-300">
              <strong className="text-white">{converting.name}</strong> wird als neuer Client angelegt (Status: Ausstehend).
              Alle konfigurierten <code className="text-cyan-400 text-xs">client.created</code> Webhooks werden ausgelöst.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConverting(null)} className="btn-secondary">Abbrechen</button>
              <button onClick={() => convertToClient(converting)} className="btn-primary">✓ Konvertieren & Webhook feuern</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
