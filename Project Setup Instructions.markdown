# Setup and Run Instructions for Team Members

These steps guide you through cloning or updating the project, installing dependencies, configuring the environment, and running the app using Expo Go. Always run commands from the `/frontend` directory and use `npx expo start --clear` to start the app.

---

## 1. Install Prerequisites

Ensure the following are installed on your computer:

- **Node.js**: Version 20 (LTS) or higher.
  - Download: [nodejs.org](https://nodejs.org)
  - Verify: Run `node --version` (expect `v20.x.x` or higher).
- **Yarn**: Version 1.22.22 (exact match).
  - Install: `npm install -g yarn@1.22.22`
  - Verify: Run `yarn --version` (expect `1.22.22`).
- **Expo Go App**: For testing on mobile devices.
  - iOS: Install from the App Store.
  - Android: Install from Google Play.
- **Text Editor**: Use VS Code or similar.
- **Git**: For repository access.
  - Verify: Run `git --version`.

---

## 2. Clone or Update the Repository

Get the latest code from the `main` branch in the `/frontend` directory.

### New Setup (Clone):
```bash
git clone <repository-url>
cd seec/frontend
```
```powershell
git clone <repository-url>
cd seec\frontend
```
Replace `<repository-url>` with the project’s URL (e.g., `https://github.com/your-repo/seec.git`).

### Existing Setup (Pull):
```bash
cd /path/to/seec/frontend
git pull origin main
```
```powershell
cd C:\path\to\seec\frontend
git pull origin main
```

### Verify Files:
Ensure these files exist in `seec/frontend`:
- `package.json` (matches versions below)
- `app.json`
- `App.js`
- `src/screens/MainMenuScreen.js`
- `src/screens/FindBusScreen.js`
- `src/screens/LocationScreen.js`
- `src/screens/ImageToSpeech.js`
- `src/utils/imageToSpeech.js` (if used)

Confirm `SignUpScreen.js` and `LoginScreen.js` are **not** in `src/screens`:
```bash
ls src/screens
```
```powershell
dir src\screens
```

### Verify `package.json` Dependencies:
Ensure `package.json` includes:
```json
"dependencies": {
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/native-stack": "^6.11.0",
  "axios": "^1.9.0",
  "expo": "^53.0.0",
  "expo-camera": "~16.1.6",
  "expo-constants": "~17.1.6",
  "expo-dev-client": "~5.1.0",
  "expo-file-system": "~18.1.0",
  "expo-image-picker": "~16.1.4",
  "expo-location": "~18.1.5",
  "expo-speech": "~13.1.7",
  "expo-status-bar": "~2.2.3",
  "react": "19.0.0",
  "react-native": "0.79.2",
  "react-native-safe-area-context": "5.4.0",
  "react-native-screens": "~4.10.0"
}
```

---

## 3. Install Dependencies

Use Yarn 1.22.22 to install exact versions for Expo SDK 53 compatibility.

### Clean Residual Files:
Remove old dependency files to avoid conflicts:
```bash
rm -rf node_modules package-lock.json yarn.lock
```
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
```
**Alternative**: Manually delete the `node_modules` folder, `package-lock.json`, and `yarn.lock` files using your file explorer.

### Install Dependencies:
```bash
yarn install
```
```powershell
yarn install
```

### Verify Installation:
Check key dependencies:
```bash
yarn list --pattern "expo-camera|expo-constants|expo-location|expo-speech|react-native"
```
```powershell
yarn list --pattern "expo-camera|expo-constants|expo-location|expo-speech|react-native"
```
Expected output:
- `expo-camera@~16.1.6`
- `expo-constants@~17.1.6`
- `expo-location@~18.1.5`
- `expo-speech@~13.1.7`
- `react-native@0.79.2`

### Troubleshoot Issues:
- If installation fails, force reinstall:
  ```bash
  yarn install --force
  ```
  ```powershell
  yarn install --force
  ```
- If issues persist, regenerate `yarn.lock`:
  ```bash
  rm -f yarn.lock
  yarn install
  ```
  ```powershell
  Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
  yarn install
  ```
  **Alternative**: Manually delete `yarn.lock` using your file explorer, then run `yarn install`.
- Last resort: Switch to npm (remove `"packageManager": "yarn@1.22.22..."` from `package.json`):
  ```bash
  npm install
  ```
  ```powershell
  npm install
  ```



### Verify `app.json`:
Ensure `app.json` includes:
```json
{
  "expo": {
    "name": "SEEC",
    "slug": "seec",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "seec",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "visionApiKey": "AIzaSyAcJpo7n1UV4kE5gcjD7lqt0YCW8apik9c"
    },
    "jsEngine": "hermes"
  }
}
```
- Confirm `"scheme": "seec"`, `"jsEngine": "hermes"`, and no `newArchEnabled` field.

---

## 5. Run the App

From the `/frontend` directory, start the development server:
```bash
npx expo start --clear
```
```powershell
npx expo start --clear
```
The `--clear` flag ensures a fresh Metro bundle.

### Open in Expo Go:
- **Scan QR Code**: Displayed in the terminal.
  - iOS: Use Camera app to scan and open in Expo Go.
  - Android: Use Expo Go app to scan.
- **Manual Entry**: If scanning fails, enter the URL (e.g., `exp://192.168.x.x:8081`) in Expo Go.
- Ensure your device and computer are on the same Wi-Fi.

