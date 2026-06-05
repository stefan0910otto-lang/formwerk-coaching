import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import GalaxyCard from '../components/GalaxyCard.jsx'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { bookings as store, clients as clientStore } from '../utils/storage.js'
import { fire, EVENTS } from '../utils/webhookEngine.js'

const TYPES = { 'check-in': 'Check-in', training: 'Training', nutrition: 'Ernährung', kickoff: 'Kickoff' }
const DURATIONS = [30, 45, 60, 90]
const TYPE_ICONS = { 'check-in': '📊', training: '💪', nutrition: '🥗', kickoff: '🚀' }

const EMPTY_FORM = {
  clientId: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  duration: 60,
  type: 'training',
  status: 'scheduled',
  notes: '',
}

function BookingForm({ initial, onSave, onClose, isEdit }) {
  const clients = clientStore.getAll().filter(c => c.status === 'active' || c.status === 'pending')
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    if (!form.clientId || !form.date) return
    const client = clients.find(c => c.id === form.clientId)
    onSave({ ...form, clientName: client?.name || 'Unbekannt' })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="form-label">Client *</label>
        <select className="galaxy-input galaxy-select" value={form.clientId} onChange={e => set('clientId', e.target.value)} required>
          <option value="">– Client wählen –</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Datum *</label>
          <input className="galaxy-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Uhrzeit</label>
          <input className="galaxy-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Typ</label>
          <select className="galaxy-input galaxy-select" value={form.type} onChange={e => set('type', e.target.value)}>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Dauer (Min.)</label>
          <select className="galaxy-input galaxy-select" value={form.duration} onChange={e => set('duration', +e.target.value)}>
            {DURATIONS.map(d => <option key={d} value={d}>{d} Min.</option>)}
          </select>
        </div>
      </div>
      {isEdit && (
        <div>
          <label className="form-label">Status</label>
          <select className="galaxy-input galaxy-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {['scheduled', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="form-label">Notizen</label>
        <textarea className="galaxy-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Worauf liegt der Fokus?" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Abbrechen</button>
        <button type="submit" className="btn-primary">{isEdit ? 'Speichern' : 'Session buchen'}</button>
      </div>
    </form>
  )
}

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const [all, setAll] = useState(() => store.getAll())
  const [showAdd, setShowAdd] = useState(false)
  const [editBooking, setEditBooking] = useState(null)
  const [view, setView] = useState('upcoming')

  useEffect(() => {
    if (searchParams.get('new') === '1') { setShowAdd(true); setSearchParams({}) }
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filtered = useMemo(() => {
    const sorted = [...all].sort((a, b) => a.date.localeCompare(b.date))
    if (view === 'upcoming') return sorted.filter(b => b.date >= today && b.status === 'scheduled')
    if (view === 'past') return sorted.filter(b => b.date < today || b.status !== 'scheduled').reverse()
    return sorted
  }, [all, view, today])

  async function handleAdd(data) {
    const booking = store.add(data)
    setAll(store.getAll())
    setShowAdd(false)
    toast('Session gebucht', 'success')
    await fire(EVENTS.BOOKING_CREATED, { booking })
  }

  function handleEdit(data) {
    const old = editBooking
    store.update(editBooking.id, data)
    setAll(store.getAll())
    setEditBooking(null)
    toast('Session aktualisiert', 'success')
    if (old.status !== data.status && data.status === 'completed') {
      fire(EVENTS.BOOKING_COMPLETED, { bookingId: old.id, clientName: old.clientName })
    }
  }

  function handleDelete(id) {
    if (!confirm('Session löschen?')) return
    store.remove(id)
    setAll(store.getAll())
    toast('Session gelöscht', 'info')
  }

  function markComplete(id) {
    store.update(id, { status: 'completed' })
    setAll(store.getAll())
    toast('Als abgeschlossen markiert', 'success')
    const b = all.find(x => x.id === id)
    if (b) fire(EVENTS.BOOKING_COMPLETED, { bookingId: id, clientName: b.clientName })
  }

  const upcoming = all.filter(b => b.date >= today && b.status === 'scheduled').length
  const thisWeek = all.filter(b => {
    const d = new Date(b.date)
    const now = new Date()
    const diff = (d - now) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7 && b.status === 'scheduled'
  }).length

  return (
    <div className="fade-in space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Buchungen & Sessions</h2>
          <p className="text-slate-500 text-sm">{upcoming} bevorstehend · {thisWeek} diese Woche</p>
        </div>
        <div className="flex gap-2">
          <a
            href={import.meta.env.VITE_CALENDLY_URL}
            target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            📅 Calendly öffnen
          </a>
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ Session buchen</button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-2">
        {[['upcoming', '⏭ Bevorstehend'], ['past', '⏮ Vergangen'], ['all', '📋 Alle']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-300'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <GalaxyCard className="p-8">
          <div className="empty-state">
            <span className="text-4xl">📅</span>
            <p className="text-slate-400 font-medium">Keine Sessions gefunden</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-2">+ Session buchen</button>
          </div>
        </GalaxyCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const isToday = b.date === today
            const isFuture = b.date > today

            return (
              <GalaxyCard key={b.id} glow={b.status === 'completed' ? 'none' : 'purple'} className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Date badge */}
                  <div className={`text-center w-14 shrink-0 rounded-lg p-2 ${isToday ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-slate-800'}`}>
                    <div className="text-lg font-bold text-white leading-none">{new Date(b.date).getDate()}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(b.date + 'T00:00:00').toLocaleDateString('de-DE', { month: 'short' })}
                    </div>
                  </div>

                  {/* Type icon */}
                  <div className="text-2xl w-8 text-center shrink-0">{TYPE_ICONS[b.type] || '📅'}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{b.clientName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-sm">{TYPES[b.type]}</span>
                      {isToday && <span className="chip text-purple-300 bg-purple-500/10 border-purple-500/20">Heute</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>🕐 {b.time} Uhr</span>
                      <span>⏱ {b.duration} Min.</span>
                      {b.notes && <span className="truncate">📝 {b.notes}</span>}
                    </div>
                  </div>

                  <StatusBadge status={b.status} />

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {b.status === 'scheduled' && (
                      <button onClick={() => markComplete(b.id)} className="btn-secondary text-xs py-1.5 px-3">✓ Fertig</button>
                    )}
                    <button onClick={() => setEditBooking(b)} className="btn-ghost text-xs">✏️</button>
                    <button onClick={() => handleDelete(b.id)} className="btn-ghost text-red-400 text-xs">🗑</button>
                  </div>
                </div>
              </GalaxyCard>
            )
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Session buchen">
        <BookingForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editBooking} onClose={() => setEditBooking(null)} title="Session bearbeiten">
        {editBooking && <BookingForm isEdit initial={editBooking} onSave={handleEdit} onClose={() => setEditBooking(null)} />}
      </Modal>
    </div>
  )
}
