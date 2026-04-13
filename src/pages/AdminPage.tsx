import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';
import type { UserProfile, UserRole } from '../types/models';

export function AdminPage(): React.JSX.Element {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('user');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadUsers = async (): Promise<void> => {
    try {
      const res = await api.listUsers();
      setUsers(res.items);
      setError(null);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await api.createUser({ fullName, email, password, role });
      setFullName('');
      setEmail('');
      setPassword('123456');
      setRole('user');
      setNotice('Utilisateur ajoute avec succes.');
      await loadUsers();
    } catch {
      setError('Creation impossible. Verifie email/role.');
    }
  };

  const onDelete = async (userId: string): Promise<void> => {
    setError(null);
    setNotice(null);
    try {
      await api.deleteUser(userId);
      setNotice('Utilisateur supprime.');
      await loadUsers();
    } catch {
      setError('Suppression refusee (admin courant ou compte admin).');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Dashboard Admin</h1>
        <p className="text-sm text-slate-500">Ajouter/supprimer des utilisateurs dans le mode mock.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm">Total utilisateurs</p><p className="text-3xl font-black">{users.length}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm">Docteurs</p><p className="text-3xl font-black">{users.filter((u) => u.role === 'doctor').length}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm">Patients</p><p className="text-3xl font-black">{users.filter((u) => u.role === 'user').length}</p></div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-bold">Ajouter un utilisateur</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <select value={role} onChange={(e) => setRole(e.target.value as Exclude<UserRole, 'admin'>)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm">
            <option value="user">Utilisateur</option>
            <option value="doctor">Docteur</option>
          </select>
        </div>
        <button className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
          Ajouter
        </button>
      </form>

      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      {notice ? <p className="text-sm font-semibold text-emerald-600">{notice}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 font-bold">Tous les utilisateurs</p>
        <div className="space-y-2 text-sm">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.email} - {user.role}</p>
              </div>
              <button
                type="button"
                onClick={() => void onDelete(user.id)}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
