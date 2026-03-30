import { useState } from 'react';

export default function PersonalCoachingWebsite() {
  const brandName = 'FormWerk Coaching';
  const formspreeEndpoint = 'https://formspree.io/f/xkoprgqz';

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    age: '',
    goal: 'Muskelaufbau',
    experience: 'Kompletter Anfänger',
    message: '',
    consent: false,
  });

  const [status, setStatus] = useState({
    type: 'idle',
    message: '',
  });

  const benefits = [
    {
      title: 'Strukturierter Einstieg',
      text: 'Gerade Anfänger brauchen keinen wilden Plan, sondern klare Schritte. Genau das bekommst du hier.'
    },
    {
      title: 'Training, das verständlich ist',
      text: 'Übungen, Technik, Trainingsaufbau und Progression werden so erklärt, dass du wirklich verstehst, was du tust.'
    },
    {
      title: 'Ernährungscoaching inklusive',
      text: 'Du bekommst eine saubere, alltagstaugliche Ernährungsstruktur statt unnötiger Verwirrung und halbgarem Internetwissen.'
    },
    {
      title: 'Ortsunabhängige Betreuung',
      text: 'Die Zusammenarbeit funktioniert flexibel und online. Damit ist das Coaching nicht an einen Ort gebunden.'
    }
  ];

  const steps = [
    'Kostenloses Erstgespräch per E-Mail',
    'Analyse von Zielen, Alltag, Trainingserfahrung und Ausgangslage',
    'Individueller Trainings- und Ernährungsfahrplan',
    'Regelmäßige Betreuung mit Anpassungen und Feedback'
  ];

  const offers = [
    {
      name: 'Starter Coaching',
      price: '79 € / Monat',
      subtitle: 'Für Anfänger, die sauber starten wollen',
      features: [
        'Kostenloses Erstgespräch',
        'Individueller Trainingsplan',
        'Grundlegende Ernährungsstruktur',
        '1 Check-in pro Woche',
        'Kontakt per E-Mail',
        'Ortsunabhängige Betreuung'
      ]
    },
    {
      name: '1:1 Betreuung',
      price: '149 € / Monat',
      subtitle: 'Mehr Kontrolle, mehr Anpassung, mehr Begleitung',
      features: [
        'Alles aus Starter Coaching',
        'Ausführlicher Ernährungsplan',
        'Regelmäßige Plananpassungen',
        'Mehrere Feedbackpunkte pro Woche',
        'Engerer persönlicher Support',
        'Ortsunabhängige Zusammenarbeit'
      ]
    }
  ];

  const targetGroups = [
    'Einsteiger, die endlich sauber anfangen wollen',
    'Menschen, die im Gym Orientierung und Sicherheit brauchen',
    'Jüngere und ältere Anfänger, die verständliche Begleitung suchen',
    'Alle, die nicht wieder mit Zufallsplänen scheitern wollen'
  ];

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.consent) {
      setStatus({
        type: 'error',
        message: 'Bitte stimme der Verarbeitung deiner Anfrage zu.',
      });
      return;
    }

    setStatus({
      type: 'loading',
      message: 'Anfrage wird gesendet ...',
    });

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Vorname: formData.firstName,
          Email: formData.email,
          Alter: formData.age,
          Ziel: formData.goal,
          Trainingserfahrung: formData.experience,
          Nachricht: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Formularversand fehlgeschlagen');
      }

      setStatus({
        type: 'success',
        message: 'Danke. Deine Anfrage wurde erfolgreich gesendet.',
      });

      setFormData({
        firstName: '',
        email: '',
        age: '',
        goal: 'Muskelaufbau',
        experience: 'Kompletter Anfänger',
        message: '',
        consent: false,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Der Versand hat nicht funktioniert. Prüfe die Formspree-ID und versuche es erneut.',
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{brandName}</p>
            <h1 className="text-lg font-semibold text-slate-900">Personal Coaching</h1>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a href="#angebot" className="transition hover:text-blue-700">Angebot</a>
            <a href="#ablauf" className="transition hover:text-blue-700">Ablauf</a>
            <a href="#zielgruppe" className="transition hover:text-blue-700">Zielgruppe</a>
            <a href="#ueber-mich" className="transition hover:text-blue-700">Über mich</a>
            <a href="#kontakt" className="transition hover:text-blue-700">Kontakt</a>
          </nav>
          <a
            href="#kontakt"
            className="rounded-2xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Erstgespräch anfragen
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700 shadow-sm">
              Professionelles Coaching für Anfänger jeden Alters
            </p>
            <h2 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
              Klarer Einstieg in Training und Ernährung – ohne Chaos, ohne Rätselraten.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              Ich unterstütze Anfänger dabei, Training und Ernährung verständlich, sauber und nachhaltig aufzubauen.
              Mit einem klaren System, persönlicher Begleitung und ortsunabhängigen Angeboten für langfristigen Fortschritt.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#kontakt"
                className="rounded-2xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Kostenloses Erstgespräch
              </a>
              <a
                href="#angebot"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-blue-50"
              >
                Angebot ansehen
              </a>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">1:1</p>
                <p className="text-sm text-slate-500">individuelle Betreuung</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">online</p>
                <p className="text-sm text-slate-500">ortsunabhängige Angebote</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">Ernährung</p>
                <p className="text-sm text-slate-500">Coaching inklusive</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Dein Fokus</p>
              <div className="mt-6 space-y-4">
                {['Gesunder Einstieg', 'Muskelaufbau', 'Fettverlust', 'Sicherheit im Training'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <span className="font-medium">{item}</span>
                    <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">Fokus</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Was du bekommst</p>
              <p className="mt-2 text-2xl font-semibold">Klare Vorgaben statt Überforderung</p>
              <p className="mt-3 text-slate-600">
                Du weißt, was du trainierst, wie du startest, worauf du achtest und wie dein Fortschritt überprüft wird.
              </p>
            </div>
          </div>
        </section>

        <section id="angebot" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Angebot</p>
              <h3 className="mt-3 text-3xl font-bold md:text-4xl">Was das Coaching konkret abdeckt</h3>
              <p className="mt-4 text-slate-600">
                Für Anfänger ist nicht Härte das Problem, sondern fehlende Orientierung. Diese Seite verkauft deshalb nicht Chaos als Motivation, sondern Struktur als Lösung.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                  <h4 className="text-xl font-semibold">{benefit.title}</h4>
                  <p className="mt-3 leading-7 text-slate-600">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ablauf" className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Ablauf</p>
              <h3 className="mt-3 text-3xl font-bold md:text-4xl">So läuft die Zusammenarbeit ab</h3>
              <p className="mt-4 text-slate-600">
                Direkt, verständlich und professionell. Der Kunde soll von Anfang an merken, dass hier Ordnung herrscht.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="zielgruppe" className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Zielgruppe</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Für wen dieses Coaching gemacht ist</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Die Spezialisierung auf Anfänger ist richtig. Warum? Weil du dort Vertrauen, echte Hilfestellung und klare Ergebnisse liefern kannst.
                  Der Fehler wäre nur, zu unscharf zu bleiben. Deshalb ist hier klar: Du hilfst Menschen, die Orientierung und einen professionellen Start brauchen.
                </p>
              </div>
              <div className="space-y-4">
                {targetGroups.map((item) => (
                  <div key={item} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="font-medium text-slate-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Pakete</p>
              <h3 className="mt-3 text-3xl font-bold md:text-4xl">Einfach starten, dann ausbauen</h3>
              <p className="mt-4 text-slate-600">
                Konkrete Preise machen das Angebot greifbarer. Zu billig darf es nicht wirken, zu hoch ohne Proof aber auch nicht. Diese Staffelung ist für den Start deutlich brauchbarer.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {offers.map((offer) => (
                <div key={offer.name} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-2xl font-bold">{offer.name}</h4>
                      <p className="mt-2 text-3xl font-bold text-blue-700">{offer.price}</p>
                      <p className="mt-2 text-slate-500">{offer.subtitle}</p>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">1:1</span>
                  </div>
                  <div className="mt-8 space-y-3">
                    {offer.features.map((feature) => (
                      <div key={feature} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
                        {feature}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#kontakt"
                    className="mt-8 inline-block rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:opacity-90"
                  >
                    Anfrage senden
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ueber-mich" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Über mich</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Verständlich, professionell und auf langfristigen Fortschritt ausgerichtet.</h3>
                <p className="mt-5 leading-7 text-slate-600">
                  Ich arbeite als Trainer bei Clever Fit und begleite Menschen dabei, strukturiert in Training und Ernährung einzusteigen.
                  Mein Schwerpunkt liegt auf Anfängern, die einen klaren Plan, saubere Erklärungen und eine verlässliche Betreuung suchen.
                </p>
                <p className="mt-4 leading-7 text-slate-600">
                  FormWerk Coaching steht für einen ruhigen, professionellen Ansatz: kein unnötiges Fitness-Gelaber, keine leeren Versprechen,
                  sondern nachvollziehbare Strategien, individuelle Anpassungen und ortsunabhängige Zusammenarbeit.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Schwerpunkt</p>
                    <p className="mt-2 font-semibold text-slate-900">Anfängercoaching</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Leistungen</p>
                    <p className="mt-2 font-semibold text-slate-900">Training + Ernährung</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Modell</p>
                    <p className="mt-2 font-semibold text-slate-900">online & flexibel</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm text-slate-500">Warum dieses Coaching Vertrauen schafft</p>
                <div className="mt-6 space-y-4">
                  {[
                    'klare und verständliche Trainingsstruktur statt Überforderung',
                    'realistische Ernährungsstrategien für den Alltag',
                    'regelmäßige Rückmeldungen und Anpassungen',
                    'professioneller, ruhiger Auftritt statt lauter Fitness-Show'
                  ].map((point) => (
                    <div key={point} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">FAQ</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Fragen, die vor einer Anfrage oft auftauchen</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Dieser Block ist wichtig. Er nimmt Unsicherheit raus und erhöht Vertrauen. Viele Coaching-Seiten sind hier schwach oder komplett leer.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    q: 'Ist das Coaching auch für komplette Anfänger geeignet?',
                    a: 'Ja. Genau darauf ist das Angebot ausgelegt. Training, Ernährung und Struktur werden verständlich erklärt und an dein Niveau angepasst.'
                  },
                  {
                    q: 'Muss ich bei Clever Fit trainieren?',
                    a: 'Nein. Das Coaching ist ortsunabhängig aufgebaut und kann unabhängig von einem bestimmten Studio genutzt werden.'
                  },
                  {
                    q: 'Ist Ernährungscoaching enthalten?',
                    a: 'Ja. Je nach Paket bekommst du eine grundlegende oder ausführlichere Ernährungsstruktur passend zu deinem Ziel und Alltag.'
                  },
                  {
                    q: 'Wie läuft die Betreuung ab?',
                    a: 'Nach dem Erstkontakt folgt eine Analyse deiner Ausgangslage. Danach bekommst du einen individuellen Plan und regelmäßige Rückmeldungen mit Anpassungen.'
                  }
                ].map((item) => (
                  <div key={item.q} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                    <h4 className="text-lg font-semibold text-slate-900">{item.q}</h4>
                    <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="kontakt" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-slate-50 p-8 md:p-10">
              <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Kontakt</p>
                  <h3 className="mt-3 text-3xl font-bold md:text-4xl">Lass uns unverbindlich prüfen, ob das Coaching zu dir passt.</h3>
                  <p className="mt-4 text-slate-600">
                    Das Formular ist deutlich stärker als eine reine E-Mail-Kachel. Es wirkt professioneller, sammelt direkt brauchbare Infos und senkt Reibung für Interessenten.
                  </p>

                  <div className="mt-8 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm text-slate-500">E-Mail</p>
                      <p className="mt-2 break-all font-semibold">polgota.buisness@gmail.com</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm text-slate-500">Antwortzeit</p>
                      <p className="mt-2 font-semibold">in der Regel innerhalb von 24–48 Stunden</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm text-slate-500">Format</p>
                      <p className="mt-2 font-semibold">ortsunabhängig & online</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Vorname</label>
                      <input
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Dein Vorname"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">E-Mail</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="deine@email.de"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Alter</label>
                      <input
                        name="age"
                        type="text"
                        required
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="z. B. 24"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Ziel</label>
                      <select
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700"
                      >
                        <option>Muskelaufbau</option>
                        <option>Fettverlust</option>
                        <option>Allgemein fitter werden</option>
                        <option>Struktur in Training und Ernährung</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Trainingserfahrung</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700"
                    >
                      <option>Kompletter Anfänger</option>
                      <option>Wenig Erfahrung</option>
                      <option>Schon etwas Erfahrung</option>
                    </select>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nachricht</label>
                    <textarea
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Beschreibe kurz deine aktuelle Situation, dein Ziel und wobei du Unterstützung suchst."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700"
                    />
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <input
                      name="consent"
                      type="checkbox"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <p className="text-sm leading-6 text-slate-600">
                      Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage per E-Mail verwendet werden.
                    </p>
                  </div>

                  {status.type !== 'idle' && (
                    <div
                      className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                        status.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : status.type === 'error'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-blue-200 bg-blue-50 text-blue-700'
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status.type === 'loading' ? 'Wird gesendet ...' : 'Anfrage absenden'}
                  </button>

                  <p className="mt-4 text-sm text-slate-500">
                    Das Formular ist jetzt mit deinem Formspree-Endpoint verbunden. Teste nach dem Deploy unbedingt einmal, ob die Anfrage korrekt bei dir ankommt.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
              <section id="impressum" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Impressum</p>
              <h3 className="mt-3 text-3xl font-bold md:text-4xl">Rechtliche Angaben</h3>
              <div className="mt-8 space-y-5 text-slate-600 leading-7">
                <p>
                  <span className="font-semibold text-slate-900">Angaben gemäß § 5 DDG</span>
                </p>
                <p>
                  FormWerk Coaching<br />
                  Stefan [Nachname ergänzen]<br />
                  [Straße und Hausnummer ergänzen]<br />
                  [PLZ] [Ort]
                </p>
                <p>
                  E-Mail: polgota.buisness@gmail.com
                </p>
                <p>
                  Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
                  Stefan [Nachname ergänzen]<br />
                  [Straße und Hausnummer ergänzen]<br />
                  [PLZ] [Ort]
                </p>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                  Vor dem Livegang musst du hier deinen vollständigen bürgerlichen Namen und eine ladungsfähige Anschrift eintragen. Ohne diese Angaben ist das Impressum für eine Business-Website in Deutschland nicht sauber.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="datenschutz" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-5xl rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Datenschutz</p>
              <h3 className="mt-3 text-3xl font-bold md:text-4xl">Datenschutzhinweise</h3>
              <div className="mt-8 space-y-8 text-slate-600 leading-7">
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">1. Verantwortlicher</h4>
                  <p className="mt-3">
                    FormWerk Coaching<br />
                    Stefan [Nachname ergänzen]<br />
                    [Straße und Hausnummer ergänzen]<br />
                    [PLZ] [Ort]<br />
                    E-Mail: polgota.buisness@gmail.com
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">2. Verarbeitung von Anfrage-Daten</h4>
                  <p className="mt-3">
                    Wenn du das Kontaktformular nutzt, werden die von dir eingegebenen Daten verarbeitet, um deine Anfrage zu bearbeiten und gegebenenfalls Rückfragen zu stellen. Dabei können insbesondere Vorname, E-Mail-Adresse, Alter, Ziel, Trainingserfahrung und deine Nachricht verarbeitet werden.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">3. Zweck und Rechtsgrundlage</h4>
                  <p className="mt-3">
                    Die Verarbeitung erfolgt zum Zweck der Bearbeitung deiner Anfrage und der Anbahnung einer möglichen Zusammenarbeit.
                    Als Rechtsgrundlage kommt je nach Inhalt der Anfrage insbesondere Art. 6 Abs. 1 lit. b DSGVO oder Art. 6 Abs. 1 lit. f DSGVO in Betracht.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">4. Formularanbieter Formspree</h4>
                  <p className="mt-3">
                    Für die Übermittlung der Formularanfragen wird Formspree verwendet. Dabei werden die im Formular eingegebenen Daten an Formspree übertragen und dort verarbeitet, damit die Anfrage an die hinterlegte E-Mail-Adresse weitergeleitet werden kann.
                  </p>
                  <p className="mt-3">
                    Prüfe vor dem Livegang zusätzlich die aktuellen Datenschutzinformationen und die Auftragsverarbeitungs- bzw. Drittland-Themen des eingesetzten Dienstes. Diese Website-Vorlage ersetzt keine individuelle Rechtsprüfung.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">5. Speicherdauer</h4>
                  <p className="mt-3">
                    Personenbezogene Daten werden nur so lange gespeichert, wie es für die Bearbeitung der Anfrage und die damit zusammenhängende Kommunikation erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">6. Rechte betroffener Personen</h4>
                  <p className="mt-3">
                    Du hast im Rahmen der geltenden gesetzlichen Vorgaben insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie gegebenenfalls auf Widerspruch gegen die Verarbeitung deiner personenbezogenen Daten.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">7. Hosting und technische Bereitstellung</h4>
                  <p className="mt-3">
                    Beim Aufruf dieser Website können technisch notwendige Daten durch den Hosting-Anbieter verarbeitet werden, etwa IP-Adresse, Zeitpunkt des Zugriffs, Browser-Informationen und Logdaten zur Stabilität und Sicherheit des Betriebs.
                  </p>
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    Sobald du dich für Vercel oder einen anderen Hoster entscheidest, solltest du diesen Abschnitt konkret mit dem tatsächlichen Anbieter ergänzen.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{brandName}</p>
            <p className="mt-2 text-sm text-slate-400">Personal Coaching für Anfänger – Training, Ernährung und ortsunabhängige Betreuung.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <a href="#angebot" className="transition hover:text-white">Angebot</a>
            <a href="#ueber-mich" className="transition hover:text-white">Über mich</a>
            <a href="#kontakt" className="transition hover:text-white">Kontakt</a>
            <a href="#impressum" className="transition hover:text-white">Impressum</a>
            <a href="#datenschutz" className="transition hover:text-white">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
