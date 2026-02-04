import { FC, useState, useEffect } from 'react';
import { RGB } from '../types';
import { setRGB, setBrightness } from '../utils/deviceAPI';
import { rgbToHex, hexToRgb } from '../utils/formatters';

interface RGBControlsProps {
  rgb: RGB;
  brightness: number;
  onUpdate: () => void;
}

const RGBControls: FC<RGBControlsProps> = ({ rgb, brightness, onUpdate }) => {
  const [localRgb, setLocalRgb] = useState(rgb);
  const [localBrightness, setLocalBrightness] = useState(brightness);
  const [colorHex, setColorHex] = useState(rgbToHex(rgb.r, rgb.g, rgb.b));

  useEffect(() => {
    setLocalRgb(rgb);
    setColorHex(rgbToHex(rgb.r, rgb.g, rgb.b));
  }, [rgb]);

  useEffect(() => {
    setLocalBrightness(brightness);
  }, [brightness]);

  const handleRgbChange = async (color: Partial<RGB>) => {
    const newRgb = { ...localRgb, ...color };
    setLocalRgb(newRgb);
    setColorHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    
    try {
      await setRGB(newRgb.r, newRgb.g, newRgb.b);
      onUpdate();
    } catch (error) {
      console.error('Failed to set RGB:', error);
    }
  };

  const handleHexChange = async (hex: string) => {
    setColorHex(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setLocalRgb(rgb);
      try {
        await setRGB(rgb.r, rgb.g, rgb.b);
        onUpdate();
      } catch (error) {
        console.error('Failed to set RGB from hex:', error);
      }
    }
  };

  const handleBrightnessChange = async (value: number) => {
    setLocalBrightness(value);
    try {
      await setBrightness(value);
      onUpdate();
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Picker */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">Color Picker</h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-shrink-0">
            <div
              className="w-32 h-32 rounded-lg border-2 border-dark-border"
              style={{ backgroundColor: colorHex }}
            />
          </div>
          <div className="flex-1 w-full">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Hex Color</label>
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                  placeholder="#ffffff"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Color Picker</label>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full h-12 bg-dark-bg border border-dark-border rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RGB Sliders */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">RGB Sliders</h3>
        <div className="space-y-4">
          {/* Red Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Red</label>
              <span className="text-sm text-white font-mono">{localRgb.r}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={localRgb.r}
              onChange={(e) => handleRgbChange({ r: parseInt(e.target.value) })}
              className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer slider-red"
            />
          </div>

          {/* Green Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Green</label>
              <span className="text-sm text-white font-mono">{localRgb.g}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={localRgb.g}
              onChange={(e) => handleRgbChange({ g: parseInt(e.target.value) })}
              className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer slider-green"
            />
          </div>

          {/* Blue Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Blue</label>
              <span className="text-sm text-white font-mono">{localRgb.b}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={localRgb.b}
              onChange={(e) => handleRgbChange({ b: parseInt(e.target.value) })}
              className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer slider-blue"
            />
          </div>
        </div>
      </div>

      {/* Brightness Slider */}
      <div className="bg-dark-card rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">Brightness</h3>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Level</label>
            <span className="text-sm text-white font-mono">{localBrightness}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={localBrightness}
            onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
            className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer slider-brightness"
          />
        </div>
      </div>
    </div>
  );
};

export default RGBControls;
