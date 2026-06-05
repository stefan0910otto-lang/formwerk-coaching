import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import GalaxyCard from '../components/GalaxyCard.jsx'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { clients as store, portalTokens } from '../utils/storage.js'
import { fire, EVENTS } from '../utils/webhookEngine.js'

function InlineProgress({ client, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(client.progress || 0)
  const ref = useRef(null)

  function commit() {
    setEditing(false)
    if (val !== (client.progress || 0)) onSave(client.id, val)
  }

  if (!editing) return (
    <div
      className="flex items-center gap-2 min-w-28 group cursor-pointer"
      onClick={() => setEditing(true)}
      title="Klicken zum Bearbeiten"
    >
      <div className="progress-bar flex-1 relative">
        <div className="progress-fill" style={{ width: `${client.progress || 0}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 shrink-0 group-hover:text-cyan-400 transition-colors">
        {client.progress || 0}%
      </span>
      <span className="text-slate-600 opacity-0 group-hover:opacity-100 text-xs transition-opacity">✏</span>
    </div>
  )

  return (
    <div className="flex items-center gap-2 min-w-36" ref={ref}>
      <input
        type="range" min={0} max={100} step={5}
        value={val}
        onChange={e => setVal(+e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && commit()}
        autoFocus
        className="flex-1 h-1.5 accent-cyan-500 cursor-pointer"
      />
      <span className="text-xs text-cyan-400 font-bold w-8 shrink-0">{val}%</span>
    </div>
  )
}

function InlineSessions({ client, onSave }) {
  function bump(delta) {
    const next = Math.max(0, (client.sessions || 0) + delta)
    onSave(client.id, next)
  }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => bump(-1)} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-700 text-xs transition-all">−</button>
      <span className="text-sm text-slate-300 w-5 text-center font-medium">{client.sessions || 0}</span>
      <button onClick={() => bump(1)} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-emerald-400 hover:bg-slate-700 text-xs transition-all">+</button>
    </div>
  )
}

const PLANS = { launch: 'Launch 59€', starter: 'Starter 79€', intensive: 'Intensiv 149€' }
const PLAN_REVENUE = { launch: 59, starter: 79, intensive: 149 }
const STATUSES = ['active', 'pending', 'paused', 'completed']
const GOALS = ['Muskelaufbau', 'Gewichtsabnahme', 'Fitness allgemein', 'Kraftsport', 'Ausdauer', 'Ernährungsoptimierung', 'Sonstiges']

const EMPTY_FORM = { name: '', email: '', phone: '', age: '', goal: GOALS[0], plan: 'starter', status: 'pending', startDate: new Date().toISOString().split('T')[0], notes: '' }

function ClientForm({ initial, onSave, onClose, isEdit }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    onSave({ ...form, revenue: PLAN_REVENUE[form.plan] })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Name *</label>
          <input className="galaxy-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Max Müller" required />
        </div>
        <div>
          <label className="form-label">E-Mail *</label>
          <input className="galaxy-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="max@example.com" required />
        </div>
        <div>
          <label className="form-label">Telefon</label>
          <input className="galaxy-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+49 151 ..." />
        </div>
        <div>
          <label className="form-label">Alter</label>
          <input className="galaxy-input" type="number" min="16" max="80" value={form.age} onChange={e => set('age', e.target.value)} placeholder="28" />
        </div>
        <div>
          <label className="form-label">Ziel</label>
          <select className="galaxy-input galaxy-select" value={form.goal} onChange={e => set('goal', e.target.value)}>
            {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Paket</label>
          <select className="galaxy-input galaxy-select" value={form.plan} onChange={e => set('plan', e.target.value)}>
            {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="galaxy-input galaxy-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Startdatum</label>
          <input className="galaxy-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="form-label">Notizen</label>
        <textarea className="galaxy-input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Interne Notizen..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Abbrechen</button>
        <button type="submit" className="btn-primary">
          {isEdit ? '✓ Speichern' : '+ Client hinzufügen'}
        </button>
      </div>
    </form>
  )
}

function ClientDetail({ client, onClose, onEdit, onDelete, toast }) {
  const progressColor = client.progress >= 70 ? '#10b981' : client.progress >= 40 ? '#06b6d4' : '#8b5cf6'
  const [portalLink, setPortalLink] = useState(() => {
    const existing = portalTokens.getTokenForClient(client.id)
    return existing ? `${window.location.origin}/portal/${existing}` : null
  })

  function generatePortalLink() {
    const token = portalTokens.create(client.id)
    const link = `${window.location.origin}/portal/${token}`
    setPortalLink(link)
    navigator.clipboard.writeText(link)
    toast?.('Portal-Link erstellt & kopiert!', 'success')
  }

  function copyLink() {
    navigator.clipboard.writeText(portalLink)
    toast?.('Link kopiert!', 'success')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {client.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{client.name}</h3>
          <p className="text-slate-400 text-sm">{client.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <StatusBadge status={client.status} />
            <span className="chip">{PLANS[client.plan]}</span>
            <span className="chip">{client.goal}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Fortschritt</span>
          <span style={{ color: progressColor }} className="font-semibold">{client.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${client.progress}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}99)` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions', value: client.sessions },
          { label: 'Revenue', value: `${client.revenue}€/Mo` },
          { label: 'Alter', value: client.age ? `${client.age} J.` : '–' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {[
          ['Telefon', client.phone || '–'],
          ['Startdatum', client.startDate ? new Date(client.startDate).toLocaleDateString('de-DE') : '–'],
          ['Erstellt', new Date(client.createdAt).toLocaleDateString('de-DE')],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-slate-800/50">
            <span className="text-slate-500">{k}</span>
            <span className="text-slate-300">{v}</span>
          </div>
        ))}
      </div>

      {client.notes && (
        <div className="bg-slate-800/40 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Notizen</p>
          <p className="text-sm text-slate-300">{client.notes}</p>
        </div>
      )}

      {/* Portal Link */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
        <p className="text-xs text-slate-500 mb-2">🌐 Client-Portal</p>
        {portalLink ? (
          <div className="flex gap-2">
            <input readOnly value={portalLink} className="galaxy-input text-xs font-mono flex-1 py-1.5" />
            <button onClick={copyLink} className="btn-secondary text-xs py-1.5 px-3 shrink-0">📋</button>
          </div>
        ) : (
          <button onClick={generatePortalLink} className="btn-secondary text-xs w-full">
            🔗 Portal-Link generieren
          </button>
        )}
        <p className="text-[10px] text-slate-600 mt-1.5">Client sieht Fortschritt, Sessions & Paket – kein Login nötig</p>
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <button onClick={onDelete} className="btn-danger">Löschen</button>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary">Schließen</button>
          <button onClick={onEdit} className="btn-primary">Bearbeiten</button>
        </div>
      </div>
    </div>
  )
}

function exportClientsCSV(clients) {
  const header = ['Name', 'E-Mail', 'Telefon', 'Alter', 'Ziel', 'Paket', 'Status', 'Fortschritt %', 'Sessions', 'Monatlich €', 'Start', 'Notizen']
  const rows = clients.map(c => [
    c.name, c.email, c.phone || '', c.age || '', c.goal || '',
    { launch: 'Launch', starter: 'Starter', intensive: '1:1 Intensiv' }[c.plan] || c.plan,
    c.status, c.progress || 0, c.sessions || 0, c.revenue || 0,
    c.startDate || '', (c.notes || '').replace(/\n/g, ' '),
  ])
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const [all, setAll] = useState(() => store.getAll())
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [showAdd, setShowAdd] = useState(searchParams.get('new') === '1')
  const [editClient, setEditClient] = useState(null)
  const [detailClient, setDetailClient] = useState(null)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowAdd(true)
      setSearchParams({})
    }
  }, [])

  const filtered = useMemo(() => {
    return all.filter(c => {
      const q = search.toLowerCase()
      const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.goal?.toLowerCase().includes(q)
      const matchS = filterStatus === 'all' || c.status === filterStatus
      const matchP = filterPlan === 'all' || c.plan === filterPlan
      return matchQ && matchS && matchP
    })
  }, [all, search, filterStatus, filterPlan])

  async function handleAdd(data) {
    const client = store.add(data)
    setAll(store.getAll())
    setShowAdd(false)
    toast('Client hinzugefügt — Webhook wird ausgelöst...', 'info')
    // AUTO-WEBHOOK: fires automatically on client creation
    const results = await fire(EVENTS.CLIENT_CREATED, { client })
    const fired = results.filter(r => r?.success).length
    if (fired > 0) toast(`✓ ${fired} Outreach-Webhook(s) ausgelöst für ${client.name}`, 'success')
    else toast(`Client "${client.name}" hinzugefügt`, 'success')
  }

  async function handleEdit(data) {
    const oldClient = editClient
    store.update(editClient.id, data)
    setAll(store.getAll())
    setEditClient(null)
    setDetailClient(null)
    toast('Client aktualisiert', 'success')
    if (oldClient.status !== data.status) {
      await fire(EVENTS.CLIENT_STATUS_CHANGED, { clientId: oldClient.id, oldStatus: oldClient.status, newStatus: data.status })
    } else {
      await fire(EVENTS.CLIENT_UPDATED, { clientId: oldClient.id, changes: data })
    }
  }

  function handleDelete(id) {
    if (!confirm('Client wirklich löschen?')) return
    store.remove(id)
    setAll(store.getAll())
    setDetailClient(null)
    toast('Client gelöscht', 'info')
    fire(EVENTS.CLIENT_DELETED, { clientId: id })
  }

  function handleProgressSave(id, progress) {
    store.update(id, { progress })
    setAll(store.getAll())
    toast(`Fortschritt auf ${progress}% gesetzt`, 'success')
    fire(EVENTS.CLIENT_UPDATED, { clientId: id, changes: { progress } })
  }

  function handleSessionsSave(id, sessions) {
    store.update(id, { sessions })
    setAll(store.getAll())
  }

  const activeCount = all.filter(c => c.status === 'active').length
  const monthRevenue = all.filter(c => c.status === 'active').reduce((s, c) => s + (c.revenue || 0), 0)

  return (
    <div className="fade-in space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Client Management</h2>
          <p className="text-slate-500 text-sm">{activeCount} aktive Clients · {monthRevenue}€/Monat</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportClientsCSV(all)} className="btn-secondary text-xs flex items-center gap-1.5">📥 CSV</button>
          <Link to="/admin/kanban" className="btn-secondary text-xs flex items-center gap-1.5">🗂 Kanban</Link>
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ Neuer Client</button>
        </div>
      </div>

      {/* Filters */}
      <GalaxyCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <input
            className="galaxy-input flex-1 min-w-48"
            placeholder="🔍 Name, E-Mail oder Ziel suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="galaxy-input galaxy-select w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Alle Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="galaxy-input galaxy-select w-36" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
            <option value="all">Alle Pakete</option>
            {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </GalaxyCard>

      {/* Table */}
      <GalaxyCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="galaxy-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Ziel</th>
                <th>Paket</th>
                <th>Status</th>
                <th>Fortschritt ✏</th>
                <th>Sessions</th>
                <th>Revenue</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">Keine Clients gefunden</div>
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-400">{c.goal}</td>
                  <td><span className="chip">{PLANS[c.plan]}</span></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <InlineProgress client={c} onSave={handleProgressSave} />
                  </td>
                  <td>
                    <InlineSessions client={c} onSave={handleSessionsSave} />
                  </td>
                  <td className="text-emerald-400 font-medium">{c.revenue}€/Mo</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDetailClient(c)}
                        className="btn-icon bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Details"
                      >👁</button>
                      <button
                        onClick={() => setEditClient(c)}
                        className="btn-icon bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400"
                        title="Bearbeiten"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn-icon bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400"
                        title="Löschen"
                      >🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GalaxyCard>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Neuen Client hinzufügen" size="lg">
        <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <p className="text-xs text-cyan-400">⚡ Beim Hinzufügen werden automatisch alle konfigurierten <strong>client.created</strong> Webhooks ausgelöst.</p>
        </div>
        <ClientForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editClient} onClose={() => setEditClient(null)} title="Client bearbeiten" size="lg">
        {editClient && <ClientForm isEdit initial={editClient} onSave={handleEdit} onClose={() => setEditClient(null)} />}
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailClient} onClose={() => setDetailClient(null)} title="Client Details">
        {detailClient && (
          <ClientDetail
            client={detailClient}
            onClose={() => setDetailClient(null)}
            onEdit={() => { setEditClient(detailClient); setDetailClient(null) }}
            onDelete={() => handleDelete(detailClient.id)}
            toast={toast}
          />
        )}
      </Modal>
    </div>
  )
}
