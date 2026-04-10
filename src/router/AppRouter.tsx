import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DoctorsPage } from '../pages/DoctorsPage';
import { MapPage } from '../pages/MapPage';
import { DoctorProfilePage } from '../pages/DoctorProfilePage';
import { BookingPage } from '../pages/BookingPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { UploadPage } from '../pages/UploadPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminPage } from '../pages/AdminPage';
import { DiagnosticPage } from '../pages/DiagnosticPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/doctors', element: <DoctorsPage /> },
          { path: '/doctors/:doctorId', element: <DoctorProfilePage /> },
          { path: '/booking/:doctorId', element: <BookingPage /> },
          { path: '/map', element: <MapPage /> },
          { path: '/appointments', element: <AppointmentsPage /> },
          { path: '/upload', element: <UploadPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/diagnostic', element: <DiagnosticPage /> }
        ]
      },
      {
        element: <ProtectedRoute roles={['admin']} />,
        children: [{ path: '/admin', element: <AdminPage /> }]
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
]);

export function AppRouter(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
