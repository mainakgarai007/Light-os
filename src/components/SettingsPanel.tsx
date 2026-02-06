import { FC, useState } from 'react';
import { DeviceState } from '../types';
import { restartDevice, getDeviceIP, setDeviceIP, clearDeviceIP } from '../utils/deviceAPI';
import { formatUptime, formatMemory } from '../utils/formatters';

interface SettingsPanelProps {
  state: DeviceState;
  onUpdate: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({ state, onUpdate }) => {
  const [isRestarting, setIsRestarting] = useState(false);
  const [deviceIP, setDeviceIPInput] = useState(getDeviceIP() || '');
  const [ipSaved, setIpSaved] = useState(false);
  const [ipError, setIpError] = useState('');

  // Delay before refreshing device state after IP configuration
  const IP_CONFIG_REFRESH_DELAY = 500; // ms

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

  const handleSaveIP = () => {
    if (deviceIP.trim()) {
      try {
        setDeviceIP(deviceIP.trim());
        setIpSaved(true);
        setIpError('');
        setTimeout(() => setIpSaved(false), 3000);
        // Refresh device state after setting IP
        setTimeout(() => onUpdate(), IP_CONFIG_REFRESH_DELAY);
      } catch (error) {
        setIpError(error instanceof Error ? error.message : 'Invalid IP address');
        setIpSaved(false);
      }
    }
  };

  const handleClearIP = () => {
    clearDeviceIP();
    setDeviceIPInput('');
    setIpSaved(false);
    setIpError('');
  };

  return (
    <div className="space-y-6">
      {/* ESP8266 Connection Settings */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">ESP8266 Connection</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              ESP8266 IP Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={deviceIP}
                onChange={(e) => setDeviceIPInput(e.target.value)}
                placeholder="192.168.1.100"
                className="flex-1 bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
              <button
                onClick={handleSaveIP}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-white rounded font-semibold transition-all"
              >
                {ipSaved ? '✓ Saved' : 'Save'}
              </button>
              {getDeviceIP() && (
                <button
                  onClick={handleClearIP}
                  className="px-4 py-2 bg-accent-danger hover:bg-accent-danger/80 text-white rounded font-semibold transition-all"
                >
                  Clear
                </button>
              )}
            </div>
            {ipError && (
              <p className="text-xs text-accent-danger mt-2">
                {ipError}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Enter the local IP address of your ESP8266 device (e.g., 192.168.1.100)
            </p>
          </div>
          <div className="bg-dark-bg rounded p-4 border border-dark-border">
            <p className="text-sm text-gray-400 mb-2">
              <strong className="text-white">Setup Instructions:</strong>
            </p>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Connect your ESP8266 to your WiFi network</li>
              <li>Find the device's IP address (check your router or serial monitor)</li>
              <li>Enter the IP address above and click Save</li>
              <li>Make sure your browser device is on the same WiFi network</li>
              <li>The dashboard will connect to http://[IP]/state and http://[IP]/command</li>
            </ol>
          </div>
        </div>
      </div>

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