### Troubleshoot Connection Issues:
- Try tunnel mode:
  ```bash
  npx expo start --clear --tunnel
  ```
  ```powershell
  npx expo start --clear --tunnel
  ```
- Check firewall/VPN settings (port 8081 must be open).
- Verify the local IP matches your network.

---

## 6. Test App Features

Verify functionality in Expo Go:

### Navigation:
- **MainMenuScreen**: Displays buttons for Find Bus, Image to Speech, and Location.
- Clicking navigates to `FindBusScreen`, `ImageToSpeech`, and `LocationScreen`.

### FindBusScreen:
- Enter start/destination addresses, click “Find Buses” to list journeys.
- Click “Read Aloud” for journey steps (uses `expo-speech`).
- Click “Start Journey” for location-based navigation (requires location permission).

### ImageToSpeech:
- Click “Select Image from Gallery” or “Take Picture” (requires camera/gallery permissions).
- Verify text extraction and speech output (depends on `imageToSpeech.js` and `VISION_API_KEY`).

### LocationScreen:
- Displays address and coordinates (requires location permission).
- Click “Find Nearby Bus Stops” to list stops.
- Tap a stop for live times.
- Click “Read Aloud” to hear location and stops (uses `expo-speech`).

---

## 7. Validate with Expo Doctor

Check dependency compatibility:
```bash
npx expo-doctor@latest
```
```powershell
npx expo-doctor@latest
```
If issues are flagged, fix them:
```bash
npx expo install --fix
```
```powershell
npx expo install --fix
```

---

## 8. Troubleshooting Common Issues

### Dependency Errors:
- Force reinstall:
  ```bash
  yarn install --force
  ```
  ```powershell
  yarn install --force
  ```
- Regenerate `yarn.lock`:
  ```bash
  rm -f yarn.lock
  yarn install
  ```
  ```powershell
  Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
  yarn install
  ```
  **Alternative**: Manually delete `yarn.lock` and run `yarn install`.

### Expo Go Crashes:
- Clear Expo Go cache: Shake device in Expo Go, select “Clear JS Bundle”.
- Restart server:
  ```bash
  npx expo start --clear
  ```
  ```powershell
  npx expo start --clear
  ```

### Permission Issues:
- Ensure camera, gallery, and location permissions are granted in Expo Go settings.
- Reinstall Expo Go to reset permissions.

### imageToSpeech.js Errors:
- Debug `imageToSpeech.js` if ImageToSpeech fails.
- Verify `VISION_API_KEY` is set.

### Network Errors:
- Check API keys for Google Directions (`AIzaSyArCo5izEub-54JZjKqsLW-qQTwWbkhiJo`) and TransportAPI (`d0b31a43`, `225da684f903d19c96310dcf0d305b5c`).
- Ensure internet connectivity.

---
