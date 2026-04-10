import { Link } from 'react-router-dom';

export function NotFoundPage(): React.JSX.Element {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-black text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">La page demandee n'existe pas.</p>
        <Link to="/" className="mt-5 inline-block rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white">
          Retour a l'accueil
        </Link>
      </div>
    </div>
  );
}
