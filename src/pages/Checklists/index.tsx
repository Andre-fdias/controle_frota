import React, { useMemo, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TextField, Tabs, Tab, Chip, TablePagination
} from '@mui/material';
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
  '&:focus': { borderColor: 'rgba(52, 211, 153, 0.5)' }
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

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

  const filteredDiarios = useMemo(() => {
    if (!search) return diarios;
    const q = search.toLowerCase();
    return diarios.filter(c => 
      c.prefixo.toLowerCase().includes(q) ||
      (c.motorista && c.motorista.toLowerCase().includes(q)) ||
      (c.baseOperacional && c.baseOperacional.toLowerCase().includes(q))
    );
  }, [diarios, search]);

  const filteredSemanais = useMemo(() => {
    if (!search) return semanais;
    const q = search.toLowerCase();
    return semanais.filter(c => 
      c.prefixo.toLowerCase().includes(q) ||
      (c.responsavel && c.responsavel.toLowerCase().includes(q)) ||
      (c.baseOperacional && c.baseOperacional.toLowerCase().includes(q))
    );
  }, [semanais, search]);

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
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3, alignItems: { md: 'center' }, justifyContent: 'space-between', ...glassPanelStyle, p: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, nv) => { setTabValue(nv); setPage(0); }}
          sx={{ '& .MuiTab-root': { color: '#9ca3af', fontWeight: 'bold' }, '& .Mui-selected': { color: '#eab308' }, '& .MuiTabs-indicator': { backgroundColor: '#eab308' } }}
        >
          <Tab label={`Diários (${filteredDiarios.length})`} />
          <Tab label={`Semanais (${filteredSemanais.length})`} />
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Typography sx={{ fontSize: '13px', color: '#9ca3af', display: { xs: 'none', md: 'block' } }}>Search</Typography>
          <Box 
            component="input" 
            type="search" 
            placeholder="Prefixo, Motorista, Base..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(0); }} 
            sx={{ ...inputStyle, width: { xs: '100%', md: 300 } }} 
          />
        </Box>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Box sx={{ ...glassPanelStyle, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '65vh', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
            <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data/Hora</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prefixo</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Motorista</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Base</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Combustível</TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDiarios.map((c, i) => (
                  <TableRow 
                    key={i} 
                    hover 
                    onClick={() => navigate(`/viaturas/${c.prefixo}`)} 
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 } }}
                  >
                    <TableCell sx={{ fontSize: '13px', color: '#5a6f8a' }}>{c.timestamp}</TableCell>
                    <TableCell sx={{ fontSize: '13.5px', fontWeight: 'bold', fontFamily: 'monospace', color: stringToColor(c.prefixo) }}>{c.prefixo}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#d1d5db' }}>{c.motorista}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#9ca3af' }}>{c.baseOperacional}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px', color: '#60a5fa', fontWeight: 'bold' }}>{c.kmAtual?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#d1d5db' }}>{c.nivelCombustivel || '-'}</TableCell>
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
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data/Hora</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prefixo</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Responsável</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Base</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hodômetro</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Combustível</TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Avarias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSemanais.map((c, i) => (
                  <TableRow 
                    key={i} 
                    hover 
                    onClick={() => navigate(`/viaturas/${c.prefixo}`)} 
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 } }}
                  >
                    <TableCell sx={{ fontSize: '13px', color: '#5a6f8a' }}>{c.timestamp}</TableCell>
                    <TableCell sx={{ fontSize: '13.5px', fontWeight: 'bold', fontFamily: 'monospace', color: stringToColor(c.prefixo) }}>{c.prefixo}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#d1d5db' }}>{c.responsavel}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#9ca3af' }}>{c.baseOperacional}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px', color: '#60a5fa', fontWeight: 'bold' }}>{c.kmAtual?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '13px', color: '#d1d5db' }}>{c.nivelCombustivel || '-'}</TableCell>
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
    </Box>
  );
};

export default Checklists;
