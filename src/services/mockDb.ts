import type { Appointment, AppointmentStatus, Doctor, UserProfile, UserRole } from '../types/models';
import { doctorStorage, type ExtendedDoctor } from './doctorStorage';

type MockUser = UserProfile & {
  password: string;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
};

type CreateAppointmentInput = {
  doctorId: string;
  patientName: string;
  phone: string;
  age: number;
  sex: 'M' | 'F';
  issueDescription: string;
  urgency: boolean;
  date: string;
  time: string;
};

const USERS_KEY = 'doctime_mock_users';
const CURRENT_USER_KEY = 'doctime_mock_current_user';
const APPOINTMENTS_KEY = 'doctime_mock_appointments';

const DOCTOR_SEED: ExtendedDoctor[] = [
  {
    id: 'doc-001',
    fullName: 'Dr Yasmine Trabelsi',
    specialty: 'Dermatologue',
    city: 'Tunis',
    rating: 4.8,
    reviewCount: 84,
    distanceKm: 4,
    experienceYears: 11,
    address: 'Centre medical du Lac, Tunis',
    phone: '+216 20 111 222',
    latitude: 36.8235,
    longitude: 10.2101,
    availability: ['Lundi 09:00', 'Mardi 14:00', 'Jeudi 10:30'],
    clinic: 'Centre medical du Lac',
    languages: ['Francais', 'Arabe', 'Anglais'],
    yearsOfExperience: 11,
    consultationFee: 90,
    education: 'Faculte de medecine de Tunis',
    certifications: ['Dermatologie clinique', 'Laser dermatologique'],
    bio: 'Specialiste en dermatologie clinique et esthetique.'
  },
  {
    id: 'doc-002',
    fullName: 'Dr Amine Ben Ali',
    specialty: 'Cardiologue',
    city: 'Sousse',
    rating: 4.7,
    reviewCount: 103,
    distanceKm: 9,
    experienceYears: 14,
    address: 'Avenue Habib Bourguiba, Sousse',
    phone: '+216 22 333 444',
    latitude: 35.8288,
    longitude: 10.6402,
    availability: ['Lundi 08:30', 'Mercredi 11:00', 'Vendredi 09:30'],
    clinic: 'Clinique du Littoral',
    languages: ['Francais', 'Arabe'],
    yearsOfExperience: 14,
    consultationFee: 110,
    education: 'Faculte de medecine de Sousse',
    certifications: ['Cardiologie interventionnelle'],
    bio: 'Cardiologue experimente en prevention et suivi cardiaque.'
  },
  {
    id: 'doc-003',
    fullName: 'Dr Sami Gharbi',
    specialty: 'Medecin generaliste',
    city: 'Sfax',
    rating: 4.5,
    reviewCount: 62,
    distanceKm: 7,
    experienceYears: 8,
    address: 'Route de l aeroport, Sfax',
    phone: '+216 27 555 666',
    latitude: 34.7451,
    longitude: 10.7613,
    availability: ['Mardi 09:00', 'Jeudi 15:00', 'Samedi 10:00'],
    clinic: 'Cabinet medical Sfax Centre',
    languages: ['Francais', 'Arabe'],
    yearsOfExperience: 8,
    consultationFee: 65,
    education: 'Faculte de medecine de Sfax',
    certifications: ['Medecine familiale'],
    bio: 'Prise en charge globale des pathologies courantes.'
  }
];

const DEFAULT_USERS: MockUser[] = [
  {
    id: 'user-001',
    fullName: 'Utilisateur Test',
    email: 'user@test.com',
    password: '123456',
    role: 'user'
  },
  {
    id: 'doctor-account-001',
    fullName: 'Docteur Test',
    email: 'doctor@test.com',
    password: '123456',
    role: 'doctor',
    doctorId: 'doc-001'
  },
  {
    id: 'admin-001',
    fullName: 'Admin Doctime',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  }
];

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function toPublicUser(user: MockUser): UserProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    doctorId: user.doctorId
  };
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedDoctors(): void {
  const existing = doctorStorage.getAllDoctors();
  if (existing.length > 0) {
    return;
  }
  doctorStorage.saveDoctors(DOCTOR_SEED);
}

export function ensureMockData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  seedDoctors();

  const users = safeRead<MockUser[]>(USERS_KEY, []);
  if (users.length === 0) {
    write(USERS_KEY, DEFAULT_USERS);
  } else {
    const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
    for (const seedUser of DEFAULT_USERS) {
      if (!byEmail.has(seedUser.email.toLowerCase())) {
        users.push(seedUser);
      }
    }
    write(USERS_KEY, users);
  }

  const appointments = safeRead<Appointment[]>(APPOINTMENTS_KEY, []);
  if (!Array.isArray(appointments)) {
    write(APPOINTMENTS_KEY, []);
  }
}

function getUsersInternal(): MockUser[] {
  ensureMockData();
  return safeRead<MockUser[]>(USERS_KEY, []);
}

function setUsersInternal(users: MockUser[]): void {
  write(USERS_KEY, users);
}

