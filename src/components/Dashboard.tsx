import React from 'react';
import RGBControls from './RGBControls';
import PowerToggle from './PowerToggle';
import { DeviceState } from '../types';

interface DashboardProps {
  state: DeviceState;
  onUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Status */}
        <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Power</span>
              <span className={`font-semibold ${state.power ? 'text-accent-success' : 'text-gray-500'}`}>
                {state.power ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Effect</span>
              <span className="font-semibold text-accent-primary">{state.effectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Brightness</span>
              <span className="font-semibold text-white">{state.brightness}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RGB</span>
              <span className="font-semibold text-white font-mono">
                {state.rgb.r}, {state.rgb.g}, {state.rgb.b}
              </span>
            </div>
          </div>
        </div>

        {/* Power Toggle */}
        <div className="lg:col-span-2">
          <PowerToggle power={state.power} onUpdate={onUpdate} />
        </div>
      </div>

      {/* RGB Controls */}
      <RGBControls
        rgb={state.rgb}
        brightness={state.brightness}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default Dashboard;
