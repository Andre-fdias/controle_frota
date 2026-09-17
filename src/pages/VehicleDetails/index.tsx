import React, { useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Warning from '@mui/icons-material/Warning';
import Timeline from '@mui/icons-material/Timeline';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Assignment from '@mui/icons-material/Assignment';
import Build from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import { useVehicleStore } from '../../store/vehicleStore';
import type { Revisao, ChecklistDiario, ChecklistSemanal } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
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

const VehicleDetails: React.FC = () => {
  const { prefixo } = useParams<{ prefixo: string }>();
  const navigate = useNavigate();
  const vehiclesMap = useVehicleStore(state => state.vehicles);
const [tabValue, setTabValue] = React.useState(0);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [selectedRevisao, setSelectedRevisao] = React.useState<Revisao | null>(null);
  const [selectedChecklistDiario, setSelectedChecklistDiario] = React.useState<ChecklistDiario | null>(null);
  const [selectedChecklistSemanal, setSelectedChecklistSemanal] = React.useState<ChecklistSemanal | null>(null);

  const vehicle = useMemo(() => {
    if (!prefixo) return null;
    return vehiclesMap.get(prefixo);
  }, [prefixo, vehiclesMap]);

const parseBrDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('/')) {
      const [datePart, timePart] = dateStr.split(' ');
      if (datePart) {
        const [day, month, year] = datePart.split('/');
        if (day && month && year) {
          return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
        }
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const { filteredAbastecimentos, filteredDiarios, filteredSemanais, filteredRevisoes } = useMemo(() => {
    let abs = vehicle?.abastecimentos || [];
    let dia = vehicle?.checklistsDiarios || [];
    let sem = vehicle?.checklistsSemanais || [];
    let rev = vehicle?.revisoes || [];

    if (startDate) {
      const start = new Date(startDate).getTime();
      abs = abs.filter(a => parseBrDate(a.data || '').getTime() >= start);
      dia = dia.filter(c => parseBrDate(c.timestamp || '').getTime() >= start);
      sem = sem.filter(c => parseBrDate(c.timestamp || '').getTime() >= start);
      rev = rev.filter(r => parseBrDate(r.dataTroca || '').getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endT = end.getTime();
      abs = abs.filter(a => parseBrDate(a.data || '').getTime() <= endT);
      dia = dia.filter(c => parseBrDate(c.timestamp || '').getTime() <= endT);
      sem = sem.filter(c => parseBrDate(c.timestamp || '').getTime() <= endT);
      rev = rev.filter(r => parseBrDate(r.dataTroca || '').getTime() <= endT);
    }
    return { filteredAbastecimentos: abs, filteredDiarios: dia, filteredSemanais: sem, filteredRevisoes: rev };
  }, [vehicle, startDate, endDate]);

  const dynamicIndicators = useMemo(() => {
    if (!vehicle) return { km: 0, litros: 0, gasto: 0, consumo: 0 };
    const { consolidado } = vehicle;
    
    let km = 0, litros = 0, gasto = 0, consumo = 0;

    if (!startDate && !endDate && consolidado) {
      km = consolidado.kmAtual || 0;
      litros = consolidado.volumeTotalLitros || 0;
      gasto = consolidado.gastoTotalCombustivel || 0;
      consumo = consolidado.consumoMedioKmL || 0;
    }

    if (km === 0 || startDate || endDate) {
      km = 0;
      filteredAbastecimentos.forEach(a => { if (a.kmHodometro && a.kmHodometro > km) km = a.kmHodometro; });
      filteredDiarios.forEach(c => { if (c.kmAtual && c.kmAtual > km) km = c.kmAtual; });
    }

    if (gasto === 0 || startDate || endDate) {
      litros = 0;
      gasto = 0;
      filteredAbastecimentos.forEach(a => {
        gasto += a.valorTotal || 0;
        litros += a.volumeLitros || 0;
      });
    }

    if ((consumo === 0 || startDate || endDate) && litros > 0 && filteredAbastecimentos.length > 1) {
      const sortedAbs = [...filteredAbastecimentos].sort((a,b) => (a.kmHodometro||0) - (b.kmHodometro||0));
      const firstKm = sortedAbs[0].kmHodometro || 0;
      const lastKm = sortedAbs[sortedAbs.length - 1].kmHodometro || 0;
      const kmPercorrido = lastKm - firstKm;
      let litrosConsumidos = 0;
      for(let i=1; i<sortedAbs.length; i++) {
        litrosConsumidos += sortedAbs[i].volumeLitros || 0;
      }
      if (litrosConsumidos > 0 && kmPercorrido > 0) {
        consumo = kmPercorrido / litrosConsumidos;
      }
    }

    return { km, litros, gasto, consumo };
  }, [vehicle, filteredAbastecimentos, filteredDiarios, startDate, endDate]);

  if (!vehicle) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">Viatura não encontrada</Typography>
        <Typography variant="body1">O prefixo "{prefixo}" não existe no sistema.</Typography>
      </Box>
    );
  }

  const { cadastro, consolidado, alertas = [] } = vehicle;

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", m: 0, color: "white" }}>Ficha da Viatura: {vehicle.prefixo}</Typography>
          {cadastro?.status && (
            <Chip 
              label={cadastro.status} 
              sx={{ 
                bgcolor: cadastro.status.toUpperCase().includes('OPERANDO') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: cadastro.status.toUpperCase().includes('OPERANDO') ? '#10b981' : '#f59e0b',
                fontWeight: 'bold', border: '1px solid',
                borderColor: cadastro.status.toUpperCase().includes('OPERANDO') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
              }} 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} sx={{ ...inputStyle, color: startDate ? 'white' : '#9ca3af', width: { xs: '100%', sm: 'auto' } }} />
            <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>até</Typography>
            <Box component="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} sx={{ ...inputStyle, color: endDate ? 'white' : '#9ca3af', width: { xs: '100%', sm: 'auto' } }} />
          </Box>
          <Chip icon={<ArrowBack sx={{ color: '#cbd5e1' }} />} label="Voltar" onClick={() => navigate('/viaturas')} clickable sx={{ flexShrink: 0, bgcolor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} />
        </Box>
      </Box>

      {/* Identificação e Indicadores (Refatorado para mini-cards) */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box sx={{ ...glassPanelStyle, p: 2, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -15, top: -15, color: 'rgba(255,255,255,0.05)', transform: 'rotate(-15deg)', zIndex: 0 }}>
              <DirectionsCar sx={{ fontSize: 90 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}>Viatura</Typography>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '1.1rem' }}>{cadastro?.placa || '-'}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>Modelo: <span style={{ color: 'white' }}>{cadastro?.modelo}</span></Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>Tipo: <span style={{ color: 'white' }}>{cadastro?.tipo || '-'}</span></Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>Garagem: <span style={{ color: 'white' }}>{cadastro?.garagem || '-'}</span></Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box sx={{ ...glassPanelStyle, p: 2, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -15, top: -15, color: 'rgba(59,130,246,0.05)', transform: 'rotate(-15deg)', zIndex: 0 }}>
              <Assignment sx={{ fontSize: 90 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}>Operacional</Typography>
              <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 'bold', mb: 1, fontSize: '1.1rem' }} noWrap>{cadastro?.opmcb || '-'}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>SGB: <span style={{ color: 'white' }}>{cadastro?.sgb || '-'}</span></Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>Status: <span style={{ color: cadastro?.status?.toUpperCase().includes('OPERANDO') ? '#10b981' : '#ef4444' }}>{cadastro?.status || '-'}</span></Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box sx={{ ...glassPanelStyle, p: 2, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -15, top: -15, color: 'rgba(16,185,129,0.05)', transform: 'rotate(-15deg)', zIndex: 0 }}>
              <Timeline sx={{ fontSize: 90 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}>Performance</Typography>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 'bold', mb: 1, fontSize: '1.1rem' }}>{dynamicIndicators.km > 0 ? `${dynamicIndicators.km.toLocaleString('pt-BR')} km` : '-'}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>Consumo Médio: <span style={{ color: 'white' }}>{dynamicIndicators.consumo > 0 ? `${dynamicIndicators.consumo.toFixed(2)} km/l` : '-'}</span></Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box sx={{ ...glassPanelStyle, p: 2, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -15, top: -15, color: 'rgba(234,179,8,0.05)', transform: 'rotate(-15deg)', zIndex: 0 }}>
              <LocalGasStation sx={{ fontSize: 90 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}>Abastecimento</Typography>
              <Typography variant="h6" sx={{ color: '#eab308', fontWeight: 'bold', mb: 1, fontSize: '1.1rem' }}>{dynamicIndicators.gasto > 0 ? `R$ ${dynamicIndicators.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>Volume Total: <span style={{ color: 'white' }}>{dynamicIndicators.litros > 0 ? `${dynamicIndicators.litros.toLocaleString('pt-BR')} L` : '-'}</span></Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Alertas Ativos */}
      {alertas.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning /> Alertas Ativos
          </Typography>
          <Grid container spacing={2}>
            {alertas.map((a, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
<Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ef4444', mb: 1, letterSpacing: '0.05em' }}>{a.tipo}</Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>{a.mensagem}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Abas */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { color: '#cbd5e1', fontWeight: 'bold', fontSize: '12px', minHeight: '40px' }, '& .Mui-selected': { color: '#60a5fa' }, '& .MuiTabs-indicator': { bgcolor: '#60a5fa' } }}
        >
          <Tab icon={<Timeline />} iconPosition="start" label="Timeline" />
          <Tab icon={<LocalGasStation />} iconPosition="start" label={`Abastecimentos (${filteredAbastecimentos.length})`} />
          <Tab icon={<Assignment />} iconPosition="start" label={`Checklists Diários (${filteredDiarios.length})`} />
          <Tab icon={<Assignment />} iconPosition="start" label={`Checklists Semanais (${filteredSemanais.length})`} />
          <Tab icon={<Build />} iconPosition="start" label={`Revisões (${filteredRevisoes.length || 0})`} />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Typography variant="body1" color="textSecondary">A timeline será implementada após a refatoração do motor cronológico.</Typography>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        {filteredAbastecimentos.length === 0 ? <Typography sx={{ color: '#cbd5e1' }}>Sem histórico de abastecimentos.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>🗓️ Data</TableCell>
                    <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>🛣️ Hodômetro</TableCell>
                    <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>⛽ Litros</TableCell>
                    <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>💲 Preço/L</TableCell>
                    <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>💰 Total</TableCell>
                    <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>📊 Consumo</TableCell>
                  </TableRow>
                </TableHead>
              <TableBody>
                {(() => {
                  const sorted = [...filteredAbastecimentos].sort((a,b) => (a.kmHodometro||0) - (b.kmHodometro||0));
                  const processed = sorted.map((abs, i) => {
                    let consumo = 0;
                    if (i > 0 && abs.kmHodometro && sorted[i-1].kmHodometro && abs.volumeLitros) {
                      consumo = (abs.kmHodometro - sorted[i-1].kmHodometro!) / abs.volumeLitros;
                    }
                    return { ...abs, consumoKmL: consumo > 0 ? consumo : undefined };
                  }).reverse();

                  return processed.map((a, i) => {
                    const precoCalculado = (a as any).precoLitro || (a.valorTotal && a.volumeLitros ? a.valorTotal / a.volumeLitros : 0);
                    return (
                    <TableRow key={i} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1, fontSize: '12px' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                      <TableCell sx={{ color: 'white' }}>{a.data}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{a.kmHodometro?.toLocaleString('pt-BR') || '-'}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{a.volumeLitros}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{precoCalculado > 0 ? `R$ ${precoCalculado.toFixed(2)}` : '-'}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{a.valorTotal ? `R$ ${a.valorTotal.toFixed(2)}` : '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: a.consumoKmL ? '#10b981' : '#cbd5e1' }}>
                        {a.consumoKmL ? `${a.consumoKmL.toFixed(2)} km/L` : '-'}
                      </TableCell>
                    </TableRow>
                  )});
                })()}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={2}>
        {filteredDiarios.length === 0 ? <Typography sx={{ color: '#cbd5e1' }}>Sem histórico de checklists diários.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Motorista</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Combustível</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDiarios.map((c, i) => (
                  <TableRow 
                    key={i} 
                    hover 
                    onClick={() => setSelectedChecklistDiario(c)}
                    sx={{ cursor: 'pointer', '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1, fontSize: '12px' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    <TableCell sx={{ color: 'white' }}>{c.timestamp}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.motorista}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.kmAtual}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.nivelCombustivel}</TableCell>
                    <TableCell>{c.anomalias ? <Chip label="Avarias relatadas" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold' }}/> : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={3}>
        {filteredSemanais.length === 0 ? <Typography sx={{ color: '#cbd5e1' }}>Sem histórico de checklists semanais.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Responsável</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSemanais.map((c, i) => (
                  <TableRow 
                    key={i} 
                    hover 
                    onClick={() => setSelectedChecklistSemanal(c)}
                    sx={{ cursor: 'pointer', '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1, fontSize: '12px' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    <TableCell sx={{ color: 'white' }}>{c.timestamp}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.responsavel}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.kmAtual}</TableCell>
                    <TableCell>{c.anomalias ? <Chip label="Avarias relatadas" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold' }}/> : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={4}>
        {filteredRevisoes.length === 0 ? <Typography sx={{ color: '#cbd5e1' }}>Sem histórico de revisões.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data da Troca</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tipo de Revisão</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>KM da Troca</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Próxima (KM)</TableCell>
                  <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRevisoes.map((r, i) => {
                  const isVencido = r.statusRevisao?.toUpperCase() === 'VENCIDO';
                  return (
                  <TableRow 
                      key={i} 
                      hover 
                      onClick={() => setSelectedRevisao(r)}
                      sx={{ 
                        cursor: 'pointer',
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, 
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                      }}
                    >
                      <TableCell sx={{ color: 'white' }}>{r.dataTroca || '-'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{r.tipoRevisao || '-'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{r.kmTroca?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{r.proximaRevisaoKm?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell>
                      {r.statusRevisao ? (
                        <Chip 
                          label={r.statusRevisao} 
                          size="small" 
                          sx={{ 
                            bgcolor: isVencido ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            color: isVencido ? '#ef4444' : '#10b981',
                            border: `1px solid ${isVencido ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                            fontWeight: 'bold',
                            fontSize: '11px'
                          }} 
                        />
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        )}
      </CustomTabPanel>

      {/* Modal de Detalhamento de Revisão */}
      <Dialog 
        open={Boolean(selectedRevisao)} 
        onClose={() => setSelectedRevisao(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' } }}
      >
        {selectedRevisao && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#34d399', fontWeight: 'bold' }}>
                Detalhamento da Revisão - {selectedRevisao.prefixo}
              </Typography>
              <IconButton onClick={() => setSelectedRevisao(null)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Data da Troca</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedRevisao.dataTroca || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Tipo de Revisão</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedRevisao.tipoRevisao || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>KM da Troca</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedRevisao.kmTroca?.toLocaleString('pt-BR') || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Próxima Revisão (KM)</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedRevisao.proximaRevisaoKm?.toLocaleString('pt-BR') || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Local da Revisão</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedRevisao.localRevisao || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Status</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: selectedRevisao.statusRevisao?.toUpperCase() === 'VENCIDO' ? '#ef4444' : '#10b981' }}>{selectedRevisao.statusRevisao || '-'}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1, color: '#60a5fa', fontWeight: 'bold' }}>
                Itens Revisados
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Filtro de Óleo</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.filtroOleo || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Composição do Óleo</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.composicaoOleo || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Viscosidade</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.viscosidadeOleo || '-'}</Typography></Box>

                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Filtro de Ar</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.filtroAr || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Filtro de Combustível</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.filtroCombustivel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Filtro de Água</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.filtroAgua || '-'}</Typography></Box>

                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Fluido de Freio</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.fluidoFreio || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Pastilha de Freio</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.pastilhaFreio || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Disco de Freio</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.discoFreio || '-'}</Typography></Box>

                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Tipo de Pneu</Typography><Typography sx={{ color: 'white' }}>{selectedRevisao.tipoPneu || '-'}</Typography></Box>
              </Box>

              {selectedRevisao.observacoes && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Observações</Typography>
                  <Typography sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2, color: '#d1d5db', fontStyle: 'italic' }}>
                    {selectedRevisao.observacoes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => setSelectedRevisao(null)} 
                sx={{ bgcolor: '#374151', color: 'white', '&:hover': { bgcolor: '#4b5563' } }}
              >
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal de Detalhamento de Checklist Diário */}
      <Dialog 
        open={Boolean(selectedChecklistDiario)} 
        onClose={() => setSelectedChecklistDiario(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' } }}
      >
        {selectedChecklistDiario && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#34d399', fontWeight: 'bold' }}>
                Checklist Diário - {selectedChecklistDiario.prefixo}
              </Typography>
              <IconButton onClick={() => setSelectedChecklistDiario(null)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Data/Hora</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.timestamp || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Motorista</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.motorista || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Hodômetro</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.kmAtual || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Combustível</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.nivelCombustivel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Turno</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.prontidaoTurno || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Base Operacional</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.baseOperacional || '-'}</Typography></Box>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1, color: '#60a5fa', fontWeight: 'bold' }}>
                Itens Inspecionados ({selectedChecklistDiario.itens.length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedChecklistDiario.itens.map((item, idx) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: 'white', fontSize: '13px' }}>{item.nome}</Typography>
                    <Chip 
                      label={item.observacao || (item.conforme ? 'Conforme' : 'Não Conforme')} 
                      size="small" 
                      sx={{ 
                        bgcolor: item.conforme ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        color: item.conforme ? '#10b981' : '#ef4444',
                        border: `1px solid ${item.conforme ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        fontWeight: 'bold',
                        fontSize: '11px',
                        maxWidth: '250px',
                        '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', padding: '4px 8px' },
                        height: 'auto'
                      }} 
                    />
                  </Box>
                ))}
              </Box>

              {selectedChecklistDiario.anomalias && (
                <Box sx={{ mt: 4 }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Anomalias Observadas</Typography>
                  <Typography sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 2, borderRadius: 2, color: '#ef4444', fontStyle: 'italic', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {selectedChecklistDiario.anomalias}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
              <Button variant="contained" onClick={() => setSelectedChecklistDiario(null)} sx={{ bgcolor: '#374151', color: 'white', '&:hover': { bgcolor: '#4b5563' } }}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal de Detalhamento de Checklist Semanal */}
      <Dialog 
        open={Boolean(selectedChecklistSemanal)} 
        onClose={() => setSelectedChecklistSemanal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' } }}
      >
        {selectedChecklistSemanal && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                Checklist Semanal - {selectedChecklistSemanal.prefixo}
              </Typography>
              <IconButton onClick={() => setSelectedChecklistSemanal(null)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Data/Hora</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.timestamp || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Responsável</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.responsavel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Hodômetro</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.kmAtual || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Combustível</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.nivelCombustivel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Base Operacional</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.baseOperacional || '-'}</Typography></Box>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1, color: '#60a5fa', fontWeight: 'bold' }}>
                Itens Inspecionados ({selectedChecklistSemanal.itens.length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedChecklistSemanal.itens.map((item, idx) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: 'white', fontSize: '13px' }}>{item.nome}</Typography>
                    <Chip 
                      label={item.observacao || (item.conforme ? 'Conforme' : 'Não Conforme')} 
                      size="small" 
                      sx={{ 
                        bgcolor: item.conforme ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        color: item.conforme ? '#10b981' : '#ef4444',
                        border: `1px solid ${item.conforme ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        fontWeight: 'bold',
                        fontSize: '11px',
                        maxWidth: '250px',
                        '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', padding: '4px 8px' },
                        height: 'auto'
                      }} 
                    />
                  </Box>
                ))}
              </Box>

              {selectedChecklistSemanal.anomalias && (
                <Box sx={{ mt: 4 }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#5a6f8a', textTransform: 'uppercase', mb: '4px' }}>Anomalias Observadas</Typography>
                  <Typography sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 2, borderRadius: 2, color: '#ef4444', fontStyle: 'italic', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {selectedChecklistSemanal.anomalias}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
              <Button variant="contained" onClick={() => setSelectedChecklistSemanal(null)} sx={{ bgcolor: '#374151', color: 'white', '&:hover': { bgcolor: '#4b5563' } }}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VehicleDetails;
