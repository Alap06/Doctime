import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Appointment, AppointmentStatus } from '../types/models';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  upcoming: 'A venir',
  completed: 'Termine',
  cancelled: 'Annule'
};

export function AppointmentsPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async (): Promise<void> => {
    try {
      const res = await api.listAppointments();
      setAppointments(res.items);
      setError(null);
    } catch {
      setError('Impossible de charger les rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const changeStatus = async (appointmentId: string, status: AppointmentStatus): Promise<void> => {
    try {
      await api.updateAppointmentStatus(appointmentId, status);
      await loadAppointments();
    } catch {
      setError('Impossible de modifier le statut.');
    }
  };

  if (loading) {
    return <p>Chargement des rendez-vous...</p>;
  }

  if (error) {
    return <p className="text-sm font-semibold text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">
        {user?.role === 'doctor' ? 'Consultations du docteur' : user?.role === 'admin' ? 'Tous les rendez-vous' : 'Mes rendez-vous'}
      </h1>

      <div className="grid gap-3">
        {appointments.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{item.doctorName ?? `Docteur ${item.doctorId}`}</p>
                <p className="text-sm text-slate-600">Patient: {item.patientName ?? 'N/A'}</p>
                <p className="text-sm text-slate-600">{item.date} a {item.time}</p>
                <p className="text-sm">Motif: {item.issueDescription}</p>
                <p className="text-sm font-semibold">Statut: {STATUS_LABEL[item.status]}</p>
              </div>

              {(user?.role === 'doctor' || user?.role === 'admin') ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void changeStatus(item.id, 'completed')}
                    className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                  >
                    Terminer
                  </button>
                  <button
                    type="button"
                    onClick={() => void changeStatus(item.id, 'cancelled')}
                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  >
                    Annuler
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        ))}

        {appointments.length === 0 ? <p>Aucun rendez-vous trouve.</p> : null}
      </div>
    </div>
  );
}
