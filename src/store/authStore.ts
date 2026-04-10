import { create } from 'zustand';
import { api } from '../services/api';
import type { UserProfile } from '../types/models';

type AuthState = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: { fullName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => void;
};

const savedToken = localStorage.getItem('doctime_web_token');
const savedUser = localStorage.getItem('doctime_web_user');

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: savedUser ? (JSON.parse(savedUser) as UserProfile) : null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login({ email, password });
      localStorage.setItem('doctime_web_token', response.token);
      localStorage.setItem('doctime_web_user', JSON.stringify(response.profile));
      set({ token: response.token, user: response.profile, loading: false });
      return true;
    } catch {
      set({ loading: false, error: 'Email ou mot de passe invalide.' });
      return false;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.register(payload);
      set({ loading: false });
      return true;
    } catch {
      set({ loading: false, error: 'Inscription impossible pour le moment.' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('doctime_web_token');
    localStorage.removeItem('doctime_web_user');
    set({ token: null, user: null, error: null });
  }
}));
