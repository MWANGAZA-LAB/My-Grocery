# Grocery List App

A collaborative, offline-first grocery list app built with React (PWA), Firebase (Auth + Firestore), and Material UI.

## Features
- Anonymous authentication with optional account upgrade
- Multiple lists per user (Groceries, Hardware, etc.)
- Real-time collaboration with smart sharing via QR codes
- Offline-first with automatic sync
- List archiving/history
- Responsive, modern UI (Material UI with dark theme)

## Tech Stack
- React 19.x (PWA with Create React App)
- TypeScript 4.9
- Firebase Auth & Firestore
- Material UI v7
- React Router v6

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Firebase project

### Installation
1. Clone the repo and install dependencies:
   ```sh
   npm install
   ```

2. Configure Firebase:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase project credentials:
   ```sh
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. Deploy Firestore security rules:
   ```sh
   firebase deploy --only firestore:rules
   ```

4. Start the app:
   ```sh
   npm start
   ```

## Project Structure
- `src/firebase.ts`: Firebase initialization with environment variables
- `src/App.tsx`: Main app component and routing
- `src/components/`: UI components
  - `ListOverview.tsx`: Main list view
  - `ListDetail.tsx`: Individual list with items
  - `SmartShareDialog.tsx`: QR code sharing functionality
  - `JoinListPage.tsx`: Join shared lists
- `src/services/smartShareService.ts`: Share token management
- `src/utils/`: Utility functions (validation, rate limiting)
- `firestore.rules`: Firestore security rules

## Security

### Environment Variables
- **Never commit `.env.local` to version control**
- All Firebase credentials are loaded from environment variables
- Required variables are validated at startup

### Firestore Security Rules
The app includes comprehensive Firestore security rules that:
- Require authentication for all operations
- Validate data format and size limits
- Enforce ownership permissions
- Support shared access via tokens

### Input Validation
All user inputs are validated and sanitized:
- List names: 1-100 characters, HTML stripped
- Item text: 1-200 characters
- Quantities: 0-50 characters

### Rate Limiting
Debouncing and rate limiting are applied to:
- Real-time updates (500ms debounce)
- API calls (10 req/sec default limit)

## Testing
```sh
npm test                    # Run tests in watch mode
npm test -- --coverage      # Run with coverage report
```

## Available Scripts
- `npm start`: Run development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run deploy`: Deploy to GitHub Pages

## Known Limitations
- react-scripts (Create React App) has known vulnerabilities that cannot be fixed without migration to Vite or similar
- Some npm packages have vulnerabilities that require breaking changes to fix

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License
MIT
