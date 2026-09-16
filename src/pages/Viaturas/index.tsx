import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, TextField, ButtonGroup, Button, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton
} from '@mui/material';
import ViewModule from '@mui/icons-material/ViewModule';
import ViewList from '@mui/icons-material/ViewList';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Warning from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '../../store/vehicleStore';

type ViewMode = 'card' | 'table';
type FilterStatus = 'ALL' | 'OPERANDO' | 'RESERVA' | 'BAIXADO' | 'ALERTAS' | 'AVARIAS';

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

const inputStyle = {
  backgroundColor: '#0a0e17',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: 'white',
  padding: '6px 12px',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': { borderColor: 'rgba(52, 211, 153, 0.5)' }
};

const Viaturas: React.FC = () => {
  const navigate = useNavigate();
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  const filteredVehicles = useMemo(() => {
    let list = Array.from(vehiclesMap.values());

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v => {
        const c = v.cadastro;
        return (
          v.prefixo.toLowerCase().includes(q) ||
          c?.placa?.toLowerCase().includes(q) ||
          c?.modelo?.toLowerCase().includes(q) ||
          c?.fabricante?.toLowerCase().includes(q) ||
          c?.tipo?.toLowerCase().includes(q) ||
          c?.municipioUnidade?.toLowerCase().includes(q) ||
          c?.opmcb?.toLowerCase().includes(q) ||
          c?.sgb?.toLowerCase().includes(q) ||
          c?.garagem?.toLowerCase().includes(q)
        );
      });
    }

    // Quick Filters
    if (filterStatus !== 'ALL') {
      list = list.filter(v => {
        const s = v.cadastro?.status?.toUpperCase() || '';
        if (filterStatus === 'OPERANDO') return s.includes('OPERANDO');
        if (filterStatus === 'RESERVA') return s.includes('RESERVA');
        if (filterStatus === 'BAIXADO') return s.includes('BAIXADA') || s.includes('BAIXADO');
        if (filterStatus === 'ALERTAS') return v.alertas.length > 0;
        if (filterStatus === 'AVARIAS') return v.checklistsDiarios.some(c => c.anomalias) || v.checklistsSemanais.some(c => c.anomalias);
        return true;
      });
    }

    return list;
  }, [vehiclesMap, search, filterStatus]);

  const getStatusColor = (status?: string | null) => {
    const s = status?.toUpperCase() || '';
    if (s.includes('OPERANDO')) return 'success';
    if (s.includes('RESERVA')) return 'warning';
    if (s.includes('BAIXAD')) return 'error';
    return 'default';
  };

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white', mb: 3 }}>Viaturas</Typography>
      
      <Box sx={{ 
        ...glassPanelStyle, p: 2, mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' }, 
        gap: 2, 
        alignItems: { xs: 'stretch', lg: 'center' }, 
        width: '100%' 
      }}>
        <Box sx={{ width: { xs: '100%', lg: '350px' }, flexShrink: 0 }}>
          <Box 
            component="input" 
            type="search" 
            placeholder="Buscar (Prefixo, Placa, Modelo...)" 
            value={search} 
            onChange={e => setSearch((e.target as HTMLInputElement).value)} 
            sx={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: { xs: 1, lg: 0 }, flexGrow: 1 }}>
          <ButtonGroup variant="outlined" size="small" sx={{ flexShrink: 0, '& .MuiButton-root': { borderColor: 'rgba(255,255,255,0.2)', color: '#9ca3af' }, '& .MuiButton-contained': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
            {(['ALL', 'OPERANDO', 'RESERVA', 'BAIXADO', 'ALERTAS', 'AVARIAS'] as FilterStatus[]).map(f => (
              <Button 
                key={f} 
                variant={filterStatus === f ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus(f)}
              >
                {f === 'ALL' ? 'Todas' : f}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup variant="outlined" size="small" sx={{ flexShrink: 0, '& .MuiButton-root': { borderColor: 'rgba(255,255,255,0.2)', color: '#9ca3af' }, '& .MuiButton-contained': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
            <Button variant={viewMode === 'card' ? 'contained' : 'outlined'} onClick={() => setViewMode('card')}>
              <ViewModule />
            </Button>
            <Button variant={viewMode === 'table' ? 'contained' : 'outlined'} onClick={() => setViewMode('table')}>
              <ViewList />
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {viewMode === 'card' ? (
        <Grid container spacing={3} alignItems="stretch">
          {filteredVehicles.map(v => (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={v.prefixo} sx={{ display: 'flex' }}>
              <Box 
                sx={{ 
                  ...glassPanelStyle,
                  p: 2.5,
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease', 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', bgcolor: 'rgba(255,255,255,0.05)' } 
                }}
                onClick={() => navigate(`/viaturas/${v.prefixo}`)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#eab308' }}>{v.prefixo}</Typography>
                  <Chip 
                    label={v.cadastro?.status || 'S/ STATUS'} 
                    size="small" 
                    sx={{ 
                      bgcolor: getStatusColor(v.cadastro?.status) === 'success' ? 'rgba(16, 185, 129, 0.1)' : getStatusColor(v.cadastro?.status) === 'warning' ? 'rgba(245, 158, 11, 0.1)' : getStatusColor(v.cadastro?.status) === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.1)',
                      color: getStatusColor(v.cadastro?.status) === 'success' ? '#10b981' : getStatusColor(v.cadastro?.status) === 'warning' ? '#f59e0b' : getStatusColor(v.cadastro?.status) === 'error' ? '#ef4444' : '#9ca3af',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      border: '1px solid transparent',
                      borderColor: getStatusColor(v.cadastro?.status) === 'success' ? 'rgba(16, 185, 129, 0.2)' : getStatusColor(v.cadastro?.status) === 'warning' ? 'rgba(245, 158, 11, 0.2)' : getStatusColor(v.cadastro?.status) === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.2)'
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 'auto', mb: 0.5 }} noWrap>
                  Placa: <span style={{ color: 'white', fontWeight: 500 }}>{v.cadastro?.placa || 'N/A'}</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 0.5 }} noWrap>
                  Modelo: <span style={{ color: 'white', fontWeight: 500 }}>{v.cadastro?.modelo || 'N/A'}</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }} noWrap>
                  Base: <span style={{ color: 'white', fontWeight: 500 }}>{v.cadastro?.opmcb || 'N/A'}</span>
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  {v.alertas.length > 0 && <Chip icon={<Warning sx={{ fontSize: '14px' }} />} label={`${v.alertas.length} Alerta${v.alertas.length > 1 ? 's' : ''}`} size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold', fontSize: '11px' }} />}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '60vh', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prefixo</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Placa</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Modelo</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Base</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Alertas</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVehicles.map(v => (
                  <TableRow 
                    key={v.prefixo} 
                    hover 
                    onClick={() => navigate(`/viaturas/${v.prefixo}`)} 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                      '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }
                    }}
                  >
                    <TableCell sx={{ color: '#eab308', fontWeight: 'bold' }}>{v.prefixo}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{v.cadastro?.placa || '-'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{v.cadastro?.modelo || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={v.cadastro?.status || 'N/A'} 
                        size="small" 
                        sx={{ 
                          bgcolor: getStatusColor(v.cadastro?.status) === 'success' ? 'rgba(16, 185, 129, 0.1)' : getStatusColor(v.cadastro?.status) === 'warning' ? 'rgba(245, 158, 11, 0.1)' : getStatusColor(v.cadastro?.status) === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.1)',
                          color: getStatusColor(v.cadastro?.status) === 'success' ? '#10b981' : getStatusColor(v.cadastro?.status) === 'warning' ? '#f59e0b' : getStatusColor(v.cadastro?.status) === 'error' ? '#ef4444' : '#9ca3af',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          border: '1px solid transparent',
                          borderColor: getStatusColor(v.cadastro?.status) === 'success' ? 'rgba(16, 185, 129, 0.2)' : getStatusColor(v.cadastro?.status) === 'warning' ? 'rgba(245, 158, 11, 0.2)' : getStatusColor(v.cadastro?.status) === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.2)'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>{v.cadastro?.opmcb || '-'}</TableCell>
                    <TableCell>
                      {v.alertas.length > 0 ? <Chip label={v.alertas.length} size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold' }} /> : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" sx={{ color: '#9ca3af' }}><ChevronRight /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {filteredVehicles.length === 0 && (
        <Box textAlign="center" mt={8}>
          <Typography variant="h6" sx={{ color: '#9ca3af' }}>Nenhuma viatura encontrada com os filtros atuais.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Viaturas;
