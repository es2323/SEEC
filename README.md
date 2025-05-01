# SEEC - Accessibility App for Visually Impaired Users

## Overview

SEEC is a mobile application designed to assist visually impaired users by enabling them to take pictures or select images from their gallery, extract text from these images using Optical Character Recognition (OCR), and have the text read aloud using Text-to-Speech (TTS). The app is built with a Django backend and a React Native frontend using Expo Go, leveraging Google Cloud Vision API for OCR.

## Features

- **User Signup and Login**: Users can create an account and log in to access the app’s features.
- **Image-to-Speech**: Take a picture or select an image from the gallery, and the app will extract text and read it aloud.
- **Accessible Design**: Built with accessibility in mind for visually impaired users.

## Prerequisites

- Python 3.8+ (Download from [python.org](https://www.python.org/downloads))
- Node.js 16+ and npm (Download from [nodejs.org](https://nodejs.org))
- Expo CLI (Install with `npm install -g expo-cli`)
- Expo Go App (Install on your iOS/Android device for testing)
- Git (Download from [git-scm.com](https://git-scm.com))

## Setup Steps

### 1. Clone the Repository
Open a Command Prompt or PowerShell.
Clone the project:
```bash
git clone <giturl>
cd seec
```

### 2. Set Up the Backend
Navigate to the backend folder:
```bash
cd .../seec/backend
```
Create a virtual environment:
```bash
python -m venv C:\path\to\.venv\folder
```
Navigate to the virtual environment’s Scripts folder:
```bash
cd C:\path\to\.venv\folder\Scripts
```
Activate the virtual environment:
```bash
activate
```
Install required packages:
```bash
pip install -r requirements.txt
```
Run migrations to set up the database:
```bash
python manage.py makemigrations
python manage.py migrate
```
Update the IP in the backend settings:
- Open `backend/settings.py`.
- Find `ALLOWED_HOSTS` and add your local IP (find it with `ipconfig` in Command Prompt, e.g., `192.168.x.x`):
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-ip-here']
```
Start the backend server:
```bash
python manage.py runserver 0.0.0.0:8000
```
Test it by visiting `http://your-ip:8000/api/create-user` in a browser.

### 3. Set Up the Frontend
Open a new Command Prompt (keep the backend running).
Navigate to the frontend folder:
```bash
cd .../seec/frontend
```
Install dependencies:
```bash
npm install
```
Update the API URL in the frontend:
- Open `src/api/api.js`.
- Update `API_URL` with your local IP (same IP as above):
```javascript
const API_URL = 'http://your-ip:8000/api';
```
Update the Google Cloud Vision API key or use mine, but be careful to not overuse it without checking with (Saul):
- Open `app.json`.
- Replace `your-actual-vision-api-key-here` with your API key from Google Cloud Console:
```json
"extra": {
    "visionApiKey": "your-actual-vision-api-key-here"
}
```
Start the Expo server:
```bash
npx expo start --clear
```
Press `s` to switch to Expo mode, then scan the QR code with Expo Go on your device (ensure your device is on the same Wi-Fi network).

### 4. Use the App
- **Sign Up**: Create an account with a username, email, password, and GDPR consent.
- **Log In**: Use your credentials to log in.
- **Image-to-Speech**: After logging in, you’ll see options to either take a picture or select an image from your gallery. The app will extract text from the image and read it aloud.

## Troubleshooting
- **Network Issues**: Ensure your device and computer are on the same Wi-Fi. Double-check the IP in `src/api/api.js` and `ALLOWED_HOSTS` in `backend/settings.py`.
- **QR Code Fails**: Restart Expo with `npx expo start --clear` and ensure LAN mode is active.
- **Android Emulator**: Install Android Studio, set up an emulator, and update `API_URL` to `http://10.0.2.2:8000/api`.
- **TTS Not Working**: Ensure your device isn’t muted and volume is up. Test on another device if possible.