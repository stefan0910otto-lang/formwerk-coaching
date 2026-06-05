export default function GalaxyCard({ children, className = '', glow = 'cyan', onClick }) {
  const glowMap = {
    cyan: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-cyan-500/40',
    purple: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-500/40',
    green: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-emerald-500/40',
    amber: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:border-amber-500/40',
    none: '',
  }

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/60 border border-slate-700/50 rounded-xl backdrop-blur-sm transition-all duration-300 ${glowMap[glow] || ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, icon, change, color = 'cyan', sub, onClick }) {
  const colorMap = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  }

  return (
    <GalaxyCard glow={color} className="p-5" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl`}>
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={`mt-3 text-xs ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% ggü. Vormonat
        </div>
      )}
    </GalaxyCard>
  )
}
