import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const [email, setEmail] = useState('patient@doctime.app');
  const [password, setPassword] = useState('Password123!');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* LEFT PANEL — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[#03111f]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-3xl" />
        </div>
        <Link to="/" className="relative text-2xl font-black tracking-tight text-cyan-400">
          doc<span className="text-white">time</span>
        </Link>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">Ce que disent nos patients</p>
          <blockquote className="text-xl font-light text-white/80 leading-relaxed italic">
            "J'ai trouvé un cardiologue à Tunis disponible le lendemain. Service incroyable, vraiment."
          </blockquote>
          <div className="mt-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">MK</div>
            <div>
              <p className="text-sm font-semibold text-white">Mohamed K.</p>
              <p className="text-xs text-slate-500">Patient vérifié - Sousse</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} Doctime</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block text-2xl font-black tracking-tight text-cyan-400 mb-10">
            doc<span className="text-white">time</span>
          </Link>

          <h1 className="text-3xl font-black text-white">Bon retour 👋</h1>
          <p className="mt-1.5 text-sm text-slate-500">Connectez-vous à votre espace patient.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mot de passe</label>
                <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">Oublié ?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
              />
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
              {loading ? 'Connexion…' : 'Se connecter →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Inscription gratuite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}