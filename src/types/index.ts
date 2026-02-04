// Device state types
export interface DeviceState {
  power: boolean;
  rgb: RGB;
  brightness: number;
  effect: number;
  effectName: string;
  wifiConnected: boolean;
  deviceName: string;
  uptime: number;
  freeMemory: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// API response types
export interface StateResponse {
  success: boolean;
  state: DeviceState;
}

export interface CommandResponse {
  success: boolean;
  message: string;
}

// Effect type
export interface Effect {
  id: number;
  name: string;
  description: string;
}

// Scene type
export interface Scene {
  name: string;
  command: string;
  icon: string;
}

// Console log entry
export interface ConsoleEntry {
  timestamp: Date;
  type: 'command' | 'response' | 'error';
  content: string;
}

// Tab types
export type TabType = 'dashboard' | 'effects' | 'console' | 'settings';
