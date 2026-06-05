const STATUS_CONFIG = {
  active: { label: 'Aktiv', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  pending: { label: 'Ausstehend', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  paused: { label: 'Pausiert', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  completed: { label: 'Abgeschlossen', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  scheduled: { label: 'Geplant', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  cancelled: { label: 'Abgesagt', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  paid: { label: 'Bezahlt', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Fehlgeschlagen', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  success: { label: 'Erfolgreich', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  error: { label: 'Fehler', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  info: { label: 'Info', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
}

export default function StatusBadge({ status, custom }) {
  const cfg = STATUS_CONFIG[status] || { label: custom || status, cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

export function Dot({ status }) {
  const colors = {
    active: 'bg-emerald-400', pending: 'bg-amber-400', paused: 'bg-slate-400',
    completed: 'bg-blue-400', success: 'bg-emerald-400', failed: 'bg-red-400',
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-slate-400'}`} />
}
