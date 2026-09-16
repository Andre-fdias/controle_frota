import { create } from 'zustand';

export interface Filters {
  searchQuery: string;
  status: string[]; // Operando, Reserva, Baixado
  hasAlerts: boolean;
  hasPendingChecklist: boolean;
  hasIssues: boolean; // Com avarias
}

interface FilterStore {
  filters: Filters;
  setSearchQuery: (query: string) => void;
  toggleStatus: (status: string) => void;
  setHasAlerts: (value: boolean) => void;
  setHasPendingChecklist: (value: boolean) => void;
  setHasIssues: (value: boolean) => void;
  resetFilters: () => void;
}

const defaultFilters: Filters = {
  searchQuery: '',
  status: [],
  hasAlerts: false,
  hasPendingChecklist: false,
  hasIssues: false,
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: defaultFilters,
  
  setSearchQuery: (query) => set((state) => ({ 
    filters: { ...state.filters, searchQuery: query } 
  })),
  
  toggleStatus: (status) => set((state) => {
    const current = state.filters.status;
    const updated = current.includes(status) 
      ? current.filter(s => s !== status)
      : [...current, status];
    return { filters: { ...state.filters, status: updated } };
  }),
  
  setHasAlerts: (value) => set((state) => ({
    filters: { ...state.filters, hasAlerts: value }
  })),
  
  setHasPendingChecklist: (value) => set((state) => ({
    filters: { ...state.filters, hasPendingChecklist: value }
  })),
  
  setHasIssues: (value) => set((state) => ({
    filters: { ...state.filters, hasIssues: value }
  })),
  
  resetFilters: () => set({ filters: defaultFilters }),
}));
