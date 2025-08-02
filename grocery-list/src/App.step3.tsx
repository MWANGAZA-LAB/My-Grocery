import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container, ThemeProvider, createTheme, Box, Typography, Button } from '@mui/material';
import './firebase';
import { auth } from './firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import ListOverview from './components/ListOverview';
import ListDetail from './components/ListDetail';
import JoinListPage from './components/JoinListPage';
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

// Home component
const Home: React.FC<HomeProps> = ({ user, onSignOut }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🛒 My Grocery App
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Smart Sharing System - Fully Loaded! 🚀
        </Typography>
        {user && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Welcome! {user.isAnonymous ? 'Guest User' : user.email}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ mb: 4, p: 3, backgroundColor: 'success.dark', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>🎉 All Systems Ready!</Typography>
        <Typography variant="body1" gutterBottom>
          Your grocery app is now fully loaded with the revolutionary smart sharing system:
        </Typography>
        <ul style={{ margin: '16px 0', paddingLeft: '20px' }}>
          <li><strong>One-tap sharing</strong> - reduced from 5+ steps to just 1 click</li>
          <li><strong>Guest access</strong> - no forced registration required</li>
          <li><strong>QR code sharing</strong> - instant visual sharing</li>
          <li><strong>Multi-channel sharing</strong> - SMS, email, native sharing</li>
          <li><strong>Smart permissions</strong> - preset options for easy control</li>
          <li><strong>Real-time collaboration</strong> - live updates across devices</li>
        </ul>
      </Box>

      <ListOverview user={user} />
    </Container>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        console.log('No user found, signing in anonymously...');
        try {
          const result = await signInAnonymously(auth);
          console.log('Anonymous sign-in successful:', result.user);
          setUser(result.user);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      console.log('Cleaning up auth listener...');
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              🛒 Loading My Grocery App...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Initializing smart sharing system...
            </Typography>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <SyncStatus />
          <Routes>
            <Route 
              path="/" 
              element={<Home user={user} onSignOut={handleSignOut} />} 
            />
            <Route 
              path="/list/:listId" 
              element={<ListDetail user={user} />} 
            />
            <Route 
              path="/join/:token" 
              element={<JoinListPage />} 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
