import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Review } from '../types/models';
import { doctorStorage, type ExtendedDoctor } from '../services/doctorStorage';
import { generateCompleteDoctorProfile, generateSampleReviews } from '../utils/doctorProfileGenerator';
import { localizeDoctorToTunisia } from '../utils/tunisiaLocalization';

type Tab = 'infos' | 'avis' | 'dispo' | 'parcours';

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }): React.JSX.Element {
  const cls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${cls} ${star <= Math.round(rating) ? 'text-amber-400' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function DoctorProfilePage(): React.JSX.Element {
  const { doctorId = '' } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<ExtendedDoctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('infos');

  useEffect(() => {
    const loadDoctorProfile = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let foundDoctor = doctorStorage.getDoctorById(doctorId);

        if (!foundDoctor) {
          try {
            const apiDoctor = await api.getDoctor(doctorId);
            const localizedDoctor = localizeDoctorToTunisia(apiDoctor);
            const index = Number(doctorId.replace(/\D/g, '')) || 0;
            foundDoctor = generateCompleteDoctorProfile(localizedDoctor, index);
            doctorStorage.saveDoctor(foundDoctor);
          } catch {
            const allDoctors = doctorStorage.getAllDoctors();
            foundDoctor = allDoctors.find((d) => d.id === doctorId) ?? null;
            if (!foundDoctor) {
              throw new Error('not-found');
            }
          }
        }

        setDoctor(foundDoctor);

        try {
          const reviewRes = await api.listReviews(doctorId);
          if (reviewRes.items.length > 0) {
            setReviews(reviewRes.items);
          } else {
            setReviews(generateSampleReviews(doctorId, foundDoctor.rating));
          }
        } catch {
          setReviews(generateSampleReviews(doctorId, foundDoctor.rating));
        }
      } catch {
        setError('Profil medecin indisponible. Le medecin demande est introuvable.');
      } finally {
        setLoading(false);
      }
    };

    if (!doctorId) {
      setError('ID medecin non specifie.');
      setLoading(false);
      return;
    }

    void loadDoctorProfile();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
          <p className="mt-4 text-sm text-slate-400">Chargement du profil medical...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Medecin non trouve</h2>
          <p className="mb-6 text-sm text-rose-300">{error}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/doctors')} className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400">
              Voir tous les medecins
            </button>
            <button onClick={() => window.location.reload()} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5">
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = doctor.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'infos', label: 'Informations' },
    { key: 'avis', label: `Avis (${reviews.length})` },
    { key: 'dispo', label: 'Disponibilites' },
    { key: 'parcours', label: 'Parcours' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="border-b border-white/5 bg-slate-900/40 px-4 pt-8 pb-0">
        <div className="mx-auto max-w-4xl">
          <Link to="/doctors" className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
            Retour aux medecins
          </Link>

          <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 text-3xl font-black text-cyan-300">
              {initials}
            </div>

            <div className="flex-1">
              <h1 className="bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-3xl font-black text-transparent md:text-4xl">{doctor.fullName}</h1>
              <p className="mt-1 text-sm text-slate-300">{doctor.specialty} - {doctor.city}, Tunisie</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={doctor.rating} />
                  <span className="text-sm font-bold text-amber-400">{doctor.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({doctor.reviewCount ?? reviews.length} avis)</span>
                </div>
                {doctor.yearsOfExperience ? <span className="text-xs text-emerald-400">{doctor.yearsOfExperience} ans d'experience</span> : null}
                {doctor.consultationFee ? <span className="text-xs text-cyan-400">Consultation: {doctor.consultationFee} DT</span> : null}
              </div>
            </div>

            <Link to={`/booking/${doctor.id}`} className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400">
              Prendre RDV
            </Link>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`relative whitespace-nowrap px-5 py-2.5 text-sm font-semibold ${tab === t.key ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                {t.label}
                {tab === t.key ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-cyan-400" /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {tab === 'infos' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Adresse</p>
              <p className="mt-2 text-sm text-white">{doctor.address ?? 'Non renseignee'}</p>
              {doctor.clinic ? <p className="mt-1 text-xs text-slate-500">{doctor.clinic}</p> : null}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Telephone</p>
              <p className="mt-2 text-sm text-white">{doctor.phone ?? 'Non renseigne'}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Langues</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(doctor.languages ?? ['Francais', 'Arabe']).map((lang) => (
                  <span key={lang} className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">{lang}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">A propos</p>
              <p className="mt-2 text-sm text-slate-300">{doctor.bio ?? 'Profil medical detaille disponible apres synchronisation complete.'}</p>
            </div>
          </div>
        ) : null}

        {tab === 'avis' ? (
          <div className="space-y-3">
            {reviews.length === 0 ? <p className="text-sm text-slate-500">Aucun avis disponible.</p> : null}
            {reviews.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.author ?? item.patientName ?? 'Patient verifie'}</p>
                  <div className="flex items-center gap-1">
                    <StarRating rating={item.rating} size="sm" />
                    <span className="text-xs font-bold text-amber-400">{item.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-300">{item.comment}</p>
                <p className="mt-2 text-xs text-slate-600">{item.consultationDate}</p>
              </article>
            ))}
          </div>
        ) : null}

        {tab === 'dispo' ? (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <p className="mb-4 text-sm text-slate-400">Creneaux disponibles</p>
            <div className="flex flex-wrap gap-2">
              {(doctor.availability ?? ['Lundi 09:00', 'Mardi 10:00', 'Mercredi 14:00']).map((slot) => (
                <span key={slot} className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {tab === 'parcours' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Formation</p>
              <p className="mt-2 text-sm text-white">{doctor.education ?? 'Doctorat en medecine'}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Certifications</p>
              <div className="mt-2 space-y-2">
                {(doctor.certifications ?? []).map((cert, idx) => (
                  <p key={`${cert}-${idx}`} className="text-sm text-slate-300">- {cert}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
