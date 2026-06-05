/**
 * Supabase Adapter — drop-in replacement for storage.js
 *
 * SETUP (5 minutes):
 * 1. Create free account at supabase.com
 * 2. New project → copy URL + anon key
 * 3. Add to .env:
 *      VITE_SUPABASE_URL=https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJ...
 * 4. Run the SQL schema below in Supabase SQL Editor
 * 5. In storage.js, change the last line to:
 *      export * from './supabaseAdapter.js'
 *
 * SQL SCHEMA (paste into Supabase SQL Editor):
 * ─────────────────────────────────────────────
 * create table clients (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   email text not null,
 *   phone text,
 *   age int,
 *   goal text,
 *   plan text default 'starter',
 *   status text default 'pending',
 *   start_date date,
 *   revenue int default 0,
 *   sessions int default 0,
 *   progress int default 0,
 *   notes text,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now()
 * );
 *
 * create table webhooks (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   url text not null,
 *   events text[] default '{}',
 *   headers jsonb default '{}',
 *   active boolean default true,
 *   success_count int default 0,
 *   failure_count int default 0,
 *   last_triggered timestamptz,
 *   created_at timestamptz default now()
 * );
 *
 * create table webhook_logs (
 *   id uuid primary key default gen_random_uuid(),
 *   webhook_id uuid references webhooks(id) on delete cascade,
 *   webhook_name text,
 *   event text,
 *   url text,
 *   status text,
 *   status_code int,
 *   duration int,
 *   payload jsonb,
 *   response text,
 *   timestamp timestamptz default now()
 * );
 *
 * create table bookings (
 *   id uuid primary key default gen_random_uuid(),
 *   client_id uuid references clients(id) on delete cascade,
 *   client_name text,
 *   date date,
 *   time text,
 *   duration int default 60,
 *   type text default 'training',
 *   status text default 'scheduled',
 *   notes text,
 *   created_at timestamptz default now()
 * );
 *
 * create table payments (
 *   id uuid primary key default gen_random_uuid(),
 *   client_id uuid references clients(id) on delete set null,
 *   client_name text,
 *   amount int,
 *   plan text,
 *   status text default 'pending',
 *   date timestamptz default now(),
 *   stripe_id text
 * );
 *
 * create table leads (
 *   id uuid primary key default gen_random_uuid(),
 *   name text,
 *   email text,
 *   age text,
 *   goal text,
 *   experience text,
 *   message text,
 *   offer text,
 *   source text default 'contact-form',
 *   status text default 'new',
 *   created_at timestamptz default now()
 * );
 *
 * -- Enable Row Level Security (open for now, restrict in production)
 * alter table clients enable row level security;
 * create policy "Allow all" on clients for all using (true) with check (true);
 * -- repeat for all tables
 * ─────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set – falling back to localStorage')
}

const sb = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

function camel(obj) {
  if (!obj) return obj
  const map = { client_id: 'clientId', webhook_id: 'webhookId', webhook_name: 'webhookName', start_date: 'startDate', success_count: 'successCount', failure_count: 'failureCount', last_triggered: 'lastTriggered', created_at: 'createdAt', updated_at: 'updatedAt', stripe_id: 'stripeId', status_code: 'statusCode' }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [map[k] || k, v]))
}
function snake(obj) {
  const map = { clientId: 'client_id', webhookId: 'webhook_id', webhookName: 'webhook_name', startDate: 'start_date', successCount: 'success_count', failureCount: 'failure_count', lastTriggered: 'last_triggered', createdAt: 'created_at', updatedAt: 'updated_at', stripeId: 'stripe_id', statusCode: 'status_code' }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [map[k] || k, v]))
}

async function query(table, fn) {
  if (!sb) throw new Error('Supabase not configured')
  const { data, error } = await fn(sb.from(table))
  if (error) throw error
  return Array.isArray(data) ? data.map(camel) : camel(data)
}

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clients = {
  getAll: () => query('clients', q => q.select('*').order('created_at', { ascending: false })),
  get: (id) => query('clients', q => q.select('*').eq('id', id).single()),
  add: (data) => query('clients', q => q.insert(snake(data)).select().single()),
  update: (id, data) => query('clients', q => q.update(snake(data)).eq('id', id).select().single()),
  remove: (id) => query('clients', q => q.delete().eq('id', id)),
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────
export const webhooks = {
  getAll: () => query('webhooks', q => q.select('*').order('created_at', { ascending: false })),
  get: (id) => query('webhooks', q => q.select('*').eq('id', id).single()),
  add: (data) => query('webhooks', q => q.insert(snake(data)).select().single()),
  update: (id, data) => query('webhooks', q => q.update(snake(data)).eq('id', id).select().single()),
  remove: (id) => query('webhooks', q => q.delete().eq('id', id)),
  recordResult: (id, success) => query('webhooks', q =>
    q.rpc('increment_webhook_stats', { webhook_id: id, was_success: success })
  ),
}

// ─── Webhook Logs ─────────────────────────────────────────────────────────────
export const webhookLogs = {
  getAll: () => query('webhook_logs', q => q.select('*').order('timestamp', { ascending: false }).limit(200)),
  add: (entry) => query('webhook_logs', q => q.insert(snake(entry)).select().single()),
  clear: () => query('webhook_logs', q => q.delete().neq('id', '00000000-0000-0000-0000-000000000000')),
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = {
  getAll: () => query('bookings', q => q.select('*').order('date', { ascending: true })),
  add: (data) => query('bookings', q => q.insert(snake(data)).select().single()),
  update: (id, data) => query('bookings', q => q.update(snake(data)).eq('id', id)),
  remove: (id) => query('bookings', q => q.delete().eq('id', id)),
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = {
  getAll: () => query('payments', q => q.select('*').order('date', { ascending: false })),
  add: (data) => query('payments', q => q.insert(snake(data)).select().single()),
}

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = {
  getAll: () => query('leads', q => q.select('*').order('created_at', { ascending: false })),
  add: (data) => query('leads', q => q.insert(snake(data)).select().single()),
  markRead: (id) => query('leads', q => q.update({ status: 'read' }).eq('id', id)),
  remove: (id) => query('leads', q => q.delete().eq('id', id)),
  getUnreadCount: async () => {
    if (!sb) return 0
    const { count } = await sb.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new')
    return count || 0
  },
}

// ─── Settings (still localStorage – no sensitive data in Supabase) ────────────
export { settings, notifications, portalTokens } from './storage.js'
