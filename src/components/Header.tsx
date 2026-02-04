import React from 'react';
import StatusIndicators from './StatusIndicators';

interface HeaderProps {
  deviceName: string;
  power: boolean;
  effect: string;
  wifiConnected: boolean;
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({
  deviceName,
  power,
  effect,
  wifiConnected,
  isOnline,
}) => {
  return (
    <header className="bg-dark-card border-b border-dark-border px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RGB Lighting OS</h1>
              <p className="text-sm text-gray-400">
                {deviceName} • ESP8266
              </p>
            </div>
          </div>
          <StatusIndicators
            power={power}
            effect={effect}
            wifiConnected={wifiConnected}
            isOnline={isOnline}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
