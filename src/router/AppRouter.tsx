import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const DoctorsPage = lazy(() => import('../pages/DoctorsPage').then((m) => ({ default: m.DoctorsPage })));
const MapPage = lazy(() => import('../pages/MapPage').then((m) => ({ default: m.MapPage })));
const DoctorProfilePage = lazy(() => import('../pages/DoctorProfilePage').then((m) => ({ default: m.DoctorProfilePage })));
const BookingPage = lazy(() => import('../pages/BookingPage').then((m) => ({ default: m.BookingPage })));
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage').then((m) => ({ default: m.AppointmentsPage })));
const UploadPage = lazy(() => import('../pages/UploadPage').then((m) => ({ default: m.UploadPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('../pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage').then((m) => ({ default: m.DiagnosticPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function LazyPage({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Suspense fallback={<div className="py-8 text-sm text-slate-600">Chargement...</div>}>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <LazyPage><HomePage /></LazyPage> },
  { path: '/login', element: <LazyPage><LoginPage /></LazyPage> },
  { path: '/register', element: <LazyPage><RegisterPage /></LazyPage> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <LazyPage><DashboardPage /></LazyPage> },
          { path: '/doctors', element: <LazyPage><DoctorsPage /></LazyPage> },
          { path: '/doctors/:doctorId', element: <LazyPage><DoctorProfilePage /></LazyPage> },
          { path: '/booking/:doctorId', element: <LazyPage><BookingPage /></LazyPage> },
          { path: '/map', element: <LazyPage><MapPage /></LazyPage> },
          { path: '/appointments', element: <LazyPage><AppointmentsPage /></LazyPage> },
          { path: '/upload', element: <LazyPage><UploadPage /></LazyPage> },
          { path: '/settings', element: <LazyPage><SettingsPage /></LazyPage> },
          { path: '/diagnostic', element: <LazyPage><DiagnosticPage /></LazyPage> }
        ]
      },
      {
        element: <ProtectedRoute roles={['admin']} />,
        children: [{ path: '/admin', element: <LazyPage><AdminPage /></LazyPage> }]
      }
    ]
  },
  { path: '*', element: <LazyPage><NotFoundPage /></LazyPage> }
]);

export function AppRouter(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
