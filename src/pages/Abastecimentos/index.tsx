import React, { useMemo, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, TablePagination,
  Select, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import TableViewIcon from '@mui/icons-material/TableView';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useVehicleStore } from '../../store/vehicleStore';
import type { Abastecimento } from '../../types';

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

const labelStyle = {
  fontSize: '10px',
  fontWeight: 'bold',
  color: '#5a6f8a',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '4px'
};

const Abastecimentos: React.FC = () => {
  const navigate = useNavigate();
  const vehiclesMap = useVehicleStore(state => state.vehicles);
  const [search, setSearch] = useState('');
  const [prefixFilter, setPrefixFilter] = useState('');
  const [postoFilter, setPostoFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const allAbastecimentos = useMemo(() => {
    const list: (Abastecimento & { consumoKmL?: number })[] = [];
    vehiclesMap.forEach(v => {
      const sortedAbs = [...v.abastecimentos].sort((a,b) => (a.kmHodometro||0) - (b.kmHodometro||0));
      sortedAbs.forEach((abs, i) => {
        let consumo = 0;
        if (i > 0 && abs.kmHodometro && sortedAbs[i-1].kmHodometro && abs.volumeLitros) {
          consumo = (abs.kmHodometro - sortedAbs[i-1].kmHodometro!) / abs.volumeLitros;
        }
        list.push({ ...abs, consumoKmL: consumo > 0 ? consumo : undefined });
      });
    });
    list.sort((a, b) => {
      const partsA = a.data.split('/');
      const partsB = b.data.split('/');
      if (partsA.length === 3 && partsB.length === 3) {
        return new Date(`${partsB[2]}-${partsB[1]}-${partsB[0]}`).getTime() - new Date(`${partsA[2]}-${partsA[1]}-${partsA[0]}`).getTime();
      }
      return 0;
    });
    return list;
  }, [vehiclesMap]);

  const uniquePrefixes = useMemo(() => {
    const p = new Set<string>();
    allAbastecimentos.forEach(a => p.add(a.prefixo));
    return Array.from(p).sort();
  }, [allAbastecimentos]);



  const filtered = useMemo(() => {
    let result = allAbastecimentos;
    if (prefixFilter) {
      result = result.filter(a => a.prefixo === prefixFilter);
    }
    if (postoFilter) {
      const q = postoFilter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      result = result.filter(a => {
        if (!a.pelotaoEstacao) return false;
        const pelotaoNorm = a.pelotaoEstacao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        return pelotaoNorm.includes(q);
      });
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.prefixo.toLowerCase().includes(q) ||
        (a.placa && a.placa.toLowerCase().includes(q)) ||
        (a.pelotaoEstacao && a.pelotaoEstacao.toLowerCase().includes(q)) ||
        a.data.includes(q)
      );
    }
    return result;
  }, [allAbastecimentos, search, prefixFilter, postoFilter]);

  // Totals
  const totalGasto = filtered.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);
  const totalLitros = filtered.reduce((acc, curr) => acc + (curr.volumeLitros || 0), 0);
  const totalKmDriven = filtered.reduce((acc, curr) => acc + (curr.consumoKmL ? (curr.volumeLitros || 0) * curr.consumoKmL : 0), 0);
  const consumoMedioGlobal = totalLitros > 0 ? totalKmDriven / totalLitros : 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* Filtros Abastecimento */}
        <Box sx={{ ...glassPanelStyle, p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { md: 'center' } }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.05em', color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon fontSize="small" /> Filtros
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 200 }}>
              <Typography sx={labelStyle}>Posto / Unidade</Typography>
              <Box sx={{ position: 'relative' }}>
                <StorefrontIcon sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, zIndex: 10, pointerEvents: 'none' }} />
                <Select
                  value={postoFilter}
                  onChange={(e) => setPostoFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    ...inputStyle,
                    width: '100%',
                    paddingLeft: '32px',
                    '& .MuiSelect-select': { padding: '4px 8px 4px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
                    '& fieldset': { border: 'none' }
                  }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#0a0e17', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } } }}
                >
                  <MenuItem value="">TODAS AS UNIDADES</MenuItem>
                  <MenuItem value="ibiuna">Ibiúna</MenuItem>
                  <MenuItem value="sao roque">São Roque</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', width: 200 }}>
              <Typography sx={labelStyle}>Prefixo Viatura</Typography>
              <Box sx={{ position: 'relative' }}>
                <LocalShippingIcon sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, zIndex: 10, pointerEvents: 'none' }} />
                <Select
                  value={prefixFilter}
                  onChange={(e) => setPrefixFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    ...inputStyle,
                    width: '100%',
                    paddingLeft: '32px',
                    '& .MuiSelect-select': { padding: '4px 8px 4px 0' },
                    '& fieldset': { border: 'none' }
                  }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#0a0e17', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } } }}
                >
                  <MenuItem value="">TODAS AS VIATURAS</MenuItem>
                  {uniquePrefixes.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', width: 200 }}>
              <Typography sx={labelStyle}>Data Início</Typography>
              <Box component="input" type="date" sx={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', width: 200 }}>
              <Typography sx={labelStyle}>Data Fim</Typography>
              <Box component="input" type="date" sx={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </Box>
          </Box>
        </Box>

        {/* Mini Cards Dashboard */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, width: '100%' }}>
          <Box sx={{ ...glassPanelStyle, p: 2.5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -20, top: -20, color: 'rgba(239, 68, 68, 0.1)', transform: 'rotate(-12deg)' }}>
              <AttachMoneyIcon sx={{ fontSize: 100 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography sx={labelStyle}>Custo Total</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Typography sx={{ fontSize: '30px', fontWeight: 900, color: 'white' }}>R$&nbsp;{totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ ...glassPanelStyle, p: 2.5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -20, top: -20, color: 'rgba(59, 130, 246, 0.1)', transform: 'rotate(-12deg)' }}>
              <WaterDropIcon sx={{ fontSize: 100 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography sx={labelStyle}>Volume Consumido</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Typography sx={{ fontSize: '30px', fontWeight: 900, color: 'white' }}>{totalLitros.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#9ca3af', mb: 0.5 }}>L</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ ...glassPanelStyle, p: 2.5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -20, top: -20, color: 'rgba(168, 85, 247, 0.1)', transform: 'rotate(-12deg)' }}>
              <SpeedIcon sx={{ fontSize: 100 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography sx={labelStyle}>Consumo Médio</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Typography sx={{ fontSize: '30px', fontWeight: 900, color: 'white' }}>{consumoMedioGlobal.toFixed(2)}</Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#9ca3af', mb: 0.5 }}>km/l</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ ...glassPanelStyle, p: 2.5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -20, top: -20, color: 'rgba(16, 185, 129, 0.1)', transform: 'rotate(-12deg)' }}>
              <LocalGasStationIcon sx={{ fontSize: 100 }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography sx={labelStyle}>Qtd. Abastecimentos</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Typography sx={{ fontSize: '30px', fontWeight: 900, color: 'white' }}>{filtered.length}</Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#9ca3af', mb: 0.5 }}>registros</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tabela */}
        <Box sx={{ ...glassPanelStyle, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.05em', color: 'white', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableViewIcon sx={{ color: '#34d399', fontSize: 18 }} /> Histórico EB SÃO ROQUE
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>Search</Typography>
              <Box component="input" type="search" placeholder="Pesquisar abastecimento..." value={search} onChange={e => setSearch(e.target.value)} sx={{ ...inputStyle, bgcolor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRadius: 0, padding: '4px 0' }} />
            </Box>
          </Box>
          
          <TableContainer sx={{ maxHeight: '50vh', '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
            <Table stickyHeader sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>DATA</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>VIATURA</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>PELOTÃO/ESTAÇÃO</TableCell>
                  <TableCell sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>KM</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>VOLUME</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#111827', color: '#9ca3af', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>VALOR</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#1f1b2e', color: '#c084fc', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>KM/L (TRECHO)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((a, i) => (
                  <TableRow 
                    key={`${a.prefixo}-${i}`} 
                    onClick={() => navigate(`/viaturas/${a.prefixo}`)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                      '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5 }
                    }}
                  >
                    <TableCell sx={{ fontSize: '13.5px', color: '#5a6f8a' }}>{a.data}</TableCell>
                    <TableCell sx={{ fontSize: '13.5px', fontWeight: 'bold', fontFamily: 'monospace', color: stringToColor(a.prefixo) }}>{a.prefixo}</TableCell>
                    <TableCell sx={{ fontSize: '13.5px', color: '#9ca3af', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.pelotaoEstacao || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '13.5px', color: '#d1d5db' }}>{a.kmHodometro?.toLocaleString('pt-BR') || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13.5px', color: '#60a5fa', fontWeight: 'bold' }}>{a.volumeLitros ? `${a.volumeLitros} L` : '-'}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13.5px', color: '#f87171', fontWeight: 'bold' }}>{a.valorTotal ? `R$ ${a.valorTotal.toFixed(2)}` : '-'}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13.5px', color: '#c084fc', fontWeight: 'bold', bgcolor: 'rgba(168,85,247,0.05)' }}>{a.consumoKmL ? a.consumoKmL.toFixed(1) : '--'}</TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 4, borderBottom: 'none' }}>Nenhum registro encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
              Mostrando {filtered.length > 0 ? page * rowsPerPage + 1 : 0} até {Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length} registros
            </Typography>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 20, 25]}
              component="div"
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage=""
              sx={{ 
                color: 'rgba(255,255,255,0.5)', 
                borderBottom: 'none',
                overflow: 'hidden',
                '& .MuiTablePagination-selectLabel': { display: 'none' },
                '& .MuiTablePagination-toolbar': { minHeight: '32px', padding: 0 }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Abastecimentos;
