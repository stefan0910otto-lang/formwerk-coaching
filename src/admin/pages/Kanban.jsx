import { useState, useRef } from 'react'
import GalaxyCard from '../components/GalaxyCard.jsx'
import { useToast } from '../components/Toast.jsx'
import { clients as store } from '../utils/storage.js'
import { fire, EVENTS } from '../utils/webhookEngine.js'

const COLUMNS = [
  { id: 'pending',   label: 'Ausstehend', icon: '⏳', color: 'border-amber-500/30',   bg: 'bg-amber-500/5',   dot: 'bg-amber-400' },
  { id: 'active',    label: 'Aktiv',      icon: '🔥', color: 'border-cyan-500/30',    bg: 'bg-cyan-500/5',    dot: 'bg-cyan-400' },
  { id: 'paused',    label: 'Pausiert',   icon: '⏸',  color: 'border-slate-500/30',   bg: 'bg-slate-500/5',   dot: 'bg-slate-400' },
  { id: 'completed', label: 'Fertig',     icon: '✅',  color: 'border-emerald-500/30', bg: 'bg-emerald-500/5', dot: 'bg-emerald-400' },
]

const PLAN_LABELS = { launch: '59€', starter: '79€', intensive: '149€' }

function ClientCard({ client, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, client.id)}
      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all hover:shadow-lg select-none group"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {client.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{client.name}</div>
        </div>
        <span className="text-xs text-slate-500 shrink-0">{PLAN_LABELS[client.plan]}</span>
      </div>
      <div className="text-xs text-slate-500 mb-2 truncate">{client.goal}</div>
      <div className="flex items-center gap-2">
        <div className="progress-bar flex-1 h-1">
          <div className="progress-fill h-1" style={{ width: `${client.progress || 0}%` }} />
        </div>
        <span className="text-[10px] text-slate-500 shrink-0">{client.progress || 0}%</span>
      </div>
      {client.sessions > 0 && (
        <div className="text-[10px] text-slate-600 mt-1">{client.sessions} Sessions</div>
      )}
    </div>
  )
}

export default function Kanban() {
  const toast = useToast()
  const [clients, setClients] = useState(() => store.getAll())
  const [dragOverCol, setDragOverCol] = useState(null)
  const dragId = useRef(null)

  function onDragStart(e, id) {
    dragId.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e, colId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  function onDragLeave() { setDragOverCol(null) }

  async function onDrop(e, newStatus) {
    e.preventDefault()
    setDragOverCol(null)
    const id = dragId.current
    if (!id) return

    const client = clients.find(c => c.id === id)
    if (!client || client.status === newStatus) return

    const oldStatus = client.status
    store.update(id, { status: newStatus })
    setClients(store.getAll())
    toast(`${client.name} → ${COLUMNS.find(c => c.id === newStatus)?.label}`, 'success')
    await fire(EVENTS.CLIENT_STATUS_CHANGED, { clientId: id, clientName: client.name, oldStatus, newStatus })
  }

  const grouped = Object.fromEntries(COLUMNS.map(c => [c.id, clients.filter(cl => cl.status === c.id)]))

  return (
    <div className="fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Kanban Board</h2>
          <p className="text-slate-500 text-sm">Clients per Drag & Drop zwischen Status verschieben · Webhook feuert automatisch</p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
          ⚡ Status-Change → <code className="text-cyan-400">client.status_changed</code>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-13rem)]">
        {COLUMNS.map(col => {
          const cards = grouped[col.id] || []
          const isOver = dragOverCol === col.id

          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, col.id)}
              className={`flex flex-col rounded-xl border ${col.color} ${col.bg} transition-all duration-200 ${isOver ? 'ring-2 ring-cyan-500/40 scale-[1.01]' : ''}`}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-800/40 shrink-0">
                <span>{col.icon}</span>
                <span className="text-sm font-semibold text-slate-300 flex-1">{col.label}</span>
                <span className={`w-5 h-5 rounded-full ${col.dot} bg-opacity-20 border border-current flex items-center justify-center text-[10px] font-bold`}
                  style={{ color: col.dot.replace('bg-', 'text-') }}>
                  {cards.length}
                </span>
              </div>

              {/* Drop zone indicator */}
              {isOver && (
                <div className="mx-3 mt-2 rounded-lg border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 h-12 flex items-center justify-center text-xs text-cyan-500">
                  Hier ablegen
                </div>
              )}

              {/* Cards */}
              <div className="flex-1 overflow-y-auto galaxy-scroll p-2 space-y-2">
                {cards.length === 0 && !isOver && (
                  <div className="flex items-center justify-center h-20 text-slate-700 text-xs text-center">
                    Ziehe einen Client hierher
                  </div>
                )}
                {cards.map(c => (
                  <ClientCard key={c.id} client={c} onDragStart={onDragStart} />
                ))}
              </div>

              {/* Column footer */}
              {col.id === 'active' && cards.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-800/40 shrink-0">
                  <div className="text-xs text-slate-500">
                    {cards.reduce((s, c) => s + (c.revenue || 0), 0)}€/Monat
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
