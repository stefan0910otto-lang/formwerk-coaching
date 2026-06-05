/**
 * Vercel Serverless Function: Stripe Webhook Handler
 *
 * Deploy: push to Vercel, then set these env vars in the Vercel dashboard:
 *   STRIPE_WEBHOOK_SECRET  – from stripe.com/webhooks (whsec_...)
 *   STRIPE_SECRET_KEY      – sk_live_...
 *
 * In Stripe Dashboard → Webhooks → Add endpoint:
 *   URL: https://your-domain.vercel.app/api/stripe-webhook
 *   Events: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed
 *
 * This handler stores payments to a shared KV store (Vercel KV / Redis).
 * For a quick start without KV: it just logs to Vercel logs & forwards to your Formspree.
 */

import Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const PLAN_MAP = {
  // Map Stripe price IDs to plan names – update with your real price IDs
  'price_launch':    { plan: 'launch',    amount: 59,  name: 'Launch Offer' },
  'price_starter':   { plan: 'starter',   amount: 79,  name: 'Starter Coaching' },
  'price_intensive': { plan: 'intensive', amount: 149, name: '1:1 Intensiv' },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  console.log('Stripe event received:', event.type, event.id)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const payment = {
          stripeId: session.payment_intent || session.id,
          clientEmail: session.customer_details?.email,
          clientName: session.customer_details?.name || 'Unbekannt',
          amount: Math.round(session.amount_total / 100),
          currency: session.currency,
          status: 'paid',
          plan: session.metadata?.plan || 'unknown',
          date: new Date(session.created * 1000).toISOString(),
        }
        console.log('New checkout completed:', payment)
        // TODO: store to Supabase/KV: await db.payments.insert(payment)
        // TODO: fire Formwerk OS webhook: await fetch(process.env.FORMWERK_WEBHOOK_URL, { ... })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const lineItem = invoice.lines?.data?.[0]
        const priceId = lineItem?.price?.id
        const planInfo = PLAN_MAP[priceId] || { plan: 'unknown', amount: Math.round(invoice.amount_paid / 100), name: 'Unbekannt' }

        const payment = {
          stripeId: invoice.payment_intent,
          clientEmail: invoice.customer_email,
          clientName: invoice.customer_name || 'Unbekannt',
          amount: planInfo.amount,
          plan: planInfo.name,
          status: 'paid',
          date: new Date(invoice.status_transitions?.paid_at * 1000 || Date.now()).toISOString(),
        }
        console.log('Invoice paid:', payment)
        // TODO: store to Supabase/KV
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.warn('Payment failed for:', invoice.customer_email, invoice.id)
        // TODO: notify via email / Formwerk webhook
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal handler error' })
  }

  res.status(200).json({ received: true, type: event.type })
}
