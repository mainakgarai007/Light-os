import { FC } from 'react';
import { setPower } from '../utils/deviceAPI';

interface PowerToggleProps {
  power: boolean;
  onUpdate: () => void;
}

const PowerToggle: FC<PowerToggleProps> = ({ power, onUpdate }) => {
  const handleToggle = async () => {
    try {
      await setPower(!power);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle power:', error);
    }
  };

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
      <h3 className="text-lg font-semibold text-white mb-4">Power Control</h3>
      <button
        onClick={handleToggle}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
          power
            ? 'bg-accent-success hover:bg-accent-success/80 text-white'
            : 'bg-dark-bg hover:bg-dark-hover text-gray-400 border border-dark-border'
        }`}
      >
        {power ? '🔆 Power ON' : '🌙 Power OFF'}
      </button>
    </div>
  );
};

export default PowerToggle;
