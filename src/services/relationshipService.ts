import type { 
  Vehicle, 
  VehicleCadastro, 
  Abastecimento, 
  ChecklistDiario, 
  ChecklistSemanal,
  RawRecord
} from '../types';
import { normalizePrefix } from './normalizationService';

export interface RawDataPayload {
  cadastro: RawRecord[];
  consolidado: RawRecord[];
  abastecimentos: RawRecord[];
  checklistsDiarios: RawRecord[];
  checklistsSemanais: RawRecord[];
  revisoes: RawRecord[];
}

export interface RelationshipResult {
  vehicles: Map<string, Vehicle>;
  orphans: {
    abastecimentos: RawRecord[];
    checklistsDiarios: RawRecord[];
    checklistsSemanais: RawRecord[];
    revisoes: RawRecord[];
  };
  globalIntegrityIssues: string[];
}

function createEmptyVehicle(prefixo: string): Vehicle {
  return {
    prefixo,
    cadastro: null,
    consolidado: null,
    abastecimentos: [],
    checklistsDiarios: [],
    checklistsSemanais: [],
    revisoes: [],
    historico: [],
    alertas: [],
    integridade: {
      isOrphan: true,
      hasDuplicatedPrefix: false,
      hasDuplicatedPlate: false,
      hasInconsistentKm: false,
      hasIncompleteData: false,
      issues: []
    }
  };
}

