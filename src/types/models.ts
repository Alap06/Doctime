export type UserRole = 'patient' | 'doctor' | 'admin';

export type UserProfile = {
  id: string;
  fullName: string;
  role: UserRole;
};

export type Doctor = {
  id: string;
  fullName: string;
  specialty: string;
  city: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  experienceYears?: number;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  availability?: string[];
};

export type Review = {
  id: string;
  doctorId: string;
  patientName?: string;
  author?: string;
  rating: number;
  comment: string;
  consultationDate: string;
};

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientName?: string;
  phone?: string;
  age?: number;
  sex?: 'M' | 'F';
  issueDescription: string;
  urgency: boolean;
  date: string;
  time: string;
  status: AppointmentStatus;
};

export type Language = 'fr' | 'en' | 'ar';
