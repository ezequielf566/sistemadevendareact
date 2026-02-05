import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import POS from './views/POS';
import Clients from './views/Clients';
import Settings from './views/Settings';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.PDV:
        return <POS />;
      case ViewState.CLIENTS:
        return <Clients />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;