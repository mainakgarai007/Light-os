# ESP8266 Firmware Guide

This guide explains how to implement the firmware for your ESP8266 to work with the Light-os dashboard.

## Overview

The ESP8266 must act as a web server with a REST API that the browser can communicate with directly over your local WiFi network.

## Required API Endpoints

### 1. GET /state

Returns the current state of the device as JSON.

**Example Response:**
```json
{
  "success": true,
  "state": {
    "power": true,
    "rgb": {
      "r": 255,
      "g": 100,
      "b": 50
    },
    "brightness": 200,
    "effect": 0,
    "effectName": "Static",
    "wifiConnected": true,
    "deviceName": "RGB Light",
    "uptime": 123456,
    "freeMemory": 32768
  }
}
```

**Fields:**
- `power` (boolean): Whether the lights are on or off
- `rgb.r`, `rgb.g`, `rgb.b` (0-255): Current RGB color values
- `brightness` (0-255): Current brightness level
- `effect` (number): Current effect ID (0-14)
- `effectName` (string): Name of the current effect
- `wifiConnected` (boolean): WiFi connection status
- `deviceName` (string): Name of your device
- `uptime` (number): Device uptime in seconds
- `freeMemory` (number): Free heap memory in bytes

### 2. POST /command

Accepts commands to control the device.

**Request Format:**
```json
{
  "cmd": "power on"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Power turned on"
}
```

**Supported Commands:**

#### Power Control
- `power on` - Turn on the lights
- `power off` - Turn off the lights

#### RGB Control
- `rgb <r> <g> <b>` - Set RGB color (e.g., "rgb 255 0 0" for red)
- `brightness <value>` - Set brightness 0-255 (e.g., "brightness 200")

#### Effects
- `effect <id>` - Set lighting effect 0-14
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

## Example Implementation (Arduino/PlatformIO)

### Required Libraries
```cpp
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
```

### Basic Structure
```cpp
ESP8266WebServer server(80);

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin("YOUR_SSID", "YOUR_PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  
  // Setup CORS headers for browser access
  server.enableCORS(true);
  
  // Define routes
  server.on("/state", HTTP_GET, handleGetState);
  server.on("/command", HTTP_POST, handlePostCommand);
  
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
  // Your LED update logic here
}
```

### Handle GET /state
```cpp
void handleGetState() {
  // Enable CORS
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  StaticJsonDocument<512> doc;
  doc["success"] = true;
  
  JsonObject state = doc.createNestedObject("state");
  state["power"] = ledState.power;
  
  JsonObject rgb = state.createNestedObject("rgb");
  rgb["r"] = ledState.r;
  rgb["g"] = ledState.g;
  rgb["b"] = ledState.b;
  
  state["brightness"] = ledState.brightness;
  state["effect"] = ledState.effect;
  state["effectName"] = getEffectName(ledState.effect);
  state["wifiConnected"] = WiFi.isConnected();
  state["deviceName"] = "RGB Light";
  state["uptime"] = millis() / 1000;
  state["freeMemory"] = ESP.getFreeHeap();
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}
```

### Handle POST /command
```cpp
void handlePostCommand() {
  // Enable CORS
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, body);
    
    if (error) {
      server.send(400, "application/json", "{\"success\":false,\"message\":\"Invalid JSON\"}");
      return;
    }
    
    String cmd = doc["cmd"].as<String>();
    String message = executeCommand(cmd);
    
    StaticJsonDocument<128> response;
    response["success"] = true;
    response["message"] = message;
    
    String responseStr;
    serializeJson(response, responseStr);
    server.send(200, "application/json", responseStr);
  } else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"No command provided\"}");
  }
}
```

### Handle OPTIONS (CORS Preflight)
```cpp
// Add this to setup()
server.on("/state", HTTP_OPTIONS, handleCORS);
server.on("/command", HTTP_OPTIONS, handleCORS);

void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  server.send(204);
}
```

### Command Parser Example
```cpp
String executeCommand(String cmd) {
  cmd.trim();
  cmd.toLowerCase();
  
  if (cmd == "power on") {
    ledState.power = true;
    return "Power turned on";
  } 
  else if (cmd == "power off") {
    ledState.power = false;
    return "Power turned off";
  }
  else if (cmd.startsWith("rgb ")) {
    // Parse: rgb 255 100 50
    int r, g, b;
    sscanf(cmd.c_str(), "rgb %d %d %d", &r, &g, &b);
    ledState.r = constrain(r, 0, 255);
    ledState.g = constrain(g, 0, 255);
    ledState.b = constrain(b, 0, 255);
    return "RGB color set";
  }
  else if (cmd.startsWith("brightness ")) {
    int brightness;
    sscanf(cmd.c_str(), "brightness %d", &brightness);
    ledState.brightness = constrain(brightness, 0, 255);
    return "Brightness set";
  }
  else if (cmd.startsWith("effect ")) {
    int effect;
    sscanf(cmd.c_str(), "effect %d", &effect);
    ledState.effect = constrain(effect, 0, 14);
    return "Effect set";
  }
  else if (cmd == "restart") {
    ESP.restart();
    return "Restarting...";
  }
  
  return "Unknown command";
}
```

## Important Notes

### CORS Headers
The ESP8266 **must** send CORS headers to allow the browser to access the API from GitHub Pages:
```cpp
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### IP Address
After connecting to WiFi, note the IP address printed to serial. You'll need to enter this in the Light-os Settings tab.

### Same WiFi Network
The browser accessing the Light-os dashboard must be on the **same WiFi network** as the ESP8266.

### No HTTPS
Since this is local communication, HTTP is used (not HTTPS). Modern browsers allow HTTP requests to local IP addresses.

### Testing
1. Flash the firmware to your ESP8266
2. Open Serial Monitor to see the assigned IP address
3. Test the endpoints with curl:
   ```bash
   curl http://192.168.1.100/state
   curl -X POST http://192.168.1.100/command -H "Content-Type: application/json" -d '{"cmd":"power on"}'
   ```
4. Open Light-os dashboard and configure the IP address in Settings

## Complete Example Projects

### Using Arduino IDE
Look for examples in the Arduino ESP8266 library:
- WebServer example
- ESP8266WebServer library documentation

### Using PlatformIO
```ini
[env:esp8266]
platform = espressif8266
board = nodemcuv2
framework = arduino
lib_deps =
    ESP8266WiFi
    ESP8266WebServer
    ArduinoJson
    Adafruit NeoPixel
```

## Troubleshooting

### Cannot connect from browser
- Check that ESP8266 and browser are on same WiFi network
- Verify IP address is correct
- Check serial monitor for any errors
- Try accessing http://[IP]/state directly in browser

### CORS errors
- Make sure all CORS headers are sent
- Implement OPTIONS handler for preflight requests
- Check browser console for specific CORS errors

### Commands not working
- Check command parsing logic
- Verify JSON format in requests
- Add Serial.println() to debug command execution
- Check that command names match exactly (case-insensitive)

## Resources
- [ESP8266 Arduino Core Documentation](https://arduino-esp8266.readthedocs.io/)
- [ESP8266WebServer Library](https://github.com/esp8266/Arduino/tree/master/libraries/ESP8266WebServer)
- [ArduinoJson Documentation](https://arduinojson.org/)
- [Adafruit NeoPixel Library](https://github.com/adafruit/Adafruit_NeoPixel)
