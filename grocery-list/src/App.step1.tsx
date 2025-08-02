import './App.css';
import React, { useEffect, useState } from 'react';
import { CssBaseline, Container, ThemeProvider, createTheme, Box, Typography, Button } from '@mui/material';

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
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('Loading basic app...');

  useEffect(() => {
    setTimeout(() => {
      setStatus('Basic app loaded! 🎉');
    }, 500);
  }, []);

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
            onClick={() => setStep(1)}
          >
            Step 1: Basic UI
          </Button>
          <Button 
            variant={step >= 2 ? "contained" : "outlined"} 
            onClick={() => setStep(2)}
            disabled={step < 1}
          >
            Step 2: Add Firebase
          </Button>
          <Button 
            variant={step >= 3 ? "contained" : "outlined"} 
            onClick={() => setStep(3)}
            disabled={step < 2}
          >
            Step 3: Add Components
          </Button>
        </Box>

        {step >= 1 && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>✅ Step 1: Material-UI & Theme Working</Typography>
            <Typography variant="body2">Dark theme, responsive design, and Material-UI components loaded successfully.</Typography>
          </Box>
        )}

        {step >= 2 && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>🔄 Step 2: Firebase Integration</Typography>
            <Typography variant="body2">Next: Add Firebase authentication and database connection.</Typography>
          </Box>
        )}

        {step >= 3 && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>🚀 Step 3: Smart Sharing Components</Typography>
            <Typography variant="body2">Final: Load grocery list components and smart sharing system.</Typography>
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
      </Container>
    </ThemeProvider>
  );
};

export default App;
