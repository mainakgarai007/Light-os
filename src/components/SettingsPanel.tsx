import { FC, useState } from 'react';
import { DeviceState } from '../types';
import { restartDevice } from '../utils/deviceAPI';
import { formatUptime, formatMemory } from '../utils/formatters';

interface SettingsPanelProps {
  state: DeviceState;
  onUpdate: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({ state, onUpdate }) => {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = async () => {
    if (!confirm('Are you sure you want to restart the device?')) {
      return;
    }

    setIsRestarting(true);
    try {
      await restartDevice();
      setTimeout(() => {
        onUpdate();
        setIsRestarting(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to restart device:', error);
      setIsRestarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Device Information */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">Device Name</span>
            <span className="text-white font-semibold">{state.deviceName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">Platform</span>
            <span className="text-white font-semibold">ESP8266</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">Uptime</span>
            <span className="text-white font-semibold font-mono">
              {formatUptime(state.uptime)}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Free Memory</span>
            <span className="text-white font-semibold font-mono">
              {formatMemory(state.freeMemory)}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Settings */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">Connection</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">WiFi Status</span>
            <span className={`font-semibold ${state.wifiConnected ? 'text-accent-success' : 'text-accent-danger'}`}>
              {state.wifiConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="bg-dark-bg rounded p-4 border border-dark-border">
            <p className="text-sm text-gray-400">
              <strong className="text-white">Note:</strong> WiFi credentials are configured directly on the device
              through its local AP-mode web portal. This dashboard does not handle WiFi setup.
            </p>
          </div>
        </div>
      </div>

      {/* Device Control */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">Device Control</h3>
        <button
          onClick={handleRestart}
          disabled={isRestarting}
          className="w-full py-3 bg-accent-danger hover:bg-accent-danger/80 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRestarting ? 'Restarting...' : '🔄 Restart Device'}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Restarting will temporarily disconnect the device
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;
