import type { Appointment, AppointmentStatus, Doctor, Review, UserProfile } from '../types/models';
import {
  clearCurrentUser,
  createAppointmentMock,
  createUserMock,
  deleteUserMock,
  ensureMockData,
  getCurrentUser,
  getDoctorMock,
  listAppointmentsMock,
  listDoctorsMock,
  listUsersMock,
  loginMock,
  registerMock,
  updateAppointmentStatusMock,
  updateDoctorAvailabilityMock
} from './mockDb';

type ListResponse<T> = {
  items: T[];
  total: number;
};

export const api = {
  health: async (): Promise<{ status: string }> => {
    ensureMockData();
    return { status: 'ok-mock' };
  },

  login: async (payload: { email: string; password: string }): Promise<{ token: string; profile: UserProfile }> => {
    const profile = loginMock(payload.email, payload.password);
    return {
      token: `mock-token-${profile.id}`,
      profile
    };
  },

  register: async (payload: { fullName: string; email: string; password: string; role: 'user' | 'doctor' }): Promise<UserProfile> => {
    return registerMock(payload);
  },

  listDoctors: async (params?: { specialty?: string; city?: string; name?: string }): Promise<ListResponse<Doctor>> => {
    const filtered = listDoctorsMock().filter((doctor) => {
      const bySpecialty = params?.specialty ? doctor.specialty === params.specialty : true;
      const byCity = params?.city ? doctor.city === params.city : true;
      const byName = params?.name ? doctor.fullName.toLowerCase().includes(params.name.toLowerCase()) : true;
      return bySpecialty && byCity && byName;
    });

    return {
      items: filtered,
      total: filtered.length
    };
  },

  getDoctor: async (doctorId: string): Promise<Doctor & { reviews?: Review[] }> => {
    return getDoctorMock(doctorId);
  },

  listReviews: async (doctorId?: string): Promise<ListResponse<Review>> => {
    const reviews: Review[] = [];
    if (doctorId) {
      return { items: reviews.filter((r) => r.doctorId === doctorId), total: 0 };
    }
    return { items: reviews, total: reviews.length };
  },

  createReview: async (payload: {
    doctorId: string;
    patientName: string;
    rating: number;
    comment: string;
    appointmentId: string;
  }): Promise<Review> => {
    return {
      id: `review-${Date.now()}`,
      doctorId: payload.doctorId,
      patientName: payload.patientName,
      author: payload.patientName,
      rating: payload.rating,
      comment: payload.comment,
      consultationDate: new Date().toISOString().slice(0, 10)
    };
  },

  listAppointments: async (): Promise<ListResponse<Appointment>> => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('not-authenticated');
    }

    const items = listAppointmentsMock(currentUser);
    return {
      items,
      total: items.length
    };
  },

  createAppointment: async (payload: {
    patientName: string;
    phone: string;
    age: number;
    sex: 'M' | 'F';
    issueDescription: string;
    urgency: boolean;
    date: string;
    time: string;
    doctorId: string;
  }): Promise<Appointment> => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('not-authenticated');
    }
    return createAppointmentMock(payload, currentUser);
  },

  uploadMedicalDoc: async (file: File): Promise<{ fileName: string; mimeType: string; size: number; url: string }> => {
    return {
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url: `mock://uploads/${encodeURIComponent(file.name)}`
    };
  },

  listUsers: async (): Promise<ListResponse<UserProfile>> => {
    const items = listUsersMock();
    return { items, total: items.length };
  },

  createUser: async (payload: { fullName: string; email: string; password: string; role: 'user' | 'doctor' }): Promise<UserProfile> => {
    return createUserMock(payload);
  },

  deleteUser: async (userId: string): Promise<void> => {
    deleteUserMock(userId);
  },

  updateAppointmentStatus: async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
    return updateAppointmentStatusMock(appointmentId, status);
  },

  updateDoctorAvailability: async (doctorId: string, slots: string[]): Promise<Doctor> => {
    return updateDoctorAvailabilityMock(doctorId, slots);
  },

  logout: async (): Promise<void> => {
    clearCurrentUser();
  }
};
