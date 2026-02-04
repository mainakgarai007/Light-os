import { DeviceState } from '../types';

// Stub data for testing when device is offline
export const stubDeviceState: DeviceState = {
  power: true,
  rgb: { r: 128, g: 64, b: 255 },
  brightness: 200,
  effect: 1,
  effectName: 'Rainbow',
  wifiConnected: true,
  deviceName: 'ESP8266-RGB',
  uptime: 3600000, // 1 hour in ms
  freeMemory: 24576,
};
