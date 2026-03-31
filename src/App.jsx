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

  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [selectedOffer, setSelectedOffer] = useState('');

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
      price: '59 € / Monat',
      subtitle: 'Nur für die ersten 5 Kunden',
      badge: 'Erste 5 Plätze',
      highlight: true,
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
      price: '79 € / Monat',
      subtitle: 'Für Anfänger, die sauber starten wollen',
      badge: null,
      highlight: false,
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
      price: '149 € / Monat',
      subtitle: 'Mehr Kontrolle, mehr Anpassung, mehr Begleitung',
      badge: 'Beliebt',
      highlight: false,
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

  function handleOfferSelect(offerName) {
    setSelectedOffer(offerName);
    setFormData((current) => ({
      ...current,
      message: current.message || `Ich interessiere mich für das Angebot: ${offerName}.`,
    }));

    const section = document.getElementById('kontakt');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
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

    setStatus({ type: 'loading', message: 'Anfrage wird gesendet ...' });

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
          Angebot: selectedOffer,
        }),
      });

      if (!response.ok) {
        throw new Error('Formularversand fehlgeschlagen');
      }

      setStatus({ type: 'success', message: 'Danke. Deine Anfrage wurde erfolgreich gesendet.' });
      setFormData({
        firstName: '',
        email: '',
        age: '',
        goal: 'Muskelaufbau',
        experience: 'Kompletter Anfänger',
        message: '',
        consent: false,
      });
      setSelectedOffer('');
    } catch {
      setStatus({ type: 'error', message: 'Der Versand hat nicht funktioniert. Bitte versuche es erneut.' });
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
            <a href="#ueber-mich" className="transition hover:text-blue-700">Über mich</a>
            <a href="#faq" className="transition hover:text-blue-700">FAQ</a>
            <a href="#kontakt" className="transition hover:text-blue-700">Kontakt</a>
          </nav>

          <a
            href="#kontakt"
            className="rounded-2xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Jetzt Anfrage senden
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700 shadow-sm">
              Professionelles Online Coaching für Anfänger
            </p>

            <h2 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
              Online-Coaching für Anfänger, die Training und Ernährung endlich verständlich und strukturiert angehen wollen.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              FormWerk Coaching hilft dir dabei, sicher ins Training zu starten, deine Ernährung alltagstauglich aufzubauen und dauerhaft dranzubleiben. Ohne unnötige Verwirrung, ohne Zufallspläne und mit klarer persönlicher Begleitung.
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

            <div className="mt-8 rounded-[2rem] border border-blue-100 bg-blue-50 p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Sonderangebot zum Start</p>
              <p className="mt-2 max-w-2xl text-slate-700">
                Sichere dir als einer der ersten 5 Kunden einen vergünstigten Einstieg in die Zusammenarbeit.
              </p>
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
              <p className="text-sm text-slate-500">Was dich erwartet</p>
              <p className="mt-2 text-2xl font-semibold">Klare Orientierung statt Überforderung</p>
              <p className="mt-3 text-slate-600">
                Du bekommst eine klare Orientierung für Training, Ernährung und die nächsten Schritte, damit Fortschritt nachvollziehbar und planbar wird.
              </p>
            </div>
          </div>
        </section>

        <section id="angebot" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Angebot</p>
              <h3 className="mt-3 text-3xl font-bold md:text-4xl">Wähle das passende Coaching-Modell</h3>
              <p className="mt-4 text-slate-600">
                Vom vergünstigten Einstieg bis zur engeren 1:1 Begleitung ist klar erkennbar, welches Angebot zu welchem Bedarf passt.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.name}
                  className={`rounded-[2rem] border p-8 shadow-sm ${
                    offer.highlight
                      ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-2xl font-bold">{offer.name}</h4>
                      <p className="mt-2 text-3xl font-bold text-blue-700">{offer.price}</p>
                      <p className="mt-2 text-slate-500">{offer.subtitle}</p>
                    </div>
                    {offer.badge && (
                      <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-medium text-blue-700">
                        {offer.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-8 space-y-3">
                    {offer.features.map((feature) => (
                      <div key={feature} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      onClick={() => handleOfferSelect(offer.name)}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                      Dieses Angebot anfragen
                    </button>
                    <a
                      href={`mailto:polgota.buisness@gmail.com?subject=${encodeURIComponent(`Anfrage ${offer.name}`)}`}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Direkt per E-Mail anfragen
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Leistungsübersicht</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Was du konkret bekommst</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Hier siehst du auf einen Blick, welche Schwerpunkte das Coaching in Training, Ernährung und Betreuung abdeckt.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="text-xl font-semibold">{benefit.title}</h4>
                    <p className="mt-3 leading-7 text-slate-600">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="ablauf" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Ablauf</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">So läuft die Zusammenarbeit ab</h3>
                <p className="mt-4 text-slate-600">
                  Die Zusammenarbeit ist klar aufgebaut, damit du von Anfang an weißt, was dich erwartet.
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
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
          </div>
        </section>

        <section id="ueber-mich" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Über mich</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Verständlich, professionell und auf langfristigen Fortschritt ausgerichtet.</h3>
                <p className="mt-5 leading-7 text-slate-600">
                  Ich arbeite als Trainer bei Clever Fit und begleite Menschen dabei, strukturiert in Training und Ernährung einzusteigen. Mein Schwerpunkt liegt auf Anfängern, die einen klaren Plan, saubere Erklärungen und verlässliche Betreuung suchen.
                </p>
                <p className="mt-4 leading-7 text-slate-600">
                  FormWerk Coaching steht für einen ruhigen, professionellen Ansatz: kein unnötiges Fitness-Gelaber, keine leeren Versprechen, sondern nachvollziehbare Strategien, individuelle Anpassungen und ortsunabhängige Zusammenarbeit.
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
                <p className="text-sm text-slate-500">Warum Kunden hier richtig sind</p>
                <div className="mt-6 space-y-4">
                  {[
                    'klare und verständliche Trainingsstruktur statt Überforderung',
                    'realistische Ernährungsstrategien für den Alltag',
                    'regelmäßige Rückmeldungen und Anpassungen',
                    'professioneller, ruhiger Auftritt statt lauter Fitness-Show',
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

        <section id="faq" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">FAQ</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Häufige Fragen</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Hier findest du Antworten auf häufige Fragen zur Zusammenarbeit, zum Ablauf und zu den Inhalten des Coachings.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((item) => (
                  <div key={item.q} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                    <h4 className="text-lg font-semibold text-slate-900">{item.q}</h4>
                    <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="kontakt" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Kontakt</p>
                  <h3 className="mt-3 text-3xl font-bold md:text-4xl">Lass uns unverbindlich prüfen, ob das Coaching zu dir passt.</h3>
                  <p className="mt-4 text-slate-600">
                    Wenn du Interesse hast, kannst du hier direkt unverbindlich anfragen und kurz dein Ziel sowie deine aktuelle Situation schildern.
                  </p>

                  <div className="mt-8 space-y-4">
                    {selectedOffer && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <p className="text-sm text-blue-700">Ausgewähltes Angebot</p>
                        <p className="mt-2 font-semibold text-slate-900">{selectedOffer}</p>
                      </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm text-slate-500">E-Mail</p>
                      <p className="mt-2 break-all font-semibold">polgota.buisness@gmail.com</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm text-slate-500">Antwortzeit</p>
                      <p className="mt-2 font-semibold">in der Regel innerhalb von 24–48 Stunden</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm text-slate-500">Format</p>
                      <p className="mt-2 font-semibold">ortsunabhängig & online</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
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
                      Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage per E-Mail verwendet werden. Details findest du in der Datenschutzerklärung.
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
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-blue-700 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Nächster Schritt</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Starte mit einem kostenlosen Erstgespräch und finde heraus, welches Coaching wirklich zu dir passt.</h3>
                <p className="mt-4 text-blue-100">
                  Teile kurz dein Ziel und deine Ausgangslage mit. Danach schauen wir gemeinsam, welches Angebot für dich sinnvoll ist.
                </p>
              </div>

              <a
                href="#kontakt"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:opacity-90"
              >
                Jetzt Anfrage senden
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{brandName}</p>
            <p className="mt-2 text-sm text-slate-400">
              Personal Coaching für Anfänger – Training, Ernährung und ortsunabhängige Betreuung.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <a href="#angebot" className="transition hover:text-white">Angebot</a>
            <a href="#ueber-mich" className="transition hover:text-white">Über mich</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
            <a href="#kontakt" className="transition hover:text-white">Kontakt</a>
            <a href="/impressum.html" className="transition hover:text-white">Impressum</a>
            <a href="/datenschutz.html" className="transition hover:text-white">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
