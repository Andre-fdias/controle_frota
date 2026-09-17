import React from 'react';
import { 
  Box, Typography, Grid, List, ListItem, ListItemIcon, ListItemText, Alert, Divider 
} from '@mui/material';
import { useVehicleStore } from '../../store/vehicleStore';
import Security from '@mui/icons-material/Security';
import Warning from '@mui/icons-material/Warning';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import Article from '@mui/icons-material/Article';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import Assignment from '@mui/icons-material/Assignment';

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

const Integridade: React.FC = () => {
  const { vehicles, orphans, globalIntegrityIssues } = useVehicleStore();

  const vehiclesWithIssues = Array.from(vehicles.values()).filter(v => 
    v.integridade.hasDuplicatedPrefix || 
    v.integridade.hasDuplicatedPlate || 
    v.integridade.isOrphan || 
    v.integridade.issues.length > 0
  );

  const totalOrphans = orphans.abastecimentos.length + orphans.checklistsDiarios.length + orphans.checklistsSemanais.length;

  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 2, md: 3 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white', mb: 1, fontWeight: 'bold' }}>
        <Security sx={{ color: '#3b82f6', fontSize: 32 }} /> Integridade e Auditoria
      </Typography>
      <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4, maxWidth: '800px' }}>
        Nenhum registro recebido do Google Sheets é descartado. Abaixo estão listadas as inconsistências encontradas durante o relacionamento dos dados.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ ...glassPanelStyle, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f59e0b', fontWeight: 'bold' }}>
              <Warning /> Registros Órfãos ({totalOrphans})
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
              Registros operacionais cujo prefixo não foi encontrado na aba de Detalhamento_Viaturas (Cadastro).
            </Typography>
            
            <List dense disablePadding>
              <ListItem sx={{ bgcolor: 'rgba(255,255,255,0.02)', mb: 1, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ListItemIcon sx={{ minWidth: 40 }}><LocalGasStation fontSize="small" sx={{ color: '#60a5fa' }} /></ListItemIcon>
                <ListItemText primary={<Typography sx={{ color: 'white', fontSize: '14px' }}>Abastecimentos Órfãos: {orphans.abastecimentos.length}</Typography>} />
              </ListItem>
              <ListItem sx={{ bgcolor: 'rgba(255,255,255,0.02)', mb: 1, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ListItemIcon sx={{ minWidth: 40 }}><Assignment fontSize="small" sx={{ color: '#a855f7' }} /></ListItemIcon>
                <ListItemText primary={<Typography sx={{ color: 'white', fontSize: '14px' }}>Checklists Diários Órfãos: {orphans.checklistsDiarios.length}</Typography>} />
              </ListItem>
              <ListItem sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ListItemIcon sx={{ minWidth: 40 }}><Assignment fontSize="small" sx={{ color: '#f43f5e' }} /></ListItemIcon>
                <ListItemText primary={<Typography sx={{ color: 'white', fontSize: '14px' }}>Checklists Semanais Órfãos: {orphans.checklistsSemanais.length}</Typography>} />
              </ListItem>
            </List>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ ...glassPanelStyle, p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#ef4444', fontWeight: 'bold' }}>
              <ErrorOutlineOutlined /> Problemas de Integridade Globais
            </Typography>
            {globalIntegrityIssues.length === 0 ? (
              <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', '& .MuiAlert-icon': { color: '#10b981' }, border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                Nenhum problema global detectado.
              </Alert>
            ) : (
              <List dense disablePadding>
                {globalIntegrityIssues.map((issue, idx) => (
                  <ListItem key={idx} sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', mb: 1, borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><Warning sx={{ color: '#ef4444', fontSize: '18px' }} /></ListItemIcon>
                    <ListItemText primary={<Typography sx={{ color: '#fca5a5', fontSize: '13px' }}>{issue}</Typography>} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ ...glassPanelStyle, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white', fontWeight: 'bold' }}>
              <Article sx={{ color: '#8b5cf6' }} /> Viaturas com Inconsistências ({vehiclesWithIssues.length})
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
            
            {vehiclesWithIssues.length === 0 ? (
              <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', '& .MuiAlert-icon': { color: '#10b981' }, border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                Todas as viaturas estão íntegras.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {vehiclesWithIssues.map(v => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={v.prefixo}>
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#38bdf8', mb: 1, display: 'inline-block', bgcolor: 'rgba(56, 189, 248, 0.1)', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                        {v.prefixo}
                      </Typography>
                      <List dense disablePadding sx={{ mt: 1 }}>
                        {v.integridade.issues.map((issue, i) => (
                          <ListItem key={i} disablePadding sx={{ py: 0.5, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}><ErrorOutlineOutlined sx={{ color: '#ef4444', fontSize: '16px' }} /></ListItemIcon>
                            <ListItemText primary={<Typography sx={{ color: '#d1d5db', fontSize: '12.5px' }}>{issue}</Typography>} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Integridade;
