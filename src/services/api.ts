import { http } from './http';
import type { Appointment, Doctor, Review, UserProfile } from '../types/models';

type ListResponse<T> = {
  items: T[];
  total: number;
};

export const api = {
  health: async (): Promise<{ status: string }> => {
    const { data } = await http.get('/health');
    return data;
  },

  login: async (payload: { email: string; password: string }): Promise<{ token: string; profile: UserProfile }> => {
    const { data } = await http.post('/auth/login', payload);
    return data;
  },

  register: async (payload: { fullName: string; email: string; phone: string; password: string }) => {
    const { data } = await http.post('/auth/register', payload);
    return data;
  },

  listDoctors: async (params?: { specialty?: string; city?: string; name?: string }): Promise<ListResponse<Doctor>> => {
    const { data } = await http.get('/doctors', { params });
    return data;
  },

  getDoctor: async (doctorId: string): Promise<Doctor & { reviews?: Review[] }> => {
    const { data } = await http.get(`/doctors/${doctorId}`);
    return data;
  },

  listReviews: async (doctorId?: string): Promise<ListResponse<Review>> => {
    const { data } = await http.get('/reviews', { params: doctorId ? { doctorId } : {} });
    return data;
  },

  createReview: async (payload: {
    doctorId: string;
    patientName: string;
    rating: number;
    comment: string;
    appointmentId: string;
  }): Promise<Review> => {
    const { data } = await http.post('/reviews', payload);
    return data;
  },

  listAppointments: async (): Promise<ListResponse<Appointment>> => {
    const { data } = await http.get('/appointments');
    return data;
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
    const { data } = await http.post('/appointments', payload);
    return data;
  },

  uploadMedicalDoc: async (file: File): Promise<{ fileName: string; mimeType: string; size: number; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await http.post('/uploads/medical-doc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};
