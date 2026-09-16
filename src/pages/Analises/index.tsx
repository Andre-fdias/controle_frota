import React, { useMemo } from 'react';
import { Box, Typography, Grid, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import Assessment from '@mui/icons-material/Assessment';
import Speed from '@mui/icons-material/Speed';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import AttachMoney from '@mui/icons-material/AttachMoney';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Build from '@mui/icons-material/Build';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Warning from '@mui/icons-material/Warning';
import EventBusy from '@mui/icons-material/EventBusy';
import { useVehicleStore } from '../../store/vehicleStore';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Legend, Line, ComposedChart 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6', '#6366f1', '#ec4899'];

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'rgba(10, 14, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', p: 1, borderRadius: '8px', boxShadow: '0 4px 8px -4px rgba(0,0,0,0.5)' }}>
        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', mb: 0.5 }}>{label || payload[0].name}</Typography>
        {payload.map((p: any, i: number) => {
          let value = p.value;
          if (p.name === 'Gasto' || p.dataKey === 'gasto' || p.name === 'Custo/KM') {
            value = `R$ ${Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          } else if (p.name === 'KM' || p.dataKey === 'kmAtual') {
            value = `${Number(p.value).toLocaleString('pt-BR')} km`;
          }
          return (
            <Typography key={i} sx={{ color: p.color || p.fill, fontSize: '10px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: p.color || p.fill }} />
              {p.name || p.dataKey}: {value}
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
};

const KpiCardAnalise = ({ title, value, icon, color }: any) => (
  <Box sx={{ ...glassPanelStyle, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
    <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 36, height: 36, border: `1px solid ${color}30` }}>
      {React.cloneElement(icon, { fontSize: 'small' })}
    </Avatar>
    <Box>
      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Typography>
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.1, mt: 0.2 }}>{value}</Typography>
    </Box>
  </Box>
);

// Função simples para calcular diferença em dias
const diffDays = (date1: Date, date2: Date) => {
  return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 3600 * 24);
};

// Função para parse simples de datas 'dd/MM/yyyy HH:mm:ss'
const parseBrDate = (str: string) => {
  if (!str) return null;
  const parts = str.split(' ');
  const dParts = parts[0].split('/');
  if (dParts.length !== 3) return null;
  return new Date(Number(dParts[2]), Number(dParts[1]) - 1, Number(dParts[0]));
};

const Analises: React.FC = () => {
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const vehicles = Array.from(vehiclesMap.values());

  // 1. Cálculos de KPIs Superiores (Adicionando Média de Baixadas)
  const kpis = useMemo(() => {
    let kmTotal = 0, litrosTotal = 0, gastoTotal = 0;
    let baixadas = 0;
    let diasEntreRevisoesCount = 0;
    let diasEntreRevisoesSum = 0;

    vehicles.forEach(v => {
      let vKmAtual = v.consolidado?.kmAtual || 0;
      let vGasto = v.consolidado?.gastoTotalCombustivel || 0;
      let vLitros = v.consolidado?.volumeTotalLitros || 0;

      // Se consolidado estiver zerado ou ausente, calcular dinamicamente pelos Abastecimentos e Checklists
      if (vKmAtual === 0) {
        v.abastecimentos?.forEach(a => {
          if (a.kmHodometro && a.kmHodometro > vKmAtual) vKmAtual = a.kmHodometro;
        });
        v.checklistsDiarios?.forEach(c => {
          if (c.kmAtual && c.kmAtual > vKmAtual) vKmAtual = c.kmAtual;
        });
      }

      if (vGasto === 0) {
        v.abastecimentos?.forEach(a => {
          vGasto += a.valorTotal || 0;
          vLitros += a.volumeLitros || 0;
        });
      }

      kmTotal += vKmAtual;
      gastoTotal += vGasto;
      litrosTotal += vLitros;

      if (v.cadastro?.status?.toLowerCase().includes('baixado')) {
        baixadas++;
      }

      // Tentativa de calcular tempo médio entre revisões de uma mesma viatura
      const revs = v.revisoes?.filter(r => r.dataTroca).sort((a, b) => {
        const d1 = parseBrDate(a.dataTroca!);
        const d2 = parseBrDate(b.dataTroca!);
        if (d1 && d2) return d1.getTime() - d2.getTime();
        return 0;
      }) || [];

      if (revs.length >= 2) {
        for (let i = 1; i < revs.length; i++) {
          const d1 = parseBrDate(revs[i-1].dataTroca!);
          const d2 = parseBrDate(revs[i].dataTroca!);
          if (d1 && d2) {
            diasEntreRevisoesSum += diffDays(d2, d1);
            diasEntreRevisoesCount++;
          }
        }
      }
    });
    
    const custoMedioKm = kmTotal > 0 ? gastoTotal / kmTotal : 0;
    const mediaBaixadas = vehicles.length > 0 ? (baixadas / vehicles.length) * 100 : 0;
    const tempoMedioRev = diasEntreRevisoesCount > 0 ? diasEntreRevisoesSum / diasEntreRevisoesCount : 0;

    return {
      kmTotal, gastoTotal, custoMedioKm, 
      mediaBaixadas, tempoMedioRev
    };
  }, [vehicles]);

  // 2. Gráfico Donut: Problemas Apresentados (Avarias/Alertas)
  const problemasData = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach(v => {
      v.alertas?.forEach(a => {
        const nome = a.tipo.replace(/_/g, ' ');
        counts[nome] = (counts[nome] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 problemas
  }, [vehicles]);

  // 3. Gráfico Combinado: Gasto de Combustível vs Total Rodado (Top 10)
  const gastoKmData = useMemo(() => {
    return vehicles
      .map(v => {
        let gasto = v.consolidado?.gastoTotalCombustivel || 0;
        let kmAtual = v.consolidado?.kmAtual || 0;

        if (gasto === 0) {
          v.abastecimentos?.forEach(a => { gasto += a.valorTotal || 0; });
        }
        if (kmAtual === 0) {
          v.abastecimentos?.forEach(a => { if (a.kmHodometro && a.kmHodometro > kmAtual) kmAtual = a.kmHodometro; });
          v.checklistsDiarios?.forEach(c => { if (c.kmAtual && c.kmAtual > kmAtual) kmAtual = c.kmAtual; });
        }

        return { prefixo: v.prefixo, gasto, kmAtual };
      })
      .filter(v => v.gasto > 0)
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 10);
  }, [vehicles]);

  // 4. Lógica de Forecast (Previsão de Data para Revisão Futura)
  const forecastData = useMemo(() => {
    const list: any[] = [];
    vehicles.forEach(v => {
      let kmAtual = v.consolidado?.kmAtual || 0;
      if (kmAtual === 0) {
        v.abastecimentos?.forEach(a => { if (a.kmHodometro && a.kmHodometro > kmAtual) kmAtual = a.kmHodometro; });
        v.checklistsDiarios?.forEach(c => { if (c.kmAtual && c.kmAtual > kmAtual) kmAtual = c.kmAtual; });
      }
      
      if (kmAtual === 0) return;

      // Pegar a revisão mais crítica ou mais próxima que não está vencida
      const pendentes = v.revisoes?.filter(r => r.kmParaProximaRevisao !== null && (r.kmParaProximaRevisao || 0) > 0) || [];
      if (pendentes.length === 0) return;
      
      const proximaRev = pendentes.reduce((prev, curr) => 
        ((curr.kmParaProximaRevisao || 999999) < (prev.kmParaProximaRevisao || 999999)) ? curr : prev
      );

      const kmFaltante = proximaRev.kmParaProximaRevisao || 0;

      // Calcular média de KM por dia baseado em abastecimentos
      const abs = v.abastecimentos || [];
      const absValidos = abs.map(a => ({ ...a, date: parseBrDate(a.data) })).filter(a => a.date !== null && (a.kmHodometro || 0) > 0).sort((a, b) => a.date!.getTime() - b.date!.getTime());
      
      let mediaDiaria = 0;
      if (absValidos.length >= 2) {
        const first = absValidos[0];
        const last = absValidos[absValidos.length - 1];
        const dias = diffDays(last.date!, first.date!) || 1;
        const dist = (last.kmHodometro || 0) - (first.kmHodometro || 0);
        if (dist > 0) mediaDiaria = dist / dias;
      }

      // Fallback: se não tiver histórico suficiente de abastecimentos, assumimos uma média padrão de 100km/dia para a frota.
      if (mediaDiaria <= 0) mediaDiaria = 100;

      const diasRestantes = Math.ceil(kmFaltante / mediaDiaria);
      const dataPrevisao = new Date();
      dataPrevisao.setDate(dataPrevisao.getDate() + diasRestantes);

      list.push({
        prefixo: v.prefixo,
        kmAtual,
        kmFaltante,
        mediaDiaria: Math.round(mediaDiaria),
        diasRestantes,
        dataPrevisao,
        tipoServico: proximaRev.tipoRevisao || 'Geral'
      });
    });

    // Ordenar pelas que precisam de revisão mais cedo
    return list.sort((a, b) => a.dataPrevisao.getTime() - b.dataPrevisao.getTime()).slice(0, 10);
  }, [vehicles]);


  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 1.5, md: 2 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1} sx={{ color: 'white', mb: 2 }}>
        <Assessment sx={{ color: '#10b981', fontSize: 24 }} /> Análises & Inteligência Preditiva
      </Typography>

      {/* Linha 1: KPIs Rápidos (Novos) */}
      <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 2, mb: 2, width: '100%' }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', md: '22%' } }}>
          <KpiCardAnalise title="% Viaturas Baixadas" value={`${kpis.mediaBaixadas.toFixed(1)}%`} icon={<EventBusy />} color="#ef4444" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', md: '22%' } }}>
          <KpiCardAnalise title="Tempo Médio p/ Revisão" value={kpis.tempoMedioRev > 0 ? `${Math.round(kpis.tempoMedioRev)} dias` : 'N/A'} icon={<Build />} color="#3b82f6" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', md: '22%' } }}>
          <KpiCardAnalise title="Custo Médio/KM" value={`R$ ${kpis.custoMedioKm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<AttachMoney />} color="#f59e0b" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', md: '22%' } }}>
          <KpiCardAnalise title="KM Total Rodado" value={`${kpis.kmTotal.toLocaleString('pt-BR')}`} icon={<Speed />} color="#8b5cf6" />
        </Box>
      </Box>

      {/* Linha 2: Gráficos (Problemas e Gasto/KM) */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, mb: 2, width: '100%' }}>
        
        {/* Problemas Apresentados (Top 8 Alertas) */}
        <Box sx={{ flex: 1, ...glassPanelStyle, p: 1.5, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#f43f5e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#f43f5e', fontSize: 16 }} /> Principais Problemas Apresentados
          </Typography>
          <Box sx={{ flex: 1, height: 180 }}>
            {problemasData.length === 0 ? (
              <Typography variant="caption" sx={{ color: '#9ca3af', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Nenhum problema registrado.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={problemasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    stroke="none"
                    style={{ fontSize: '9px', fill: '#9ca3af' }}
                  >
                    {problemasData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Box>

        {/* Gasto de Combustível vs Total Rodado (Combinado) */}
        <Box sx={{ flex: 2, ...glassPanelStyle, p: 1.5, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#10b981', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalGasStation sx={{ color: '#10b981', fontSize: 16 }} /> Custo de Combustível vs KM Total Rodado
          </Typography>
          <Box sx={{ flex: 1, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={gastoKmData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="prefixo" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis 
                  yAxisId="left" 
                  tickFormatter={(v) => `R$ ${v / 1000}k`} 
                  stroke="rgba(255,255,255,0.2)" 
                  tick={{ fill: '#ef4444', fontSize: 10 }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(v) => `${v / 1000}k`} 
                  stroke="rgba(255,255,255,0.2)" 
                  tick={{ fill: '#3b82f6', fontSize: 10 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '9px' }} />
                <Bar yAxisId="left" dataKey="gasto" name="Gasto" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={15} />
                <Line yAxisId="right" type="monotone" dataKey="kmAtual" name="KM Total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', stroke: 'white', strokeWidth: 1 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>

      {/* Linha 3: Motor de Forecast de Revisões */}
      <Box sx={{ width: '100%', ...glassPanelStyle, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#8b5cf6', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ color: '#8b5cf6', fontSize: 20 }} /> Forecast de Manutenção Preventiva (Top 10 mais próximas)
        </Typography>
        
        <TableContainer component={Box} sx={{ bgcolor: 'transparent', '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' } }}>
                <TableCell>Viatura</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell align="right">KM Atual</TableCell>
                <TableCell align="right">Faltam (KM)</TableCell>
                <TableCell align="right">Média Diária (KM/Dia)</TableCell>
                <TableCell align="right">Dias Restantes</TableCell>
                <TableCell align="right" sx={{ color: '#8b5cf6' }}>Previsão de Parada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecastData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ borderBottom: 'none', py: 3 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>Nenhuma viatura com revisão programada e dados suficientes.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                forecastData.map((row, idx) => (
                  <TableRow key={idx} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'white', fontSize: '12px' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.prefixo}</TableCell>
                    <TableCell><Chip label={row.tipoServico} size="small" sx={{ height: '18px', fontSize: '10px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }} /></TableCell>
                    <TableCell align="right">{row.kmAtual.toLocaleString('pt-BR')}</TableCell>
                    <TableCell align="right" sx={{ color: row.kmFaltante < 500 ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                      {row.kmFaltante.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell align="right">{row.mediaDiaria} km</TableCell>
                    <TableCell align="right">{row.diasRestantes}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>
                      {row.dataPrevisao.toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Box>
  );
};

export default Analises;
