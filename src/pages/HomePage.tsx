import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Doctor } from '../types/models';

const SPECIALTIES = [
  { icon: '🫀', label: 'Cardiologie' },
  { icon: '🧠', label: 'Neurologie' },
  { icon: '👁️', label: 'Ophtalmologie' },
  { icon: '🦷', label: 'Dentisterie' },
  { icon: '🧒', label: 'Pédiatrie' },
  { icon: '🩻', label: 'Radiologie' },
  { icon: '🦴', label: 'Orthopédie' },
  { icon: '🌿', label: 'Dermatologie' },
];

const STATS = [
  { value: '1 200+', label: 'Médecins vérifiés' },
  { value: '48h', label: 'Délai moyen RDV' },
  { value: '98%', label: 'Patients satisfaits' },
  { value: '24/7', label: 'Disponible' },
];

const FEATURE_FLAGS = [
  {
    title: 'Recherche intelligente',
    description: 'Filtres avancés par spécialité, note, distance et disponibilité en temps réel.'
  },
  {
    title: 'Carte interactive',
    description: 'Visualisez les médecins proches, comparez les options et ouvrez un itinéraire en un clic.'
  },
  {
    title: 'Réservation en étapes',
    description: 'Un flow guidé avec validation médicale progressive pour éviter les erreurs de saisie.'
  },
  {
    title: 'Suivi complet',
    description: 'Historique des rendez-vous, documents médicaux et paramètres personnalisés.'
  },
];

const DEFAULT_HIGHLIGHT_DOCTORS = [
  {
    id: 'd1',
    name: 'Dr Sarah Benali',
    specialty: 'Cardiologie',
    city: 'Tunis',
    rating: 4.9,
    reviews: 324,
    nextSlot: 'Aujourd\'hui 18:30'
  },
  {
    id: 'd2',
    name: 'Dr Karim El Idrissi',
    specialty: 'Dermatologie',
    city: 'Sousse',
    rating: 4.8,
    reviews: 267,
    nextSlot: 'Demain 09:15'
  },
  {
    id: 'd3',
    name: 'Dr Salma Naciri',
    specialty: 'Pédiatrie',
    city: 'Sfax',
    rating: 4.9,
    reviews: 412,
    nextSlot: 'Demain 11:00'
  },
  {
    id: 'd4',
    name: 'Dr Mehdi Alaoui',
    specialty: 'Dentisterie',
    city: 'Monastir',
    rating: 4.7,
    reviews: 203,
    nextSlot: 'Aujourd\'hui 20:10'
  },
];

const BOOKING_EXAMPLES = [
  {
    doctorId: 'd1',
    patient: 'Amine B.',
    specialty: 'Cardiologie',
    doctor: 'Dr Sarah Benali',
    date: '2026-04-14',
    time: '10:00',
    status: 'Confirmé',
    urgency: 'Normal'
  },
  {
    doctorId: 'd2',
    patient: 'Nadia H.',
    specialty: 'Dermatologie',
    doctor: 'Dr Karim El Idrissi',
    date: '2026-04-15',
    time: '14:30',
    status: 'En attente',
    urgency: 'Normal'
  },
  {
    doctorId: 'd3',
    patient: 'Salma R.',
    specialty: 'Pédiatrie',
    doctor: 'Dr Salma Naciri',
    date: '2026-04-16',
    time: '09:15',
    status: 'Confirmé',
    urgency: 'Urgent'
  },
  {
    doctorId: 'd4',
    patient: 'Yassine K.',
    specialty: 'Dentisterie',
    doctor: 'Dr Mehdi Alaoui',
    date: '2026-04-17',
    time: '18:45',
    status: 'Confirmé',
    urgency: 'Normal'
  }
];

const SPECIALTY_DOCTOR_MATRIX = [
  {
    specialty: 'Cardiologie',
    doctors: ['Dr Sarah Benali', 'Dr Younes El Fassi', 'Dr Lina Bennis'],
    avgRating: 4.8
  },
  {
    specialty: 'Dermatologie',
    doctors: ['Dr Karim El Idrissi', 'Dr Samir Bouzidi', 'Dr Amine Touil'],
    avgRating: 4.7
  },
  {
    specialty: 'Pédiatrie',
    doctors: ['Dr Salma Naciri', 'Dr Nora El Mansouri', 'Dr Mariam Bousfiha'],
    avgRating: 4.9
  },
  {
    specialty: 'Neurologie',
    doctors: ['Dr Hajar Chraibi', 'Dr Nisrine Lahbabi', 'Dr Rachid Fikri'],
    avgRating: 4.6
  }
];

const JOURNEYS = [
  {
    title: 'Patient pressé',
    result: 'RDV confirmé en moins de 2 minutes',
    example: 'Recherche par ville + créneau du soir + paiement au cabinet.'
  },
  {
    title: 'Parent avec enfant',
    result: 'Pédiatre trouvé avec avis vérifiés',
    example: 'Filtre pédiatrie + tri par note + distance < 5km.'
  },
  {
    title: 'Suivi chronique',
    result: 'Même médecin reprogrammé rapidement',
    example: 'Historique RDV + rappel auto + upload bilan médical.'
  }
];

