# RGB Lighting OS

A modern, premium dark-themed dashboard for controlling ESP8266-based RGB LED lighting devices. Built with React, TypeScript, and Tailwind CSS.

## 💡 Project Philosophy

**Light-os** is an original, lightweight IoT control panel inspired by the simplicity of platforms like Blynk IoT, but designed from the ground up with a different approach:

- **🏠 Local Control Only**: No cloud services, no remote servers, no external dependencies
- **🔗 Direct Communication**: HTTP requests sent directly from your browser to the ESP8266 on your local network
- **🎯 Simplicity First**: Straightforward REST API, no complex protocols or authentication systems
- **🚀 GitHub Pages Hosted**: Static web app served from GitHub Pages, connects to your device over local Wi-Fi
- **🔓 No User Authentication**: Optional access token for basic device security, but no user accounts or login systems
- **⚡ Original Design**: Built from scratch with React, not a clone or fork of existing platforms

This is a personal IoT dashboard that puts you in direct control of your hardware, with no middleman.

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

3. Start local development (Vite dev server - for development only):
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

> **Note**: The `npm run dev` command starts Vite's local development server for coding and testing. This is NOT used in production. The deployed GitHub Pages site serves static files only - no server is created or hosted in the frontend.

### Building for Production

Build the project for GitHub Pages:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploying to GitHub Pages

#### Using GitHub Actions (Recommended)

1. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"
2. Push to the `main` branch - the workflow will automatically build and deploy

The workflow (`.github/workflows/deploy.yml`) will build on every push to `main`. If GitHub Pages is not enabled, the build will succeed but deployment will be skipped.

#### Manual Deployment

1. Build the project: `npm run build`
2. Push the `dist` folder to the `gh-pages` branch
3. Enable GitHub Pages in repository settings pointing to the `gh-pages` branch

## 🎮 Usage

### Connecting to Your Device

**Important**: The dashboard and ESP8266 must be on the **same local WiFi network**.

The application automatically attempts to connect to the ESP8266 device at the same origin (same IP address). Here's how to set it up:

1. **Configure ESP8266 WiFi**: Connect your ESP8266 to your WiFi network using its built-in AP mode configuration
2. **Deploy Dashboard**: Access the Light-os dashboard from GitHub Pages or locally
3. **Same Network**: Ensure your device (phone/laptop) running the browser is on the same WiFi network
4. **Automatic Connection**: The dashboard will automatically try to connect to the ESP8266
5. **Direct Control**: All commands are sent directly from browser to ESP8266 via HTTP

**No cloud services, no internet required** (after initial dashboard load from GitHub Pages).

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

## 🏗️ Architecture

### How It Works

```
┌─────────────────┐         WiFi          ┌─────────────────┐
│  GitHub Pages   │  ←──────────────────→  │   ESP8266 MCU   │
│  (Static Site)  │   HTTP Requests        │ (Web Server +   │
│  Light-os UI    │                        │  RGB Control)   │
└─────────────────┘                        └─────────────────┘
        ↑                                            ↓
        │                                    Controls RGB LED
     Your Browser                            Hardware Devices
   (Any Device on                        
    Same Network)
```

### Key Architecture Points

1. **Static Web App**: The dashboard is a static React application hosted on GitHub Pages - HTML, CSS, and JavaScript files only, no backend server
2. **Local Network Only**: Both your browser and ESP8266 must be on the same WiFi network
3. **No Internet Required**: Once loaded, the dashboard works completely offline (no cloud APIs)
4. **Direct HTTP API**: Simple REST endpoints (`GET /state`, `POST /command`) on the ESP8266
5. **No Authentication System**: Optional access token for device security, but no user management
6. **Client-Side Only**: All logic runs in your browser, no backend server needed
7. **ESP8266 = Only Web Server**: The ESP8266 is the ONLY web server in production - it serves the RGB LED control API

### Why This Approach?

- **Privacy**: Your commands never leave your local network
- **Reliability**: Works even when internet is down
- **Simplicity**: No complex setup, authentication, or cloud accounts
- **Speed**: Direct communication = instant response
- **Cost**: Free hosting on GitHub Pages, no subscription fees

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

## 🔒 Security & Privacy

- **100% Local**: All communication stays on your local network - no data sent to external servers or cloud services
- **No User Accounts**: This is not a multi-user platform. No login system, no user authentication, no password management
- **No WiFi Credentials**: This dashboard does NOT handle WiFi credentials. Configure WiFi directly on the ESP8266 using its AP-mode web portal
- **Optional Access Token**: Simple 4-6 digit access code for basic device security (if enabled on ESP8266), stored in browser localStorage
- **GitHub Pages Only**: The static web app is served from GitHub Pages - your device data never touches GitHub
- **Direct Control**: Your browser talks directly to your ESP8266 - no middleman, no cloud relay
- **HTTPS Recommended**: When accessing from GitHub Pages, you get HTTPS automatically. Local development uses HTTP

**Privacy First**: This project was designed to keep your IoT control completely private and local.

## 🛠️ Development

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (dev server for local development only)
- **Tailwind CSS** - Styling framework
- **ESLint** - Code linting

### Scripts

- `npm run dev` - Start Vite dev server (local development only)
- `npm run build` - Build static files for production deployment
- `npm run preview` - Preview production build locally (development only)
- `npm run lint` - Run ESLint

> **Important**: The `dev` and `preview` commands run local development servers for testing. In production, GitHub Pages serves static HTML/CSS/JS files - no server is created in the frontend. The ESP8266 is the only web server in this project.

## ❓ FAQ

### Is this a Blynk clone?

No. While inspired by the simplicity of IoT platforms like Blynk, Light-os is an **original project built from scratch**. It does not use Blynk's code, APIs, or cloud services. It's a completely different architecture focused on local control.

### Does it require internet or cloud services?

No. After the initial load from GitHub Pages, the dashboard works **completely offline**. All communication is direct HTTP between your browser and ESP8266 on your local WiFi network. No cloud services, no external APIs, no remote servers.

### Can I control it from anywhere in the world?

No, this is by design. Light-os is focused on **local network control only**. Your browser and ESP8266 must be on the same WiFi network. This ensures privacy and simplicity.

### Does it support multiple users or authentication?

No. Light-os is designed as a **personal IoT dashboard**. There's no user system, no login, no authentication backend. It's just you and your device. If your ESP8266 has an optional access token, it will be stored locally in your browser.

### How is this different from cloud IoT platforms?

| Feature | Light-os | Cloud IoT Platforms |
|---------|----------|---------------------|
| **Connection** | Direct HTTP to device | Through cloud servers |
| **Internet** | Not required (after load) | Always required |
| **Privacy** | 100% local | Data goes through cloud |
| **Latency** | Instant (local) | Depends on internet |
| **Cost** | Free forever | Often subscription-based |
| **Setup** | Simple REST API | Complex SDK integration |

### Can I add my own features?

Yes! Light-os is open source (MIT License). Fork it, modify it, add your own features. It's designed to be simple and hackable.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.