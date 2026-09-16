import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      themeMode: 'light',
      toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'controle-frota-settings',
    }
  )
);
