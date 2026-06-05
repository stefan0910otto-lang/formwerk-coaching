import { useState, useEffect, useRef } from 'react'

const HASH_KEY = 'fw_pin_hash'
const SESSION_KEY = 'fw_unlocked'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function useAdminLock() {
  const hasPin = !!localStorage.getItem(HASH_KEY)
  const unlocked = sessionStorage.getItem(SESSION_KEY) === '1'
  return { locked: hasPin && !unlocked, hasPin }
}

export function clearAdminPin() {
  localStorage.removeItem(HASH_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export default function AdminLock({ onUnlock }) {
  const hasPin = !!localStorage.getItem(HASH_KEY)
  const [mode, setMode] = useState(hasPin ? 'enter' : 'setup')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [mode])

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  async function handleSetup(e) {
    e.preventDefault()
    if (pin.length < 4) { setError('Mindestens 4 Zeichen'); return }
    if (pin !== confirm) { setError('PINs stimmen nicht überein'); triggerShake(); setPin(''); setConfirm(''); return }
    setLoading(true)
    const hash = await sha256(pin)
    localStorage.setItem(HASH_KEY, hash)
    sessionStorage.setItem(SESSION_KEY, '1')
    onUnlock()
  }

  async function handleEnter(e) {
    e.preventDefault()
    if (!pin) return
    setLoading(true)
    const hash = await sha256(pin)
    const stored = localStorage.getItem(HASH_KEY)
    if (hash === stored) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onUnlock()
    } else {
      setError('Falscher PIN')
      triggerShake()
      setPin('')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center galaxy-bg">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative w-full max-w-sm mx-4 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-cyan-500/30 mb-4">
            FW
          </div>
          <h1 className="text-xl font-bold text-white">Formwerk Master-OS</h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'setup' ? 'PIN einrichten' : 'Bitte einloggen'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
          {mode === 'setup' ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="form-label">PIN festlegen (min. 4 Zeichen)</label>
                <input
                  ref={inputRef}
                  type="password"
                  className="galaxy-input text-center text-xl tracking-widest"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError('') }}
                  placeholder="••••"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="form-label">PIN bestätigen</label>
                <input
                  type="password"
                  className="galaxy-input text-center text-xl tracking-widest"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  placeholder="••••"
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                PIN speichern & einloggen
              </button>
            </form>
          ) : (
            <form onSubmit={handleEnter} className="space-y-4">
              <div>
                <label className="form-label text-center block">Dein PIN</label>
                <input
                  ref={inputRef}
                  type="password"
                  className="galaxy-input text-center text-2xl tracking-widest"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError('') }}
                  placeholder="••••"
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button type="submit" disabled={loading || !pin} className="btn-primary w-full">
                {loading ? '⏳ Prüfe...' : '🔓 Entsperren'}
              </button>
              <button
                type="button"
                onClick={() => { localStorage.removeItem(HASH_KEY); setMode('setup'); setPin(''); setError('') }}
                className="btn-ghost w-full text-xs text-slate-600 hover:text-slate-400"
              >
                PIN vergessen? Zurücksetzen
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  )
}