const TESTIMONIALS = [
  {
    name: 'Yasmine A.',
    role: 'Patiente - Tunis',
    quote: 'J\'ai trouvé un cardiologue fiable en 5 minutes. L\'interface est très claire et rapide.'
  },
  {
    name: 'Samir H.',
    role: 'Patient - Sousse',
    quote: 'Le stepper de réservation est excellent: aucune confusion, tout est bien guidé.'
  },
  {
    name: 'Nadia B.',
    role: 'Mère de famille - Sfax',
    quote: 'Les avis patients m\'ont aidée à choisir le bon pédiatre pour mon fils.'
  }
];

const FAQ = [
  {
    q: 'Comment savoir si le médecin est vérifié ?',
    a: 'Chaque profil affiche un badge de vérification, la note moyenne et le volume réel d\'avis.'
  },
  {
    q: 'Puis-je annuler un rendez-vous ?',
    a: 'Oui, depuis votre espace Mes rendez-vous avec mise à jour immédiate du statut.'
  },
  {
    q: 'Mes données médicales sont-elles protégées ?',
    a: 'Les documents sont envoyés via API sécurisée et les accès sont protégés par authentification JWT.'
  },
  {
    q: 'Doctime fonctionne-t-il sur mobile ?',
    a: 'Oui, l\'interface web est responsive et optimisée pour mobile, tablette et desktop.'
  }
];

