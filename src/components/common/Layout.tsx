import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  AppBar, Toolbar, Typography, IconButton, useTheme, CssBaseline, Chip
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
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const drawerWidth = 260;

const menuModules = [
  { text: 'Dashboard', icon: <Dashboard fontSize="small" />, path: '/dashboard' },
  { text: 'Viaturas', icon: <DirectionsCar fontSize="small" />, path: '/viaturas' },
  { text: 'Revisões', icon: <Build fontSize="small" />, path: '/revisoes' },
  { text: 'Abastecimento', icon: <LocalGasStation fontSize="small" />, path: '/abastecimentos' },
  { text: 'Checklists', icon: <Assignment fontSize="small" />, path: '/checklists' },
  { text: 'Avarias', icon: <Warning fontSize="small" />, path: '/avarias' },
  { text: 'Integridade', icon: <Security fontSize="small" />, path: '/integridade' },
  { text: 'Análises', icon: <Assessment fontSize="small" />, path: '/analises' },
];

const menuSystem = [
  { text: 'Sobre', icon: <Info fontSize="small" />, path: '/sobre' }
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const NavGroup = ({ title, items }: { title: string, items: typeof menuModules }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ px: 4, mb: 1.5, color: '#5a6f8a', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {title}
      </Typography>
      <List disablePadding>
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  mx: 2,
                  borderRadius: '8px',
                  color: isActive ? '#eab308' : '#9ca3af',
                  backgroundColor: isActive ? '#131b2c' : 'transparent',
                  borderLeft: isActive ? '4px solid #eab308' : '4px solid transparent',
                  paddingLeft: isActive ? '12px' : '16px', // adjust for border
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
        })}
      </List>
    </Box>
  );

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0a0e17' }}>
      <Box sx={{ h: '80px', display: 'flex', alignItems: 'center', px: 3, borderBottom: '1px solid #1a2a4a', background: 'linear-gradient(to bottom, #0d1422, #0a0e17)', py: 3 }}>
        <img src="https://cdn-icons-png.flaticon.com/128/2504/2504860.png" alt="Shield" style={{ width: '32px', height: '32px', marginRight: '12px', opacity: 0.9, filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#eab308', letterSpacing: '0.1em', fontSize: '14px', lineHeight: 1.2 }}>
            EB SÃO ROQUE
          </Typography>
          <Typography variant="caption" sx={{ color: '#5a6f8a', letterSpacing: '0.2em', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            COMANDO OPERACIONAL
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        py: 3,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' }
      }}>
        <NavGroup title="Módulos" items={menuModules} />
        <NavGroup title="Sistema" items={menuSystem} />
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
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '65px', px: { xs: 2, md: 3 } }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              <img src="https://cdn-icons-png.flaticon.com/128/1552/1552467.png" alt="Logo" style={{ width: '28px', height: '28px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: '#eab308', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                  EB SÃO ROQUE <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>• 15º GB / 2º SGB</span>
                </Typography>
                <Typography sx={{ fontSize: '10px', color: '#5a6f8a', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
                  PORTAL ANALÍTICO OPERACIONAL
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.05)', px: 2, py: 0.5, borderRadius: '12px', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment sx={{ fontSize: 14 }} /> {format(time, 'dd/MM/yyyy')}
              </Typography>
              <Typography sx={{ color: '#eab308', fontWeight: 'bold', fontSize: '13px', borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 1.5 }}>
                {format(time, 'HH:mm:ss')}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => window.location.reload()}
                sx={{ 
                  ml: 1, 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  bgcolor: 'rgba(255,255,255,0.02)', 
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& svg': {
                      transform: 'rotate(180deg)',
                      transition: 'transform 0.4s ease-in-out'
                    }
                  } 
                }}
                title="Atualizar Dados"
              >
                <Sync fontSize="small" sx={{ color: '#9ca3af', transition: 'transform 0.4s ease-in-out' }} />
              </IconButton>
            </Box>
            
            {/* Mobile Refresh Button */}
            <IconButton 
              size="small" 
              onClick={() => window.location.reload()}
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px', 
                bgcolor: 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& svg': {
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.4s ease-in-out'
                  }
                }
              }}
            >
              <Sync fontSize="small" sx={{ color: '#9ca3af', transition: 'transform 0.4s ease-in-out' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #1a2a4a', bgcolor: '#0a0e17' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #1a2a4a', bgcolor: '#0a0e17' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          minHeight: '100vh', 
          bgcolor: '#0a0e17', // Match body background
        }}
      >
        <Toolbar sx={{ minHeight: '65px' }} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
