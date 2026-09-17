import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import TableChart from '@mui/icons-material/TableChart';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Storage from '@mui/icons-material/Storage';

const glassPanelStyle = {
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

const SPREADSHEET_ID = '1LvqrPR_KCD7WpZ-zr9Ow2YXIqIUYrh3dtKlGiBXX4FQ';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;

const ABASTECIMENTO_SPREADSHEET_ID = '1Yddf9EORz6izjuYQhYBPN23edWIaJgxcb1qIXwu35A4';
const ABASTECIMENTO_URL = `https://docs.google.com/spreadsheets/d/${ABASTECIMENTO_SPREADSHEET_ID}/edit?gid=429180231#gid=429180231`;

const CHK_DIARIO_FORM = 'https://docs.google.com/forms/d/1Rjp9fATLydkTY5DREftwUn8cpNC27C-jnbgLFnunwTQ/edit';
const CHK_DIARIO_SHEET = 'https://docs.google.com/spreadsheets/d/1xKZS6iEiP7U5VEvzm9aCEQpaYF-xZ4z1Fc5zp6hyNT8/edit?usp=sharing';

const CHK_SEMANAL_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSexNgJgs_LvynwiyNDIEcYzadG_gu5KtSwj8sMQlP6dTAuEPQ/viewform?usp=header';
const CHK_SEMANAL_SHEET = 'https://docs.google.com/spreadsheets/d/1_ME9t0LqYyIK6zEKoWpMtcPzYV4VgasTNNeFIN6JjeM/edit?gid=1809767578#gid=1809767578';

const FontesDeDados: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#0a0e17', minHeight: '100vh', p: { xs: 1.5, sm: 2 }, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'white', mb: 1 }}>
        <Storage sx={{ color: '#3b82f6', fontSize: 26 }} /> Base de Dados (Google Sheets)
      </Typography>
      <Typography variant="body1" sx={{ color: '#9ca3af', mb: 2.5, maxWidth: '800px' }}>
        O sistema centraliza e consome os dados automaticamente do Google Sheets. Abaixo estão os links de acesso direto à base de dados.
      </Typography>

      <Grid container spacing={2} sx={{ width: '100%', m: 0, p: 0, '& .MuiGrid-item': { pl: 1, pr: 1, pt: 1 } }}>
        <Grid item xs={6}>
          <Box sx={{ ...glassPanelStyle, p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <TableChart sx={{ color: '#10b981' }} /> Planilha Mestre de Controle de Frota
              </Typography>
              <Button 
                size="small"
                variant="contained" 
                color="primary" 
                endIcon={<OpenInNew />} 
                href={BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
              >
                Abrir Planilha
              </Button>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />
            
            <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 2, fontWeight: 'bold' }}>
              ABAS (SHEETS) SINCRONIZADAS:
            </Typography>

            <List disablePadding>
              {[
                { name: 'Detalhamento_Viaturas', desc: 'Cadastro principal, Placas, Prefixos, Modelo e Status da frota.' },
                { name: 'Consolidado_Frota', desc: 'Dados consolidados de KM atual e Consumo Geral (se aplicável).' },
                { name: 'Historico_Abastecimentos', desc: 'Registro de todos os abastecimentos (Litros, KM, Valor).' },
                { name: 'Checklist_Diario', desc: 'Respostas dos formulários de Checklists Diários (Google Forms).' },
                { name: 'Checklist_Semanal', desc: 'Respostas dos formulários de Checklists Semanais (Google Forms).' },
                { name: 'Cadastro_Revisoes', desc: 'Histórico de manutenções e previsão de próximas revisões.' }
              ].map((sheet, idx) => (
                <ListItem key={idx} sx={{ bgcolor: 'rgba(255,255,255,0.02)', mb: 1, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TableChart sx={{ color: '#9ca3af', fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px' }}>{sheet.name}</Typography>}
                    secondary={<Typography sx={{ color: '#9ca3af', fontSize: '10px' }}>{sheet.desc}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

        </Grid>

        <Grid item xs={6}>
          <Box sx={{ ...glassPanelStyle, p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <TableChart sx={{ color: '#f59e0b' }} /> Planilha Auxiliar de Abastecimento
              </Typography>
              <Button 
                size="small"
                variant="contained" 
                color="primary" 
                endIcon={<OpenInNew />} 
                href={ABASTECIMENTO_URL}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', bgcolor: '#f59e0b', color: 'white', '&:hover': { bgcolor: '#d97706' } }}
              >
                Abrir Planilha
              </Button>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />
            
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Esta planilha contém os dados específicos referentes a registros auxiliares de Abastecimento. 
            </Typography>
          </Box>

          <Box sx={{ ...glassPanelStyle, p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <Storage sx={{ color: '#8b5cf6' }} /> Checklist Diário
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  size="small"
                  variant="outlined" 
                  color="primary" 
                  endIcon={<OpenInNew />} 
                  href={CHK_DIARIO_FORM}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', borderColor: '#8b5cf6', color: '#8b5cf6', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)', borderColor: '#7c3aed' } }}
                >
                  Formulário
                </Button>
                <Button 
                  size="small"
                  variant="contained" 
                  color="primary" 
                  endIcon={<OpenInNew />} 
                  href={CHK_DIARIO_SHEET}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', bgcolor: '#8b5cf6', color: 'white', '&:hover': { bgcolor: '#7c3aed' } }}
                >
                  Planilha
                </Button>
              </Box>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />
            
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Links auxiliares para o preenchimento (Formulário) e leitura dos dados brutos (Planilha) do Checklist Diário.
            </Typography>
          </Box>

          <Box sx={{ ...glassPanelStyle, p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <Storage sx={{ color: '#f43f5e' }} /> Checklist Semanal
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  size="small"
                  variant="outlined" 
                  color="primary" 
                  endIcon={<OpenInNew />} 
                  href={CHK_SEMANAL_FORM}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', borderColor: '#f43f5e', color: '#f43f5e', '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.1)', borderColor: '#e11d48' } }}
                >
                  Formulário
                </Button>
                <Button 
                  size="small"
                  variant="contained" 
                  color="primary" 
                  endIcon={<OpenInNew />} 
                  href={CHK_SEMANAL_SHEET}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', bgcolor: '#f43f5e', color: 'white', '&:hover': { bgcolor: '#e11d48' } }}
                >
                  Planilha
                </Button>
              </Box>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />
            
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Links para as planilhas responsáveis por armazenar e consolidar os dados do Checklist Semanal.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FontesDeDados;
