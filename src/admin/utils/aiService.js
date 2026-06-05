import { settings } from './storage.js'

const TEMPLATES = {
  welcome: (client) => `Hallo ${client.name}! 🎯

Herzlich willkommen bei Formwerk Coaching! Ich freue mich riesig, dich auf deinem Weg zu begleiten.

Dein Ziel: ${client.goal}
Dein Paket: ${PLAN_NAMES[client.plan]}

In den nächsten Tagen schicke ich dir deinen personalisierten Trainingsplan. Hast du schon Erfahrung mit strukturiertem Training?

Bis bald,
Stefan 💪`,

  checkIn: (client) => `Hey ${client.name}! 👋

Schnelles Check-in – wie läuft's bei dir?

Du bist jetzt ${client.sessions} Sessions dabei und hast schon ${client.progress}% deines Ziels erreicht. Das ist richtig stark!

Gibt es etwas, das wir optimieren können – Training, Ernährung oder Timing?

Stefan`,

  reminder: (client, booking) => `Hey ${client.name.split(' ')[0]}! 📅

Kurze Erinnerung: ${booking?.date === new Date().toISOString().split('T')[0] ? 'Heute' : 'Morgen'} haben wir unsere ${booking?.type === 'training' ? 'Training' : booking?.type === 'nutrition' ? 'Ernährungs' : 'Check-in'}-Session um ${booking?.time || '?'} Uhr.

Komm ausgeruht und gut hydriert – ich freue mich auf dich! 💪

Stefan`,

  goalReset: (client) => `Hey ${client.name.split(' ')[0]}! 🎯

Ein neues Quartal startet – perfekte Zeit, um deine Ziele zu schärfen.

Du hast bei "${client.goal}" schon ${client.progress || 0}% erreicht. Ich würde gerne mit dir besprechen, was als nächstes kommt und wie wir den Plan für die nächsten Monate ausrichten.

Wann passt dir ein kurzes 15-Min-Gespräch? ✨

Stefan`,

  nutritionTip: (client) => `Hey ${client.name.split(' ')[0]}! 🍎

📌 Dein Ernährungs-Tipp der Woche:

Protein first! Starte jede Mahlzeit mit deiner Proteinquelle (Fleisch, Fisch, Eier, Hülsenfrüchte). Das sättigt länger, stabilisiert den Blutzucker und unterstützt deinen Muskelaufbau.

Ziel: ${Math.round(((client.age || 70) / 70) * 140)}g Protein täglich – verteilt auf 3–4 Mahlzeiten. 🥩

Fragen? Einfach melden!
Stefan`,

  referral: (client) => `Hey ${client.name.split(' ')[0]}! 🎁

Du bist jetzt schon ${client.sessions || 0} Sessions dabei – das ist richtig beeindruckend!

Ich möchte dich für deine Treue belohnen: Empfiehl mir einen Freund, der mit dem Coaching startet, und du bekommst einen vollen Monat kostenlos on top.

Hast du jemanden im Kopf, dem ich helfen könnte? 😊

Stefan`,

  planSuggestion: (client) => `Trainingsplan-Empfehlung für ${client.name}

**Ziel:** ${client.goal}
**Frequenz:** ${client.plan === 'intensive' ? '4-5x' : client.plan === 'starter' ? '3-4x' : '3x'} pro Woche

**Wochenplan:**
- Mo: Push (Brust, Schultern, Trizeps)
- Di: Cardio/Ausdauer 30-45 min
- Mi: Pull (Rücken, Bizeps)
- Do: Pause oder leichtes Cardio
- Fr: Beine & Core
- Sa: Freie Einheit nach Wahl
- So: Aktive Erholung / Stretching

**Ernährung:**
- Protein: ${Math.round((client.age || 70) * 2)}g/Tag
- Kalorienziel: individuell berechnen
- Mahlzeiten: 3-4 strukturierte Mahlzeiten

Passen wir den Plan gemeinsam an deine Verfügbarkeit an!`,

  reEngagement: (client) => `Hi ${client.name}! ⭐

Ich hab gemerkt, dass es bei dir gerade etwas ruhiger ist. Das ist völlig okay – das Leben ist manchmal voll.

Aber ich würde gerne wissen: Wie kann ich dich besser unterstützen? Manchmal reicht schon eine kleine Anpassung am Plan, um wieder in den Flow zu kommen.

Kein Druck – ich bin für dich da. 💬

Stefan`,
}

const PLAN_NAMES = { launch: 'Launch Offer', starter: 'Starter Coaching', intensive: '1:1 Betreuung' }

