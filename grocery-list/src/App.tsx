import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import './firebase';
import { auth } from './firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import ListOverview from './components/ListOverview';
import ListDetail from './components/ListDetail';
import SyncStatus from './components/SyncStatus';
import ErrorBoundary from './components/ErrorBoundary';
import { HomeProps } from './types';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
  },
});

function Home({ user }: HomeProps) {
  return (
    <>
      <ListOverview />
    </>
  );
}

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // If not authenticated, sign in anonymously
        await signInAnonymously(auth);
      } else {
        setUser(u || null);
      }
    });
    return unsubscribe;
  }, []);

  if (user === undefined) return null; // or a spinner

  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <Router>
          <SyncStatus />
          <CssBaseline />
          <Container maxWidth="sm">
            <ErrorBoundary>
              <Routes>
                <Route path="/list/:id" element={<ListDetail />} />
                <Route path="/" element={<Home user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </Container>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
