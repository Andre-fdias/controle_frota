import React, { useMemo, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TextField, Tabs, Tab, Chip, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '../../store/vehicleStore';
import type { ChecklistDiario, ChecklistSemanal } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
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
  backgroundColor: '#0a0e17',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: 'white',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s',
  colorScheme: 'dark',
  '&:focus': { borderColor: 'rgba(52, 211, 153, 0.5)' },
  '&::-webkit-calendar-picker-indicator': { opacity: 0.7, cursor: 'pointer' }
};

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${(value | 128).toString(16)}`.slice(-2);
  }
  return color;
}

const Checklists: React.FC = () => {
  const navigate = useNavigate();
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedChecklistDiario, setSelectedChecklistDiario] = useState<ChecklistDiario | null>(null);
  const [selectedChecklistSemanal, setSelectedChecklistSemanal] = useState<ChecklistSemanal | null>(null);

  const { diarios, semanais } = useMemo(() => {
    const d: ChecklistDiario[] = [];
    const s: ChecklistSemanal[] = [];
    vehiclesMap.forEach(v => {
      d.push(...v.checklistsDiarios);
      s.push(...v.checklistsSemanais);
    });
    
    // Sort descending by timestamp assuming format is sortable or valid date string
    d.sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
    s.sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
    
    return { diarios: d, semanais: s };
  }, [vehiclesMap]);

  const parseBrDate = (dateStr: string) => {
    // If it comes as DD/MM/YYYY HH:mm:ss
    if (dateStr.includes('/')) {
      const [datePart, timePart] = dateStr.split(' ');
      if (datePart) {
        const [day, month, year] = datePart.split('/');
        if (day && month && year) {
          return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
        }
      }
    }
    return new Date(dateStr);
  };

  const filteredDiarios = useMemo(() => {
    let result = diarios;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.prefixo.toLowerCase().includes(q) ||
        (c.motorista && c.motorista.toLowerCase().includes(q)) ||
        (c.baseOperacional && c.baseOperacional.toLowerCase().includes(q))
      );
    }
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(c => parseBrDate(c.timestamp || '').getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(c => parseBrDate(c.timestamp || '').getTime() <= end.getTime());
    }
    return result;
  }, [diarios, search, startDate, endDate]);

  const filteredSemanais = useMemo(() => {
    let result = semanais;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.prefixo.toLowerCase().includes(q) ||
        (c.responsavel && c.responsavel.toLowerCase().includes(q)) ||
        (c.baseOperacional && c.baseOperacional.toLowerCase().includes(q))
      );
    }
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(c => parseBrDate(c.timestamp || '').getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(c => parseBrDate(c.timestamp || '').getTime() <= end.getTime());
    }
    return result;
  }, [semanais, search, startDate, endDate]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDiarios = filteredDiarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const paginatedSemanais = filteredSemanais.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white', mb: 3 }}>Checklists</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3, alignItems: { md: 'center' }, justifyContent: 'space-between', ...glassPanelStyle, p: 2, flexWrap: 'wrap' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, nv) => { setTabValue(nv); setPage(0); }}
          sx={{ flexShrink: 0, '& .MuiTab-root': { color: '#9ca3af', fontWeight: 'bold', minWidth: '130px' }, '& .Mui-selected': { color: '#eab308' }, '& .MuiTabs-indicator': { backgroundColor: '#eab308' } }}
        >
          <Tab label={`Diários (${filteredDiarios.length})`} />
          <Tab label={`Semanais (${filteredSemanais.length})`} />
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="input" type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(0); }} sx={{ ...inputStyle, color: startDate ? 'white' : '#9ca3af', width: { xs: '100%', sm: 'auto' } }} />
            <Typography sx={{ color: '#9ca3af', fontSize: '12px' }}>até</Typography>
            <Box component="input" type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(0); }} sx={{ ...inputStyle, color: endDate ? 'white' : '#9ca3af', width: { xs: '100%', sm: 'auto' } }} />
          </Box>
          <Box 
            component="input" 
            type="search" 
            placeholder="Prefixo, Motorista, Base..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(0); }} 
            sx={{ ...inputStyle, width: { xs: '100%', md: 250 } }} 
          />
        </Box>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Box sx={{ ...glassPanelStyle, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '65vh', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
            <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data/Hora</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prefixo</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Motorista</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Base</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Combustível</TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDiarios.map((c, i) => (
                  <TableRow 
                    key={i} 
                    hover 
                    onClick={() => setSelectedChecklistDiario(c)} 
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1, fontSize: '12px' } }}
                  >
                    <TableCell sx={{ color: '#cbd5e1' }}>{c.timestamp}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: stringToColor(c.prefixo) }}>{c.prefixo}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.motorista}</TableCell>
                    <TableCell sx={{ color: '#cbd5e1' }}>{c.baseOperacional}</TableCell>
                    <TableCell align="right" sx={{ color: '#60a5fa', fontWeight: 'bold' }}>{c.kmAtual?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.nivelCombustivel || '-'}</TableCell>
                    <TableCell align="center">
                      {c.anomalias ? (
                        <Chip label="Avarias" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold', fontSize: '11px', height: '24px' }} />
                      ) : (
                        <Chip label="Sem Avarias" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 'bold', fontSize: '11px', height: '24px' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedDiarios.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 4, borderBottom: 'none' }}>Nenhum registro encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
            <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
              Mostrando {filteredDiarios.length > 0 ? page * rowsPerPage + 1 : 0} até {Math.min((page + 1) * rowsPerPage, filteredDiarios.length)} de {filteredDiarios.length} registros
            </Typography>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={filteredDiarios.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage=""
              sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: 'none', overflow: 'hidden', '& .MuiTablePagination-selectLabel': { display: 'none' }, '& .MuiTablePagination-toolbar': { minHeight: '32px', padding: 0 } }}
            />
          </Box>
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        <Box sx={{ ...glassPanelStyle, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '65vh', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
            <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data/Hora</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prefixo</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Responsável</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Base</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Combustível</TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#111827', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSemanais.map((c, i) => (
                  <TableRow 
                    key={i} 
                    hover 
                    onClick={() => setSelectedChecklistSemanal(c)} 
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1, fontSize: '12px' } }}
                  >
                    <TableCell sx={{ color: '#cbd5e1' }}>{c.timestamp}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: stringToColor(c.prefixo) }}>{c.prefixo}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.responsavel}</TableCell>
                    <TableCell sx={{ color: '#cbd5e1' }}>{c.baseOperacional}</TableCell>
                    <TableCell align="right" sx={{ color: '#60a5fa', fontWeight: 'bold' }}>{c.kmAtual?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{c.nivelCombustivel || '-'}</TableCell>
                    <TableCell align="center">
                      {c.anomalias ? (
                        <Chip label="Avarias" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold', fontSize: '11px', height: '24px' }} />
                      ) : (
                        <Chip label="Sem Avarias" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 'bold', fontSize: '11px', height: '24px' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedSemanais.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 4, borderBottom: 'none' }}>Nenhum registro encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
            <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
              Mostrando {filteredSemanais.length > 0 ? page * rowsPerPage + 1 : 0} até {Math.min((page + 1) * rowsPerPage, filteredSemanais.length)} de {filteredSemanais.length} registros
            </Typography>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={filteredSemanais.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage=""
              sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: 'none', overflow: 'hidden', '& .MuiTablePagination-selectLabel': { display: 'none' }, '& .MuiTablePagination-toolbar': { minHeight: '32px', padding: 0 } }}
            />
          </Box>
        </Box>
      </CustomTabPanel>

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
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Data/Hora</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.timestamp || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Motorista</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.motorista || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Hodômetro</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.kmAtual || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Combustível</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.nivelCombustivel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Turno</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.prontidaoTurno || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Base Operacional</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistDiario.baseOperacional || '-'}</Typography></Box>
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
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Anomalias Observadas</Typography>
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
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Data/Hora</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.timestamp || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Responsável</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.responsavel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Hodômetro</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.kmAtual || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Combustível</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.nivelCombustivel || '-'}</Typography></Box>
                <Box><Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Base Operacional</Typography><Typography sx={{ fontWeight: 'bold', color: 'white' }}>{selectedChecklistSemanal.baseOperacional || '-'}</Typography></Box>
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
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', mb: '4px' }}>Anomalias Observadas</Typography>
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

export default Checklists;
