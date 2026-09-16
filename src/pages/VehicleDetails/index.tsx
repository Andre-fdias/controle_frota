import React, { useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tab, Tabs
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Warning from '@mui/icons-material/Warning';
import Timeline from '@mui/icons-material/Timeline';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import Assignment from '@mui/icons-material/Assignment';
import Build from '@mui/icons-material/Build';
import { useVehicleStore } from '../../store/vehicleStore';

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
        <Box sx={{ p: 3 }}>
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

const VehicleDetails: React.FC = () => {
  const { prefixo } = useParams<{ prefixo: string }>();
  const navigate = useNavigate();
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const [tabValue, setTabValue] = React.useState(0);

  const vehicle = useMemo(() => {
    if (!prefixo) return null;
    return vehiclesMap.get(prefixo);
  }, [prefixo, vehiclesMap]);

  if (!vehicle) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">Viatura não encontrada</Typography>
        <Typography variant="body1">O prefixo "{prefixo}" não existe no sistema.</Typography>
      </Box>
    );
  }

  const { cadastro, consolidado, abastecimentos, checklistsDiarios, checklistsSemanais, alertas } = vehicle;

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ m: 0, color: 'white' }}>Ficha da Viatura: {vehicle.prefixo}</Typography>
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
        <Chip icon={<ArrowBack sx={{ color: '#9ca3af' }} />} label="Voltar" onClick={() => navigate('/viaturas')} clickable sx={{ flexShrink: 0, bgcolor: 'rgba(255,255,255,0.05)', color: '#9ca3af', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} />
      </Box>

      {/* Identificação e Indicadores */}
      <Grid container spacing={3} mb={4} alignItems="stretch">
        <Grid item size={{ xs: 12, md: 6 }}>
          <Box sx={{ ...glassPanelStyle, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#eab308', fontWeight: 'bold' }}>Identificação</Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Placa</Typography><Typography fontWeight="bold" sx={{ color: 'white' }}>{cadastro?.placa || '-'}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Modelo/Fabricante</Typography><Typography fontWeight="bold" noWrap sx={{ color: 'white' }}>{cadastro?.modelo} / {cadastro?.fabricante}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Tipo</Typography><Typography fontWeight="bold" sx={{ color: 'white' }}>{cadastro?.tipo || '-'}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Base Operacional</Typography><Typography fontWeight="bold" noWrap sx={{ color: 'white' }}>{cadastro?.opmcb || '-'}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Garagem</Typography><Typography fontWeight="bold" noWrap sx={{ color: 'white' }}>{cadastro?.garagem || '-'}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>SGB</Typography><Typography fontWeight="bold" noWrap sx={{ color: 'white' }}>{cadastro?.sgb || '-'}</Typography></Grid>
            </Grid>
          </Box>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 6 }}>
          <Box sx={{ ...glassPanelStyle, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#eab308', fontWeight: 'bold' }}>Indicadores</Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>KM Atual</Typography><Typography fontWeight="bold" sx={{ color: 'white' }}>{consolidado?.kmAtual?.toLocaleString('pt-BR') || '-'}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Consumo Médio</Typography><Typography fontWeight="bold" sx={{ color: 'white' }}>{consolidado?.consumoMedioKmL ? `${consolidado.consumoMedioKmL.toFixed(2)} km/l` : '-'}</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Total Abastecido</Typography><Typography fontWeight="bold" sx={{ color: 'white' }}>{consolidado?.volumeTotalLitros?.toLocaleString('pt-BR')} L</Typography></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><Typography variant="body2" sx={{ color: '#9ca3af' }}>Gasto Total</Typography><Typography fontWeight="bold" sx={{ color: 'white' }}>R$ {consolidado?.gastoTotalCombustivel?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '-'}</Typography></Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Alertas Ativos */}
      {alertas.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom color="error" display="flex" alignItems="center" gap={1}>
            <Warning /> Alertas Ativos
          </Typography>
          <Grid container spacing={2}>
            {alertas.map((a, i) => (
              <Grid item size={{ xs: 12, md: 6 }} key={i}>
                <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold">{a.tipo}</Typography>
                    <Typography variant="body2">{a.mensagem}</Typography>
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
          onChange={(_, nv) => setTabValue(nv)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { color: '#9ca3af' }, '& .Mui-selected': { color: '#eab308' }, '& .MuiTabs-indicator': { backgroundColor: '#eab308' } }}
        >
          <Tab icon={<Timeline />} iconPosition="start" label="Timeline" />
          <Tab icon={<LocalGasStation />} iconPosition="start" label={`Abastecimentos (${abastecimentos.length})`} />
          <Tab icon={<Assignment />} iconPosition="start" label={`Checklists Diários (${checklistsDiarios.length})`} />
          <Tab icon={<Assignment />} iconPosition="start" label={`Checklists Semanais (${checklistsSemanais.length})`} />
          <Tab icon={<Build />} iconPosition="start" label={`Revisões (${vehicle.revisoes?.length || 0})`} />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Typography variant="body1" color="textSecondary">A timeline será implementada após a refatoração do motor cronológico.</Typography>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        {abastecimentos.length === 0 ? <Typography sx={{ color: '#9ca3af' }}>Sem histórico de abastecimentos.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>🗓️ Data</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>🛣️ Hodômetro</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>⛽ Litros</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>💲 Preço/L</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>💰 Total</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>📊 Consumo</TableCell>
                  </TableRow>
                </TableHead>
              <TableBody>
                {(() => {
                  const sorted = [...abastecimentos].sort((a,b) => (a.kmHodometro||0) - (b.kmHodometro||0));
                  const processed = sorted.map((abs, i) => {
                    let consumo = 0;
                    if (i > 0 && abs.kmHodometro && sorted[i-1].kmHodometro && abs.volumeLitros) {
                      consumo = (abs.kmHodometro - sorted[i-1].kmHodometro!) / abs.volumeLitros;
                    }
                    return { ...abs, consumoKmL: consumo > 0 ? consumo : undefined };
                  }).reverse();

                  return processed.map((a, i) => (
                    <TableRow key={i} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                      <TableCell sx={{ color: 'white' }}>{a.data}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{a.kmHodometro?.toLocaleString('pt-BR') || '-'}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{a.volumeLitros}</TableCell>
                      <TableCell sx={{ color: 'white' }}>R$ {a.precoLitro?.toFixed(2) || '-'}</TableCell>
                      <TableCell sx={{ color: 'white' }}>R$ {a.valorTotal?.toFixed(2) || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: a.consumoKmL ? '#10b981' : '#9ca3af' }}>
                        {a.consumoKmL ? `${a.consumoKmL.toFixed(2)} km/L` : '-'}
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={2}>
        {checklistsDiarios.length === 0 ? <Typography sx={{ color: '#9ca3af' }}>Sem histórico de checklists diários.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Motorista</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Combustível</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checklistsDiarios.map((c, i) => (
                  <TableRow key={i} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
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
        {checklistsSemanais.length === 0 ? <Typography sx={{ color: '#9ca3af' }}>Sem histórico de checklists semanais.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Responsável</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checklistsSemanais.map((c, i) => (
                  <TableRow key={i} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
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
        {!vehicle.revisoes || vehicle.revisoes.length === 0 ? <Typography sx={{ color: '#9ca3af' }}>Sem histórico de revisões.</Typography> : (
          <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data da Troca</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tipo de Revisão</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>KM da Troca</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Próxima (KM)</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicle.revisoes.map((r, i) => {
                  const isVencido = r.statusRevisao?.toUpperCase() === 'VENCIDO';
                  return (
                  <TableRow key={i} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
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

    </Box>
  );
};

export default VehicleDetails;
