const KEYS = {
  clients: 'fw_clients',
  webhooks: 'fw_webhooks',
  webhookLogs: 'fw_webhook_logs',
  bookings: 'fw_bookings',
  payments: 'fw_payments',
  settings: 'fw_settings',
  notifications: 'fw_notifications',
  leads: 'fw_leads',
  portalTokens: 'fw_portal_tokens',
}

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clients = {
  getAll: () => read(KEYS.clients, SEED_CLIENTS),
  get: (id) => clients.getAll().find(c => c.id === id),
  add(data) {
    const all = clients.getAll()
    const client = { ...data, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    write(KEYS.clients, [client, ...all])
    return client
  },
  update(id, data) {
    const all = clients.getAll().map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    )
    write(KEYS.clients, all)
    return all.find(c => c.id === id)
  },
  remove(id) {
    write(KEYS.clients, clients.getAll().filter(c => c.id !== id))
  },
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────
export const webhooks = {
  getAll: () => read(KEYS.webhooks, []),
  get: (id) => webhooks.getAll().find(w => w.id === id),
  add(data) {
    const all = webhooks.getAll()
    const wh = { ...data, id: uuid(), successCount: 0, failureCount: 0, lastTriggered: null, createdAt: new Date().toISOString() }
    write(KEYS.webhooks, [...all, wh])
    return wh
  },
  update(id, data) {
    const all = webhooks.getAll().map(w => w.id === id ? { ...w, ...data } : w)
    write(KEYS.webhooks, all)
    return all.find(w => w.id === id)
  },
  remove(id) {
    write(KEYS.webhooks, webhooks.getAll().filter(w => w.id !== id))
  },
  recordResult(id, success) {
    const wh = webhooks.get(id)
    if (!wh) return
    webhooks.update(id, {
      lastTriggered: new Date().toISOString(),
      successCount: wh.successCount + (success ? 1 : 0),
      failureCount: wh.failureCount + (success ? 0 : 1),
    })
  },
}

// ─── Webhook Logs ─────────────────────────────────────────────────────────────
export const webhookLogs = {
  getAll: () => read(KEYS.webhookLogs, []),
  add(entry) {
    const all = webhookLogs.getAll()
    const log = { ...entry, id: uuid() }
    write(KEYS.webhookLogs, [log, ...all].slice(0, 200))
    return log
  },
  clear() { write(KEYS.webhookLogs, []) },
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = {
  getAll: () => read(KEYS.bookings, SEED_BOOKINGS),
  add(data) {
    const all = bookings.getAll()
    const booking = { ...data, id: uuid(), createdAt: new Date().toISOString() }
    write(KEYS.bookings, [booking, ...all])
    return booking
  },
  update(id, data) {
    const all = bookings.getAll().map(b => b.id === id ? { ...b, ...data } : b)
    write(KEYS.bookings, all)
  },
  remove(id) {
    write(KEYS.bookings, bookings.getAll().filter(b => b.id !== id))
  },
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = {
  getAll: () => read(KEYS.payments, SEED_PAYMENTS),
  add(data) {
    const all = payments.getAll()
    const payment = { ...data, id: uuid(), date: new Date().toISOString() }
    write(KEYS.payments, [payment, ...all])
    return payment
  },
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settings = {
  get: () => read(KEYS.settings, DEFAULT_SETTINGS),
  set(data) {
    write(KEYS.settings, { ...settings.get(), ...data })
  },
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = {
  getAll: () => read(KEYS.notifications, []),
  add(msg, type = 'info') {
    const all = notifications.getAll()
    const n = { id: uuid(), msg, type, read: false, createdAt: new Date().toISOString() }
    write(KEYS.notifications, [n, ...all].slice(0, 50))
    return n
  },
  markRead(id) {
    const all = notifications.getAll().map(n => n.id === id ? { ...n, read: true } : n)
    write(KEYS.notifications, all)
  },
  markAllRead() {
    write(KEYS.notifications, notifications.getAll().map(n => ({ ...n, read: true })))
  },
}

// ─── Leads (from contact form) ────────────────────────────────────────────────
export const leads = {
  getAll: () => read(KEYS.leads, []),
  add(data) {
    const all = leads.getAll()
    const lead = { ...data, id: uuid(), status: 'new', createdAt: new Date().toISOString() }
    write(KEYS.leads, [lead, ...all])
    return lead
  },
  markRead(id) {
    const all = leads.getAll().map(l => l.id === id ? { ...l, status: 'read' } : l)
    write(KEYS.leads, all)
  },
  remove(id) { write(KEYS.leads, leads.getAll().filter(l => l.id !== id)) },
  getUnreadCount: () => read(KEYS.leads, []).filter(l => l.status === 'new').length,
}

// ─── Portal Tokens ────────────────────────────────────────────────────────────
export const portalTokens = {
  getAll: () => read(KEYS.portalTokens, {}),
  create(clientId) {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
    const all = portalTokens.getAll()
    all[token] = { clientId, createdAt: new Date().toISOString() }
    write(KEYS.portalTokens, all)
    return token
  },
  getClientId(token) {
    return portalTokens.getAll()[token]?.clientId || null
  },
  revokeByClient(clientId) {
    const all = portalTokens.getAll()
    Object.keys(all).forEach(k => { if (all[k].clientId === clientId) delete all[k] })
    write(KEYS.portalTokens, all)
  },
  getTokenForClient(clientId) {
    const all = portalTokens.getAll()
    return Object.entries(all).find(([, v]) => v.clientId === clientId)?.[0] || null
  },
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_CLIENTS = [
  { id: '1', name: 'Max Müller', email: 'max@example.com', phone: '+49 151 1234567', age: 28, goal: 'Muskelaufbau', plan: 'intensive', status: 'active', startDate: '2026-02-01', revenue: 149, sessions: 8, progress: 65, notes: 'Sehr motiviert, kommt 4x/Woche', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
  { id: '2', name: 'Lisa Schmidt', email: 'lisa@example.com', phone: '+49 152 9876543', age: 32, goal: 'Gewichtsabnahme', plan: 'starter', status: 'active', startDate: '2026-01-15', revenue: 79, sessions: 14, progress: 42, notes: 'Fokus auf Ernährungsplan', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
  { id: '3', name: 'Tom Wagner', email: 'tom@example.com', phone: '+49 160 5551234', age: 24, goal: 'Fitness allgemein', plan: 'launch', status: 'pending', startDate: '2026-06-01', revenue: 59, sessions: 0, progress: 0, notes: 'Erstgespräch diese Woche', createdAt: '2026-05-28T14:00:00Z', updatedAt: '2026-05-28T14:00:00Z' },
  { id: '4', name: 'Anna Koch', email: 'anna@example.com', phone: '+49 170 4448888', age: 29, goal: 'Kraftsport', plan: 'intensive', status: 'active', startDate: '2026-03-10', revenue: 149, sessions: 11, progress: 78, notes: 'Großartige Fortschritte', createdAt: '2026-03-10T11:00:00Z', updatedAt: '2026-03-10T11:00:00Z' },
  { id: '5', name: 'Ben Braun', email: 'ben@example.com', phone: '+49 176 3337777', age: 35, goal: 'Ausdauer', plan: 'starter', status: 'paused', startDate: '2025-11-01', revenue: 79, sessions: 6, progress: 30, notes: 'Pause wegen Urlaub', createdAt: '2025-11-01T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z' },
]

const today = new Date()
const SEED_BOOKINGS = [
  { id: 'b1', clientId: '1', clientName: 'Max Müller', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0], time: '10:00', duration: 60, type: 'training', status: 'scheduled', notes: 'Push-Tag', createdAt: new Date().toISOString() },
  { id: 'b2', clientId: '4', clientName: 'Anna Koch', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0], time: '14:00', duration: 60, type: 'check-in', status: 'scheduled', notes: 'Fortschrittskontrolle', createdAt: new Date().toISOString() },
  { id: 'b3', clientId: '2', clientName: 'Lisa Schmidt', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().split('T')[0], time: '11:00', duration: 45, type: 'nutrition', status: 'completed', notes: 'Makros besprochen', createdAt: new Date().toISOString() },
]

const SEED_PAYMENTS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return [
    { id: `p${i}a`, clientId: '1', clientName: 'Max Müller', amount: 149, plan: 'Intensiv', status: 'paid', date: d.toISOString(), stripeId: `pi_${Math.random().toString(36).slice(2)}` },
    { id: `p${i}b`, clientId: '4', clientName: 'Anna Koch', amount: 149, plan: 'Intensiv', status: 'paid', date: d.toISOString(), stripeId: `pi_${Math.random().toString(36).slice(2)}` },
    { id: `p${i}c`, clientId: '2', clientName: 'Lisa Schmidt', amount: 79, plan: 'Starter', status: i === 0 ? 'pending' : 'paid', date: d.toISOString(), stripeId: i === 0 ? null : `pi_${Math.random().toString(36).slice(2)}` },
  ]
}).flat()

const DEFAULT_SETTINGS = {
  anthropicKey: '',
  stripeKey: '',
  adminName: 'Stefan',
  adminEmail: 'stefan0910otto@gmail.com',
  webhookSecret: 'fw-secret-' + Math.random().toString(36).slice(2, 10),
  notifyOnNewClient: true,
  notifyOnPayment: true,
  notifyOnBooking: true,
  theme: 'galaxy',
}
