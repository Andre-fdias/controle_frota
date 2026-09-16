import { create } from 'zustand';
import type { Vehicle, RawRecord } from '../types';

interface SystemState {
  status: 'Dados atualizados' | 'Atualizando dados...' | 'Exibindo dados armazenados' | 'Não foi possível atualizar';
  lastUpdate: Date | null;
  datasetVersion: string | null;
}

interface VehicleStore {
  vehicles: Map<string, Vehicle>;
  orphans: {
    abastecimentos: RawRecord[];
    checklistsDiarios: RawRecord[];
    checklistsSemanais: RawRecord[];
  };
  globalIntegrityIssues: string[];
  systemState: SystemState;
  
  // Actions
  setVehiclesData: (
    vehicles: Map<string, Vehicle>, 
    orphans: { abastecimentos: RawRecord[], checklistsDiarios: RawRecord[], checklistsSemanais: RawRecord[] },
    globalIntegrityIssues: string[]
  ) => void;
  setSystemState: (state: Partial<SystemState>) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: new Map(),
  orphans: {
    abastecimentos: [],
    checklistsDiarios: [],
    checklistsSemanais: [],
  },
  globalIntegrityIssues: [],
  systemState: {
    status: 'Exibindo dados armazenados',
    lastUpdate: null,
    datasetVersion: null,
  },
  
  setVehiclesData: (vehicles, orphans, globalIntegrityIssues) => set({ vehicles, orphans, globalIntegrityIssues }),
  setSystemState: (state) => set((prev) => ({ 
    systemState: { ...prev.systemState, ...state } 
  })),
}));
