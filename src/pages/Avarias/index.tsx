import React, { useMemo, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TextField, Chip, TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '../../store/vehicleStore';
import Warning from '@mui/icons-material/Warning';

interface AvariaRow {
  prefixo: string;
  data: string;
  origem: 'Diário' | 'Semanal';
  responsavel: string;
  base: string;
  descricao: string;
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

const Avarias: React.FC = () => {
  const navigate = useNavigate();
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const allAvarias = useMemo(() => {
    const list: AvariaRow[] = [];
    vehiclesMap.forEach(v => {
      v.checklistsDiarios.forEach(c => {
        if (c.anomalias) {
          list.push({
            prefixo: v.prefixo,
            data: c.timestamp || '',
            origem: 'Diário',
            responsavel: c.motorista || '',
            base: c.baseOperacional || '',
            descricao: c.anomalias
          });
        }
      });
      v.checklistsSemanais.forEach(c => {
        if (c.anomalias) {
          list.push({
            prefixo: v.prefixo,
            data: c.timestamp || '',
            origem: 'Semanal',
            responsavel: c.responsavel || '',
            base: c.baseOperacional || '',
            descricao: c.anomalias
          });
        }
      });
    });
    
    list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return list;
  }, [vehiclesMap]);

  const filtered = useMemo(() => {
    if (!search) return allAvarias;
    const q = search.toLowerCase();
    return allAvarias.filter(a => 
      a.prefixo.toLowerCase().includes(q) ||
      a.descricao.toLowerCase().includes(q) ||
      a.responsavel.toLowerCase().includes(q)
    );
  }, [allAvarias, search]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 3, gap: 2 }}>
        <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1} sx={{ color: 'white', m: 0 }}>
          <Warning sx={{ color: '#ef4444', fontSize: 32 }} /> Avarias e Anomalias
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Typography sx={{ fontSize: '13px', color: '#9ca3af', display: { xs: 'none', md: 'block' } }}>Search</Typography>
          <Box 
            component="input" 
            type="search" 
            placeholder="Prefixo, Descrição, Responsável..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(0); }} 
            sx={{ ...inputStyle, width: { xs: '100%', md: 350 } }} 
          />
        </Box>
      </Box>

      <Box sx={{ ...glassPanelStyle, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '75vh', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
          <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data/Hora</TableCell>
                <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prefixo</TableCell>
                <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Origem</TableCell>
                <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Responsável</TableCell>
                <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Base</TableCell>
                <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Descrição da Avaria</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((a, i) => (
                <TableRow 
                  key={i} 
                  hover 
                  onClick={() => navigate(`/viaturas/${a.prefixo}`)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 } }}
                >
                  <TableCell sx={{ fontSize: '13px', color: '#5a6f8a' }}>{a.data}</TableCell>
                  <TableCell sx={{ fontSize: '13.5px', fontWeight: 'bold', fontFamily: 'monospace', color: stringToColor(a.prefixo) }}>{a.prefixo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={a.origem} 
                      size="small" 
                      sx={{ 
                        bgcolor: a.origem === 'Diário' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                        color: a.origem === 'Diário' ? '#3b82f6' : '#a855f7',
                        border: `1px solid ${a.origem === 'Diário' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
                        fontWeight: 'bold', fontSize: '11px', height: '24px'
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px', color: '#d1d5db' }}>{a.responsavel}</TableCell>
                  <TableCell sx={{ fontSize: '13px', color: '#9ca3af' }}>{a.base}</TableCell>
                  <TableCell sx={{ fontSize: '13px', color: '#d1d5db', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.descricao}</TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 4, borderBottom: 'none' }}>Nenhuma avaria registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
          <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
            Mostrando {filtered.length > 0 ? page * rowsPerPage + 1 : 0} até {Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} registros
          </Typography>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage=""
            sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: 'none', overflow: 'hidden', '& .MuiTablePagination-selectLabel': { display: 'none' }, '& .MuiTablePagination-toolbar': { minHeight: '32px', padding: 0 } }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Avarias;
