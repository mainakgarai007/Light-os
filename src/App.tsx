import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Dashboard from './components/Dashboard';
import EffectSelector from './components/EffectSelector';
import CommandConsole from './components/CommandConsole';
import SettingsPanel from './components/SettingsPanel';
import SceneButtons from './components/SceneButtons';
import { getDeviceState } from './utils/deviceAPI';
import { stubDeviceState } from './data/stubData';
import { DeviceState, TabType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [deviceState, setDeviceState] = useState<DeviceState>(stubDeviceState);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchState = async () => {
    try {
      const state = await getDeviceState();
      setDeviceState(state);
      setIsOnline(true);
    } catch (error) {
      console.error('Failed to fetch device state:', error);
      setIsOnline(false);
      // Keep using stub data when offline
      setDeviceState(stubDeviceState);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    
    // Poll state every 2 seconds
    const interval = setInterval(fetchState, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    // Fetch state after any update
    fetchState();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading RGB Lighting OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header
        deviceName={deviceState.deviceName}
        power={deviceState.power}
        effect={deviceState.effectName}
        wifiConnected={deviceState.wifiConnected}
        isOnline={isOnline}
      />
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard state={deviceState} onUpdate={handleUpdate} />
        )}
        {activeTab === 'effects' && (
          <EffectSelector currentEffect={deviceState.effect} onUpdate={handleUpdate} />
        )}
        {activeTab === 'console' && (
          <CommandConsole onUpdate={handleUpdate} />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel state={deviceState} onUpdate={handleUpdate} />
        )}
      </main>
      
      <SceneButtons onUpdate={handleUpdate} />
    </div>
  );
}

export default App;
