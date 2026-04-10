import { create } from 'zustand';
import type { Language } from '../types/models';

type SettingsState = {
  darkMode: boolean;
  language: Language;
  highContrast: boolean;
  textScale: number;
  setDarkMode: (value: boolean) => void;
  setLanguage: (value: Language) => void;
  setHighContrast: (value: boolean) => void;
  setTextScale: (value: number) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  language: 'fr',
  highContrast: false,
  textScale: 1,
  setDarkMode: (value) => set({ darkMode: value }),
  setLanguage: (value) => set({ language: value }),
  setHighContrast: (value) => set({ highContrast: value }),
  setTextScale: (value) => set({ textScale: Math.min(1.3, Math.max(0.9, value)) })
}));
