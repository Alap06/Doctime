import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Doctor } from '../types/models';
import { localizeDoctorsToTunisia } from '../utils/tunisiaLocalization';
import { doctorStorage, type ExtendedDoctor } from '../services/doctorStorage';
import { generateCompleteDoctorProfile } from '../utils/doctorProfileGenerator';

const ALL_SPECIALTIES = [
  'Cardiologue',
  'Dermatologue',
  'Gynecologue',
  'Pediatre',
  'Ophtalmologue',
  'Dentiste',
  'ORL',
  'Neurologue',
  'Psychiatre',
  'Rhumatologue',
  'Endocrinologue',
  'Gastro-enterologue',
  'Urologue',
  'Pneumologue',
  'Hematologue',
  'Chirurgien',
  'Orthopediste',
  'Medecin generaliste',
  'Radiologue',
  'Oncologue'
];

function createFallbackDoctor(specialty: string, index: number): Doctor {
  const cities = ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul', 'Bizerte', 'Ariana', 'Ben Arous', 'Kairouan', 'Gabes'];
  const city = cities[index % cities.length];

  return {
    id: `auto-${specialty}-${index}`,
    fullName: `Dr Medecin ${specialty} ${index + 1}`,
    specialty,
    city,
    rating: 4.4 + (index % 5) * 0.1,
    reviewCount: 20 + index * 3,
    distanceKm: 2 + (index % 25),
    experienceYears: 6 + (index % 18),
    address: `Centre medical, ${city}, Tunisie`,
    phone: `+216 2${(100000 + index).toString().slice(0, 6)}`,
    availability: ['Lundi 09:00', 'Mardi 10:00', 'Mercredi 11:00']
  };
}

function ensureMinDoctorsPerSpecialty(source: Doctor[], minPerSpecialty = 10): Doctor[] {
  const grouped = new Map<string, Doctor[]>();

  source.forEach((doctor) => {
    const list = grouped.get(doctor.specialty) ?? [];
    list.push(doctor);
    grouped.set(doctor.specialty, list);
  });

  ALL_SPECIALTIES.forEach((specialty) => {
    const list = grouped.get(specialty) ?? [];
    if (list.length === 0) {
      for (let i = 0; i < minPerSpecialty; i += 1) {
        list.push(createFallbackDoctor(specialty, i));
      }
      grouped.set(specialty, list);
      return;
    }

    let index = 0;
    while (list.length < minPerSpecialty) {
      const template = list[index % list.length] ?? createFallbackDoctor(specialty, index);
      list.push({
        ...template,
        id: `${template.id}-clone-${index + 1}`,
        fullName: `Dr ${template.fullName.replace('Dr ', '')} ${index + 1}`,
        reviewCount: (template.reviewCount ?? 20) + index + 3,
        rating: Number(Math.max(4.1, Math.min(5, template.rating - 0.2 + (index % 4) * 0.15)).toFixed(1))
      });
      index += 1;
    }

    grouped.set(specialty, list);
  });

  return Array.from(grouped.values()).flat();
}

