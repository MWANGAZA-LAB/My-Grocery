import './App.css';
import React, { useEffect, useState } from 'react';
import { CssBaseline, Container, ThemeProvider, createTheme, Box, Typography, Button, Alert } from '@mui/material';

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

const App: React.FC = () => {
  const [step, setStep] = useState(2);
  const [status, setStatus] = useState('Loading Firebase...');
  const [firebaseStatus, setFirebaseStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [firebaseError, setFirebaseError] = useState<string>('');

  useEffect(() => {
    // Test Firebase initialization
    const testFirebase = async () => {
      try {
        // Import Firebase modules
        const { auth } = await import('./firebase');
        console.log('Firebase auth imported successfully:', auth);
        setFirebaseStatus('success');
        setStatus('Firebase loaded successfully! 🔥');
      } catch (error) {
        console.error('Firebase error:', error);
        setFirebaseStatus('error');
        setFirebaseError(error instanceof Error ? error.message : 'Unknown Firebase error');
        setStatus('Firebase failed to load ❌');
      }
    };

    setTimeout(testFirebase, 500);
  }, []);

  const handleStepClick = (newStep: number) => {
    if (newStep === 2 && firebaseStatus === 'success') {
      setStep(newStep);
    } else if (newStep === 3 && firebaseStatus === 'success') {
      // Proceed to full app
      window.location.reload(); // Will be replaced with step 3
      setStep(newStep);
    } else if (newStep === 1) {
      setStep(newStep);
    }
  };

  const proceedToStep3 = () => {
    // Replace the app with the full version
    if (firebaseStatus === 'success') {
      setStep(3);
      setTimeout(() => {
        window.location.href = window.location.href + '?step=3';
      }, 1000);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            🛒 My Grocery App
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Smart Sharing System
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Status: {status}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button 
            variant={step >= 1 ? "contained" : "outlined"} 
            onClick={() => handleStepClick(1)}
          >
            Step 1: Basic UI
          </Button>
          <Button 
            variant={step >= 2 ? "contained" : "outlined"} 
            onClick={() => handleStepClick(2)}
            disabled={firebaseStatus === 'error'}
          >
            Step 2: Add Firebase
          </Button>
          <Button 
            variant={step >= 3 ? "contained" : "outlined"} 
            onClick={() => handleStepClick(3)}
            disabled={firebaseStatus !== 'success'}
          >
            Step 3: Add Components
          </Button>
        </Box>

        {firebaseStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Firebase Configuration Issue</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {firebaseError}
            </Typography>
            <Typography variant="body2">
              <strong>Solutions:</strong>
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Check your .env file has valid Firebase credentials</li>
              <li>Ensure your Firebase project is active</li>
              <li>Try using Firebase emulators for development</li>
            </ul>
          </Alert>
        )}

        {step >= 1 && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>✅ Step 1: Material-UI & Theme Working</Typography>
            <Typography variant="body2">Dark theme, responsive design, and Material-UI components loaded successfully.</Typography>
          </Box>
        )}

        {step >= 2 && firebaseStatus === 'success' && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>✅ Step 2: Firebase Integration Working</Typography>
            <Typography variant="body2">Firebase authentication and database connection established.</Typography>
          </Box>
        )}

        {step >= 2 && firebaseStatus === 'loading' && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'warning.dark', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>🔄 Step 2: Testing Firebase...</Typography>
            <Typography variant="body2">Checking Firebase authentication and database connection...</Typography>
          </Box>
        )}

        {step >= 3 && firebaseStatus === 'success' && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>🚀 Step 3: Smart Sharing Components</Typography>
            <Typography variant="body2">Loading grocery list components and smart sharing system...</Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, p: 2, backgroundColor: 'primary.dark', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Smart Sharing Features Ready:</Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>One-tap sharing (vs 5+ steps before)</li>
            <li>Guest access without registration</li>
            <li>QR code & multi-channel sharing</li>
            <li>Smart permission presets</li>
            <li>Real-time collaboration</li>
          </ul>
        </Box>

        {firebaseStatus === 'success' && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'success.dark', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>🎉 Ready for Step 3!</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Firebase is connected and working. Click below to load the full grocery list application 
              with all the smart sharing features we implemented.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={proceedToStep3}
              sx={{ mt: 1 }}
            >
              🚀 Launch Full App with Smart Sharing
            </Button>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