export function processRelationships(data: RawDataPayload): RelationshipResult {
  const vehicles = new Map<string, Vehicle>();
  const plates = new Map<string, string[]>(); // placa -> [prefixos]
  
  const orphans = {
    abastecimentos: [] as RawRecord[],
    checklistsDiarios: [] as RawRecord[],
    checklistsSemanais: [] as RawRecord[],
    revisoes: [] as RawRecord[]
  };
  
  const globalIntegrityIssues: string[] = [];

  // 1. Process Cadastro (Detalhamento_Viaturas)
  data.cadastro.forEach(record => {
    const rawPrefixo = record.values['Prefixo'];
    const prefixo = normalizePrefix(rawPrefixo);
    
    if (!prefixo) {
      globalIntegrityIssues.push(`Cadastro sem prefixo válido na linha ${record.rowNumber}`);
      return;
    }

    if (vehicles.has(prefixo)) {
      const v = vehicles.get(prefixo)!;
      v.integridade.hasDuplicatedPrefix = true;
      v.integridade.issues.push(`Prefixo duplicado no Cadastro (linha ${record.rowNumber})`);
      return; // Skip overwriting, but flag it
    }

    const placa = record.values['Placa'] ? String(record.values['Placa']).trim().toUpperCase() : null;
    if (placa) {
      if (!plates.has(placa)) plates.set(placa, []);
      plates.get(placa)!.push(prefixo);
    }

    const vehicle = createEmptyVehicle(prefixo);
    vehicle.integridade.isOrphan = false; // It exists in Cadastro
    
    // Convert RawRecord to VehicleCadastro
    const cadastro: VehicleCadastro = {
      prefixo,
      placa,
      municipioUnidade: String(record.values['Município (Unidade)'] || '') || null,
      opmcb: String(record.values['OPMCB'] || '') || null,
      sgb: String(record.values['SGB'] || '') || null,
      proprietario: String(record.values['Proprietário'] || '') || null,
      municipioPlaca: String(record.values['Município (Placa)'] || '') || null,
      fabricante: String(record.values['Fabricante'] || '') || null,
      modelo: String(record.values['Modelo'] || '') || null,
      tipo: String(record.values['Tipo'] || '') || null,
      grupoNI: String(record.values['Grupo NI'] || '') || null,
      anoFabricacao: Number(record.values['Ano de Fabricação']) || null,
      anoModelo: Number(record.values['Ano do Modelo']) || null,
      grupoDCTI: String(record.values['Grupo DCTI'] || '') || null,
      status: String(record.values['Status'] || '') || null,
      volumeAgua: Number(record.values['Volume de Água']) || null,
      garagem: String(record.values['Garagem'] || '') || null,
      combustivel: String(record.values['Combustível'] || '') || null,
    };
    
    vehicle.cadastro = cadastro;
    vehicles.set(prefixo, vehicle);
  });

  // Check duplicate plates
  plates.forEach((prefixos, placa) => {
    if (prefixos.length > 1) {
      prefixos.forEach(p => {
        const v = vehicles.get(p);
        if (v) {
          v.integridade.hasDuplicatedPlate = true;
          v.integridade.issues.push(`Placa duplicada (${placa}) com outros prefixos: ${prefixos.filter(x => x !== p).join(', ')}`);
        }
      });
    }
  });

  // 2. Process Consolidado
  data.consolidado.forEach(record => {
    const prefixo = normalizePrefix(record.values['Prefixo']);
    if (!prefixo) return;
    
    let vehicle = vehicles.get(prefixo);
    if (!vehicle) {
      vehicle = createEmptyVehicle(prefixo);
      vehicle.integridade.issues.push(`Prefixo órfão encontrado no Consolidado (linha ${record.rowNumber})`);
      vehicles.set(prefixo, vehicle);
    }

    vehicle.consolidado = {
      prefixo,
      kmAtual: Number(record.values['KM Atual']) || null,
      volumeTotalLitros: Number(record.values['Volume Total (L)']) || null,
      gastoTotalCombustivel: Number(record.values['Gasto Total (R$)']) || null,
      consumoMedioKmL: Number(record.values['Consumo Médio (KM/L)']) || null,
      ultimoChecklistDiario: String(record.values['Último Checklist Diário'] || '') || null,
      statusDiario: String(record.values['Status Diário'] || '') || null,
      ultimoChecklistSemanal: String(record.values['Último Checklist Semanal'] || '') || null,
      statusSemanal: String(record.values['Status Semanal'] || '') || null,
    };
  });

  // 3. Process Abastecimentos
  data.abastecimentos.forEach(record => {
    const prefixo = normalizePrefix(record.values['Prefixo']);
    if (!prefixo) return;

    let vehicle = vehicles.get(prefixo);
    if (!vehicle) {
      orphans.abastecimentos.push(record);
      vehicle = createEmptyVehicle(prefixo);
      vehicle.integridade.issues.push(`Prefixo órfão encontrado em Abastecimentos (linha ${record.rowNumber})`);
      vehicles.set(prefixo, vehicle);
    }

    const abs: Abastecimento = {
      data: String(record.values['Data'] || ''),
      prefixo,
      placa: String(record.values['Placa'] || '') || null,
      responsavel: String(record.values['Responsavel pelo Abastecimento'] || '') || null,
      kmHodometro: Number(record.values['Km']) || null,
      volumeLitros: Number(record.values['Volume_L']) || null,
      valorTotal: Number(record.values['Valor']) || null,
      combustivel: String(record.values['Combustível'] || '') || null,
      aditivoMl: Number(record.values['Aditivo (ml)']) || null,
      pelotaoEstacao: String(record.values['Pelotão/ Estação'] || '') || null,
      posto: String(record.values['POSTO DE COMBUSTÍVEL'] || '') || null,
      consumoMedioKmL: Number(record.values['Consumo Médio (Km/L)']) || null,
    };
    vehicle.abastecimentos.push(abs);
  });

  // 4. Process Checklists Diarios
  data.checklistsDiarios.forEach(record => {
    const rawPrefixo = record.values['Prefixo'] || record.values['[06] PREFIXO DA VIATURA'] || record.values['06. PREFIXO DA VIATURA'] || record.values['Viatura'];
    const prefixo = normalizePrefix(rawPrefixo);
    if (!prefixo) return;

    let vehicle = vehicles.get(prefixo);
    if (!vehicle) {
      orphans.checklistsDiarios.push(record);
      vehicle = createEmptyVehicle(prefixo);
      vehicle.integridade.issues.push(`Prefixo órfão encontrado em Checklist Diário (linha ${record.rowNumber})`);
      vehicles.set(prefixo, vehicle);
    }

    // Parsing dynamic items can be complex. Let's assume some fields.
    // The requirement says "Preservar todos os itens originais do checklist."
    // Here we store all raw values in a raw object, but map known fields.
    const diario: ChecklistDiario = {
      timestamp: String(record.values['Carimbo de data/hora'] || ''),
      email: String(record.values['Endereço de e-mail'] || '') || null,
      motorista: String(record.values['[01] MOTORISTA RESPONSÁVEL (GRADUAÇÃO / NOME DE GUERRA)'] || record.values['[01] MOTORISTA RESPONSÁVEL'] || record.values['01. MOTORISTA RESPONSÁVEL'] || '') || null,
      reMotorista: String(record.values['[02] RE DO MOTORISTA'] || record.values['02. RE DO MOTORISTA'] || '') || null,
      prontidaoTurno: String(record.values['[03] PRONTIDÃO / TURNO DE SERVIÇO'] || '') || null,
      dataConferencia: String(record.values['[04] DATA DA CONFERÊNCIA'] || '') || null,
      baseOperacional: String(record.values['[05] POSTO / BASE OPERACIONAL'] || record.values['05. BASE OPERACIONAL'] || '') || null,
      prefixo: String(record.values['[06] PREFIXO DA VIATURA'] || record.values['06. PREFIXO DA VIATURA'] || prefixo),
      kmAtual: Number(record.values['[07] QUILOMETRAGEM ATUAL (ODÔMETRO)']) || null,
      nivelCombustivel: String(record.values['[08] NÍVEL DE COMBUSTÍVEL NA ASSUNÇÃO'] || '') || null,
      necessidadeAbastecimento: String(record.values['[39] VERIFICAR NECESSIDADE DE ABASTECIMENTO'] || '') || null,
      anomalias: String(record.values['[40] DISCRIMINAÇÃO DETALHADA DE ANOMALIAS'] || '') || null,
      itens: [] // To be parsed fully in a specific mapper
    };
    
    // We can extract items dynamically if we exclude known keys
    const knownKeys = ['Carimbo de data/hora', 'Endereço de e-mail', 'Motorista', 'RE Motorista', 'Prontidão / Turno', 'Data da Conferência', 'Base Operacional', 'Prefixo', 'KM Atual (Hodômetro)', 'Nível de Combustível', 'Necessidade de Abastecimento', 'Anomalias/Avarias Encontradas', 'Placa'];
    Object.entries(record.values).forEach(([key, value]) => {
      if (!knownKeys.includes(key)) {
        diario.itens.push({
          nome: key,
          conforme: String(value).toUpperCase() === 'CONFORME' || String(value) === 'Sim',
          observacao: String(value)
        });
      }
    });

    vehicle.checklistsDiarios.push(diario);
  });

  // 5. Process Checklists Semanais (Similar approach)
  data.checklistsSemanais.forEach(record => {
    const rawPrefixo = record.values['Prefixo'] || record.values['[06] PREFIXO DA VIATURA'] || record.values['06. PREFIXO DA VIATURA'] || record.values['Viatura'];
    const prefixo = normalizePrefix(rawPrefixo);
    if (!prefixo) return;

    let vehicle = vehicles.get(prefixo);
    if (!vehicle) {
      orphans.checklistsSemanais.push(record);
      vehicle = createEmptyVehicle(prefixo);
      vehicle.integridade.issues.push(`Prefixo órfão encontrado em Checklist Semanal (linha ${record.rowNumber})`);
      vehicles.set(prefixo, vehicle);
    }

    const semanal: ChecklistSemanal = {
      timestamp: String(record.values['Carimbo de data/hora'] || ''),
      email: String(record.values['Endereço de e-mail'] || '') || null,
      responsavel: String(record.values['[01] MOTORISTA RESPONSÁVEL (GRADUAÇÃO / NOME DE GUERRA)'] || record.values['[01] MOTORISTA RESPONSÁVEL'] || record.values['01. MOTORISTA RESPONSÁVEL'] || '') || null,
      reResponsavel: String(record.values['[02] RE DO MOTORISTA'] || record.values['02. RE DO MOTORISTA'] || '') || null,
      dataConferencia: String(record.values['[04] DATA DA CONFERÊNCIA'] || record.values['04. DATA DA CONFERÊNCIA'] || '') || null,
      baseOperacional: String(record.values['05. BASE OPERACIONAL'] || '') || null,
      prefixo: String(record.values['06. PREFIXO DA VIATURA'] || prefixo),
      kmAtual: Number(record.values['07. QUILOMETRAGEM ATUAL (ODÔMETRO)']) || null,
      nivelCombustivel: String(record.values['08. NÍVEL DE COMBUSTÍVEL NA ASSUNÇÃO'] || '') || null,
      anomalias: String(record.values['28. DISCRIMINAÇÃO DETALHADA DE AVARIAS'] || '') || null,
      itens: [] 
    };
    
    // Dynamic items mapping
    const knownKeys = ['Carimbo de data/hora', 'Endereço de e-mail', 'Responsável', 'RE Responsável', 'Data da Conferência', 'Base Operacional', 'Prefixo', 'KM Atual (Hodômetro)', 'Nível de Combustível', 'Anomalias/Avarias Encontradas', 'Placa'];
    Object.entries(record.values).forEach(([key, value]) => {
      if (!knownKeys.includes(key)) {
        semanal.itens.push({
          nome: key,
          conforme: String(value).toUpperCase() === 'CONFORME' || String(value) === 'Sim',
          observacao: String(value)
        });
      }
    });

    vehicle.checklistsSemanais.push(semanal);
  });

  // 6. Process Revisoes
  if (data.revisoes) {
    data.revisoes.forEach(record => {
      const prefixo = normalizePrefix(record.values['Viatura']);
      if (!prefixo) return;

      let vehicle = vehicles.get(prefixo);
      if (!vehicle) {
        orphans.revisoes.push(record);
        vehicle = createEmptyVehicle(prefixo);
        vehicle.integridade.issues.push(`Prefixo órfão encontrado em Revisões (linha ${record.rowNumber})`);
        vehicles.set(prefixo, vehicle);
      }

      vehicle.revisoes.push({
        id: `rev-${record.rowNumber}`,
        prefixo,
        tipoRevisao: String(record.values['Tipo de Revisão'] || '') || null,
        fluidoFreio: String(record.values['Fluido de Freio'] || '') || null,
        filtroAr: String(record.values['Filtro de Ar'] || '') || null,
        filtroAgua: String(record.values['Filtro de Água'] || '') || null,
        filtroCombustivel: String(record.values['Filtro de Combustível'] || '') || null,
        filtroOleo: String(record.values['Filtro de Óleo'] || '') || null,
        viscosidadeOleo: String(record.values['Viscosidade do Óleo'] || '') || null,
        composicaoOleo: String(record.values['Composição do Óleo'] || '') || null,
        tipoPneu: String(record.values['Tipo de Pneu'] || '') || null,
        pastilhaFreio: String(record.values['Pastilha de Freio'] || '') || null,
        discoFreio: String(record.values['Disco de Freio'] || '') || null,
        dataTroca: String(record.values['Data da Troca'] || '') || null,
        kmTroca: Number(record.values['Km da troca']) || null,
        proximaRevisaoKm: Number(record.values['Próxima Revisão (Km)']) || null,
        observacoes: String(record.values['Observações'] || '') || null,
        localRevisao: String(record.values['Local da Revisão'] || '') || null,
        kmParaProximaRevisao: Number(record.values['Km para Próxima Revisão']) || null,
        statusRevisao: String(record.values['Status da Revisão'] || '') || null,
      });
    });
  }

  // Post-processing to generate calculations, timeline, and alerts
  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR'); // ex: 15/09/2026

  vehicles.forEach(vehicle => {
    // 1. Calculate Average Consumption (already exists)
    if (vehicle.consolidado && !vehicle.consolidado.consumoMedioKmL && vehicle.abastecimentos.length >= 2) {
      const sortedAbs = [...vehicle.abastecimentos]
        .filter(a => a.kmHodometro && a.volumeLitros)
        .sort((a, b) => a.kmHodometro! - b.kmHodometro!);
        
      if (sortedAbs.length >= 2) {
        const first = sortedAbs[0];
        const last = sortedAbs[sortedAbs.length - 1];
        const totalDistance = last.kmHodometro! - first.kmHodometro!;
        
        let totalLiters = 0;
        for (let i = 1; i < sortedAbs.length; i++) {
          totalLiters += sortedAbs[i].volumeLitros!;
        }
        
        if (totalLiters > 0 && totalDistance > 0) {
          vehicle.consolidado.consumoMedioKmL = totalDistance / totalLiters;
        }
      }
    }

    // 2. Alert Engine: Checklists Diários (Quem não fez hoje)
    const isOperando = vehicle.cadastro?.status?.toLowerCase().includes('operando');
    if (isOperando) {
      // Find if there is any checklist done today
      const hasChecklistToday = vehicle.checklistsDiarios.some(c => {
        if (!c.timestamp) return false;
        // The timestamp usually comes like "15/09/2026 08:30:00" from Google Forms
        return c.timestamp.includes(todayStr);
      });

      if (!hasChecklistToday) {
        vehicle.alertas.push({
          id: `alert-ck-pendente-${vehicle.prefixo}-${Date.now()}`,
          tipo: 'CHECKLIST_DIARIO_PENDENTE',
          mensagem: `Checklist diário não foi realizado hoje (${todayStr}).`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'WARNING'
        });
      }
      
      // Also add alert if there's any recent checklist with anomaly
      const latestChecklist = vehicle.checklistsDiarios.length > 0 ? 
        [...vehicle.checklistsDiarios].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))[0] : null;
      
      if (latestChecklist && (latestChecklist.anomalias || latestChecklist.itens.some(i => !i.conforme))) {
        vehicle.alertas.push({
          id: `alert-ck-avaria-${vehicle.prefixo}-${Date.now()}`,
          tipo: 'CHECKLIST_COM_AVARIA',
          mensagem: `Avarias relatadas no último checklist diário.`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'CRITICAL'
        });
      }
    }

    // 3. Alert Engine: Revisões (Manutenção baseada no Hodômetro)
    // Find the highest known KM for the vehicle
    let highestKm = vehicle.consolidado?.kmAtual || 0;
    
    // Check daily checklists for a potentially higher KM
    vehicle.checklistsDiarios.forEach(c => {
      if (c.kmAtual && c.kmAtual > highestKm) {
        highestKm = c.kmAtual;
      }
    });

    // Check abastecimentos for a potentially higher KM
    vehicle.abastecimentos.forEach(a => {
      if (a.kmHodometro && a.kmHodometro > highestKm) {
        highestKm = a.kmHodometro;
      }
    });

    // Find the next scheduled maintenance
    const nextRevision = vehicle.revisoes.find(r => r.proximaRevisaoKm && r.proximaRevisaoKm > 0);
    
    if (nextRevision && nextRevision.proximaRevisaoKm && highestKm > 0) {
      const missingKm = nextRevision.proximaRevisaoKm - highestKm;
      
      if (missingKm <= 0) {
        vehicle.alertas.push({
          id: `alert-rev-vencida-${vehicle.prefixo}`,
          tipo: 'REVISAO_VENCIDA',
          mensagem: `Manutenção vencida! Passou ${Math.abs(missingKm)} km da revisão programada (${nextRevision.proximaRevisaoKm} km).`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'CRITICAL'
        });
      } else if (missingKm <= 200) {
        vehicle.alertas.push({
          id: `alert-rev-200-${vehicle.prefixo}`,
          tipo: 'REVISAO_PROXIMA',
          mensagem: `Atenção Crítica: Faltam apenas ${missingKm} km para a próxima revisão programada (${nextRevision.proximaRevisaoKm} km).`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'CRITICAL'
        });
      } else if (missingKm <= 400) {
        vehicle.alertas.push({
          id: `alert-rev-400-${vehicle.prefixo}`,
          tipo: 'REVISAO_PROXIMA',
          mensagem: `Atenção: Faltam ${missingKm} km para a próxima revisão programada (${nextRevision.proximaRevisaoKm} km).`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'WARNING'
        });
      } else if (missingKm <= 600) {
        vehicle.alertas.push({
          id: `alert-rev-600-${vehicle.prefixo}`,
          tipo: 'REVISAO_PROXIMA',
          mensagem: `Alerta: Faltam ${missingKm} km para a próxima revisão programada.`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'WARNING'
        });
      } else if (missingKm <= 1000) {
        vehicle.alertas.push({
          id: `alert-rev-1000-${vehicle.prefixo}`,
          tipo: 'REVISAO_PROXIMA',
          mensagem: `Aviso: Faltam ${missingKm} km para a próxima revisão programada.`,
          dataDeteccao: new Date().toISOString(),
          nivel: 'INFO'
        });
      }
    }
  });
  
  return { vehicles, orphans, globalIntegrityIssues };
}
