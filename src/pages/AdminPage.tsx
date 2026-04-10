import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Appointment, Doctor } from '../types/models';

export function AdminPage(): React.JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listDoctors()
      .then((res) => {
        setDoctors(res.items);
        setError(null);
      })
      .catch(() => setError('Impossible de charger les statistiques admin.'));

    api
      .listAppointments()
      .then((res) => setAppointments(res.items))
      .catch(() => setAppointments([]));
  }, []);

  const upcoming = appointments.filter((item) => item.status === 'upcoming').length;
  const cancelled = appointments.filter((item) => item.status === 'cancelled').length;

  if (error) {
    return <p className="text-sm font-semibold text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm">Docteurs actifs</p><p className="text-3xl font-black">{doctors.length}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm">RDV a venir</p><p className="text-3xl font-black">{upcoming}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm">RDV annules</p><p className="text-3xl font-black">{cancelled}</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 font-bold">Top praticiens</p>
        <div className="space-y-2 text-sm">
          {doctors.slice(0, 8).map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{doctor.fullName}</span>
              <span>{doctor.specialty} - {doctor.rating.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
