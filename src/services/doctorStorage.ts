import type { Doctor } from '../types/models';

export interface ExtendedDoctor extends Doctor {
  clinic?: string;
  languages?: string[];
  yearsOfExperience?: number;
  consultationFee?: number;
  education?: string;
  certifications?: string[];
  bio?: string;
  availability?: string[];
}

class DoctorStorageService {
  private storageKey = 'tunisian_doctors_db';
  private doctors: Map<string, ExtendedDoctor> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(this.storageKey);
      if (!stored) {
        return;
      }
      const data = JSON.parse(stored) as Record<string, ExtendedDoctor>;
      this.doctors = new Map(Object.entries(data));
    } catch {
      this.doctors = new Map();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const data = Object.fromEntries(this.doctors);
      window.localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Ignore storage errors to keep app usable.
    }
  }

  getAllDoctors(): ExtendedDoctor[] {
    return Array.from(this.doctors.values());
  }

  getDoctorById(id: string): ExtendedDoctor | null {
    return this.doctors.get(id) ?? null;
  }

  saveDoctor(doctor: ExtendedDoctor): void {
    this.doctors.set(doctor.id, doctor);
    this.saveToStorage();
  }

  saveDoctors(doctors: ExtendedDoctor[]): void {
    doctors.forEach((doctor) => {
      this.doctors.set(doctor.id, doctor);
    });
    this.saveToStorage();
  }

  hasDoctor(id: string): boolean {
    return this.doctors.has(id);
  }

  clear(): void {
    this.doctors.clear();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.storageKey);
    }
  }
}

export const doctorStorage = new DoctorStorageService();
