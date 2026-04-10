import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      appName: 'Doctime Web',
      dashboard: 'Dashboard',
      doctors: 'Medecins',
      appointments: 'Rendez-vous',
      map: 'Carte',
      settings: 'Parametres',
      admin: 'Admin',
      login: 'Connexion',
      register: 'Inscription',
      logout: 'Deconnexion'
    }
  },
  en: {
    translation: {
      appName: 'Doctime Web',
      dashboard: 'Dashboard',
      doctors: 'Doctors',
      appointments: 'Appointments',
      map: 'Map',
      settings: 'Settings',
      admin: 'Admin',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    }
  },
  ar: {
    translation: {
      appName: 'دوك تايم',
      dashboard: 'لوحة التحكم',
      doctors: 'الأطباء',
      appointments: 'المواعيد',
      map: 'الخريطة',
      settings: 'الإعدادات',
      admin: 'المشرف',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
