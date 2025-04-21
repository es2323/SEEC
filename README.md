# SEEC

SEEC is a transport app for blind people, with a Django backend and React Native frontend (using Expo). Follow these steps to get it running on your Windows machine.

## Prerequisites
Python 3.8+ (Download from [python.org](httpswww.python.orgdownloads))
Node.js 16+ and npm (Download from [nodejs.org](httpsnodejs.org))
Expo CLI (Install with `npm install -g expo-cli`)
Expo Go App (Install on your iOSAndroid device for testing)
Git (Download from [git-scm.com](httpsgit-scm.com))

## Setup Steps

### 1. Clone the Repository
Open a Command Prompt or PowerShell.
Clone the project
```bash
git clone <giturl>
cd seec
```

### 2. Set Up the Backend
Navigate to the backend folder
```bash
cd .../seec/backend
```
Create and activate a virtual environment
```bash
python -m venv venv
.venvScriptsactivate
```
Install required packages
```bash
pip install django djangorestframework django-cors-headers
```
Run migrations to set up the database
```bash
python manage.py makemigrations
python manage.py migrate
```
Update the IP
Open `backendsettings.py`.
Find `ALLOWED_HOSTS` and add your local IP (find it with `ipconfig` in Command Prompt, e.g., `192.168.x.x`)
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-ip-here']
```
Start the backend server
```bash
python manage.py runserver 0.0.0.08000
```
Test it by visiting `http://your-ip:8000/api/create-user` in a browser.

### 3. Set Up the Frontend
Open a new Command Prompt (keep the backend running).
Navigate to the frontend folder
```bash
cd .../seec/frontend
```
Install dependencies
```bash
npm install
```
Update the API URL
Open `srcapiapi.js`.
Update `API_URL` with your local IP (same IP as above)
```javascript
const API_URL = 'http://your-ip:8000/api';
```
Start the Expo server
```bash
npx expo start --clear
```
Press `l`/`s` to switch to LAN mode/Expo mode, then scan the QR code with Expo Go on your device (ensure your device is on the same Wi-Fi network).

### 4. Test the App
Sign Up Create an account with a username, email, password, and GDPR consent.
Log In Use your credentials to log in.
Profile After login, you should see Welcome, [username]!.

## Troubleshooting
Network Issues Ensure your device and computer are on the same Wi-Fi. Double-check the IP in `src/api/api.js` and `ALLOWED_HOSTS`.
QR Code Fails Restart Expo with `npx expo start --clear` and ensure LAN mode is active.
Android Emulator Install Android Studio, set up an emulator, and update `API_URL` to `http10.0.2.28000api`.
