import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/models';

export function RegisterPage(): React.JSX.Element {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('user');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const ok = await register({ fullName, email, password, role });
    if (ok) {
      navigate('/login');
      return;
    }
    setError('Inscription impossible. Vérifiez les champs.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block text-2xl font-black tracking-tight text-cyan-400 mb-6">
            doc<span className="text-white">time</span>
          </Link>
          <h1 className="text-3xl font-black text-white">Créer un compte</h1>
          <p className="mt-1.5 text-sm text-slate-500">Rejoignez des milliers de patients satisfaits en Tunisie.</p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1.5 mb-8 justify-center">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1 w-12 rounded-full transition-all ${n === 1 ? 'bg-cyan-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom complet</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Prénom Nom"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Rôle</label>
              <select
                aria-label="Selection du role"
                value={role}
                onChange={(e) => setRole(e.target.value as Exclude<UserRole, 'admin'>)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition-all"
              >
                <option className="text-slate-900" value="user">Utilisateur (Patient)</option>
                <option className="text-slate-900" value="doctor">Docteur</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-xl bg-cyan-500 px-4 py-3.5 font-bold text-slate-950 hover:bg-cyan-400 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {loading ? 'Création…' : 'Créer mon compte →'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-600">
            En vous inscrivant, vous acceptez nos{' '}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Conditions d'utilisation</a>
            {' '}et notre{' '}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Politique de confidentialité</a>.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}