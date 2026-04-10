import type { Doctor, Review } from '../types/models';
import type { ExtendedDoctor } from '../services/doctorStorage';

const CLINICS_BY_CITY: Record<string, string[]> = {
  Tunis: ['Clinique El Amen', 'Polyclinique Les Jasmins', 'Centre Medical Carthage', 'Hopital Prive du Lac'],
  Sousse: ['Clinique La Medina', 'Polyclinique Sousse Centre', 'Clinique Les Oliviers', 'Hopital Farhat Hached'],
  Sfax: ['Clinique El Boustan', 'Polyclinique El Alya', 'Clinique Les Jardins', 'Centre Medical Sfax'],
  Monastir: ['Clinique La Corniche', 'Polyclinique Monastir', 'Clinique El Amir'],
  Nabeul: ['Clinique Les Roses', 'Polyclinique Nabeul Centre', 'Clinique El Manar'],
  Bizerte: ['Clinique La Cote', 'Polyclinique Bizerte Nord', 'Clinique Les Pins'],
  Ariana: ['Clinique El Ghazala', 'Polyclinique Ariana', 'Clinique Les Palmiers'],
  'Ben Arous': ['Clinique Ettadhamen', 'Polyclinique Ben Arous', 'Clinique El Mourouj'],
  Kairouan: ['Clinique El Okba', 'Polyclinique Kairouan', 'Clinique Les Agdal'],
  Gabes: ['Clinique El Waha', 'Polyclinique Gabes', 'Clinique La Palmeraie']
};

const SPECIALTY_DESCRIPTIONS: Record<string, string> = {
  Cardiologue: 'Specialiste des maladies du coeur et des vaisseaux sanguins.',
  Dermatologue: 'Specialiste de la peau, des cheveux et des ongles.',
  'Gynecologue': 'Specialiste de la sante reproductive feminine.',
  Pediatre: 'Specialiste de la sante des enfants et adolescents.',
  Ophtalmologue: 'Specialiste des yeux et de la vision.',
  Dentiste: 'Specialiste des soins dentaires.',
  ORL: 'Specialiste des oreilles, du nez et de la gorge.',
  Neurologue: 'Specialiste du systeme nerveux.',
  Psychiatre: 'Specialiste des troubles mentaux.',
  Rhumatologue: 'Specialiste des articulations et des os.',
  Endocrinologue: 'Specialiste des hormones et du metabolisme.',
  'Gastro-enterologue': 'Specialiste du systeme digestif.',
  Urologue: 'Specialiste des voies urinaires.',
  Pneumologue: 'Specialiste des poumons et voies respiratoires.',
  Hematologue: 'Specialiste du sang.',
  Chirurgien: 'Specialiste des interventions chirurgicales.',
  Orthopediste: 'Specialiste des os, articulations et muscles.',
  'Medecin generaliste': 'Premier recours medical pour les soins courants.',
  Radiologue: 'Specialiste de l\'imagerie medicale.',
  Oncologue: 'Specialiste du cancer.'
};

const LANGUAGES_POOL = ['Francais', 'Arabe', 'Anglais', 'Italien', 'Allemand'];

function getLanguages(index: number): string[] {
  const selected = ['Francais', 'Arabe'];
  if (index % 2 === 0) selected.push(LANGUAGES_POOL[2]);
  if (index % 3 === 0) selected.push(LANGUAGES_POOL[3]);
  if (index % 5 === 0) selected.push(LANGUAGES_POOL[4]);
  return Array.from(new Set(selected));
}

function getCertifications(specialty: string, index: number): string[] {
  const certs = [
    `Certification europeenne en ${specialty}`,
    'Diplome universitaire de recherche medicale',
    'Formation continue en nouvelles technologies medicales',
    'Certification en gestion de cabinet medical',
    'Master en sante publique',
    'Certification en telemedecine',
    'Diplome en urgences medicales',
    'Certification en ethique medicale'
  ];
  const num = 3 + (index % 3);
  return certs.slice(0, num);
}

