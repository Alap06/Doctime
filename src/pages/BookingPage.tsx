import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Doctor } from '../types/models';

type Step = 'identity' | 'slot' | 'medical' | 'confirm';

export function BookingPage(): React.JSX.Element {
  const { doctorId = '' } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [step, setStep] = useState<Step>('identity');

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [date, setDate] = useState('2026-05-10');
  const [time, setTime] = useState('09:00');
  const [issueDescription, setIssueDescription] = useState('');
  const [urgency, setUrgency] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDoctor(doctorId)
      .then((res) => {
        setDoctor(res);
        setError(null);
      })
      .catch(() => setError('Impossible de charger ce medecin.'));
  }, [doctorId]);

  const identityValid = patientName.length > 2 && phone.length >= 8 && Number(age) >= 18;
  const medicalValid = issueDescription.length >= 10;
  const canSubmit = identityValid && medicalValid;

  const stepOrder: Step[] = useMemo(() => ['identity', 'slot', 'medical', 'confirm'], []);

  const next = () => {
    const index = stepOrder.indexOf(step);
    if (index < stepOrder.length - 1) {
      if (step === 'identity' && !identityValid) return;
      if (step === 'medical' && !medicalValid) return;
      setStep(stepOrder[index + 1]);
    }
  };

  const back = () => {
    const index = stepOrder.indexOf(step);
    if (index > 0) {
      setStep(stepOrder[index - 1]);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    try {
      await api.createAppointment({
        patientName,
        phone,
        age: Number(age),
        sex,
        issueDescription,
        urgency,
        date,
        time,
        doctorId
      });
      navigate('/appointments');
    } catch {
      setError('Reservation impossible. Verifiez votre session puis reessayez.');
    }
  };

  if (error && !doctor) {
    return <p className="text-sm font-semibold text-rose-600">{error}</p>;
  }

  if (!doctor) {
    return <p>Chargement de la reservation...</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl font-black">Reservation avec {doctor.fullName}</h1>
      <p className="text-sm text-slate-500">Etape {stepOrder.indexOf(step) + 1} / 4</p>
      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

      {step === 'identity' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border px-4 py-3" placeholder="Nom patient" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          <input className="rounded-xl border px-4 py-3" placeholder="Telephone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="rounded-xl border px-4 py-3" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
          <select aria-label="Selectionner le sexe" className="rounded-xl border px-4 py-3" value={sex} onChange={(e) => setSex(e.target.value as 'M' | 'F')}>
            <option value="F">Femme</option>
            <option value="M">Homme</option>
          </select>
        </div>
      ) : null}

      {step === 'slot' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <input aria-label="Date du rendez-vous" className="rounded-xl border px-4 py-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input aria-label="Heure du rendez-vous" className="rounded-xl border px-4 py-3" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      ) : null}

      {step === 'medical' ? (
        <div className="space-y-3">
          <textarea className="min-h-28 w-full rounded-xl border px-4 py-3" placeholder="Decrire le motif medical" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={urgency} onChange={(e) => setUrgency(e.target.checked)} />
            Consultation urgente
          </label>
        </div>
      ) : null}

      {step === 'confirm' ? (
        <div className="rounded-xl bg-cyan-50 p-4 text-sm">
          <p>Patient: {patientName}</p>
          <p>Date/Heure: {date} {time}</p>
          <p>Urgence: {urgency ? 'Oui' : 'Non'}</p>
          <p>Motif: {issueDescription}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {step !== 'identity' ? (
          <button type="button" onClick={back} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">
            Retour
          </button>
        ) : null}
        {step !== 'confirm' ? (
          <button type="button" onClick={next} className="rounded-xl bg-cyan-700 px-4 py-2 font-semibold text-white">
            Continuer
          </button>
        ) : (
          <button type="submit" className="rounded-xl bg-cyan-700 px-4 py-2 font-semibold text-white" disabled={!canSubmit}>
            Confirmer rendez-vous
          </button>
        )}
      </div>
    </form>
  );
}
