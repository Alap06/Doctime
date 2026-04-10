import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[linear-gradient(130deg,#032b3a_0%,#0d9488_40%,#ecfeff_100%)] p-6 text-white">
      <div className="mx-auto grid min-h-[90vh] max-w-7xl items-center gap-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            HealthTech Platform 2026
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">Votre clinique digitale moderne.</h1>
          <p className="mt-6 max-w-xl text-lg text-cyan-50">
            Recherchez un medecin en Tunisie, reservez un rendez-vous et gerez votre parcours de soin sur une web app rapide,
            securisee et responsive.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="rounded-xl bg-white px-5 py-3 font-bold text-cyan-900 hover:bg-cyan-50">
              Se connecter
            </Link>
            <Link to="/register" className="rounded-xl border border-white px-5 py-3 font-bold hover:bg-white/10">
              Creer un compte
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/30 bg-white/15 p-6 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-extrabold">Fonctionnalites cle</h2>
          <ul className="mt-4 space-y-3 text-cyan-50">
            <li>Localisation complete Tunisie (villes et praticiens locaux)</li>
            <li>Recherche intelligente medecins + tri par note</li>
            <li>Carte interactive avec geolocalisation</li>
            <li>Reservation multi-step et validation medicale</li>
            <li>Dashboard patient/admin et upload documents</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
