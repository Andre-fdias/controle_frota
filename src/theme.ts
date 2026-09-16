import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    background: {
      default: mode === 'dark' ? '#070D19' : '#F3F4F6', // Main background (Obsidian Dark Navy or Light Gray)
      paper: mode === 'dark' ? '#0F1A31' : '#FFFFFF',   // Card background
    },
    primary: {
      main: '#FACC15',    // SRQ Yellow Accent
      light: '#FDE047',
      dark: '#EAB308',
      contrastText: '#000000',
    },
    secondary: {
      main: '#7A8BA8',    // Muted text / secondary borders
      light: '#9CA3AF',
      dark: '#4B5563',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#111827',
      secondary: mode === 'dark' ? '#7A8BA8' : '#4B5563',
    },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#06B6D4' },
    action: {
      selected: mode === 'dark' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.2)',
      hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
  },
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
    h4: { fontWeight: 800, color: mode === 'dark' ? '#FFFFFF' : '#111827', letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, color: mode === 'dark' ? '#FFFFFF' : '#111827' },
    h6: { fontWeight: 700, color: mode === 'dark' ? '#FFFFFF' : '#111827' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 500, color: mode === 'dark' ? '#7A8BA8' : '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: ${mode === 'dark' ? '#070D19' : '#F3F4F6'};
          overflow-x: hidden;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${mode === 'dark' ? '#070D19' : '#F3F4F6'}; 
        }
        ::-webkit-scrollbar-thumb {
          background: ${mode === 'dark' ? '#1A2A4A' : '#D1D5DB'}; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${mode === 'dark' ? '#2D3A5A' : '#9CA3AF'}; 
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(15, 26, 49, 0.75)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          borderRadius: 16,
          boxShadow: mode === 'dark' ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
          backgroundImage: 'none', 
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
        },
        containedPrimary: {
          color: '#000000', 
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: mode === 'dark' ? '#0B1426' : '#FFFFFF',
            borderRadius: 12,
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FACC15',
            },
          },
        },
      },
    },
  },
});
