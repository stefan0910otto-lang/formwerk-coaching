import { useState, useMemo } from 'react'
import GalaxyCard from '../components/GalaxyCard.jsx'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { webhooks as store, webhookLogs as logStore } from '../utils/storage.js'
import { test as testWebhook, EVENTS, EVENT_LABELS } from '../utils/webhookEngine.js'

const ALL_EVENTS = Object.values(EVENTS)

const EMPTY_FORM = {
  name: '',
  url: '',
  events: [EVENTS.CLIENT_CREATED],
  headers: '',
  active: true,
}

function parseHeaders(raw) {
  if (!raw?.trim()) return {}
  return Object.fromEntries(
    raw.split('\n').map(l => l.split(':').map(s => s.trim())).filter(([k]) => k)
  )
}

function WebhookForm({ initial, onSave, onClose, isEdit }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    headers: Object.entries(initial.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
    events: initial.events || [],
  } : EMPTY_FORM)

  const toggleEvent = (ev) => setForm(f => ({
    ...f,
    events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
  }))

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    try { new URL(form.url) } catch { alert('Ungültige URL'); return }
    onSave({ ...form, headers: parseHeaders(form.headers) })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="form-label">Name *</label>
        <input className="galaxy-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Outreach CRM" required />
      </div>
      <div>
        <label className="form-label">Webhook URL *</label>
        <input className="galaxy-input font-mono text-xs" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://hooks.zapier.com/hooks/..." required />
      </div>

      <div>
        <label className="form-label">Events (mindestens 1 auswählen)</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {ALL_EVENTS.map(ev => (
            <label key={ev} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${form.events.includes(ev) ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={form.events.includes(ev)}
                onChange={() => toggleEvent(ev)}
              />
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${form.events.includes(ev) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'}`}>
                {form.events.includes(ev) && <span className="text-white text-[9px]">✓</span>}
              </span>
              <span className="truncate">{EVENT_LABELS[ev] || ev}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Custom Headers (optional, ein pro Zeile)</label>
        <textarea className="galaxy-input font-mono text-xs" rows={3} value={form.headers} onChange={e => setForm(f => ({ ...f, headers: e.target.value }))} placeholder={'Authorization: Bearer token123\nX-Custom-Header: value'} />
      </div>

      <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            className={`w-10 h-5 rounded-full transition-all relative ${form.active ? 'bg-cyan-500' : 'bg-slate-700'}`}
            onClick={() => setForm(f => ({ ...f, active: !f.active }))}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm text-slate-300">Webhook aktiv</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Abbrechen</button>
        <button type="submit" className="btn-primary">{isEdit ? 'Speichern' : 'Webhook erstellen'}</button>
      </div>
    </form>
  )
}

export default function Webhooks() {
  const toast = useToast()
  const [all, setAll] = useState(() => store.getAll())
  const [logs, setLogs] = useState(() => logStore.getAll())
  const [showAdd, setShowAdd] = useState(false)
  const [editWh, setEditWh] = useState(null)
  const [testing, setTesting] = useState(null)
  const [activeTab, setActiveTab] = useState('webhooks')
  const [logFilter, setLogFilter] = useState('all')

  function refresh() { setAll(store.getAll()); setLogs(logStore.getAll()) }

  function handleAdd(data) {
    store.add(data)
    refresh()
    setShowAdd(false)
    toast(`Webhook "${data.name}" erstellt`, 'success')
  }

  function handleEdit(data) {
    store.update(editWh.id, data)
    refresh()
    setEditWh(null)
    toast('Webhook aktualisiert', 'success')
  }

  function handleDelete(id, name) {
    if (!confirm(`Webhook "${name}" löschen?`)) return
    store.remove(id)
    refresh()
    toast('Webhook gelöscht', 'info')
  }

  function toggleActive(wh) {
    store.update(wh.id, { active: !wh.active })
    refresh()
    toast(`Webhook "${wh.name}" ${!wh.active ? 'aktiviert' : 'deaktiviert'}`, 'info')
  }

  async function handleTest(id, name) {
    setTesting(id)
    try {
      const result = await testWebhook(id)
      setLogs(logStore.getAll())
      if (result.success) toast(`✓ Test erfolgreich (${result.statusCode}, ${result.duration}ms)`, 'success')
      else toast(`✕ Test fehlgeschlagen: ${result.error || result.statusCode}`, 'error')
    } catch (err) {
      toast(`Fehler: ${err.message}`, 'error')
    } finally {
      setTesting(null)
      refresh()
    }
  }

  const filteredLogs = useMemo(() =>
    logFilter === 'all' ? logs : logs.filter(l => l.status === logFilter),
    [logs, logFilter]
  )

  const totalFired = all.reduce((s, w) => s + w.successCount + w.failureCount, 0)
  const totalSuccess = all.reduce((s, w) => s + w.successCount, 0)

  return (
    <div className="fade-in space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Webhook Engine</h2>
          <p className="text-slate-500 text-sm">{all.length} Webhooks · {totalFired} ausgelöst · {totalSuccess} erfolgreich</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Webhook erstellen</button>
      </div>

      {/* Info banner */}
      <GalaxyCard className="p-4" glow="cyan">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-semibold text-cyan-300">Automatische Trigger</p>
            <p className="text-xs text-slate-400 mt-1">
              Webhooks werden automatisch ausgelöst, wenn Events eintreten (z.B. neuer Client → <code className="text-cyan-400 bg-slate-800 px-1 rounded">client.created</code>).
              Verbinde sie mit Zapier, Make, Pipedream oder deinem eigenen Backend.
            </p>
          </div>
        </div>
      </GalaxyCard>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['webhooks', '🔗 Webhooks'], ['logs', '📋 Log']].map(([t, l]) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-300'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === 'webhooks' && (
        <div className="space-y-3">
          {all.length === 0 ? (
            <GalaxyCard className="p-8">
              <div className="empty-state">
                <span className="text-4xl">🔗</span>
                <p className="font-medium text-slate-400">Noch keine Webhooks</p>
                <p className="text-sm text-slate-600">Erstelle deinen ersten Webhook, um automatische Trigger zu nutzen.</p>
                <button onClick={() => setShowAdd(true)} className="btn-primary mt-2">+ Webhook erstellen</button>
              </div>
            </GalaxyCard>
          ) : all.map(wh => (
            <GalaxyCard key={wh.id} glow={wh.active ? 'cyan' : 'none'} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                {/* Toggle */}
                <div
                  className={`mt-1 w-10 h-5 rounded-full cursor-pointer transition-all relative shrink-0 ${wh.active ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  onClick={() => toggleActive(wh)}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${wh.active ? 'left-5' : 'left-0.5'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{wh.name}</span>
                    {!wh.active && <span className="text-xs text-slate-500">(inaktiv)</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1 truncate">{wh.url}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(wh.events || []).map(ev => (
                      <span key={ev} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        {EVENT_LABELS[ev] || ev}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-center shrink-0">
                  <div>
                    <div className="text-sm font-bold text-emerald-400">{wh.successCount}</div>
                    <div className="text-[10px] text-slate-600">OK</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-red-400">{wh.failureCount}</div>
                    <div className="text-[10px] text-slate-600">Fehler</div>
                  </div>
                  {wh.lastTriggered && (
                    <div className="hidden sm:block">
                      <div className="text-xs text-slate-400">{new Date(wh.lastTriggered).toLocaleDateString('de-DE')}</div>
                      <div className="text-[10px] text-slate-600">Zuletzt</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleTest(wh.id, wh.name)}
                    disabled={testing === wh.id || !wh.active}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    {testing === wh.id ? '⏳' : '▶'} Test
                  </button>
                  <button onClick={() => setEditWh(wh)} className="btn-ghost text-xs">✏️</button>
                  <button onClick={() => handleDelete(wh.id, wh.name)} className="btn-ghost text-red-400 hover:text-red-300 text-xs">🗑</button>
                </div>
              </div>
            </GalaxyCard>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <GalaxyCard className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
            <span className="text-sm font-semibold text-white">{filteredLogs.length} Einträge</span>
            <div className="flex gap-2">
              {['all', 'success', 'failed'].map(f => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${logFilter === f ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {f === 'all' ? 'Alle' : f === 'success' ? '✓ OK' : '✕ Fehler'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[500px] galaxy-scroll">
            {filteredLogs.length === 0 ? (
              <div className="empty-state">Keine Log-Einträge</div>
            ) : filteredLogs.slice(0, 100).map(log => (
              <div key={log.id} className={`flex gap-4 px-4 py-3 border-b border-slate-800/30 text-xs ${log.status === 'success' ? 'log-success' : 'log-failed'}`}>
                <div className="shrink-0 mt-0.5">
                  <StatusBadge status={log.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-300">{log.webhookName}</span>
                    <span className="text-slate-600">·</span>
                    <code className="text-cyan-400">{log.event}</code>
                    {log.statusCode && <span className="text-slate-500">HTTP {log.statusCode}</span>}
                    <span className="text-slate-600">{log.duration}ms</span>
                  </div>
                  {log.response && <p className="text-slate-600 mt-0.5 truncate">{log.response}</p>}
                </div>
                <div className="text-slate-600 shrink-0">
                  {new Date(log.timestamp).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </GalaxyCard>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Webhook erstellen" size="lg">
        <WebhookForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!editWh} onClose={() => setEditWh(null)} title="Webhook bearbeiten" size="lg">
        {editWh && <WebhookForm isEdit initial={editWh} onSave={handleEdit} onClose={() => setEditWh(null)} />}
      </Modal>
    </div>
  )
}
