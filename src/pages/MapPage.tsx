import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import type { Doctor } from '../types/models';
import { localizeDoctorsToTunisia } from '../utils/tunisiaLocalization';
import { doctorStorage } from '../services/doctorStorage';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icônes personnalisées par spécialité
const getMarkerIcon = (specialty: string) => {
  const colors: Record<string, string> = {
    'Cardiologue': '#ef4444',
    'Dermatologue': '#f59e0b',
    'Gynécologue': '#ec4899',
    'Pédiatre': '#10b981',
    'Ophtalmologue': '#3b82f6',
    'Dentiste': '#8b5cf6',
    'ORL': '#06b6d4',
    'Neurologue': '#6366f1',
    'Psychiatre': '#a855f7',
    'Rhumatologue': '#14b8a6',
  };
  
  const color = colors[specialty] || '#6b7280';
  
  return L.divIcon({
    html: `<div class="custom-marker" style="background-color: ${color};">
            <div class="marker-pulse" style="background-color: ${color};"></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>`,
    className: 'custom-marker-div',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  });
};

// Composant pour centrer la carte
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Composant de statistiques
function MapStats({ doctors, filteredCount, maxDistance }: { doctors: Doctor[]; filteredCount: number; maxDistance: number }) {
  const specialties = useMemo(() => {
    const specMap = new Map<string, number>();
    doctors.forEach(d => {
      if (d.latitude && d.longitude) {
        specMap.set(d.specialty, (specMap.get(d.specialty) || 0) + 1);
      }
    });
    return Array.from(specMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [doctors]);

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600">EN DIRECT</span>
            </div>
            <span className="text-xs text-slate-500">{filteredCount} médecins visibles</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{doctors.filter(d => d.latitude && d.longitude).length}</p>
              <p className="text-xs text-slate-500">médecins localisés</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-2xl font-black text-slate-900">{maxDistance}</p>
              <p className="text-xs text-slate-500">km de rayon</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex flex-wrap gap-1">
              {specialties.map(([spec, count]) => (
                <span key={spec} className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                  {spec.split(' ')[0]} {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant de filtres
function MapFilters({ 
  maxDistance, 
  setMaxDistance, 
  selectedSpecialty, 
  setSelectedSpecialty,
  selectedCity,
  setSelectedCity,
  showOnlyAvailable,
  setShowOnlyAvailable,
  specialties,
  cities
}: { 
  maxDistance: number; 
  setMaxDistance: (d: number) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (s: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  showOnlyAvailable: boolean;
  setShowOnlyAvailable: (v: boolean) => void;
  specialties: string[];
  cities: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className={`bg-white rounded-2xl shadow-2xl border border-slate-100 transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-slate-700"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filtres</span>
            </div>
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Rayon de recherche</label>
                <div className="flex gap-2">
                  {[3, 10, 20, 50].map((distance) => (
                    <button
                      key={distance}
                      onClick={() => setMaxDistance(distance)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                        maxDistance === distance
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {distance} km
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Toutes spécialités</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Toutes villes</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-600">Afficher uniquement les médecins disponibles</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant de carte
export function MapPage(): React.JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState(20);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        // Essayer d'abord depuis le cache
        const cachedDoctors = doctorStorage.getAllDoctors();
        if (cachedDoctors.length > 0) {
          setDoctors(cachedDoctors);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Sinon charger depuis l'API
        const res = await api.listDoctors();
        const tunisianDoctors = localizeDoctorsToTunisia(res.items);
        setDoctors(tunisianDoctors);
      } catch {
        setError('Impossible de charger la carte des médecins.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDoctors();
  }, []);

  const filtered = useMemo(() => {
    return doctors.filter((doctor) => {
      const hasCoords = doctor.latitude && doctor.longitude;
      const withinDistance = (doctor.distanceKm ?? 999) <= maxDistance;
      const matchesSpecialty = selectedSpecialty ? doctor.specialty === selectedSpecialty : true;
      const matchesCity = selectedCity ? doctor.city === selectedCity : true;
      const isAvailable = showOnlyAvailable ? (doctor.availability && doctor.availability.length > 0) : true;
      
      return hasCoords && withinDistance && matchesSpecialty && matchesCity && isAvailable;
    });
  }, [doctors, maxDistance, selectedSpecialty, selectedCity, showOnlyAvailable]);

  const center: [number, number] = useMemo(() => {
    if (selectedDoctor?.latitude && selectedDoctor?.longitude) {
      return [selectedDoctor.latitude, selectedDoctor.longitude];
    }
    if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
      return [filtered[0].latitude, filtered[0].longitude];
    }
    return [36.8065, 10.1815];
  }, [filtered, selectedDoctor]);

  const specialties = Array.from(new Set(doctors.filter(d => d.latitude && d.longitude).map(d => d.specialty))).sort();
  const cities = Array.from(new Set(doctors.filter(d => d.latitude && d.longitude).map(d => d.city))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement de la carte interactive...</p>
          <p className="text-sm text-slate-400 mt-1">Localisation des médecins en Tunisie</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Carte indisponible</h2>
          <p className="text-rose-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Carte interactive des médecins
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {filtered.length} médecins trouvés • {specialties.length} spécialités • {cities.length} villes
              </p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Vue en liste
            </Link>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-100px)]">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          className="z-0"
        >
          <MapController center={center} zoom={12} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Cercles de rayon */}
          {filtered.map((doctor) => (
            doctor.latitude && doctor.longitude && (
              <Circle
                key={`circle-${doctor.id}`}
                center={[doctor.latitude, doctor.longitude]}
                radius={maxDistance * 1000}
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.05,
                  weight: 1,
                  opacity: 0.3
                }}
              />
            )
          ))}
          
          {/* Marqueurs */}
          {filtered.map((doctor) => {
            if (!(doctor.latitude && doctor.longitude)) {
              return null;
            }

            const markerIcon = getMarkerIcon(doctor.specialty);
            const markerHtml = markerIcon.options.html;
            const markerColor = typeof markerHtml === 'string'
              ? (markerHtml.match(/#[a-f0-9]{6}/i)?.[0] ?? '#6b7280')
              : '#6b7280';

            return (
              <Marker
                key={doctor.id}
                position={[doctor.latitude, doctor.longitude]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => setSelectedDoctor(doctor)
                }}
              >
                <Popup className="custom-popup">
                  <div className="min-w-[240px] p-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white`}
                        style={{ backgroundColor: markerColor }}>
                        {doctor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-sm">{doctor.fullName}</h3>
                        <p className="text-xs text-cyan-600 font-medium">{doctor.specialty}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{doctor.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>{doctor.rating.toFixed(1)} ({doctor.reviewCount} avis)</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="flex-1 text-center py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        Voir profil
                      </Link>
                      <Link
                        to={`/booking/${doctor.id}`}
                        className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Stats Panel */}
        <MapStats doctors={doctors} filteredCount={filtered.length} maxDistance={maxDistance} />
        
        {/* Filters Panel */}
        <MapFilters
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          showOnlyAvailable={showOnlyAvailable}
          setShowOnlyAvailable={setShowOnlyAvailable}
          specialties={specialties}
          cities={cities}
        />
        
        {/* Légende */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-xl rounded-xl shadow-lg p-3 text-xs">
          <p className="font-semibold text-slate-700 mb-2">Spécialités</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-slate-600">Cardiologue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
              <span className="text-slate-600">Dermatologue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ec4899' }} />
              <span className="text-slate-600">Gynécologue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
              <span className="text-slate-600">Pédiatre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6b7280' }} />
              <span className="text-slate-600">Autres</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        .custom-marker-div {
          background: transparent;
          border: none;
        }
        
        .custom-marker {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.2s;
          cursor: pointer;
        }
        
        .custom-marker:hover {
          transform: scale(1.1);
        }
        
        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 1.5s infinite;
          opacity: 0.6;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        
        .leaflet-popup-close-button {
          font-size: 18px !important;
          padding: 4px !important;
        }
      `}</style>
    </div>
  );
}