function generateBio(fullName: string, specialty: string, years: number, index: number): string {
  const lastName = fullName.split(' ').slice(-1)[0] ?? 'Medecin';
  const firstPart = [
    `Dr ${lastName} est un medecin ${specialty.toLowerCase()} reconnu pour son expertise et sa bienveillance.`,
    `Avec ${years} ans d'experience, Dr ${lastName} accompagne ses patients avec rigueur et empathie.`,
    `Dr ${lastName} propose une prise en charge personnalisee en ${specialty.toLowerCase()}.`
  ];

  const secondPart = [
    'Sa pratique medicale repose sur l\'ecoute active, la prevention et des recommandations fondees sur les preuves.',
    'Il/Elle participe regulierement a des congres medicaux pour suivre les dernieres avancees du domaine.',
    'Son approche privilegie la clarte, la confiance et l\'accompagnement dans la duree.'
  ];

  return `${firstPart[index % firstPart.length]} ${secondPart[index % secondPart.length]}`;
}

function generateAvailability(index: number): string[] {
  const slots = [
    'Lundi 09:00', 'Lundi 10:00', 'Lundi 11:00', 'Lundi 14:00', 'Lundi 15:00',
    'Mardi 09:30', 'Mardi 10:30', 'Mardi 14:30', 'Mardi 15:30',
    'Mercredi 10:00', 'Mercredi 11:00', 'Mercredi 14:00',
    'Jeudi 09:00', 'Jeudi 10:00', 'Jeudi 14:30', 'Jeudi 15:30',
    'Vendredi 09:30', 'Vendredi 10:30', 'Vendredi 14:00',
    'Samedi 09:00', 'Samedi 10:00'
  ];

  const numberOfSlots = 5 + (index % 4);
  return slots.slice(index % 4, index % 4 + numberOfSlots).sort();
}

export function generateCompleteDoctorProfile(baseDoctor: Doctor, index: number): ExtendedDoctor {
  const city = baseDoctor.city || 'Tunis';
  const clinics = CLINICS_BY_CITY[city] || CLINICS_BY_CITY.Tunis;
  const yearsOfExperience = baseDoctor.experienceYears ?? 5 + (index % 25);

  return {
    ...baseDoctor,
    clinic: clinics[index % clinics.length],
    languages: getLanguages(index),
    yearsOfExperience,
    consultationFee: 50 + (index % 6) * 10,
    education: `Doctorat en ${baseDoctor.specialty} - ${index % 2 === 0 ? 'Universite de Tunis El Manar' : 'Universite de Sousse'} (${2000 + (index % 20)})`,
    certifications: getCertifications(baseDoctor.specialty, index),
    bio: `${SPECIALTY_DESCRIPTIONS[baseDoctor.specialty] ?? 'Specialiste medical qualifie.'} ${generateBio(baseDoctor.fullName, baseDoctor.specialty, yearsOfExperience, index)}`,
    availability: baseDoctor.availability && baseDoctor.availability.length > 0 ? baseDoctor.availability : generateAvailability(index),
    address: baseDoctor.address || `${baseDoctor.city}, Tunisie`
  };
}

export function generateSampleReviews(doctorId: string, rating: number): Review[] {
  const names = ['Ahmed K.', 'Sarra M.', 'Karim B.', 'Nadia L.', 'Mohamed A.', 'Hela R.', 'Walid S.', 'Amira T.'];
  const comments = [
    'Excellent medecin, tres a l\'ecoute et professionnel.',
    'Tres bon suivi et explications claires.',
    'Diagnostic precis et accompagnement rassurant.',
    'Consultation efficace, recommande sans hesitation.',
    'Cabinet bien organise, equipe accueillante.',
    'Approche humaine et tres pedagogique.',
    'Resultats positifs apres traitement.',
    'Tres satisfaite de la prise en charge.'
  ];

  return names.map((name, index) => ({
    id: `review-${doctorId}-${index}`,
    doctorId,
    author: name,
    patientName: name,
    rating: Math.max(3.5, Math.min(5, Number((rating - 0.4 + (index % 4) * 0.2).toFixed(1)))),
    comment: comments[index % comments.length],
    consultationDate: new Date(Date.now() - index * 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  }));
}
