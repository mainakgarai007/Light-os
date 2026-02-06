import { StateResponse, CommandResponse, DeviceState } from '../types';
import { stubDeviceState } from '../data/stubData';

// ========================================
// Local Device API - Direct HTTP Communication
// ========================================
// This module handles direct HTTP communication with the ESP8266 device
// on your local WiFi network. No cloud services or external APIs involved.
// All requests go directly from browser to device.

// API Configuration
// When deployed to GitHub Pages, users need to set the ESP8266 IP address
// Default to stub data if no IP is configured
const getAPIBaseURL = (): string => {
  const savedIP = localStorage.getItem('esp8266_ip');
  return savedIP ? `http://${savedIP}` : '';
};

const USE_STUB_DATA = false; // Set to true for development without physical device

// Device IP Configuration Management
export const getDeviceIP = (): string | null => {
  return localStorage.getItem('esp8266_ip');
};

export const setDeviceIP = (ip: string): void => {
  localStorage.setItem('esp8266_ip', ip);
};

export const clearDeviceIP = (): void => {
  localStorage.removeItem('esp8266_ip');
};

// ========================================
// Access Token Management (Local Storage)
// ========================================
// Optional token for device-level security. Stored locally in browser,
// never sent to external services or cloud APIs.
export const getAccessToken = (): string | null => {
  return localStorage.getItem('deviceAccessToken');
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem('deviceAccessToken', token);
};

export const clearAccessToken = (): void => {
  localStorage.removeItem('deviceAccessToken');
};

// Get device state
export const getDeviceState = async (): Promise<DeviceState> => {
  if (USE_STUB_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(stubDeviceState), 100);
    });
  }

  try {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getAPIBaseURL()}/state`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: StateResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API returned success: false');
    }

    return data.state;
  } catch (error) {
    console.error('Error fetching device state:', error);
    throw error;
  }
};

// Send command to device
export const sendCommand = async (command: string): Promise<CommandResponse> => {
  if (USE_STUB_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        success: true,
        message: `Command executed: ${command}`
      }), 100);
    });
  }

  try {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Strip leading / if present
    const cleanCommand = command.startsWith('/') ? command.substring(1) : command;

    const response = await fetch(`${getAPIBaseURL()}/command`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cmd: cleanCommand }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CommandResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending command:', error);
    throw error;
  }
};

// Helper functions for common commands
export const setPower = (on: boolean): Promise<CommandResponse> => {
  return sendCommand(on ? 'power on' : 'power off');
};

export const setRGB = (r: number, g: number, b: number): Promise<CommandResponse> => {
  return sendCommand(`rgb ${r} ${g} ${b}`);
};

export const setBrightness = (brightness: number): Promise<CommandResponse> => {
  return sendCommand(`brightness ${brightness}`);
};

export const setEffect = (effectId: number): Promise<CommandResponse> => {
  return sendCommand(`effect ${effectId}`);
};

export const setScene = (sceneName: string): Promise<CommandResponse> => {
  return sendCommand(`scene ${sceneName}`);
};

export const restartDevice = (): Promise<CommandResponse> => {
  return sendCommand('restart');
};
