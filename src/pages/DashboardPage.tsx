import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Appointment, Doctor } from '../types/models';

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export function DashboardPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotInput, setSlotInput] = useState('Lundi 09:00, Mardi 11:00, Jeudi 14:00');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const [doctorsRes, appointmentsRes] = await Promise.all([api.listDoctors(), api.listAppointments()]);
        setDoctors(doctorsRes.items);
        setAppointments(appointmentsRes.items);
      } catch {
        setDoctors([]);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const upcoming = useMemo(() => appointments.filter((a) => a.status === 'upcoming').length, [appointments]);
  const completed = useMemo(() => appointments.filter((a) => a.status === 'completed').length, [appointments]);

  const doctorPatients = useMemo(() => {
    const names = appointments.map((a) => a.patientName ?? '').filter((n) => n.trim().length > 0);
    return Array.from(new Set(names));
  }, [appointments]);

  const saveAvailability = async (): Promise<void> => {
    if (!user?.doctorId) {
      return;
    }

    const slots = slotInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await api.updateDoctorAvailability(user.doctorId, slots);
      setNotice('Disponibilites mises a jour.');
    } catch {
      setNotice('Mise a jour impossible pour le moment.');
    }
  };

  if (!user) {
    return <p className="text-sm text-slate-600">Session invalide.</p>;
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Chargement du dashboard...</p>;
  }

  if (user.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard Admin</h1>
          <p className="text-sm text-slate-500">Vue globale de la plateforme mock.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Utilisateurs" value="3+" subtitle="Comptes mock persists" />
          <StatCard title="Docteurs" value={doctors.length} subtitle="Dans le catalogue" />
          <StatCard title="Rendez-vous" value={appointments.length} subtitle={`${upcoming} a venir`} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-bold text-slate-900">Actions admin</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/admin" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Gerer utilisateurs</Link>
            <Link to="/appointments" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Voir tous les rendez-vous</Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'doctor') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard Docteur</h1>
          <p className="text-sm text-slate-500">Patients, disponibilites et suivi des consultations.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Mes rendez-vous" value={appointments.length} subtitle="Total" />
          <StatCard title="A venir" value={upcoming} subtitle="Consultations planifiees" />
          <StatCard title="Patients" value={doctorPatients.length} subtitle="Patients uniques" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-bold text-slate-900">Liste patients</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {doctorPatients.length === 0 ? <p>Aucun patient pour le moment.</p> : null}
              {doctorPatients.map((patient) => (
                <div key={patient} className="rounded-lg bg-slate-50 px-3 py-2">{patient}</div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-bold text-slate-900">Gerer disponibilites</p>
            <p className="mt-1 text-xs text-slate-500">Separe les creneaux par une virgule, ex: Lundi 09:00, Mardi 14:00</p>
            <textarea
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              className="mt-3 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <button onClick={saveAvailability} className="mt-3 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">
              Enregistrer
            </button>
            {notice ? <p className="mt-2 text-xs font-semibold text-cyan-700">{notice}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Dashboard Patient</h1>
        <p className="text-sm text-slate-500">Recherchez des docteurs et suivez vos rendez-vous.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Docteurs" value={doctors.length} subtitle="Disponibles" />
        <StatCard title="Mes rendez-vous" value={appointments.length} subtitle="Total" />
        <StatCard title="Consultations" value={completed} subtitle="Terminees" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-bold text-slate-900">Actions rapides</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/doctors" className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">Voir les docteurs</Link>
          <Link to="/map" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Carte des docteurs</Link>
          <Link to="/appointments" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Mes rendez-vous</Link>
        </div>
      </div>
    </div>
  );
}
