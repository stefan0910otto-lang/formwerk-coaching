import { useState } from 'react';
import heroImage from './assets/hero.png';

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || '';
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '';

function openCalendly() {
  if (CALENDLY_URL && CALENDLY_URL.includes('calendly.com') && window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else if (CALENDLY_URL && CALENDLY_URL.includes('calendly.com')) {
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
  } else {
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function CheckIcon({ light = false }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${light ? 'text-white' : 'text-blue-600'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CookieBanner({ onAccept }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-xl md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-slate-600">
          Diese Website verwendet <strong>Google Fonts</strong> (Schriftarten) und <strong>Formspree</strong> (Kontaktformular).
          Durch die Nutzung der Seite werden Daten an externe Anbieter übermittelt.{' '}
          <a href="/datenschutz.html" className="underline hover:text-blue-600">Datenschutzerklärung</a>
        </p>
        <div className="flex shrink-0 gap-3">
          <a href="/datenschutz.html" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            Details
          </a>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

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

  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [selectedOffer, setSelectedOffer] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(
    () => localStorage.getItem('fw-cookie-consent') === 'true'
  );

  function acceptCookies() {
    localStorage.setItem('fw-cookie-consent', 'true');
    setCookieConsent(true);
  }

  const benefits = [
    {
      title: 'Strukturierter Einstieg',
      text: 'Gerade Anfänger brauchen keine wilden Pläne, sondern klare Schritte, verständliche Erklärungen und eine saubere Struktur.',
    },
    {
      title: 'Training, das nachvollziehbar ist',
      text: 'Übungen, Aufbau, Technik und Progression werden so erklärt, dass du verstehst, was du tust und warum du es tust.',
    },
    {
      title: 'Ernährungscoaching inklusive',
      text: 'Du bekommst eine alltagstaugliche Ernährungsstruktur statt unnötiger Verwirrung, Extremen oder Internet-Halbwissen.',
    },
    {
      title: 'Ortsunabhängige Betreuung',
      text: 'Die Zusammenarbeit funktioniert flexibel online. Damit ist das Coaching nicht an einen Ort gebunden.',
    },
  ];

  const steps = [
    'Kostenloses Erstgespräch und kurze Analyse deiner Ausgangslage',
    'Individueller Trainings- und Ernährungsfahrplan passend zu deinem Ziel',
    'Regelmäßige Rückmeldungen, Anpassungen und klare nächste Schritte',
    'Langfristiger Fortschritt statt Aktionismus für zwei Wochen',
  ];

  const offers = [
    {
      name: 'Launch Angebot',
      price: '59',
      period: '/ Monat',
      subtitle: 'Nur für die ersten 5 Kunden',
      badge: 'Erste 5 Plätze',
      highlight: true,
      paymentLink: 'https://buy.stripe.com/4gM6oGcp85gu7cVgwG0ZW01',
      features: [
        'Kostenloses Erstgespräch',
        'Individueller Trainingsplan',
        'Grundlegende Ernährungsstruktur',
        '1 Check-in pro Woche',
        'E-Mail Support',
        'Online & ortsunabhängig',
      ],
    },
    {
      name: 'Starter Coaching',
      price: '79',
      period: '/ Monat',
      subtitle: 'Für Anfänger, die sauber starten wollen',
      badge: null,
      highlight: false,
      paymentLink: 'https://buy.stripe.com/28EfZg4WGcIW9l380a0ZW00',
      features: [
        'Kostenloses Erstgespräch',
        'Individueller Trainingsplan',
        'Grundlegende Ernährungsstruktur',
        '1 Check-in pro Woche',
        'E-Mail Support',
        'Online & ortsunabhängig',
      ],
    },
    {
      name: '1:1 Betreuung',
      price: '149',
      period: '/ Monat',
      subtitle: 'Mehr Kontrolle, mehr Anpassung, mehr Begleitung',
      badge: 'Beliebt',
      highlight: false,
      paymentLink: 'https://buy.stripe.com/4gM3cuexgdN09l30xI0ZW02',
      features: [
        'Alles aus Starter Coaching',
        'Ausführlichere Ernährungsbegleitung',
        'Mehrere Feedbackpunkte pro Woche',
        'Regelmäßige Plananpassungen',
        'Engerer persönlicher Support',
        'Online & flexibel',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Ist das Coaching auch für komplette Anfänger geeignet?',
      a: 'Ja. Genau darauf ist das Angebot ausgelegt. Training, Ernährung und Struktur werden verständlich erklärt und an dein Niveau angepasst.',
    },
    {
      q: 'Muss ich bei Clever Fit trainieren?',
      a: 'Nein. Das Coaching ist ortsunabhängig aufgebaut und kann unabhängig von einem bestimmten Studio genutzt werden.',
    },
    {
      q: 'Ist Ernährungscoaching enthalten?',
      a: 'Ja. Je nach Paket bekommst du eine grundlegende oder ausführlichere Ernährungsstruktur passend zu deinem Ziel und Alltag.',
    },
    {
      q: 'Wie läuft die Betreuung ab?',
      a: 'Nach dem Erstkontakt folgt eine Analyse deiner Ausgangslage. Danach bekommst du einen individuellen Plan und regelmäßige Rückmeldungen mit Anpassungen.',
    },
  ];

  const navLinks = [
    { href: '#angebot', label: 'Angebot' },
    { href: '#ablauf', label: 'Ablauf' },
    { href: '#ueber-mich', label: 'Über mich' },
    { href: '#faq', label: 'FAQ' },
    { href: '#kontakt', label: 'Kontakt' },
  ];

  function handleOfferSelect(offerName) {
    setSelectedOffer(offerName);
    setFormData((current) => ({
      ...current,
      message: current.message || `Ich interessiere mich für das Angebot: ${offerName}.`,
    }));
    setMobileMenuOpen(false);
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Bitte fülle Vorname, E-Mail und Nachricht aus.' });
      return;
    }
    if (!formData.consent) {
      setStatus({ type: 'error', message: 'Bitte stimme der Verarbeitung deiner Anfrage zu.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Anfrage wird gesendet …' });
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Vorname: formData.firstName,
          Email: formData.email,
          Alter: formData.age,
          Ziel: formData.goal,
          Trainingserfahrung: formData.experience,
          Nachricht: formData.message,
          Angebot: selectedOffer,
        }),
      });
      if (!response.ok) throw new Error();
      setStatus({ type: 'success', message: 'Danke. Deine Anfrage wurde erfolgreich gesendet.' });
      setFormData({ firstName: '', email: '', age: '', goal: 'Muskelaufbau', experience: 'Kompletter Anfänger', message: '', consent: false });
      setSelectedOffer('');
    } catch {
      setStatus({ type: 'error', message: 'Der Versand hat nicht funktioniert. Bitte versuche es erneut.' });
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{brandName}</p>
            <h1 className="text-base font-bold text-slate-900">Personal Coaching</h1>
          </div>

          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-blue-600">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCalendly}
              className="hidden rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 md:block"
            >
              Erstgespräch buchen
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-6 pb-6 md:hidden">
            <nav className="mt-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={openCalendly}
                className="mt-3 rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Kostenloses Erstgespräch buchen
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08),_transparent_70%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Professionelles Online Coaching für Anfänger
              </span>

              <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                Training und Ernährung –{' '}
                <span className="text-blue-600">endlich verständlich.</span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                FormWerk Coaching hilft dir dabei, sicher ins Training zu starten, deine Ernährung alltagstauglich aufzubauen und dauerhaft dranzubleiben. Ohne unnötige Verwirrung, mit klarer persönlicher Begleitung.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={openCalendly}
                  className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                >
                  Kostenloses Erstgespräch
                </button>
                <a
                  href="#angebot"
                  className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  Angebot ansehen
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { value: '1:1', label: 'Individuelle Betreuung' },
                  { value: 'Online', label: 'Ortsunabhängig' },
                  { value: '100%', label: 'Auf dich zugeschnitten' },
                ].map((stat) => (
                  <div key={stat.value} className="flex items-center gap-3">
                    <p className="text-2xl font-extrabold text-blue-600">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-blue-100 to-blue-50 opacity-60" />
              <img
                src={heroImage}
                alt="FormWerk Coaching"
                className="relative w-full rounded-[2rem] object-cover shadow-xl"
              />
              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Sonderangebot</p>
                <p className="mt-1 font-bold text-slate-900">59 € / Monat</p>
                <p className="text-xs text-slate-500">Nur für die ersten 5 Kunden</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ANGEBOTE ── */}
        <section id="angebot" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-14 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Angebot</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Wähle das passende Coaching-Modell
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                Vom vergünstigten Einstieg bis zur engeren 1:1 Begleitung – klar erkennbar, welches Angebot zu deinem Bedarf passt.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.name}
                  className={`relative flex flex-col rounded-[2rem] border p-8 shadow-sm transition hover:shadow-md ${
                    offer.highlight
                      ? 'border-blue-200 bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  {offer.badge && (
                    <span
                      className={`absolute -top-3 left-8 rounded-full px-4 py-1 text-xs font-bold shadow-sm ${
                        offer.highlight ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {offer.badge}
                    </span>
                  )}

                  <div>
                    <h4 className={`text-xl font-bold ${offer.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {offer.name}
                    </h4>
                    <p className={`mt-1 text-sm ${offer.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                      {offer.subtitle}
                    </p>
                    <div className="mt-5 flex items-end gap-1">
                      <span className={`text-5xl font-extrabold tracking-tight ${offer.highlight ? 'text-white' : 'text-blue-600'}`}>
                        {offer.price} €
                      </span>
                      <span className={`mb-1.5 text-sm ${offer.highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                        {offer.period}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex-1 space-y-3">
                    {offer.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            offer.highlight ? 'bg-white/20' : 'bg-blue-50'
                          }`}
                        >
                          <CheckIcon light={offer.highlight} />
                        </span>
                        <span className={`text-sm ${offer.highlight ? 'text-blue-50' : 'text-slate-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <a
                      href={offer.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold shadow-sm transition ${
                        offer.highlight
                          ? 'bg-white text-blue-600 hover:bg-blue-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Jetzt buchen
                    </a>
                    <a
                      href={`mailto:polgota.buisness@gmail.com?subject=${encodeURIComponent(`Anfrage ${offer.name}`)}`}
                      className={`inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                        offer.highlight
                          ? 'border-white/30 text-white hover:bg-white/10'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Per E-Mail anfragen
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEISTUNGEN ── */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-14 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Leistungsübersicht</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Was du konkret bekommst</h3>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                Diese Schwerpunkte deckt das Coaching in Training, Ernährung und Betreuung ab.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <CheckIcon />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{benefit.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABLAUF ── */}
        <section id="ablauf" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-12 md:grid-cols-2 md:items-start">
              <div className="md:sticky md:top-28">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Ablauf</p>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                  So läuft die Zusammenarbeit ab
                </h3>
                <p className="mt-4 leading-7 text-slate-500">
                  Die Zusammenarbeit ist klar aufgebaut, damit du von Anfang an weißt, was dich erwartet.
                </p>
                <button
                  type="button"
                  onClick={openCalendly}
                  className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                >
                  Erstgespräch direkt buchen
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200">
                      {index + 1}
                    </div>
                    <p className="flex items-center font-medium text-slate-800">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ÜBER MICH ── */}
        <section id="ueber-mich" className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Über mich</p>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                  Verständlich, professionell und auf langfristigen Fortschritt ausgerichtet.
                </h3>
                <p className="mt-5 leading-7 text-slate-600">
                  Ich arbeite als Trainer bei Clever Fit und begleite Menschen dabei, strukturiert in Training und Ernährung einzusteigen. Mein Schwerpunkt liegt auf Anfängern, die einen klaren Plan, saubere Erklärungen und verlässliche Betreuung suchen.
                </p>
                <p className="mt-4 leading-7 text-slate-600">
                  FormWerk Coaching steht für einen ruhigen, professionellen Ansatz: kein unnötiges Fitness-Gelaber, keine leeren Versprechen, sondern nachvollziehbare Strategien, individuelle Anpassungen und ortsunabhängige Zusammenarbeit.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['Anfängercoaching', 'Training + Ernährung', 'Online & flexibel'].map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-blue-600">Warum du hier richtig bist</p>
                <div className="space-y-4">
                  {[
                    'Klare und verständliche Trainingsstruktur statt Überforderung',
                    'Realistische Ernährungsstrategien für den Alltag',
                    'Regelmäßige Rückmeldungen und Anpassungen',
                    'Professioneller, ruhiger Auftritt statt lauter Fitness-Show',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckIcon />
                      </div>
                      <p className="text-sm leading-6 text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-14 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">FAQ</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Häufige Fragen</h3>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                Antworten auf häufige Fragen zur Zusammenarbeit, zum Ablauf und zu den Inhalten des Coachings.
              </p>
            </div>

            <div className="mx-auto max-w-3xl space-y-4">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h4 className="font-bold text-slate-900">{item.q}</h4>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KONTAKT ── */}
        <section id="kontakt" className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
              <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Kontakt</p>
                  <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                    Lass uns unverbindlich prüfen, ob das Coaching zu dir passt.
                  </h3>
                  <p className="mt-4 text-slate-500">
                    Wenn du Interesse hast, kannst du hier direkt unverbindlich anfragen und kurz dein Ziel sowie deine aktuelle Situation schildern.
                  </p>

                  <button
                    type="button"
                    onClick={openCalendly}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Erstgespräch direkt buchen
                  </button>

                  <div className="mt-6 space-y-3">
                    {selectedOffer && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Ausgewähltes Angebot</p>
                        <p className="mt-1 font-bold text-slate-900">{selectedOffer}</p>
                      </div>
                    )}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">E-Mail</p>
                      <p className="mt-1 break-all font-semibold text-slate-800">polgota.buisness@gmail.com</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Antwortzeit</p>
                      <p className="mt-1 font-semibold text-slate-800">innerhalb von 24–48 Stunden</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Format</p>
                      <p className="mt-1 font-semibold text-slate-800">Ortsunabhängig & online</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6">
                  <p className="mb-4 text-sm font-semibold text-slate-500">Oder schreib mir direkt:</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vorname</label>
                      <input
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Dein Vorname"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">E-Mail</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="deine@email.de"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Alter</label>
                      <input
                        name="age"
                        type="text"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="z. B. 24"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Ziel</label>
                      <select
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option>Muskelaufbau</option>
                        <option>Fettverlust</option>
                        <option>Allgemein fitter werden</option>
                        <option>Struktur in Training und Ernährung</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Trainingserfahrung</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>Kompletter Anfänger</option>
                      <option>Wenig Erfahrung</option>
                      <option>Schon etwas Erfahrung</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nachricht</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Beschreibe kurz deine aktuelle Situation, dein Ziel und wobei du Unterstützung suchst."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <input
                      name="consent"
                      type="checkbox"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                    <p className="text-sm leading-6 text-slate-600">
                      Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage per E-Mail verwendet werden. Details findest du in der{' '}
                      <a href="/datenschutz.html" className="underline hover:text-blue-600">Datenschutzerklärung</a>.
                    </p>
                  </div>

                  {status.type !== 'idle' && (
                    <div
                      className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
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
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status.type === 'loading' ? 'Wird gesendet …' : 'Anfrage absenden'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">Nächster Schritt</p>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                  Starte mit einem kostenlosen Erstgespräch.
                </h3>
                <p className="mt-4 text-blue-100">
                  Teile kurz dein Ziel und deine Ausgangslage mit. Danach schauen wir gemeinsam, welches Angebot für dich sinnvoll ist.
                </p>
              </div>
              <button
                type="button"
                onClick={openCalendly}
                className="shrink-0 rounded-xl bg-white px-8 py-4 font-bold text-blue-600 shadow-lg transition hover:opacity-90"
              >
                Jetzt Termin buchen
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-300">{brandName}</p>
            <p className="mt-2 text-sm">Personal Coaching für Anfänger – Training, Ernährung und ortsunabhängige Betreuung.</p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
            <a href="/impressum.html" className="transition hover:text-white">Impressum</a>
            <a href="/datenschutz.html" className="transition hover:text-white">Datenschutz</a>
            {INSTAGRAM_URL && !INSTAGRAM_URL.includes('DEIN_PROFIL') && (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-2 transition hover:text-pink-400"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* ── COOKIE BANNER ── */}
      {!cookieConsent && <CookieBanner onAccept={acceptCookies} />}
    </div>
  );
}
