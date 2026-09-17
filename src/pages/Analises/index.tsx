import React, { useMemo } from 'react';
import { Box, Typography, Avatar, Grid, Card, Tooltip as MuiTooltip } from '@mui/material';
import Assessment from '@mui/icons-material/Assessment';
import Speed from '@mui/icons-material/Speed';
import AttachMoney from '@mui/icons-material/AttachMoney';
import EventBusy from '@mui/icons-material/EventBusy';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Build from '@mui/icons-material/Build';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { useVehicleStore } from '../../store/vehicleStore';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  Tooltip, LineChart, Line, ScatterChart, Scatter, ZAxis, AreaChart, Area,
  ComposedChart
} from 'recharts';
import { parse, differenceInDays, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- STYLES ---
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  textMain: 'white',
  textMuted: '#9ca3af',
  bgPanel: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.05)',
};

const glassPanelStyle = {
  background: COLORS.bgPanel,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '16px',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
};

const inputStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: 'white',
  padding: '8px 16px',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s',
  colorScheme: 'dark',
  '&:focus': { borderColor: 'rgba(52, 211, 153, 0.5)' },
  '&::-webkit-calendar-picker-indicator': { opacity: 0.7, cursor: 'pointer' }
};

// --- HELPERS ---
const parseBrDate = (str: string) => {
  if (!str) return null;
  const parts = str.split(' ');
  const dParts = parts[0].split('/');
  if (dParts.length !== 3) return null;
  return new Date(Number(dParts[2]), Number(dParts[1]) - 1, Number(dParts[0]));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'rgba(10, 14, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', p: 1.5, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px', mb: 1 }}>{label || payload[0].payload.name}</Typography>
        {payload.map((p: any, i: number) => {
          let val = p.value;
          if (typeof val === 'number') {
            if (p.name.toLowerCase().includes('custo') || p.name.toLowerCase().includes('gasto') || p.name.includes('R$')) {
              val = `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else if (p.name.toLowerCase().includes('km/l')) {
              val = `${val.toFixed(1)} km/L`;
            } else if (p.name.toLowerCase().includes('km') || p.name.toLowerCase().includes('rodados')) {
              val = `${Math.round(val).toLocaleString('pt-BR')} km`;
            } else if (p.name.toLowerCase().includes('%') || p.name.toLowerCase().includes('taxa')) {
              val = `${val.toFixed(1)}%`;
            }
          }
          return (
            <Typography key={i} sx={{ color: p.color || p.fill, fontSize: '11px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color || p.fill }} />
              {p.name}: <strong>{val}</strong>
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
};

const KpiCard = ({ title, value, subValue, icon, color }: any) => (
  <Box sx={{ ...glassPanelStyle, flexDirection: 'row', alignItems: 'center', gap: 2, p: 2 }}>
    <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48, border: `1px solid ${color}40` }}>
      {React.cloneElement(icon, { fontSize: 'medium' })}
    </Avatar>
    <Box>
      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Typography>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.1, mt: 0.5 }}>{value}</Typography>
      {subValue && <Typography variant="caption" sx={{ color: subValue.color || COLORS.textMuted, fontSize: '10px', display: 'block', mt: 0.5, fontWeight: 500 }}>{subValue.text}</Typography>}
    </Box>
  </Box>
);


const Analises: React.FC = () => {
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const vehicles = Array.from(vehiclesMap.values());
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // --- DATA PROCESSING ---
  const kpis = useMemo(() => {
    let frotaTotal = vehicles.length;
    let baixados = 0;
    
    let globalKmTotal = 0;
    let globalGastoTotal = 0;
    let globalLitrosTotal = 0;
    
    const monthlyData: Record<string, { km: number, custo: number, count: number }> = {};
    const veiculosData: any[] = [];

    const start = startDate ? new Date(startDate).getTime() : 0;
    const endObj = endDate ? new Date(endDate) : new Date(2100, 1, 1);
    if (endDate) endObj.setHours(23, 59, 59, 999);
    const endT = endObj.getTime();

    vehicles.forEach(v => {
      let isBaixado = v.cadastro?.status?.toLowerCase().includes('baixado');
      if (isBaixado) baixados++;

      let kmInicial = 99999999;
      let kmFinal = 0;
      let veiculoGasto = 0;
      let veiculoLitros = 0;
      let qtdIntervencoes = 0;
      
      v.revisoes?.forEach(r => {
        const d = parseBrDate(r.dataRevisao || '')?.getTime() || 0;
        if (d >= start && d <= endT) qtdIntervencoes++;
      });
      v.alertas?.forEach(a => {
        if (a.tipo.includes('AVARIA') || a.tipo.includes('MANUTENCAO')) qtdIntervencoes++;
      });

      // Process abastecimentos to get km delta and monthly evolution
      v.abastecimentos?.forEach(a => {
        const dTime = parseBrDate(a.data || '')?.getTime() || 0;
        if (dTime >= start && dTime <= endT) {
            if (a.kmHodometro && a.kmHodometro > 0) {
              if (a.kmHodometro < kmInicial) kmInicial = a.kmHodometro;
              if (a.kmHodometro > kmFinal) kmFinal = a.kmHodometro;
            }
            
            const valor = a.valorTotal || 0;
            const vol = a.volumeLitros || 0;
            veiculoGasto += valor;
            veiculoLitros += vol;

            if (a.data) {
              const d = parseBrDate(a.data);
              if (d && isValid(d)) {
                const key = format(d, 'MMM/yy', { locale: ptBR });
                if (!monthlyData[key]) monthlyData[key] = { km: 0, custo: 0, count: 0 };
                monthlyData[key].custo += valor;
                monthlyData[key].count++;
              }
            }
        }
      });

      let distPercorrida = 0;
      if (kmFinal > kmInicial) {
        distPercorrida = kmFinal - kmInicial;
      }

      // Distribuição de KM no mês aproximado
      if (distPercorrida > 0 && v.abastecimentos && v.abastecimentos.length > 1) {
        const dInicial = parseBrDate(v.abastecimentos[0].data);
        const dFinal = parseBrDate(v.abastecimentos[v.abastecimentos.length - 1].data);
        if (dInicial && dFinal) {
           const key = format(dFinal, 'MMM/yy', { locale: ptBR });
           if (monthlyData[key]) monthlyData[key].km += distPercorrida;
        }
      }

      globalKmTotal += distPercorrida;
      globalGastoTotal += veiculoGasto;
      globalLitrosTotal += veiculoLitros;

      // Calculando Utilização Simulada (Se andou mais de 100km, 100%. Senao proporcional ou 0)
      // Como não temos dias parados, usaremos KM recente ou Distância Percorrida para gerar a métrica
      let utilizacao = distPercorrida > 500 ? Math.min(100, 50 + (distPercorrida/1000)*10) : (distPercorrida > 0 ? 30 : 0);
      if (isBaixado) utilizacao = 0;

      const custoKm = distPercorrida > 0 ? veiculoGasto / distPercorrida : 0;
      const kml = veiculoLitros > 0 ? distPercorrida / veiculoLitros : 0;

      veiculosData.push({
        prefixo: v.prefixo,
        kmPercorrido: distPercorrida,
        gasto: veiculoGasto,
        litros: veiculoLitros,
        custoKm: custoKm > 0 && custoKm < 20 ? custoKm : 0, // Filtro outlier
        kml: kml > 0 && kml < 30 ? kml : 0, // Filtro outlier
        utilizacao,
        intervencoes: qtdIntervencoes,
        isAtivo: !isBaixado
      });
    });

    const disponibilidade = frotaTotal > 0 ? ((frotaTotal - baixados) / frotaTotal) * 100 : 0;
    const custoMedioKm = globalKmTotal > 0 ? globalGastoTotal / globalKmTotal : 0;
    
    // Avg Utilização of active vehicles
    const ativos = veiculosData.filter(v => v.isAtivo);
    const utilizacaoGlobal = ativos.length > 0 ? ativos.reduce((acc, curr) => acc + curr.utilizacao, 0) / ativos.length : 0;

    // Monthly Array
    const evoMensal = Object.entries(monthlyData).map(([mes, data]) => ({
      mes, 
      Custo: data.custo, 
      KM: data.km,
      CustoKm: data.km > 0 ? data.custo / data.km : 0
    }));

    return {
      disponibilidade,
      utilizacaoGlobal,
      globalKmTotal,
      globalGastoTotal,
      custoMedioKm,
      veiculosData,
      evoMensal
    };
  }, [vehicles, startDate, endDate]);

  // -- Gráficos Nível 2 e 3 --
  
  // Rank Utilização
  const rankUtilizacao = [...kpis.veiculosData]
    .filter(v => v.isAtivo)
    .sort((a, b) => b.utilizacao - a.utilizacao)
    .slice(0, 10);

  // Rank Intervenções (Problemas/Revisões)
  const rankIntervencoes = [...kpis.veiculosData]
    .sort((a, b) => b.intervencoes - a.intervencoes)
    .filter(v => v.intervencoes > 0)
    .slice(0, 10);

  // Evolução Consolidada (Area chart)
  const evoData = kpis.evoMensal.length > 0 ? kpis.evoMensal : [
    { mes: 'Jan', Custo: 0, KM: 0, CustoKm: 0 },
    { mes: 'Fev', Custo: 0, KM: 0, CustoKm: 0 }
  ];

  // Scatter Eficiência (X=KM, Y=Custo/KM, Z=Intervenções)
  const scatterData = kpis.veiculosData
    .filter(v => v.kmPercorrido > 100 && v.custoKm > 0)
    .map(v => ({
      name: v.prefixo,
      KM: v.kmPercorrido,
      CustoKm: v.custoKm,
      Ocorrencias: v.intervencoes > 0 ? v.intervencoes : 1
    }));

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 1.5, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* CABEÇALHO */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: `${COLORS.primary}20`, color: COLORS.primary, width: 40, height: 40, border: `1px solid ${COLORS.primary}40` }}>
            <Assessment />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">Inteligência & Analytics</Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>Indicadores Estratégicos de Frota</Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box component="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} sx={{ ...inputStyle, color: startDate ? 'white' : '#9ca3af', width: { xs: '100%', sm: 'auto' } }} />
          <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>até</Typography>
          <Box component="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} sx={{ ...inputStyle, color: endDate ? 'white' : '#9ca3af', width: { xs: '100%', sm: 'auto' } }} />
        </Box>
      </Box>

      {/* ==================================================================================== */}
      {/* NÍVEL 1: VISÃO EXECUTIVA */}
      {/* ==================================================================================== */}
      <Typography variant="subtitle2" sx={{ color: COLORS.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Nível 1 — Visão Executiva</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', lg: 'nowrap' }, mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', lg: 0 } }}>
          <KpiCard 
            title="Disponibilidade" 
            value={`${kpis.disponibilidade.toFixed(1)}%`} 
            icon={<CheckCircleOutlined />} 
            color={COLORS.success} 
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', lg: 0 } }}>
          <KpiCard 
            title="Utilização (Ativos)" 
            value={`${kpis.utilizacaoGlobal.toFixed(1)}%`} 
            icon={<DirectionsCar />} 
            color={COLORS.primary} 
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', lg: 0 } }}>
          <KpiCard 
            title="KM Total Rodado" 
            value={kpis.globalKmTotal.toLocaleString('pt-BR')} 
            icon={<Speed />} 
            color={COLORS.purple} 
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%', lg: 0 } }}>
          <KpiCard 
            title="Custo Médio / KM" 
            value={`R$ ${kpis.custoMedioKm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={<AttachMoney />} 
            color={COLORS.danger} 
            subValue={{ text: `Gasto Total: R$ ${kpis.globalGastoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: COLORS.textMuted }}
          />
        </Box>
      </Box>

      {/* Evolução Temporal (KM e Custos) */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ ...glassPanelStyle, height: 320 }}>
             <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: COLORS.primary }}>
               <Speed fontSize="small" /> Evolução de Volume Operacional e Custos
             </Typography>
             <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={evoData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey="mes" stroke={COLORS.textMuted} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `R$ ${v/1000}k`} stroke={COLORS.textMuted} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v/1000}k`} stroke={COLORS.textMuted} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="Custo" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorCusto)" />
                  <Bar yAxisId="right" dataKey="KM" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={20} />
                </ComposedChart>
              </ResponsiveContainer>
             </Box>
          </Box>
      </Box>


      {/* ==================================================================================== */}
      {/* NÍVEL 2: VISÃO OPERACIONAL */}
      {/* ==================================================================================== */}
      <Typography variant="subtitle2" sx={{ color: COLORS.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Nível 2 — Operacional</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', lg: 'nowrap' }, mb: 4 }}>
        
        {/* Taxa de Utilização por Veículo */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: 0 } }}>
          <Box sx={{ ...glassPanelStyle, height: 350 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: COLORS.success }}>
              <DirectionsCar fontSize="small" /> Taxa de Utilização (%)
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankUtilizacao} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={COLORS.border} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="prefixo" type="category" stroke={COLORS.textMuted} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="utilizacao" name="Taxa de Uso" fill={COLORS.success} radius={[0, 4, 4, 0]} barSize={16}>
                    {/* Exibe o % no final da barra */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* Frequência de Intervenções */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: 0 } }}>
          <Box sx={{ ...glassPanelStyle, height: 350 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: COLORS.warning }}>
              <Build fontSize="small" /> Frequência de Intervenções (Manutenções/Alertas)
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankIntervencoes} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey="prefixo" stroke={COLORS.textMuted} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                  <YAxis stroke={COLORS.textMuted} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="intervencoes" name="Intervenções" fill={COLORS.warning} radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

      </Box>

      {/* ==================================================================================== */}
      {/* NÍVEL 3: VISÃO ANALÍTICA */}
      {/* ==================================================================================== */}
      <Typography variant="subtitle2" sx={{ color: COLORS.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Nível 3 — Analítico</Typography>
      
      <Box sx={{ width: '100%', mb: 2 }}>
        
        {/* Matriz de Eficiência Operacional (Scatter Plot) */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ ...glassPanelStyle, height: 450 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: COLORS.purple }}>
                <ErrorOutlined fontSize="small" /> Matriz de Eficiência Operacional
              </Typography>
              <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                X: KM Rodados | Y: Custo por KM | Tamanho: Ocorrências
              </Typography>
            </Box>
            
            {scatterData.length < 2 ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: COLORS.textMuted }}>Dados insuficientes para a Matriz de Eficiência.</Typography>
              </Box>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    
                    {/* Eixo X: KM Rodados */}
                    <XAxis 
                      type="number" 
                      dataKey="KM" 
                      name="KM Rodado" 
                      stroke={COLORS.textMuted} 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v/1000}k`}
                    />
                    
                    {/* Eixo Y: Custo por KM */}
                    <YAxis 
                      type="number" 
                      dataKey="CustoKm" 
                      name="Custo/KM" 
                      stroke={COLORS.textMuted} 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `R$ ${v.toFixed(2)}`}
                    />
                    
                    {/* Tamanho da Bolha */}
                    <ZAxis 
                      type="number" 
                      dataKey="Ocorrencias" 
                      range={[50, 400]} 
                      name="Ocorrências" 
                    />
                    
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    
                    <Scatter name="Veículos" data={scatterData} fill={COLORS.purple} fillOpacity={0.7} stroke="white" strokeWidth={1} />
                    
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </Box>
        
      </Box>

    </Box>
  );
};

export default Analises;