function StarRating({ rating }: { rating: number }): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function DoctorCard({ doctor, view }: { doctor: ExtendedDoctor; view: 'grid' | 'list' }): React.JSX.Element {
  const initials = doctor.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={`rounded-2xl border border-white/8 bg-white/3 p-5 transition-all hover:border-cyan-500/25 hover:bg-white/5 ${
        view === 'list' ? 'flex items-center gap-5' : ''
      }`}
    >
      <div className={`flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 font-bold text-cyan-400 ${view === 'list' ? 'h-12 w-12 text-sm' : 'mb-4 h-10 w-10 text-xs'} flex items-center justify-center`}>
        {initials}
      </div>

      <div className={`${view === 'list' ? 'flex flex-1 items-center gap-4 flex-wrap' : ''}`}>
        <div className={`${view === 'list' ? 'flex-1' : ''}`}>
          <h2 className="text-base font-bold text-white">{doctor.fullName}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{doctor.specialty} - {doctor.city}</p>
          {doctor.clinic ? <p className="mt-1 text-xs text-slate-500">{doctor.clinic}</p> : null}
        </div>

        <div className={`${view === 'list' ? '' : 'mt-2'} flex flex-col gap-1`}>
          <div className="flex items-center gap-2">
            <StarRating rating={doctor.rating} />
            <span className="text-xs font-bold text-amber-400">{doctor.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-600">({doctor.reviewCount} avis)</span>
          </div>
          {doctor.consultationFee ? <p className="text-xs font-semibold text-emerald-400">Consultation: {doctor.consultationFee} DT</p> : null}
          {doctor.yearsOfExperience ? <p className="text-xs text-slate-500">{doctor.yearsOfExperience} ans d'experience</p> : null}
        </div>
      </div>

      <div className={`${view === 'list' ? '' : 'mt-4'} flex flex-shrink-0 gap-2`}>
        <Link to={`/doctors/${doctor.id}`} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-white/20 hover:text-white">
          Profil
        </Link>
        <Link to={`/booking/${doctor.id}`} className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400">
          Reserver
        </Link>
      </div>
    </article>
  );
}

export function DoctorsPage(): React.JSX.Element {
  const [doctors, setDoctors] = useState<ExtendedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [minRating, setMinRating] = useState(0);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const loadDoctors = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const cachedDoctors = doctorStorage.getAllDoctors();
        if (cachedDoctors.length > 0) {
          setDoctors(cachedDoctors);
          setLoading(false);
          return;
        }

        const res = await api.listDoctors();
        const tunisianDoctors = localizeDoctorsToTunisia(res.items);
        const baseDoctors = ensureMinDoctorsPerSpecialty(tunisianDoctors, 10);
        const completeDoctors = baseDoctors.map((doctor, idx) => generateCompleteDoctorProfile(doctor, idx));

        doctorStorage.saveDoctors(completeDoctors);
        setDoctors(completeDoctors);
      } catch {
        const cached = doctorStorage.getAllDoctors();
        if (cached.length > 0) {
          setDoctors(cached);
          setError(null);
        } else {
          setError('Impossible de charger la liste des medecins.');
        }
      } finally {
        setLoading(false);
      }
    };

    void loadDoctors();
  }, []);

  const filtered = useMemo(() => {
    return doctors
      .filter((d) => {
        const searchKey = `${d.fullName} ${d.specialty} ${d.city}`.toLowerCase();
        return searchKey.includes(query.toLowerCase());
      })
      .filter((d) => (specialty ? d.specialty === specialty : true))
      .filter((d) => (selectedCity ? d.city === selectedCity : true))
      .filter((d) => d.rating >= minRating)
      .sort((a, b) => b.rating - a.rating);
  }, [doctors, query, specialty, selectedCity, minRating]);

  const specialties = Array.from(new Set(doctors.map((d) => d.specialty))).sort();
  const cities = Array.from(new Set(doctors.map((d) => d.city))).sort();

  const getSpecialtyCount = (spec: string): number => doctors.filter((d) => d.specialty === spec).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un medecin par nom, specialite ou ville..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Filtrer par specialite"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
              >
                <option value="">Toutes specialites ({doctors.length})</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s} ({getSpecialtyCount(s)})
                  </option>
                ))}
              </select>

              <select
                aria-label="Filtrer par ville"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
              >
                <option value="">Toutes villes</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                aria-label="Note minimum"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
              >
                <option value={0}>Toutes notes</option>
                <option value={4.5}>4.5+ etoiles</option>
                <option value={4.0}>4.0+ etoiles</option>
                <option value={3.5}>3.5+ etoiles</option>
              </select>

              <div className="ml-auto flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                <button onClick={() => setView('grid')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === 'grid' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>
                  Grille
                </button>
                <button onClick={() => setView('list')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === 'list' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>
                  Liste
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-3xl font-black text-transparent">Medecins disponibles</h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-cyan-400">Reseau medical Tunisie</p>
            {!loading && !error ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">Catalogue enrichi</div>
                <div className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400">Min 10 medecins/specialite</div>
              </div>
            ) : null}
          </div>
          {!loading ? (
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">{filtered.length}</p>
              <p className="text-xs text-slate-500">resultats</p>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-white/5 bg-white/3 p-5">
                <div className="mb-3 h-4 w-1/2 rounded bg-white/10" />
                <div className="h-3 w-1/3 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : null}

        {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-5 text-sm font-semibold text-rose-400">{error}</div> : null}

        {!loading && !error ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} view={view} />
            ))}
          </div>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-xl font-bold text-white">Aucun resultat</h3>
            <p className="mt-2 text-sm text-slate-500">Essayez d'autres mots-cles ou ajustez vos filtres.</p>
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-slate-600">
            <p>{doctors.length} medecins au total | {specialties.length} specialites | {cities.length} villes</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
