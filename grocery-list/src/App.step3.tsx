import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  CssBaseline, 
  Container, 
  ThemeProvider, 
  createTheme, 
  Box, 
  Typography, 
  Button,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AccountCircle, 
  ExitToApp, 
  Person 
} from '@mui/icons-material';
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

// User Menu Component
const UserMenu: React.FC<{ user: User; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    onSignOut();
  };

  const displayName = user.isAnonymous ? 'Guest User' : (user.email || 'User');
  const isGuest = user.isAnonymous;

  return (
    <>
      <Chip
        avatar={
          <Avatar sx={{ bgcolor: isGuest ? 'warning.main' : 'primary.main' }}>
            {isGuest ? <Person /> : <AccountCircle />}
          </Avatar>
        }
        label={displayName}
        onClick={handleClick}
        variant="outlined"
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Avatar sx={{ bgcolor: isGuest ? 'warning.main' : 'primary.main' }}>
              {isGuest ? <Person /> : <AccountCircle />}
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={displayName}
            secondary={isGuest ? 'Anonymous Session' : user.email}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </>
  );
};

// Home component
const Home: React.FC<HomeProps> = ({ user, onSignOut }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with User Menu */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            🛒 My Grocery App
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Smart Sharing System - Fully Loaded! 🚀
          </Typography>
        </Box>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserMenu user={user} onSignOut={onSignOut} />
          </Box>
        )}
      </Box>

      {/* Welcome Message */}
      {user && (
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4, 
          p: 2, 
          backgroundColor: 'primary.dark', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main'
        }}>
          <Typography variant="h6" gutterBottom>
            Welcome back! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.isAnonymous 
              ? 'You\'re browsing as a guest. Create lists and share them instantly!' 
              : `Signed in as ${user.email}. All your lists are synced and secure.`
            }
          </Typography>
        </Box>
      )}
      
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

      <ListOverview />
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
              element={<ListDetail />} 
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
