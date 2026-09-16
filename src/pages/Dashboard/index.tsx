import React, { useMemo } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Alert as MuiAlert, CircularProgress, Skeleton,
  TextField, Button, FormControl, Select, MenuItem, Divider, List, ListItem, ListItemIcon, ListItemText,
  Badge, Avatar, Chip
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Build from '@mui/icons-material/Build';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import Speed from '@mui/icons-material/Speed';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Warning from '@mui/icons-material/Warning';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import AssignmentLateOutlined from '@mui/icons-material/AssignmentLateOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import { useVehicleStore } from '../../store/vehicleStore';
import { useFilterStore } from '../../store/filterStore';

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Box sx={{ 
    ...glassPanelStyle,
    p: 1.5, // Reduzido em ~33%
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 16px -8px ${color}40`,
      bgcolor: 'rgba(255,255,255,0.05)',
    }
  }}>
    <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'scale(1.8)', color: color }}>
      {icon}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        width: 28, height: 28, borderRadius: '8px', 
        bgcolor: `${color}15`, color: color, mr: 1,
        border: `1px solid ${color}30`
      }}>
        {React.cloneElement(icon as React.ReactElement, { fontSize: 'small' })}
      </Box>
      <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </Typography>
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block', fontSize: '0.6rem' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const Dashboard: React.FC = () => {
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const systemState = useVehicleStore(state => state.systemState);
  const filters = useFilterStore(state => state.filters);

  // Apply global filters
  const filteredVehicles = useMemo(() => {
    let list = Array.from(vehiclesMap.values());
    if (filters.status.length > 0) {
      list = list.filter(v => {
        const s = v.cadastro?.status?.toLowerCase() || '';
        return filters.status.some(fs => s.includes(fs.toLowerCase()));
      });
    }
    return list;
  }, [vehiclesMap, filters]);

  const kpis = useMemo(() => {
    let total = filteredVehicles.length;
    let operando = 0, reserva = 0, baixado = 0;
    let kmTotal = 0, litros = 0, gastoTotal = 0;
    
    filteredVehicles.forEach(v => {
      const status = v.cadastro?.status?.toLowerCase() || '';
      if (status.includes('operando')) operando++;
      else if (status.includes('reserva')) reserva++;
      else if (status.includes('baixado')) baixado++;

      let vKmAtual = v.consolidado?.kmAtual || 0;
      let vGasto = v.consolidado?.gastoTotalCombustivel || 0;
      let vLitros = v.consolidado?.volumeTotalLitros || 0;

      if (vKmAtual === 0) {
        v.abastecimentos?.forEach(a => { if (a.kmHodometro && a.kmHodometro > vKmAtual) vKmAtual = a.kmHodometro; });
        v.checklistsDiarios?.forEach(c => { if (c.kmAtual && c.kmAtual > vKmAtual) vKmAtual = c.kmAtual; });
      }

      if (vGasto === 0) {
        v.abastecimentos?.forEach(a => {
          vGasto += a.valorTotal || 0;
          vLitros += a.volumeLitros || 0;
        });
      }

      kmTotal += vKmAtual;
      litros += vLitros;
      gastoTotal += vGasto;
    });

    return { total, operando, reserva, baixado, kmTotal, litros, gastoTotal };
  }, [filteredVehicles]);

  const allAlerts = useMemo(() => {
    return filteredVehicles.flatMap(v => 
      v.alertas.map(a => ({ prefixo: v.prefixo, alerta: a }))
    ).sort((a, b) => {
      // Sort by severity
      if (a.alerta.nivel === 'CRITICAL' && b.alerta.nivel !== 'CRITICAL') return -1;
      if (a.alerta.nivel !== 'CRITICAL' && b.alerta.nivel === 'CRITICAL') return 1;
      if (a.alerta.tipo.includes('AVARIA') && !b.alerta.tipo.includes('AVARIA')) return -1;
      if (!a.alerta.tipo.includes('AVARIA') && b.alerta.tipo.includes('AVARIA')) return 1;
      return 0;
    });
  }, [filteredVehicles]);

  const checklistControl = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const operando = filteredVehicles.filter(v => v.cadastro?.status?.toLowerCase().includes('operando'));
    
    const entregues = operando.filter(v => 
      v.checklistsDiarios.some(c => c.timestamp?.includes(todayStr))
    ).map(v => {
      const c = v.checklistsDiarios.find(c => c.timestamp?.includes(todayStr));
      return { prefixo: v.prefixo, motorista: c?.motorista || 'Não Informado', hora: c?.timestamp?.split(' ')[1] || '' };
    });
    
    const pendentes = operando.filter(v => 
      !v.checklistsDiarios.some(c => c.timestamp?.includes(todayStr))
    ).map(v => ({ prefixo: v.prefixo, base: v.cadastro?.garagem || 'Não Informada' }));
    
    return { entregues, pendentes };
  }, [filteredVehicles]);

  const isLoading = systemState.status === 'Atualizando dados...';

  const getAlertIcon = (tipo: string) => {
    if (tipo.includes('VENCIDA') || tipo.includes('AVARIA')) return <Warning fontSize="small" sx={{ color: '#ef4444' }} />;
    if (tipo.includes('PROXIMA')) return <Build fontSize="small" sx={{ color: '#f59e0b' }} />;
    if (tipo.includes('PENDENTE')) return <AssignmentLateOutlined fontSize="small" sx={{ color: '#f59e0b' }} />;
    return <NotificationsActive fontSize="small" sx={{ color: '#3b82f6' }} />;
  };

  const getAlertColor = (tipo: string, nivel: string) => {
    if (nivel === 'CRITICAL') return 'rgba(239, 68, 68, 0.1)';
    if (nivel === 'WARNING') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(59, 130, 246, 0.1)';
  };

  const getAlertBorder = (tipo: string, nivel: string) => {
    if (nivel === 'CRITICAL') return 'rgba(239, 68, 68, 0.2)';
    if (nivel === 'WARNING') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(59, 130, 246, 0.2)';
  };

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1.5} sx={{ color: 'white' }}>
          <DashboardIcon sx={{ color: '#3b82f6', fontSize: 32 }} /> Centro de Comando
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MuiAlert 
            severity={systemState.status === 'Não foi possível atualizar' ? 'error' : 'info'} 
            icon={isLoading ? <CircularProgress size={16} sx={{ color: '#3b82f6' }} /> : undefined} 
            sx={{ 
              bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px',
              py: 0, '& .MuiAlert-message': { py: 1, fontSize: '12px' }, '& .MuiAlert-icon': { py: 1 }
            }}
          >
            {systemState.status} {systemState.lastUpdate && `• Última sincronização: ${systemState.lastUpdate.toLocaleTimeString()}`}
          </MuiAlert>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ 
        ...glassPanelStyle, p: 2, mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', ml: 1, fontWeight: 600, mb: 0.5, display: 'block' }}>BUSCAR VIATURA</Typography>
          <TextField 
            size="small" 
            fullWidth 
            placeholder="Prefixo (Ex: UR-15201)" 
            variant="outlined" 
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)', color: 'white', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#3b82f6' } } }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', ml: 1, fontWeight: 600, mb: 0.5, display: 'block' }}>FILTRAR STATUS</Typography>
          <FormControl fullWidth size="small">
            <Select 
              value="Todos" 
              displayEmpty
              sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: 'white', borderRadius: '12px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' } }}
            >
              <MenuItem value="Todos">Todos os Status</MenuItem>
              <MenuItem value="Operando">Operando</MenuItem>
              <MenuItem value="Reserva">Reserva</MenuItem>
              <MenuItem value="Baixado">Baixado</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, height: '40px' }}>
          <Button variant="contained" startIcon={<Search />} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: '12px', px: 3, fontWeight: 600, textTransform: 'none' }}>
            Buscar
          </Button>
          <Button variant="outlined" startIcon={<DeleteOutlineOutlined />} sx={{ color: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)', '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' }, borderRadius: '12px', textTransform: 'none' }}>
            Limpar
          </Button>
        </Box>
      </Box>

      {isLoading && vehiclesMap.size === 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {[1,2,3,4,5,6,7].map(i => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ flex: 1, minWidth: '12%', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          {/* Linha de KPIs (Ocupa toda a tela, cards do mesmo tamanho) */}
          <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', lg: 'nowrap' }, gap: 2, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="Frota Total" value={kpis.total} icon={<DirectionsCar />} color="#3b82f6" subtitle="Cadastradas" />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="Operando" value={kpis.operando} icon={<CheckCircle />} color="#10b981" subtitle="Prontas" />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="Reserva" value={kpis.reserva} icon={<Build />} color="#f59e0b" subtitle="Apoio" />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="Baixadas" value={kpis.baixado} icon={<ErrorOutlineOutlined />} color="#ef4444" subtitle="Inoperantes" />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="KM Total" value={kpis.kmTotal.toLocaleString('pt-BR')} icon={<Speed />} color="#8b5cf6" subtitle="Rodados" />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="Litros" value={kpis.litros.toLocaleString('pt-BR')} icon={<LocalGasStation />} color="#06b6d4" subtitle="Abastecidos" />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '45%', sm: '30%', lg: '12%' } }}>
              <KpiCard title="Custos" value={`R$ ${kpis.gastoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<AttachMoney />} color="#10b981" subtitle="Despesa" />
            </Box>
          </Box>

          {/* Segunda Linha: Checklists e Alertas (2 Colunas 50/50) */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, width: '100%' }}>
            {/* Coluna Checklists */}
            <Box sx={{ flex: 1, ...glassPanelStyle, p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentTurnedIn sx={{ color: '#8b5cf6', fontSize: 20 }} /> Controle de Checklists Diários (Operando)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden', flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Realizados */}
                <Box sx={{ flex: 1, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#10b981', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle fontSize="small" /> Realizados Hoje ({checklistControl.entregues.length})
                  </Typography>
                  <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
                    {checklistControl.entregues.length === 0 ? (
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>Nenhum checklist entregue hoje.</Typography>
                    ) : (
                      checklistControl.entregues.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: 'white' }}>{item.prefixo}</Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', fontSize: '10px' }}>{item.motorista}</Typography>
                            <Typography variant="caption" sx={{ color: '#10b981', fontSize: '10px' }}>{item.hora}</Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
                
                {/* Pendentes */}
                <Box sx={{ flex: 1, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#ef4444', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelOutlined fontSize="small" /> Pendentes Hoje ({checklistControl.pendentes.length})
                  </Typography>
                  <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
                    {checklistControl.pendentes.length === 0 ? (
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>Todos os checklists foram entregues!</Typography>
                    ) : (
                      checklistControl.pendentes.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: '#fca5a5' }}>{item.prefixo}</Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '10px' }}>{item.base}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Coluna Direita: Feed de Notificações */}
            <Box sx={{ flex: 1, ...glassPanelStyle, display: 'flex', flexDirection: 'column', height: '500px' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActive sx={{ color: '#f59e0b', fontSize: 20 }} /> Central de Alertas
                </Typography>
                <Badge badgeContent={allAlerts.length} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold', fontSize: '10px', height: '18px', minWidth: '18px' } }} />
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 1.5,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' }
              }}>
                {allAlerts.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 40, color: '#10b981', mb: 2 }} />
                    <Typography variant="caption">Nenhum alerta pendente</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {allAlerts.map((item, idx) => (
                      <ListItem 
                        key={idx} 
                        sx={{ 
                          mb: 1, 
                          bgcolor: getAlertColor(item.alerta.tipo, item.alerta.nivel), 
                          border: `1px solid ${getAlertBorder(item.alerta.tipo, item.alerta.nivel)}`, 
                          borderRadius: '12px',
                          alignItems: 'flex-start',
                          p: 1.5,
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.02)' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                          <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.2)', width: 26, height: 26 }}>
                            {getAlertIcon(item.alerta.tipo)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white' }}>{item.prefixo}</Typography>
                              <Chip 
                                label={item.alerta.tipo.replace(/_/g, ' ')} 
                                size="small" 
                                sx={{ 
                                  height: '18px', fontSize: '9px', fontWeight: 'bold', 
                                  bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '& .MuiChip-label': { px: 1 }
                                }} 
                              />
                            </Box>
                          }
                          secondary={item.alerta.mensagem}
                          secondaryTypographyProps={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', lineHeight: 1.3, mt: 0.5 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