function getAppointmentsInternal(): Appointment[] {
  ensureMockData();
  return safeRead<Appointment[]>(APPOINTMENTS_KEY, []);
}

function setAppointmentsInternal(appointments: Appointment[]): void {
  write(APPOINTMENTS_KEY, appointments);
}

export function getCurrentUser(): UserProfile | null {
  ensureMockData();
  return safeRead<UserProfile | null>(CURRENT_USER_KEY, null);
}

export function clearCurrentUser(): void {
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function loginMock(email: string, password: string): UserProfile {
  const users = getUsersInternal();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);

  if (!found) {
    throw new Error('invalid-credentials');
  }

  const publicUser = toPublicUser(found);
  write(CURRENT_USER_KEY, publicUser);
  return publicUser;
}

export function registerMock(payload: RegisterInput): UserProfile {
  const users = getUsersInternal();
  const email = payload.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('email-exists');
  }

  const user: MockUser = {
    id: makeId('user'),
    fullName: payload.fullName.trim(),
    email,
    password: payload.password,
    role: payload.role
  };

  if (payload.role === 'doctor') {
    const doctorId = makeId('doc');
    const doctor: ExtendedDoctor = {
      id: doctorId,
      fullName: payload.fullName.trim().startsWith('Dr ') ? payload.fullName.trim() : `Dr ${payload.fullName.trim()}`,
      specialty: 'Medecin generaliste',
      city: 'Tunis',
      rating: 4.2,
      reviewCount: 0,
      distanceKm: 5,
      experienceYears: 3,
      address: 'Cabinet prive, Tunis',
      phone: '+216 00 000 000',
      latitude: 36.8065,
      longitude: 10.1815,
      availability: ['Lundi 09:00', 'Mardi 10:00', 'Jeudi 14:00'],
      clinic: 'Cabinet prive',
      languages: ['Francais', 'Arabe'],
      yearsOfExperience: 3,
      consultationFee: 70,
      education: 'Diplome en medecine generale',
      certifications: ['Ordre des medecins'],
      bio: 'Nouveau medecin inscrit sur la plateforme.'
    };

    doctorStorage.saveDoctor(doctor);
    user.doctorId = doctorId;
  }

  users.push(user);
  setUsersInternal(users);

  return toPublicUser(user);
}

export function listUsersMock(): UserProfile[] {
  return getUsersInternal().map(toPublicUser);
}

export function createUserMock(payload: RegisterInput): UserProfile {
  return registerMock(payload);
}

export function deleteUserMock(id: string): void {
  const users = getUsersInternal();
  const current = getCurrentUser();
  const target = users.find((u) => u.id === id);

  if (!target) {
    throw new Error('user-not-found');
  }

  if (target.role === 'admin') {
    throw new Error('cannot-delete-admin');
  }

  if (current?.id === id) {
    throw new Error('cannot-delete-current-user');
  }

  setUsersInternal(users.filter((u) => u.id !== id));
}

export function listDoctorsMock(): Doctor[] {
  ensureMockData();
  return doctorStorage.getAllDoctors();
}

export function getDoctorMock(doctorId: string): ExtendedDoctor {
  const doctor = doctorStorage.getDoctorById(doctorId);
  if (!doctor) {
    throw new Error('doctor-not-found');
  }
  return doctor;
}

export function updateDoctorAvailabilityMock(doctorId: string, slots: string[]): ExtendedDoctor {
  const doctor = getDoctorMock(doctorId);
  const next = {
    ...doctor,
    availability: slots.filter((s) => s.trim().length > 0)
  };
  doctorStorage.saveDoctor(next);
  return next;
}

export function createAppointmentMock(payload: CreateAppointmentInput, currentUser: UserProfile): Appointment {
  const doctor = getDoctorMock(payload.doctorId);

  const appointment: Appointment = {
    id: makeId('apt'),
    userId: currentUser.id,
    doctorId: payload.doctorId,
    doctorName: doctor.fullName,
    patientName: payload.patientName,
    phone: payload.phone,
    age: payload.age,
    sex: payload.sex,
    issueDescription: payload.issueDescription,
    urgency: payload.urgency,
    date: payload.date,
    time: payload.time,
    status: 'upcoming'
  };

  const appointments = getAppointmentsInternal();
  appointments.unshift(appointment);
  setAppointmentsInternal(appointments);
  return appointment;
}

export function listAppointmentsMock(currentUser: UserProfile): Appointment[] {
  const appointments = getAppointmentsInternal();

  if (currentUser.role === 'admin') {
    return appointments;
  }

  if (currentUser.role === 'doctor') {
    const doctorId = currentUser.doctorId;
    if (!doctorId) {
      return [];
    }
    return appointments.filter((a) => a.doctorId === doctorId);
  }

  return appointments.filter((a) => a.userId === currentUser.id);
}

export function updateAppointmentStatusMock(appointmentId: string, status: AppointmentStatus): Appointment {
  const appointments = getAppointmentsInternal();
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index === -1) {
    throw new Error('appointment-not-found');
  }

  const updated = { ...appointments[index], status };
  appointments[index] = updated;
  setAppointmentsInternal(appointments);
  return updated;
}
