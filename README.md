# RGB Lighting OS

A modern, premium dark-themed dashboard for controlling ESP8266-based RGB LED lighting devices. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🎨 **Dashboard**: Real-time control of RGB colors, brightness, and power state
- ✨ **Effects**: 15+ pre-configured lighting effects with visual indicators
- 💻 **Console**: Terminal-style command interface for custom device commands
- ⚙️ **Settings**: Device information, system stats, and device control
- 🌙 **Quick Scenes**: One-click scene presets (Night, Party, Chill, etc.)
- 📱 **Mobile Responsive**: Fully responsive design for all screen sizes
- 🔄 **Real-time Updates**: Auto-polling device state every 2 seconds
- 🌐 **Offline Support**: Graceful fallback to stub data when device is unavailable

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- ESP8266 device with REST API endpoints:
  - `GET /state` - Returns device state
  - `POST /command` - Accepts commands with JSON payload `{ cmd: "command" }`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mainakgarai007/Light-os.git
cd Light-os
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

Build the project for GitHub Pages:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploying to GitHub Pages

1. Build the project
2. Push the `dist` folder to the `gh-pages` branch
3. Enable GitHub Pages in repository settings

Or use GitHub Actions for automatic deployment (see `.github/workflows/deploy.yml`)

## 🎮 Usage

### Connecting to Your Device

The application will automatically attempt to connect to the ESP8266 device at the same origin. Make sure your device exposes the REST API endpoints.

### Access Token

If your device requires authentication, it will prompt for a 4-6 digit access code. This code is stored in localStorage for future sessions.

### Available Commands

#### Power Control
- `power on` - Turn on the lights
- `power off` - Turn off the lights

#### RGB Control
- `rgb <r> <g> <b>` - Set RGB color (0-255 for each channel)
- `brightness <value>` - Set brightness (0-255)

#### Effects
- `effect <id>` - Set lighting effect (0-14)
  - 0: Static
  - 1: Rainbow
  - 2: Rainbow Chase
  - 3: Color Wipe
  - 4: Theater Chase
  - 5: Twinkle
  - 6: Fire
  - 7: Breathing
  - 8: Strobe
  - 9: Lightning
  - 10: Meteor
  - 11: Police
  - 12: Fade
  - 13: Scan
  - 14: Sparkle

#### Scenes
- `scene night` - Night mode preset
- `scene party` - Party mode preset
- `scene chill` - Chill mode preset
- `scene focus` - Focus mode preset
- `scene relax` - Relax mode preset
- `scene custom` - Custom scene preset

#### Device Control
- `restart` - Restart the device

## 🏗️ Project Structure

```
Light-os/
├── src/
│   ├── components/          # React components
│   │   ├── CommandConsole.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EffectSelector.tsx
│   │   ├── Header.tsx
│   │   ├── PowerToggle.tsx
│   │   ├── RGBControls.tsx
│   │   ├── SceneButtons.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── StatusIndicators.tsx
│   │   └── TabNavigation.tsx
│   ├── data/                # Static data
│   │   ├── effects.ts
│   │   ├── scenes.ts
│   │   └── stubData.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── deviceAPI.ts
│   │   └── formatters.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Customization

### Changing Base URL

Edit `src/utils/deviceAPI.ts` and modify the `API_BASE_URL` constant to point to your device's IP address or hostname.

### Using Stub Data

For development without a physical device, set `USE_STUB_DATA = true` in `src/utils/deviceAPI.ts`.

### Adding Effects

Edit `src/data/effects.ts` to add or modify lighting effects.

### Adding Scenes

Edit `src/data/scenes.ts` to add or modify quick scene presets.

### Theming

Customize colors in `tailwind.config.js` under the `theme.extend.colors` section.

## 📝 API Specification

### GET /state

Returns the current device state.

**Response:**
```json
{
  "success": true,
  "state": {
    "power": true,
    "rgb": { "r": 255, "g": 128, "b": 64 },
    "brightness": 200,
    "effect": 1,
    "effectName": "Rainbow",
    "wifiConnected": true,
    "deviceName": "ESP8266-RGB",
    "uptime": 3600000,
    "freeMemory": 24576
  }
}
```

### POST /command

Sends a command to the device.

**Request:**
```json
{
  "cmd": "power on"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Power turned on"
}
```

## 🔒 Security Notes

- **No WiFi Credentials**: This dashboard does NOT handle WiFi credentials. Configure WiFi directly on the ESP8266 using its AP-mode web portal.
- **Access Token**: Optional 4-6 digit access code for basic authentication, stored in browser localStorage.
- **HTTPS Recommended**: Use HTTPS in production for secure communication.

## 🛠️ Development

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **ESLint** - Code linting

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.