async function callClaude(prompt, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API Error ${res.status}`)
  }

  const data = await res.json()
  return data.content[0].text
}

export async function generateMessage(type, client, booking) {
  const { anthropicKey } = settings.get()
  const first = client.name?.split(' ')[0] || client.name

  if (anthropicKey) {
    const prompts = {
      welcome: `Du bist ein Fitness-Coach aus Deutschland. Schreibe eine kurze, herzliche Willkommensnachricht für einen neuen Coaching-Klienten. Name: ${client.name}, Alter: ${client.age}, Ziel: ${client.goal}, Paket: ${PLAN_NAMES[client.plan]}. Auf Deutsch, max 5 Sätze, freundlich und motivierend.`,
      checkIn: `Du bist ein Fitness-Coach. Schreibe eine kurze Check-in Nachricht für: ${client.name}, ${client.sessions} Sessions absolviert, ${client.progress}% Fortschritt, Ziel: ${client.goal}. Auf Deutsch, max 4 Sätze, direkt und motivierend.`,
      planSuggestion: `Erstelle einen kurzen, strukturierten Trainingsplan für: Name: ${client.name}, Ziel: ${client.goal}, Paket: ${PLAN_NAMES[client.plan]}. Auf Deutsch, mit Wochenstruktur und Ernährungshinweisen.`,
      reEngagement: `Schreibe eine einfühlsame Re-Engagement Nachricht für einen Klienten, der eine Pause eingelegt hat: ${client.name}, Ziel: ${client.goal}. Auf Deutsch, max 4 Sätze, ohne Druck.`,
      reminder: `Schreibe eine kurze, freundliche Session-Erinnerung für ${first}. Session: ${booking?.type || 'Training'} ${booking?.date === new Date().toISOString().split('T')[0] ? 'heute' : 'morgen'} um ${booking?.time || '?'} Uhr. Auf Deutsch, max 3 Sätze, motivierend.`,
      goalReset: `Schreibe eine Nachricht an ${first} um ein Quartals-Ziel-Gespräch vorzuschlagen. Bisheriger Fortschritt: ${client.progress}% bei "${client.goal}". Auf Deutsch, einladend, max 4 Sätze.`,
      nutritionTip: `Schreibe einen kurzen, praktischen Ernährungs-Tipp der Woche für Coaching-Client ${first}, Ziel: ${client.goal}. Auf Deutsch, konkret umsetzbar, max 4 Sätze mit einem klaren Tipp.`,
      referral: `Schreibe eine herzliche Referral-Nachricht an ${first}, der ${client.sessions} Sessions absolviert hat. Empfehle das Referral-Programm: 1 Monat gratis bei Empfehlung. Auf Deutsch, authentisch, max 4 Sätze.`,
    }
    try {
      return await callClaude(prompts[type] || prompts.welcome, anthropicKey)
    } catch (err) {
      console.warn('Claude API Fehler, nutze Template:', err.message)
    }
  }

  return TEMPLATES[type]?.(client, booking) || TEMPLATES.welcome(client)
}

export async function analyzeProgress(client) {
  const { anthropicKey } = settings.get()
  const prompt = `Analysiere kurz den Fortschritt dieses Coaching-Klienten und gib 2-3 konkrete Empfehlungen:
Name: ${client.name}
Ziel: ${client.goal}
Fortschritt: ${client.progress}%
Sessions: ${client.sessions}
Status: ${client.status}
Notizen: ${client.notes || 'keine'}
Auf Deutsch, max 150 Wörter, strukturiert mit Bullet Points.`

  if (anthropicKey) {
    try { return await callClaude(prompt, anthropicKey) } catch { /* fall through */ }
  }

  return `**Fortschrittsanalyse für ${client.name}**

• Aktueller Fortschritt ${client.progress}% ist ${client.progress >= 50 ? 'sehr gut' : 'ausbaufähig'} für ${client.sessions} Sessions
• ${client.status === 'active' ? 'Klient ist aktiv – weiter so!' : `Status "${client.status}" erfordert Aufmerksamkeit`}
• Empfehlung: ${client.progress < 30 ? 'Intensivierung des Trainingsplans' : client.progress < 60 ? 'Ernährungsoptimierung einbeziehen' : 'Neue Ziele setzen für nächste Phase'}`
}

export async function generateEmailTemplate(subject, context) {
  const { anthropicKey } = settings.get()

  if (anthropicKey) {
    try {
      return await callClaude(
        `Schreibe eine professionelle E-Mail für einen Fitness-Coach an einen Klienten. Betreff: ${subject}. Kontext: ${context}. Auf Deutsch, freundlich, max 8 Sätze.`,
        anthropicKey
      )
    } catch { /* fall through */ }
  }

  return `Betreff: ${subject}\n\nHallo [Name],\n\n${context}\n\nBei Fragen stehe ich dir gerne zur Verfügung.\n\nViele Grüße,\nStefan`
}
