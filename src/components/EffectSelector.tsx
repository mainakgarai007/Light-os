import { FC } from 'react';
import { effectsDatabase } from '../data/effects';
import { setEffect } from '../utils/deviceAPI';

interface EffectSelectorProps {
  currentEffect: number;
  onUpdate: () => void;
}

const EffectSelector: FC<EffectSelectorProps> = ({ currentEffect, onUpdate }) => {
  const handleEffectClick = async (effectId: number) => {
    try {
      await setEffect(effectId);
      onUpdate();
    } catch (error) {
      console.error('Failed to set effect:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-2">Lighting Effects</h3>
        <p className="text-sm text-gray-400 mb-4">
          Select an effect to apply to your RGB lighting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {effectsDatabase.map((effect) => (
          <button
            key={effect.id}
            onClick={() => handleEffectClick(effect.id)}
            className={`p-4 rounded-lg border transition-all text-left ${
              currentEffect === effect.id
                ? 'bg-accent-primary border-accent-primary text-white'
                : 'bg-dark-card border-dark-border text-gray-300 hover:bg-dark-hover hover:border-accent-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{effect.name}</h4>
              {currentEffect === effect.id && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Active</span>
              )}
            </div>
            <p className={`text-sm ${currentEffect === effect.id ? 'text-white/80' : 'text-gray-400'}`}>
              {effect.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EffectSelector;
