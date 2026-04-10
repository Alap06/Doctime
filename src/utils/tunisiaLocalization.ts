import type { Doctor } from '../types/models';

type CityCoordinates = {
  lat: number;
  lng: number;
};

const TUNISIAN_CITY_COORDS: Record<string, CityCoordinates> = {
  Tunis: { lat: 36.8065, lng: 10.1815 },
  Sousse: { lat: 35.8256, lng: 10.6369 },
  Sfax: { lat: 34.7406, lng: 10.7603 },
  Monastir: { lat: 35.777, lng: 10.8262 },
  Nabeul: { lat: 36.4513, lng: 10.7357 },
  Bizerte: { lat: 37.2744, lng: 9.8739 },
  Ariana: { lat: 36.8665, lng: 10.1647 },
  BenArous: { lat: 36.7531, lng: 10.2189 },
  Kairouan: { lat: 35.6781, lng: 10.0963 },
  Gabes: { lat: 33.8815, lng: 10.0982 }
};

const CITY_ALIASES: Record<string, keyof typeof TUNISIAN_CITY_COORDS> = {
  Casablanca: 'Tunis',
  Rabat: 'Sousse',
  Marrakech: 'Sfax',
  Tanger: 'Monastir',
  Agadir: 'Nabeul',
  Fes: 'Bizerte',
  Fez: 'Bizerte',
  Tunis: 'Tunis',
  Sousse: 'Sousse',
  Sfax: 'Sfax',
  Monastir: 'Monastir',
  Nabeul: 'Nabeul',
  Bizerte: 'Bizerte',
  Ariana: 'Ariana',
  'Ben Arous': 'BenArous',
  Kairouan: 'Kairouan',
  Gabes: 'Gabes'
};

function resolveTunisiaCity(city: string): keyof typeof TUNISIAN_CITY_COORDS {
  return CITY_ALIASES[city] ?? 'Tunis';
}

export function localizeDoctorToTunisia(doctor: Doctor): Doctor {
  const cityKey = resolveTunisiaCity(doctor.city);
  const coords = TUNISIAN_CITY_COORDS[cityKey];

  return {
    ...doctor,
    city: cityKey === 'BenArous' ? 'Ben Arous' : cityKey,
    latitude: coords.lat,
    longitude: coords.lng
  };
}

export function localizeDoctorsToTunisia(doctors: Doctor[]): Doctor[] {
  return doctors.map(localizeDoctorToTunisia);
}
