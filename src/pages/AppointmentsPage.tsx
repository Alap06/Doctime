import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Appointment } from '../types/models';

export function AppointmentsPage(): React.JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listAppointments()
      .then((res) => {
        setAppointments(res.items);
        setError(null);
      })
      .catch(() => setError('Impossible de charger vos rendez-vous. Connectez-vous puis reessayez.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Chargement des rendez-vous...</p>;
  }

  if (error) {
    return <p className="text-sm font-semibold text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">Mes rendez-vous</h1>
      <div className="grid gap-3">
        {appointments.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-bold">Docteur ID: {item.doctorId}</p>
            <p className="text-sm text-slate-600">{item.date} a {item.time}</p>
            <p className="text-sm">Statut: {item.status}</p>
            <p className="text-sm">Motif: {item.issueDescription}</p>
          </article>
        ))}
        {appointments.length === 0 ? <p>Aucun rendez-vous trouve.</p> : null}
      </div>
    </div>
  );
}
