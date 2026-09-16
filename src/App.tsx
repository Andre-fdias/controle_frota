import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSettingsStore } from './store/settingsStore';
import { getTheme } from './theme';
import Layout from './components/common/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Viaturas from './pages/Viaturas';
import VehicleDetails from './pages/VehicleDetails';
import Abastecimentos from './pages/Abastecimentos';
import Revisoes from './pages/Revisoes';
import Checklists from './pages/Checklists';
import Avarias from './pages/Avarias';
import Integridade from './pages/Integridade';
import Analises from './pages/Analises';

// Orchestration
import { fetchAllData } from './services/googleSheetsService';
import { processRelationships } from './services/relationshipService';
import { useVehicleStore } from './store/vehicleStore';
import { saveToCache, loadFromCache } from './services/cacheService';

const App: React.FC = () => {
  const { themeMode } = useSettingsStore();
  const theme = React.useMemo(() => getTheme(themeMode), [themeMode]);
  
  const setVehiclesData = useVehicleStore(state => state.setVehiclesData);
  const setSystemState = useVehicleStore(state => state.setSystemState);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // 1. Try to load from cache first for fast display
      const cached = loadFromCache();
      if (cached) {
        setVehiclesData(cached.relationshipResult.vehicles, cached.relationshipResult.orphans, cached.relationshipResult.globalIntegrityIssues);
        setSystemState({ status: 'Exibindo dados armazenados', lastUpdate: new Date(cached.lastUpdate) });
      }

      // 2. Fetch fresh data
      setSystemState({ status: 'Atualizando dados...' });
      try {
        const rawData = await fetchAllData();
        if (!mounted) return;
        
        const result = processRelationships(rawData);
        
        setVehiclesData(result.vehicles, result.orphans, result.globalIntegrityIssues);
        setSystemState({ status: 'Dados atualizados', lastUpdate: new Date() });
        
        saveToCache(rawData, result);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to update data from Google Sheets', error);
        // If we have cache, we keep it, otherwise show error
        if (cached) {
          setSystemState({ status: 'Exibindo dados armazenados' });
        } else {
          setSystemState({ status: 'Não foi possível atualizar' });
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [setVehiclesData, setSystemState]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/controle_frota">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/viaturas" element={<Viaturas />} />
            <Route path="/viaturas/:prefixo" element={<VehicleDetails />} />
            <Route path="/abastecimentos" element={<Abastecimentos />} />
            <Route path="/revisoes" element={<Revisoes />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/avarias" element={<Avarias />} />
            <Route path="/integridade" element={<Integridade />} />
            <Route path="/analises" element={<Analises />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
