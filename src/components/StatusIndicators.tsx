import { FC } from 'react';

interface StatusIndicatorsProps {
  power: boolean;
  effect: string;
  wifiConnected: boolean;
  isOnline: boolean;
}

const StatusIndicators: FC<StatusIndicatorsProps> = ({
  power,
  effect,
  wifiConnected,
  isOnline,
}) => {
  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Power Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            power ? 'bg-accent-success' : 'bg-gray-500'
          }`}
        />
        <span className="text-gray-400">Power</span>
      </div>

      {/* Effect Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
        <span className="text-gray-400">{effect}</span>
      </div>

      {/* WiFi Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            wifiConnected ? 'bg-accent-success' : 'bg-accent-warning'
          }`}
        />
        <span className="text-gray-400">WiFi</span>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-accent-success' : 'bg-accent-danger'
          }`}
        />
        <span className="text-gray-400">{isOnline ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  );
};

export default StatusIndicators;
