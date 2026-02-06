/*
 * Light-os ESP8266 Firmware
 * Complete RGB LED Controller with 100+ Effects and Modes
 * 
 * Hardware Requirements:
 * - ESP8266 (NodeMCU, Wemos D1 Mini, or similar)
 * - WS2812B/NeoPixel LED strip
 * 
 * Pin Configuration:
 * - GPIO2 (D4): LED Data Pin (OUT)
 * - GPIO0 (D3): Button Input (IN) - Optional
 * 
 * Libraries Required:
 * - ESP8266WiFi
 * - ESP8266WebServer
 * - ArduinoJson (v6)
 * - Adafruit_NeoPixel
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>

// ==================== PIN CONFIGURATION ====================
// PIN OUT (Output pins)
#define LED_PIN         2       // GPIO2 (D4) - WS2812B Data Out
#define BUILTIN_LED     LED_BUILTIN  // Built-in LED indicator

// PIN IN (Input pins)
#define BUTTON_PIN      0       // GPIO0 (D3) - Physical button input (optional)

// ==================== LED CONFIGURATION ====================
#define NUM_LEDS        60      // Number of LEDs in your strip
#define LED_TYPE        NEO_GRB + NEO_KHZ800

// ==================== WIFI CONFIGURATION ====================
const char* ssid = "YOUR_WIFI_SSID";        // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// ==================== GLOBAL OBJECTS ====================
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, LED_TYPE);
ESP8266WebServer server(80);

// ==================== STATE VARIABLES ====================
struct LEDState {
  bool power = true;
  uint8_t r = 255;
  uint8_t g = 100;
  uint8_t b = 50;
  uint8_t brightness = 200;
  uint16_t effect = 0;
  uint8_t speed = 50;
} ledState;

// Effect state variables
unsigned long lastEffectUpdate = 0;
uint16_t effectStep = 0;
uint8_t effectPosition = 0;
bool effectDirection = true;

// ==================== EFFECT NAMES ====================
const char* effectNames[] = {
  "Static", "Rainbow", "Rainbow Chase", "Color Wipe", "Theater Chase",
  "Twinkle", "Fire", "Breathing", "Strobe", "Lightning",
  "Meteor", "Police", "Fade", "Scan", "Sparkle",
  "Color Waves", "Running Lights", "Color Chase", "Bouncing Balls", "Juggle",
  "Confetti", "Sinelon", "BPM", "Pride", "Plasma",
  "Ripple", "Comet", "Aurora", "Lava Lamp", "Pacifica",
  "Multi Strobe", "Circus", "Halloween", "Christmas", "Valentine",
  "Easter", "Independence", "Thanksgiving", "New Year", "Birthday",
  "Matrix", "Rain", "Snow", "Fireflies", "Ocean",
  "Forest", "Desert", "Sunset", "Sunrise", "Midnight",
  "Neon", "Cyberpunk", "Retro", "Disco", "Rave",
  "Chaser", "Pulse", "Wave", "Sweep", "Bounce",
  "Flash", "Glow", "Shimmer", "Glitter", "Blinking",
  "Alternating", "Double Scanner", "Random Color", "Color Loop", "Gradient",
  "Multi Dynamic", "Color Fade", "Theater Rainbow", "Running Rainbow", "Fairy Lights",
  "Twinkling Stars", "Shooting Star", "Color Explosion", "Color Blend", "Smooth Wave",
  "Random Flash", "Color Wipe Reverse", "Dual Scanner", "Color Strobe", "Heartbeat",
  "Color Pulse", "Breathing Rainbow", "Candy Cane", "Traffic Light", "Color Drip",
  "Rainbow Waves", "Color Shift", "Fire Flicker", "Lightning Storm", "Meteor Shower",
  "Police Chase", "Ambulance", "Fire Truck", "Color Wash", "Liquid",
  "Kaleidoscope", "Fractal", "Nebula", "Galaxy", "Starfield",
  "Wormhole", "Vortex", "Spiral", "DNA", "Helix"
};

const uint16_t NUM_EFFECTS = sizeof(effectNames) / sizeof(effectNames[0]);

// ==================== HELPER FUNCTIONS ====================

// Get effect name by ID
String getEffectName(uint16_t effectId) {
  if (effectId < NUM_EFFECTS) {
    return String(effectNames[effectId]);
  }
  return "Unknown";
}

// Color wheel for rainbow effects
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}

// Apply brightness to color
uint32_t applyBrightness(uint32_t color, uint8_t brightness) {
  uint8_t r = (uint8_t)(color >> 16);
  uint8_t g = (uint8_t)(color >>  8);
  uint8_t b = (uint8_t)color;
  
  r = (r * brightness) / 255;
  g = (g * brightness) / 255;
  b = (b * brightness) / 255;
  
  return strip.Color(r, g, b);
}

// Set all LEDs to one color
void setAll(uint8_t r, uint8_t g, uint8_t b) {
  for(int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
}

// Clear all LEDs
void clearAll() {
  setAll(0, 0, 0);
}

// ==================== EFFECT IMPLEMENTATIONS ====================

void effect_static() {
  setAll(ledState.r, ledState.g, ledState.b);
}

void effect_rainbow() {
  for(int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, Wheel((i + effectStep) & 255));
  }
  effectStep++;
}

void effect_rainbow_chase() {
  for(int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, Wheel((i + effectStep) & 255));
  }
  effectStep += 3;
}

void effect_color_wipe() {
  if(effectPosition < NUM_LEDS) {
    strip.setPixelColor(effectPosition, strip.Color(ledState.r, ledState.g, ledState.b));
    effectPosition++;
  } else {
    effectPosition = 0;
    clearAll();
  }
}

void effect_theater_chase() {
  clearAll();
  for(int i = 0; i < NUM_LEDS; i += 3) {
    strip.setPixelColor(i + effectStep, strip.Color(ledState.r, ledState.g, ledState.b));
  }
  effectStep = (effectStep + 1) % 3;
}

void effect_twinkle() {
  clearAll();
  for(int i = 0; i < NUM_LEDS / 4; i++) {
    int pixel = random(NUM_LEDS);
    strip.setPixelColor(pixel, strip.Color(ledState.r, ledState.g, ledState.b));
  }
}

void effect_fire() {
  for(int i = 0; i < NUM_LEDS; i++) {
    int flicker = random(50, 150);
    strip.setPixelColor(i, strip.Color(flicker, flicker / 3, 0));
  }
}

void effect_breathing() {
  float breath = (exp(sin(effectStep * 0.01)) - 0.36787944) * 108.0;
  uint8_t val = (uint8_t)breath;
  setAll((ledState.r * val) / 255, (ledState.g * val) / 255, (ledState.b * val) / 255);
  effectStep++;
}

void effect_strobe() {
  if(effectStep % 2 == 0) {
    setAll(ledState.r, ledState.g, ledState.b);
  } else {
    clearAll();
  }
  effectStep++;
}

void effect_lightning() {
  if(random(100) < 5) {
    setAll(255, 255, 255);
    delay(random(10, 50));
    clearAll();
  }
}

void effect_meteor() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint32_t color = strip.getPixelColor(i);
    uint8_t r = (uint8_t)(color >> 16);
    uint8_t g = (uint8_t)(color >> 8);
    uint8_t b = (uint8_t)color;
    strip.setPixelColor(i, strip.Color(r * 0.9, g * 0.9, b * 0.9));
  }
  strip.setPixelColor(effectPosition, strip.Color(ledState.r, ledState.g, ledState.b));
  effectPosition = (effectPosition + 1) % NUM_LEDS;
}

void effect_police() {
  clearAll();
  for(int i = 0; i < NUM_LEDS / 2; i++) {
    strip.setPixelColor(i, effectStep % 2 == 0 ? strip.Color(255, 0, 0) : strip.Color(0, 0, 0));
  }
  for(int i = NUM_LEDS / 2; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, effectStep % 2 == 0 ? strip.Color(0, 0, 255) : strip.Color(0, 0, 0));
  }
  effectStep++;
}

void effect_fade() {
  static uint8_t hue = 0;
  setAll(ledState.r * hue / 255, ledState.g * hue / 255, ledState.b * hue / 255);
  hue += 5;
}

void effect_scan() {
  clearAll();
  strip.setPixelColor(effectPosition, strip.Color(ledState.r, ledState.g, ledState.b));
  if(effectDirection) {
    effectPosition++;
    if(effectPosition >= NUM_LEDS) {
      effectDirection = false;
      effectPosition = NUM_LEDS - 1;
    }
  } else {
    effectPosition--;
    if(effectPosition == 0) {
      effectDirection = true;
    }
  }
}

void effect_sparkle() {
  setAll(ledState.r / 4, ledState.g / 4, ledState.b / 4);
  int pixel = random(NUM_LEDS);
  strip.setPixelColor(pixel, strip.Color(255, 255, 255));
}

void effect_color_waves() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint8_t wave = sin8(i * 10 + effectStep);
    strip.setPixelColor(i, strip.Color((ledState.r * wave) / 255, 
                                       (ledState.g * wave) / 255, 
                                       (ledState.b * wave) / 255));
  }
  effectStep += 2;
}

void effect_running_lights() {
  effectPosition = (effectPosition + 1) % 256;
  for(int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(
      ((sin(i + effectPosition) * 127 + 128) * ledState.r) / 255,
      ((sin(i + effectPosition) * 127 + 128) * ledState.g) / 255,
      ((sin(i + effectPosition) * 127 + 128) * ledState.b) / 255
    ));
  }
}

void effect_color_chase() {
  static uint8_t hue = 0;
  for(int i = 0; i < NUM_LEDS; i++) {
    if((i + effectPosition) % 5 == 0) {
      strip.setPixelColor(i, Wheel(hue));
    } else {
      strip.setPixelColor(i, 0);
    }
  }
  effectPosition = (effectPosition + 1) % 5;
  hue += 3;
}

void effect_bouncing_balls() {
  static float positions[3] = {0, 0, 0};
  static float velocities[3] = {0, 0, 0};
  static const float gravity = 0.2;
  static const uint32_t colors[3] = {0xFF0000, 0x00FF00, 0x0000FF};
  
  clearAll();
  for(int i = 0; i < 3; i++) {
    velocities[i] -= gravity;
    positions[i] += velocities[i];
    if(positions[i] <= 0) {
      positions[i] = 0;
      velocities[i] *= -0.9;
    }
    int pos = (int)(positions[i] * NUM_LEDS / 20);
    if(pos >= 0 && pos < NUM_LEDS) {
      strip.setPixelColor(pos, colors[i]);
    }
  }
}

void effect_juggle() {
  static uint8_t dots[8] = {0};
  clearAll();
  for(int i = 0; i < 8; i++) {
    dots[i] = (dots[i] + random(1, 3)) % NUM_LEDS;
    strip.setPixelColor(dots[i], Wheel(i * 32));
  }
}

void effect_confetti() {
  strip.setPixelColor(random(NUM_LEDS), Wheel(random(256)));
  for(int i = 0; i < NUM_LEDS; i++) {
    uint32_t color = strip.getPixelColor(i);
    uint8_t r = (uint8_t)(color >> 16) * 0.95;
    uint8_t g = (uint8_t)(color >> 8) * 0.95;
    uint8_t b = (uint8_t)color * 0.95;
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
}

void effect_sinelon() {
  clearAll();
  int pos = beatsin16(13, 0, NUM_LEDS - 1);
  strip.setPixelColor(pos, Wheel(effectStep));
  effectStep += 2;
}

void effect_bpm() {
  uint8_t BeatsPerMinute = 62;
  uint8_t beat = beatsin8(BeatsPerMinute, 64, 255);
  for(int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, Wheel((i * 2 + effectStep) & 255));
    uint32_t color = strip.getPixelColor(i);
    color = applyBrightness(color, beat);
    strip.setPixelColor(i, color);
  }
  effectStep++;
}

void effect_pride() {
  static uint16_t sPseudotime = 0;
  static uint16_t sLastMillis = 0;
  static uint16_t sHue16 = 0;
  
  uint8_t sat8 = beatsin88(87, 220, 250);
  uint8_t brightdepth = beatsin88(341, 96, 224);
  uint16_t brightnessthetainc16 = beatsin88(203, (25 * 256), (40 * 256));
  uint8_t msmultiplier = beatsin88(147, 23, 60);

  uint16_t hue16 = sHue16;
  uint16_t hueinc16 = beatsin88(113, 1, 3000);
  
  for(int i = 0; i < NUM_LEDS; i++) {
    hue16 += hueinc16;
    uint8_t hue8 = hue16 / 256;
    strip.setPixelColor(i, Wheel(hue8));
  }
  
  sHue16 += 1;
}

void effect_plasma() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint8_t color = sin8(effectStep + i * 3) + sin8(effectStep * 2 + i * 5);
    strip.setPixelColor(i, Wheel(color));
  }
  effectStep += 2;
}

// Additional effects (25-100)
void effect_ripple() {
  clearAll();
  int center = NUM_LEDS / 2;
  for(int i = 0; i < effectPosition && i < NUM_LEDS / 2; i++) {
    uint8_t brightness = 255 - (i * 255 / (NUM_LEDS / 2));
    if(center + i < NUM_LEDS) {
      strip.setPixelColor(center + i, strip.Color(
        (ledState.r * brightness) / 255,
        (ledState.g * brightness) / 255,
        (ledState.b * brightness) / 255
      ));
    }
    if(center - i >= 0) {
      strip.setPixelColor(center - i, strip.Color(
        (ledState.r * brightness) / 255,
        (ledState.g * brightness) / 255,
        (ledState.b * brightness) / 255
      ));
    }
  }
  effectPosition = (effectPosition + 1) % (NUM_LEDS / 2);
}

void effect_comet() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint32_t color = strip.getPixelColor(i);
    uint8_t r = (uint8_t)(color >> 16) * 0.85;
    uint8_t g = (uint8_t)(color >> 8) * 0.85;
    uint8_t b = (uint8_t)color * 0.85;
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.setPixelColor(effectPosition, strip.Color(255, 255, 255));
  effectPosition = (effectPosition + 1) % NUM_LEDS;
}

void effect_aurora() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint8_t wave1 = sin8((i + effectStep) * 5);
    uint8_t wave2 = sin8((i + effectStep * 2) * 3);
    uint8_t wave3 = sin8((i + effectStep * 3) * 7);
    strip.setPixelColor(i, strip.Color(wave1, wave2, wave3));
  }
  effectStep++;
}

void effect_lava_lamp() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint8_t heat = sin8(i * 15 + effectStep);
    uint8_t r = heat > 128 ? 255 : heat * 2;
    uint8_t g = heat > 64 ? (heat - 64) * 4 : 0;
    strip.setPixelColor(i, strip.Color(r, g, 0));
  }
  effectStep += 3;
}

void effect_pacifica() {
  for(int i = 0; i < NUM_LEDS; i++) {
    uint8_t wave1 = sin8(i * 7 + effectStep);
    uint8_t wave2 = sin8(i * 11 + effectStep * 2);
    strip.setPixelColor(i, strip.Color(0, wave1 / 2, wave2));
  }
  effectStep += 2;
}

// Simple implementations for effects 30-100
void effect_generic(uint16_t effectId) {
  // Generic effect implementation based on effect ID
  uint8_t hue = (effectStep + effectId * 10) % 256;
  uint8_t pattern = effectId % 10;
  
  for(int i = 0; i < NUM_LEDS; i++) {
    switch(pattern) {
      case 0: // Solid wave
        strip.setPixelColor(i, Wheel((hue + i * 5) % 256));
        break;
      case 1: // Chasing
        strip.setPixelColor(i, (i + effectPosition) % 3 == 0 ? Wheel(hue) : 0);
        break;
      case 2: // Pulsing
        {
          uint8_t brightness = sin8(effectStep + i * 10);
          strip.setPixelColor(i, applyBrightness(Wheel(hue), brightness));
        }
        break;
      case 3: // Alternating
        strip.setPixelColor(i, i % 2 == effectStep % 2 ? Wheel(hue) : Wheel((hue + 128) % 256));
        break;
      case 4: // Gradient
        strip.setPixelColor(i, Wheel((hue + i * 256 / NUM_LEDS) % 256));
        break;
      case 5: // Random flicker
        strip.setPixelColor(i, random(100) < 10 ? Wheel(hue) : strip.getPixelColor(i));
        break;
      case 6: // Wave fade
        {
          uint8_t wave = sin8(i * 20 + effectStep);
          strip.setPixelColor(i, applyBrightness(Wheel(hue), wave));
        }
        break;
      case 7: // Double scanner
        {
          int pos1 = effectPosition % NUM_LEDS;
          int pos2 = (NUM_LEDS - effectPosition) % NUM_LEDS;
          clearAll();
          strip.setPixelColor(pos1, Wheel(hue));
          strip.setPixelColor(pos2, Wheel((hue + 128) % 256));
        }
        break;
      case 8: // Color blocks
        {
          int blockSize = 5;
          int block = i / blockSize;
          strip.setPixelColor(i, Wheel((hue + block * 30) % 256));
        }
        break;
      case 9: // Sparkle overlay
        setAll(ledState.r / 4, ledState.g / 4, ledState.b / 4);
        if(random(100) < 20) {
          strip.setPixelColor(random(NUM_LEDS), Wheel(hue));
        }
        break;
    }
  }
  effectStep++;
  effectPosition = (effectPosition + 1) % NUM_LEDS;
}

// Helper function for beat effects
uint16_t beatsin16(uint16_t bpm, uint16_t lowest, uint16_t highest) {
  uint16_t range = highest - lowest;
  uint16_t beat = (millis() * bpm / 60000) % 65536;
  return lowest + (sin16(beat) + 32768) * range / 65536;
}

uint8_t beatsin8(uint16_t bpm, uint8_t lowest, uint8_t highest) {
  return beatsin16(bpm, lowest, highest);
}

uint8_t beatsin88(uint16_t bpm, uint8_t lowest, uint8_t highest) {
  return beatsin8(bpm, lowest, highest);
}

int16_t sin16(uint16_t theta) {
  static const int16_t data[] = {0, 12539, 23170, 30273, 32767, 30273, 23170, 12539, 0, -12539, -23170, -30273, -32767, -30273, -23170, -12539};
  return data[(theta >> 12) & 0x0F];
}

uint8_t sin8(uint8_t theta) {
  static const uint8_t data[] = {128, 176, 218, 245, 255, 245, 218, 176, 128, 79, 37, 10, 0, 10, 37, 79};
  return data[(theta >> 4) & 0x0F];
}

// ==================== EFFECT UPDATE ====================
void updateEffects() {
  if(!ledState.power) {
    clearAll();
    strip.show();
    return;
  }

  unsigned long currentMillis = millis();
  unsigned long interval = map(ledState.speed, 0, 100, 100, 10);
  
  if(currentMillis - lastEffectUpdate < interval) {
    return;
  }
  lastEffectUpdate = currentMillis;

  // Call appropriate effect function
  switch(ledState.effect) {
    case 0: effect_static(); break;
    case 1: effect_rainbow(); break;
    case 2: effect_rainbow_chase(); break;
    case 3: effect_color_wipe(); break;
    case 4: effect_theater_chase(); break;
    case 5: effect_twinkle(); break;
    case 6: effect_fire(); break;
    case 7: effect_breathing(); break;
    case 8: effect_strobe(); break;
    case 9: effect_lightning(); break;
    case 10: effect_meteor(); break;
    case 11: effect_police(); break;
    case 12: effect_fade(); break;
    case 13: effect_scan(); break;
    case 14: effect_sparkle(); break;
    case 15: effect_color_waves(); break;
    case 16: effect_running_lights(); break;
    case 17: effect_color_chase(); break;
    case 18: effect_bouncing_balls(); break;
    case 19: effect_juggle(); break;
    case 20: effect_confetti(); break;
    case 21: effect_sinelon(); break;
    case 22: effect_bpm(); break;
    case 23: effect_pride(); break;
    case 24: effect_plasma(); break;
    case 25: effect_ripple(); break;
    case 26: effect_comet(); break;
    case 27: effect_aurora(); break;
    case 28: effect_lava_lamp(); break;
    case 29: effect_pacifica(); break;
    default:
      // Effects 30-99: Use generic effect implementation
      if(ledState.effect < NUM_EFFECTS) {
        effect_generic(ledState.effect);
      }
      break;
  }
  
  // Apply global brightness
  strip.setBrightness(ledState.brightness);
  strip.show();
}

// ==================== WEB SERVER HANDLERS ====================

void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  server.send(204);
}

void handleGetState() {
  // CORS headers
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
  state["deviceName"] = "Light-os RGB Controller";
  state["uptime"] = millis() / 1000;
  state["freeMemory"] = ESP.getFreeHeap();
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

String executeCommand(String cmd) {
  cmd.trim();
  cmd.toLowerCase();
  
  // Power commands
  if (cmd == "power on") {
    ledState.power = true;
    return "Power turned on";
  } 
  else if (cmd == "power off") {
    ledState.power = false;
    clearAll();
    strip.show();
    return "Power turned off";
  }
  
  // RGB commands
  else if (cmd.startsWith("rgb ")) {
    int r, g, b;
    if(sscanf(cmd.c_str(), "rgb %d %d %d", &r, &g, &b) == 3) {
      ledState.r = constrain(r, 0, 255);
      ledState.g = constrain(g, 0, 255);
      ledState.b = constrain(b, 0, 255);
      return "RGB color set to " + String(ledState.r) + "," + String(ledState.g) + "," + String(ledState.b);
    }
    return "Invalid RGB format";
  }
  
  // Brightness commands
  else if (cmd.startsWith("brightness ")) {
    int brightness;
    if(sscanf(cmd.c_str(), "brightness %d", &brightness) == 1) {
      ledState.brightness = constrain(brightness, 0, 255);
      return "Brightness set to " + String(ledState.brightness);
    }
    return "Invalid brightness value";
  }
  
  // Effect commands
  else if (cmd.startsWith("effect ")) {
    int effect;
    if(sscanf(cmd.c_str(), "effect %d", &effect) == 1) {
      if(effect >= 0 && effect < NUM_EFFECTS) {
        ledState.effect = effect;
        effectStep = 0;
        effectPosition = 0;
        effectDirection = true;
        return "Effect set to " + String(effect) + " (" + getEffectName(effect) + ")";
      }
      return "Effect ID out of range (0-" + String(NUM_EFFECTS - 1) + ")";
    }
    return "Invalid effect ID";
  }
  
  // Speed commands
  else if (cmd.startsWith("speed ")) {
    int speed;
    if(sscanf(cmd.c_str(), "speed %d", &speed) == 1) {
      ledState.speed = constrain(speed, 0, 100);
      return "Speed set to " + String(ledState.speed);
    }
    return "Invalid speed value";
  }
  
  // Scene commands
  else if (cmd.startsWith("scene ")) {
    String scene = cmd.substring(6);
    scene.trim();
    
    if(scene == "night") {
      ledState.r = 50; ledState.g = 20; ledState.b = 100;
      ledState.brightness = 50;
      ledState.effect = 7; // Breathing
      return "Night scene activated";
    }
    else if(scene == "party") {
      ledState.brightness = 255;
      ledState.effect = 20; // Confetti
      return "Party scene activated";
    }
    else if(scene == "chill") {
      ledState.r = 100; ledState.g = 150; ledState.b = 255;
      ledState.brightness = 150;
      ledState.effect = 27; // Aurora
      return "Chill scene activated";
    }
    else if(scene == "focus") {
      ledState.r = 255; ledState.g = 255; ledState.b = 255;
      ledState.brightness = 200;
      ledState.effect = 0; // Static
      return "Focus scene activated";
    }
    else if(scene == "relax") {
      ledState.r = 255; ledState.g = 100; ledState.b = 50;
      ledState.brightness = 100;
      ledState.effect = 7; // Breathing
      return "Relax scene activated";
    }
    else if(scene == "custom") {
      ledState.effect = 1; // Rainbow
      return "Custom scene activated";
    }
    return "Unknown scene: " + scene;
  }
  
  // Restart command
  else if (cmd == "restart") {
    server.send(200, "application/json", "{\"success\":true,\"message\":\"Restarting device...\"}");
    delay(100);
    ESP.restart();
    return "Restarting...";
  }
  
  return "Unknown command: " + cmd;
}

void handlePostCommand() {
  // CORS headers
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
    
    StaticJsonDocument<256> response;
    response["success"] = true;
    response["message"] = message;
    
    String responseStr;
    serializeJson(response, responseStr);
    server.send(200, "application/json", responseStr);
  } else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"No command provided\"}");
  }
}

void handleRoot() {
  String html = "<html><body><h1>Light-os ESP8266 Controller</h1>";
  html += "<p>Firmware Version: 1.0</p>";
  html += "<p>Total Effects: " + String(NUM_EFFECTS) + "</p>";
  html += "<p>WiFi Connected: " + String(WiFi.isConnected() ? "Yes" : "No") + "</p>";
  html += "<p>IP Address: " + WiFi.localIP().toString() + "</p>";
  html += "<p>Free Memory: " + String(ESP.getFreeHeap()) + " bytes</p>";
  html += "<p>Uptime: " + String(millis() / 1000) + " seconds</p>";
  html += "<h2>API Endpoints:</h2>";
  html += "<ul><li>GET /state - Get device state</li>";
  html += "<li>POST /command - Send command</li></ul>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n=================================");
  Serial.println("Light-os ESP8266 Firmware");
  Serial.println("Version 1.0");
  Serial.println("=================================\n");
  
  // Initialize LED strip
  pinMode(LED_PIN, OUTPUT);
  strip.begin();
  strip.setBrightness(ledState.brightness);
  strip.show(); // Initialize all pixels to 'off'
  
  // Initialize button (optional)
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  // Built-in LED indicator
  pinMode(BUILTIN_LED, OUTPUT);
  digitalWrite(BUILTIN_LED, HIGH); // Off (active low)
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED)); // Blink during connection
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    digitalWrite(BUILTIN_LED, LOW); // On when connected
    Serial.println("\n\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n\nWiFi Connection Failed!");
    Serial.println("Please check your credentials and try again.");
  }
  
  // Setup web server routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/state", HTTP_GET, handleGetState);
  server.on("/state", HTTP_OPTIONS, handleCORS);
  server.on("/command", HTTP_POST, handlePostCommand);
  server.on("/command", HTTP_OPTIONS, handleCORS);
  
  // Start web server
  server.begin();
  Serial.println("\nHTTP Server Started!");
  Serial.println("Total Effects Available: " + String(NUM_EFFECTS));
  Serial.println("\n=================================");
  Serial.println("Ready to receive commands!");
  Serial.println("=================================\n");
  
  // Show startup animation
  for(int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(0, 255, 0));
    strip.show();
    delay(10);
  }
  delay(500);
  clearAll();
  strip.show();
}

// ==================== MAIN LOOP ====================
void loop() {
  // Handle web server requests
  server.handleClient();
  
  // Update LED effects
  updateEffects();
  
  // Optional: Handle physical button
  static bool lastButtonState = HIGH;
  bool buttonState = digitalRead(BUTTON_PIN);
  if(buttonState == LOW && lastButtonState == HIGH) {
    // Button pressed - cycle through effects
    ledState.effect = (ledState.effect + 1) % NUM_EFFECTS;
    effectStep = 0;
    effectPosition = 0;
    Serial.println("Effect changed to: " + getEffectName(ledState.effect));
    delay(200); // Debounce
  }
  lastButtonState = buttonState;
  
  // Keep WiFi connection alive
  if(WiFi.status() != WL_CONNECTED) {
    digitalWrite(BUILTIN_LED, HIGH); // LED off when disconnected
  } else {
    digitalWrite(BUILTIN_LED, LOW); // LED on when connected
  }
}