export function HomePage(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [highlightDoctors, setHighlightDoctors] = useState(DEFAULT_HIGHLIGHT_DOCTORS);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHighlights = async (): Promise<void> => {
      try {
        const res = await api.listDoctors();
        const doctors = res.items.slice(0, 4).map((doctor: Doctor) => ({
          id: doctor.id,
          name: doctor.fullName,
          specialty: doctor.specialty,
          city: doctor.city,
          rating: doctor.rating,
          reviews: doctor.reviewCount,
          nextSlot: doctor.availability?.[0] ?? 'Prochainement'
        }));

        if (doctors.length > 0) {
          setHighlightDoctors(doctors);
        }
      } catch {
        setHighlightDoctors(DEFAULT_HIGHLIGHT_DOCTORS);
      }
    };

    void loadHighlights();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <span className="text-xl font-black tracking-tight text-cyan-400">doc<span className="text-white">time</span></span>
          <div className="hidden md:flex gap-6 text-sm text-slate-400">
            <Link to="/doctors" className="hover:text-white transition-colors">Médecins</Link>
            <Link to="/doctors" className="hover:text-white transition-colors">Spécialités</Link>
            <a href="#specialty-map" className="hover:text-white transition-colors">Spécialité / Docteur</a>
            <a href="#rdv" className="hover:text-white transition-colors">Rendez-vous</a>
            <a href="#examples" className="hover:text-white transition-colors">Exemples</a>
            <a href="#avis" className="hover:text-white transition-colors">Avis</a>
            <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex gap-2">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
              Connexion
            </Link>
            <Link to="/register" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-all">
              Inscription
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 tracking-widest uppercase mb-6">
            Plateforme médicale de confiance - Tunisie
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            Votre santé,<br />
            <span className="text-cyan-400">vos médecins</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Trouvez le bon spécialiste en Tunisie, consultez les avis patients et réservez votre rendez-vous en quelques secondes.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
            {FEATURE_FLAGS.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">{feature.title}</p>
                <p className="mt-1 text-xs text-slate-400 line-clamp-3">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-10 flex gap-2 max-w-xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, spécialité, ville…"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
            />
            <button
              type="submit"
              className="rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all"
            >
              Rechercher
            </button>
          </form>

          {/* Quick specialty chips */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {['Généraliste', 'Dermatologue', 'Cardiologue', 'Pédiatre'].map((s) => (
              <Link
                key={s}
                to={`/doctors?specialty=${encodeURIComponent(s)}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10 px-4">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-cyan-400">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Spécialités</p>
              <h2 className="text-3xl font-black">Tous les experts,<br />une seule plateforme</h2>
            </div>
            <Link to="/doctors" className="hidden md:block rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:border-white/20 transition-all">
              Voir tous les médecins →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPECIALTIES.map((spec) => (
              <Link
                key={spec.label}
                to={`/doctors?specialty=${encodeURIComponent(spec.label)}`}
                className="group rounded-2xl border border-white/8 bg-white/3 p-5 hover:bg-white/8 hover:border-cyan-500/30 transition-all"
              >
                <span className="text-3xl">{spec.icon}</span>
                <p className="mt-3 text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{spec.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE EXAMPLES */}
      <section id="examples" className="border-t border-white/5 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Exemples concrets</p>
              <h2 className="text-3xl font-black">Médecins vedettes et disponibilités</h2>
            </div>
            <Link to="/doctors" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
              Explorer le catalogue complet
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlightDoctors.map((doctor) => (
              <article key={doctor.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{doctor.specialty}</p>
                <h3 className="mt-2 text-lg font-black">{doctor.name}</h3>
                <p className="text-sm text-slate-400">{doctor.city}</p>
                <p className="mt-3 text-sm text-slate-300">⭐ {doctor.rating} ({doctor.reviews} avis)</p>
                <p className="mt-1 text-xs text-emerald-300">Prochain créneau: {doctor.nextSlot}</p>
                <div className="mt-4 flex gap-2">
                  <Link to={`/doctors/${doctor.id}`} className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950">
                    Voir profil
                  </Link>
                  <Link to={`/booking/${doctor.id}`} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold">
                    Réserver
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALTY MATRIX */}
      <section id="specialty-map" className="border-t border-white/5 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Mapping spécialités</p>
              <h2 className="text-3xl font-black">Spécialité et docteurs disponibles</h2>
            </div>
            <Link to="/doctors" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
              Voir toutes les spécialités
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {SPECIALTY_DOCTOR_MATRIX.map((item) => (
              <article key={item.specialty} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-black text-cyan-300">{item.specialty}</h3>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    Note moyenne: {item.avgRating}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.doctors.map((doctor) => (
                    <span key={doctor} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {doctor}
                    </span>
                  ))}
                </div>
                <Link to={`/doctors?specialty=${encodeURIComponent(item.specialty)}`} className="mt-4 inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200">
                  Filtrer par {item.specialty} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* APPOINTMENT EXAMPLES */}
      <section id="rdv" className="border-t border-white/5 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Exemples rendez-vous</p>
              <h2 className="text-3xl font-black">Suivi des rendez-vous en un coup d'œil</h2>
            </div>
            <Link to="/appointments" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
              Ouvrir mes rendez-vous
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="hidden grid-cols-8 gap-2 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 md:grid">
              <span>Patient</span>
              <span>Spécialité</span>
              <span className="col-span-2">Docteur</span>
              <span>Date</span>
              <span>Heure</span>
              <span>Statut</span>
              <span>Urgence</span>
            </div>

            <div className="divide-y divide-white/10">
              {BOOKING_EXAMPLES.map((rdv) => (
                <article key={`${rdv.doctorId}-${rdv.patient}`} className="grid gap-2 px-4 py-4 md:grid-cols-8 md:items-center">
                  <p className="text-sm font-semibold text-white">{rdv.patient}</p>
                  <p className="text-sm text-slate-300">{rdv.specialty}</p>
                  <p className="text-sm text-slate-300 md:col-span-2">{rdv.doctor}</p>
                  <p className="text-sm text-slate-300">{rdv.date}</p>
                  <p className="text-sm text-slate-300">{rdv.time}</p>
                  <p className={`text-xs font-bold ${rdv.status === 'Confirmé' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {rdv.status}
                  </p>
                  <p className={`text-xs font-bold ${rdv.urgency === 'Urgent' ? 'text-rose-300' : 'text-slate-300'}`}>
                    {rdv.urgency}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* USER JOURNEYS */}
      <section className="border-t border-white/5 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Parcours utilisateurs</p>
            <h2 className="text-3xl font-black">Plusieurs cas d\'usage, une seule expérience</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {JOURNEYS.map((journey) => (
              <article key={journey.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-black text-cyan-400">{journey.title}</h3>
                <p className="mt-3 text-sm font-semibold text-white">{journey.result}</p>
                <p className="mt-2 text-sm text-slate-400">{journey.example}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-4 border-t border-white/5">
        <div className="mx-auto max-w-4xl text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Processus</p>
          <h2 className="text-3xl font-black">Réserver en 3 étapes</h2>
        </div>
        <div className="mx-auto max-w-4xl grid md:grid-cols-3 gap-5">
          {[
            { n: '01', title: 'Cherchez', desc: 'Filtrez par spécialité, ville ou nom pour trouver le médecin qu\'il vous faut.' },
            { n: '02', title: 'Consultez', desc: 'Lisez les avis patients, vérifiez les disponibilités et le profil du praticien.' },
            { n: '03', title: 'Réservez', desc: 'Choisissez un créneau horaire et confirmez votre rendez-vous instantanément.' },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl border border-white/8 bg-white/3 p-7">
              <p className="text-5xl font-black text-white/10">{step.n}</p>
              <h3 className="mt-3 text-xl font-black text-cyan-400">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="avis" className="border-t border-white/5 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Avis patients</p>
            <h2 className="text-3xl font-black">Des retours concrets et vérifiés</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <article key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm leading-relaxed text-slate-300">"{item.quote}"</p>
                <p className="mt-4 text-sm font-bold text-cyan-300">{item.name}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/5 py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">FAQ</p>
            <h2 className="text-3xl font-black">Questions fréquentes</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <article key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-bold text-white">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-10 text-center">
          <h2 className="text-3xl font-black">Prêt à prendre soin de vous ?</h2>
          <p className="mt-3 text-slate-400">Rejoignez des milliers de patients qui font confiance à Doctime.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-400 transition-all">
              Créer mon compte gratuit
            </Link>
            <Link to="/doctors" className="rounded-2xl border border-white/15 px-8 py-4 font-bold text-white hover:bg-white/8 transition-all">
              Parcourir les médecins
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Doctime — Tous droits réservés
      </footer>
    </div>
  );
}
