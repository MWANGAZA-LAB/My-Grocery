# Grocery List App

A collaborative, offline-first grocery list app built with React (PWA), Firebase (Auth + Firestore), and Material UI.

## Features
- Email/password authentication
- Multiple lists per user (Groceries, Hardware, etc.)
- Real-time collaboration (shared lists)
- Offline-first with automatic sync
- List archiving/history
- Responsive, modern UI (Material UI)

## Tech Stack
- React (PWA)
- Firebase Auth & Firestore
- Material UI
- React Router

## Setup
1. Clone the repo and install dependencies:
   ```sh
   npm install
   ```
2. Add your Firebase config to `src/firebase.js`:
   ```js
   const firebaseConfig = {
     apiKey: 'YOUR_API_KEY',
     authDomain: 'YOUR_AUTH_DOMAIN',
     projectId: 'YOUR_PROJECT_ID',
     storageBucket: 'YOUR_STORAGE_BUCKET',
     messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
     appId: 'YOUR_APP_ID',
   };
   ```
3. Start the app:
   ```sh
   npm start
   ```

## Project Structure
- `src/firebase.js`: Firebase initialization
- `src/App.js`: Main app and routing
- `src/components/`: UI components (to be added)

## Next Steps
- Implement authentication screens
- Build list overview and detail screens
- Add Firestore data logic
- Enable offline persistence and real-time updates
