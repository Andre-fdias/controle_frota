export interface Vehicle {
  prefixo: string;
  cadastro: VehicleCadastro | null;
  consolidado: VehicleConsolidado | null;
  abastecimentos: Abastecimento[];
  checklistsDiarios: ChecklistDiario[];
  checklistsSemanais: ChecklistSemanal[];
  historico: HistoricoEvento[];
  revisoes: Revisao[];
  alertas: VehicleAlert[];
  integridade: DataIntegrity;
}

export interface VehicleCadastro {
  prefixo: string;
  placa: string | null;
  municipioUnidade: string | null;
  opmcb: string | null;
  sgb: string | null;
  proprietario: string | null;
  municipioPlaca: string | null;
  fabricante: string | null;
  modelo: string | null;
  tipo: string | null;
  grupoNI: string | null;
  anoFabricacao: number | null;
  anoModelo: number | null;
  grupoDCTI: string | null;
  status: string | null;
  volumeAgua: number | null;
  garagem: string | null;
  combustivel: string | null;
}

export interface VehicleConsolidado {
  prefixo: string;
  kmAtual: number | null;
  volumeTotalLitros: number | null;
  gastoTotalCombustivel: number | null;
  consumoMedioKmL: number | null;
  ultimoChecklistDiario: string | null;
  statusDiario: string | null;
  ultimoChecklistSemanal: string | null;
  statusSemanal: string | null;
}

export interface Abastecimento {
  data: string;
  prefixo: string;
  placa: string | null;
  responsavel: string | null;
  kmHodometro: number | null;
  volumeLitros: number | null;
  valorTotal: number | null;
  combustivel: string | null;
  aditivoMl: number | null;
  pelotaoEstacao: string | null;
  posto: string | null;
  consumoMedioKmL: number | null;
}

export interface Revisao {
  id: string;
  prefixo: string;
  tipoRevisao: string | null;
  fluidoFreio: string | null;
  filtroAr: string | null;
  filtroAgua: string | null;
  filtroCombustivel: string | null;
  filtroOleo: string | null;
  viscosidadeOleo: string | null;
  composicaoOleo: string | null;
  tipoPneu: string | null;
  pastilhaFreio: string | null;
  discoFreio: string | null;
  dataTroca: string | null;
  kmTroca: number | null;
  proximaRevisaoKm: number | null;
  observacoes: string | null;
  localRevisao: string | null;
  kmParaProximaRevisao: number | null;
  statusRevisao: string | null;
}

export interface ChecklistItem {
  nome: string;
  conforme: boolean;
  observacao?: string;
}

export interface ChecklistDiario {
  timestamp: string | null;
  email: string | null;
  motorista: string | null;
  reMotorista: string | null;
  prontidaoTurno: string | null;
  dataConferencia: string | null;
  baseOperacional: string | null;
  prefixo: string;
  kmAtual: number | null;
  nivelCombustivel: string | null;
  itens: ChecklistItem[];
  necessidadeAbastecimento: string | null;
  anomalias: string | null;
}

export interface ChecklistSemanal {
  timestamp: string | null;
  email: string | null;
  responsavel: string | null;
  reResponsavel: string | null;
  dataConferencia: string | null;
  baseOperacional: string | null;
  prefixo: string;
  kmAtual: number | null;
  nivelCombustivel: string | null;
  itens: ChecklistItem[];
  anomalias: string | null;
}

export interface RawRecord {
  sourceSheet: string;
  rowNumber: number;
  values: Record<string, unknown>;
}

export type EventType = 'ABASTECIMENTO' | 'CHECKLIST_DIARIO' | 'CHECKLIST_SEMANAL' | 'AVARIA' | 'EVENTO_RELEVANTE';

export interface HistoricoEvento {
  id: string;
  data: string;
  tipo: EventType;
  descricao: string;
  dadosOriginais?: unknown;
}

export type AlertType = 
  | 'CHECKLIST_DIARIO_PENDENTE'
  | 'CHECKLIST_SEMANAL_ATRASADO'
  | 'CHECKLIST_COM_AVARIA'
  | 'PREFIXO_ORFAO'
  | 'PREFIXO_DUPLICADO'
  | 'PLACA_DUPLICADA'
  | 'KM_INCONSISTENTE'
  | 'ABASTECIMENTO_INCONSISTENTE'
  | 'DADOS_AUSENTES'
  | 'CONSUMO_FORA_DO_PADRAO'
  | 'REVISAO_PROXIMA'
  | 'REVISAO_VENCIDA';

export interface VehicleAlert {
  id: string;
  tipo: AlertType;
  mensagem: string;
  dataDeteccao: string;
  nivel: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface DataIntegrity {
  isOrphan: boolean;
  hasDuplicatedPrefix: boolean;
  hasDuplicatedPlate: boolean;
  hasInconsistentKm: boolean;
  hasIncompleteData: boolean;
  issues: string[];
}
