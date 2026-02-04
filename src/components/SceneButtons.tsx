import { FC } from 'react';
import { scenes } from '../data/scenes';
import { setScene } from '../utils/deviceAPI';

interface SceneButtonsProps {
  onUpdate: () => void;
}

const SceneButtons: FC<SceneButtonsProps> = ({ onUpdate }) => {
  const handleSceneClick = async (sceneName: string) => {
    try {
      await setScene(sceneName.toLowerCase());
      onUpdate();
    } catch (error) {
      console.error('Failed to set scene:', error);
    }
  };

  return (
    <footer className="bg-dark-card border-t border-dark-border px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-sm text-gray-400 font-semibold">Quick Scenes:</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {scenes.map((scene) => (
              <button
                key={scene.name}
                onClick={() => handleSceneClick(scene.name)}
                className="px-4 py-2 bg-dark-bg hover:bg-accent-primary border border-dark-border hover:border-accent-primary text-white rounded-lg transition-all flex items-center gap-2"
              >
                <span>{scene.icon}</span>
                <span className="text-sm font-semibold">{scene.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SceneButtons;
