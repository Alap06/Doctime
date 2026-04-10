import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorStorage } from '../services/doctorStorage';

export function DiagnosticPage(): React.JSX.Element {
  const [, setVersion] = useState(0);

  const doctors = doctorStorage.getAllDoctors();
  const bySpecialty = doctors.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.specialty] = (acc[doc.specialty] ?? 0) + 1;
    return acc;
  }, {});

  const topSpecialties = Object.entries(bySpecialty)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const avgRating =
    doctors.length > 0 ? doctors.reduce((sum, doc) => sum + doc.rating, 0) / doctors.length : 0;

  const stats = {
    totalDoctors: doctors.length,
    specialtyCount: Object.keys(bySpecialty).length,
    avgRating,
    topSpecialties
  };

  const clearCache = (): void => {
    doctorStorage.clear();
    setVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black">Diagnostic de cache medecins</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVersion((v) => v + 1)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              Rafraichir
            </button>
            <button
              onClick={clearCache}
              className="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500"
            >
              Vider le cache
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total medecins</p>
            <p className="mt-2 text-3xl font-black text-cyan-400">{stats.totalDoctors}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Specialites</p>
            <p className="mt-2 text-3xl font-black text-emerald-400">{stats.specialtyCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Moyenne avis</p>
            <p className="mt-2 text-3xl font-black text-amber-400">{stats.avgRating.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">Top specialites en cache</h2>
          {stats.topSpecialties.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Aucune donnee en cache.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {stats.topSpecialties.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2">
                  <span>{name}</span>
                  <span className="font-semibold text-cyan-400">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <Link to="/doctors" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
            Retour a la liste des medecins
          </Link>
        </div>
      </div>
    </div>
  );
}
