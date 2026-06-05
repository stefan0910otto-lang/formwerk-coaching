import { webhooks, webhookLogs, notifications } from './storage.js'

export const EVENTS = {
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_STATUS_CHANGED: 'client.status_changed',
  CLIENT_DELETED: 'client.deleted',
  PAYMENT_RECEIVED: 'payment.received',
  BOOKING_CREATED: 'booking.created',
  BOOKING_COMPLETED: 'booking.completed',
  FORM_SUBMITTED: 'form.submitted',
}

export const EVENT_LABELS = {
  [EVENTS.CLIENT_CREATED]: 'Neuer Client',
  [EVENTS.CLIENT_UPDATED]: 'Client aktualisiert',
  [EVENTS.CLIENT_STATUS_CHANGED]: 'Client-Status geändert',
  [EVENTS.CLIENT_DELETED]: 'Client gelöscht',
  [EVENTS.PAYMENT_RECEIVED]: 'Zahlung eingegangen',
  [EVENTS.BOOKING_CREATED]: 'Session gebucht',
  [EVENTS.BOOKING_COMPLETED]: 'Session abgeschlossen',
  [EVENTS.FORM_SUBMITTED]: 'Kontaktformular',
}

async function sendWebhook(webhook, event, payload) {
  const start = Date.now()
  const body = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    source: 'formwerk-master-os',
    data: payload,
  })

  const headers = {
    'Content-Type': 'application/json',
    'X-Formwerk-Event': event,
    'X-Formwerk-Timestamp': new Date().toISOString(),
    ...(webhook.headers || {}),
  }

  try {
    const res = await fetch(webhook.url, { method: 'POST', headers, body })
    const duration = Date.now() - start
    const success = res.ok

    webhookLogs.add({
      webhookId: webhook.id,
      webhookName: webhook.name,
      event,
      url: webhook.url,
      status: success ? 'success' : 'failed',
      statusCode: res.status,
      duration,
      payload,
      response: null,
      timestamp: new Date().toISOString(),
    })

    webhooks.recordResult(webhook.id, success)
    return { success, statusCode: res.status, duration }
  } catch (err) {
    const duration = Date.now() - start
    webhookLogs.add({
      webhookId: webhook.id,
      webhookName: webhook.name,
      event,
      url: webhook.url,
      status: 'failed',
      statusCode: null,
      duration,
      payload,
      response: err.message,
      timestamp: new Date().toISOString(),
    })
    webhooks.recordResult(webhook.id, false)
    return { success: false, statusCode: null, duration, error: err.message }
  }
}

export async function fire(event, payload = {}) {
  const active = webhooks.getAll().filter(w => w.active && w.events?.includes(event))
  if (!active.length) return []

  const results = await Promise.allSettled(active.map(wh => sendWebhook(wh, event, payload)))

  const fired = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - fired

  if (fired > 0) {
    notifications.add(`${fired} Webhook(s) für "${EVENT_LABELS[event] || event}" ausgelöst`, 'success')
  }
  if (failed > 0) {
    notifications.add(`${failed} Webhook(s) fehlgeschlagen bei "${EVENT_LABELS[event] || event}"`, 'error')
  }

  return results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message })
}

export async function test(webhookId) {
  const wh = webhooks.get(webhookId)
  if (!wh) throw new Error('Webhook nicht gefunden')
  return sendWebhook(wh, 'webhook.test', {
    message: 'Dies ist ein Test-Webhook von Formwerk Master-OS',
    timestamp: new Date().toISOString(),
  })
}
