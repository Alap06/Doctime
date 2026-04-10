import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { doctorStorage } from '../services/doctorStorage';

interface StatBlock {
  title: string;
  value: string;
  to: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  bgGradient: string;
}

// Composant d'icône réutilisable
const Icons = {
  Doctors: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Appointments: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Satisfaction: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Documents: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendingDown: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

// Composant de carte statistique animée
function StatCard({ block, index }: { block: StatBlock; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${block.bgGradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${block.bgGradient} text-white shadow-lg`}>
            {block.icon}
          </div>
          {block.trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              block.trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {block.trend.isPositive ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
              <span>{block.trend.value}%</span>
            </div>
          )}
        </div>
        
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{block.title}</p>
        <p className="mt-2 text-4xl font-black text-slate-900">{block.value}</p>
        
        <Link
          to={block.to}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors group/link"
        >
          <span>Voir détails</span>
          <Icons.ChevronRight />
        </Link>
      </div>
      
      {/* Decorative Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${block.bgGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </motion.div>
  );
}

// Composant d'activité récente
function RecentActivity() {
  const activities = [
    { id: 1, type: 'appointment', message: 'Rendez-vous confirmé avec Dr. Amine Ben Ali', time: 'Il y a 2 heures', icon: '📅' },
    { id: 2, type: 'review', message: 'Nouvel avis reçu pour Dr. Yasmine Trabelsi', time: 'Il y a 5 heures', icon: '⭐' },
    { id: 3, type: 'document', message: 'Document médical téléchargé', time: 'Hier', icon: '📄' },
    { id: 4, type: 'appointment', message: 'Rappel: Rendez-vous avec Dr. Sami Gharbi demain', time: 'Il y a 1 jour', icon: '🔔' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-2xl bg-white shadow-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Activity />
            <h2 className="text-lg font-bold text-slate-900">Activité récente</h2>
          </div>
          <Link to="/activity" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
            Voir tout
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
              </div>
              <Icons.ChevronRight />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Composant de rendez-vous à venir
function UpcomingAppointments() {
  const appointments = [
    { id: 1, doctor: 'Dr. Amine Ben Ali', specialty: 'Cardiologue', date: '15 Avril 2026', time: '14:30', status: 'confirmé' },
    { id: 2, doctor: 'Dr. Yasmine Trabelsi', specialty: 'Dermatologue', date: '18 Avril 2026', time: '10:00', status: 'en attente' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="rounded-2xl bg-white shadow-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Icons.Calendar />
          <h2 className="text-lg font-bold text-slate-900">Rendez-vous à venir</h2>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {appointments.map((apt, idx) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + idx * 0.1 }}
            className="px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-slate-900">{apt.doctor}</p>
                <p className="text-xs text-slate-500 mt-0.5">{apt.specialty}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-600">{apt.date}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600">{apt.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  apt.status === 'confirmé' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {apt.status}
                </span>
                <Link
                  to={`/booking/${apt.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Modifier
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <Link to="/appointments" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center justify-center gap-1">
          Gérer tous les rendez-vous
          <Icons.ArrowRight />
        </Link>
      </div>
    </motion.div>
  );
}

// Composant de bienvenue personnalisé
function WelcomeHeader() {
  const [greeting, setGreeting] = useState('');
  const [userName] = useState('Ahmed');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Voici un résumé de votre activité médicale en Tunisie
          </p>
        </div>
        
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-500 transition-all duration-300 group"
        >
          <Icons.Doctors />
          <span>Prendre un rendez-vous</span>
          <Icons.ArrowRight />
        </Link>
      </div>
    </motion.div>
  );
}

// Composant principal du Dashboard
export function DashboardPage(): React.JSX.Element {
  const [doctorsCount, setDoctorsCount] = useState(0);
  
  useEffect(() => {
    // Récupérer le nombre réel de médecins depuis le stockage
    const doctors = doctorStorage.getAllDoctors();
    setDoctorsCount(doctors.length);
  }, []);
  
  const blocks: StatBlock[] = [
    {
      title: 'Médecins disponibles',
      value: `${doctorsCount}+`,
      to: '/doctors',
      icon: <Icons.Doctors />,
      trend: { value: 12, isPositive: true },
      color: 'cyan',
      bgGradient: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Rendez-vous actifs',
      value: '32',
      to: '/appointments',
      icon: <Icons.Appointments />,
      trend: { value: 8, isPositive: true },
      color: 'violet',
      bgGradient: 'from-violet-500 to-purple-500'
    },
    {
      title: 'Satisfaction patient',
      value: '4.8/5',
      to: '/doctors',
      icon: <Icons.Satisfaction />,
      trend: { value: 5, isPositive: true },
      color: 'amber',
      bgGradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Documents médicaux',
      value: '8',
      to: '/upload',
      icon: <Icons.Documents />,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <WelcomeHeader />
        
        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {blocks.map((block, index) => (
            <StatCard key={block.title} block={block} index={index} />
          ))}
        </div>
        
        {/* Bottom Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity />
          <UpcomingAppointments />
        </div>
        
        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 p-4 rounded-2xl bg-white shadow-lg border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              🩺 Plateforme médicale tunisienne - Soins de qualité pour tous
            </p>
            <div className="flex gap-3">
              <Link
                to="/doctors"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Trouver un médecin
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                to="/appointments"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Mes rendez-vous
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                to="/upload"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Mes documents
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}