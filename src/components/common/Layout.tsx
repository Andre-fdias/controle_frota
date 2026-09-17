import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  AppBar, Toolbar, Typography, IconButton, useTheme, CssBaseline, Collapse
} from '@mui/material';
import Dashboard from '@mui/icons-material/Dashboard';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import Assignment from '@mui/icons-material/Assignment';
import Build from '@mui/icons-material/Build';
import Warning from '@mui/icons-material/Warning';
import Assessment from '@mui/icons-material/Assessment';
import Security from '@mui/icons-material/Security';
import Info from '@mui/icons-material/Info';
import Menu from '@mui/icons-material/Menu';
import Sync from '@mui/icons-material/Sync';
import TableChart from '@mui/icons-material/TableChart';
import Settings from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import firetruckLogo from '../../assets/firetruck_logo.jpg';

const drawerWidth = 260;

const menuModules = [
  { text: 'Dashboard', icon: <Dashboard fontSize="small" />, path: '/dashboard' },
  { text: 'Viaturas', icon: <DirectionsCar fontSize="small" />, path: '/viaturas' },
  { text: 'Revisões', icon: <Build fontSize="small" />, path: '/revisoes' },
  { text: 'Abastecimento', icon: <LocalGasStation fontSize="small" />, path: '/abastecimentos' },
  { text: 'Checklists', icon: <Assignment fontSize="small" />, path: '/checklists' },
  { text: 'Avarias', icon: <Warning fontSize="small" />, path: '/avarias' },
  { text: 'Análises', icon: <Assessment fontSize="small" />, path: '/analises' },
];

const configItems = [
  { text: 'Integridade', icon: <Security fontSize="small" />, path: '/integridade' },
  { text: 'Fontes de Dados', icon: <TableChart fontSize="small" />, path: '/fontes-de-dados' },
  { text: 'Sobre', icon: <Info fontSize="small" />, path: '/sobre' }
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const NavItem = ({ item, isNested = false }: { item: any, isNested?: boolean }) => {
    const isActive = location.pathname.startsWith(item.path);
    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton 
          onClick={() => navigate(item.path)}
          selected={isActive}
          sx={{
            mx: 2,
            pl: isNested ? 4 : (isActive ? '12px' : '16px'), // adjust for nested and border
            borderRadius: '8px',
            color: isActive ? '#eab308' : '#9ca3af',
            backgroundColor: isActive ? '#131b2c' : 'transparent',
            borderLeft: isActive && !isNested ? '4px solid #eab308' : '4px solid transparent',
            '&.Mui-selected': {
              backgroundColor: '#131b2c',
              color: '#eab308',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#131b2c',
              }
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: '#eab308'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }} 
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0a0e17' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, borderBottom: '1px solid #1a2a4a', background: 'linear-gradient(to bottom, #0d1422, #0a0e17)', py: 3 }}>
        <Box 
          component="img"
          src={firetruckLogo} 
          alt="Firetruck Logo" 
          sx={{ width: 48, height: 48, borderRadius: '8px', marginRight: 1.5, opacity: 0.9, filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }} 
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#eab308', letterSpacing: '0.1em', fontSize: '14px', lineHeight: 1.2 }}>
            EB SÃO ROQUE
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        py: 2,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' }
      }}>
        <List disablePadding>
          {menuModules.map((item) => (
            <NavItem key={item.text} item={item} />
          ))}

          <ListItem disablePadding sx={{ mt: 1, mb: 0.5 }}>
            <ListItemButton 
              onClick={() => setConfigOpen(!configOpen)}
              sx={{
                mx: 2,
                pl: '16px',
                borderRadius: '8px',
                color: '#9ca3af',
                borderLeft: '4px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  color: '#eab308'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Configurações" 
                primaryTypographyProps={{ fontSize: '13px', fontWeight: 500 }} 
              />
              {configOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
          </ListItem>

          <Collapse in={configOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {configItems.map((item) => (
                <NavItem key={item.text} item={item} isNested />
              ))}
            </List>
          </Collapse>
        </List>
      </Box>

      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="caption" sx={{ color: '#4B5563', fontSize: '10px', display: 'block', textAlign: 'left' }}>
          v3.0.0 • 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(to right, #0a0e17, #0d1422)',
          borderBottom: '1px solid #1a2a4a',
          color: 'white',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#3b82f6' }}
          >
            <Menu />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, bgcolor: 'rgba(59, 130, 246, 0.1)', px: 2, py: 1, borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Sync sx={{ fontSize: 16, color: '#3b82f6', animation: 'spin 4s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 'bold' }}>Sincronizado</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#9ca3af' }}>
                {format(time, 'dd/MM/yyyy')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#eab308', lineHeight: 1 }}>
                {format(time, 'HH:mm:ss')}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #1a2a4a' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #1a2a4a' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 0, width: { md: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', bgcolor: '#05080f' }}>
        <Toolbar sx={{ minHeight: '70px' }} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
