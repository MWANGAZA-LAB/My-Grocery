import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { 
  CssBaseline, 
  Container, 
  ThemeProvider, 
  createTheme, 
  Box, 
  Typography, 
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
  ExitToApp
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

  const displayName = user.email || 'User';

  return (
    <>
      <Chip
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountCircle />
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
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AccountCircle />
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={displayName}
            secondary={user.email || 'Collaborative User'}
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
            Real-Time Collaboration Made Simple 🚀
          </Typography>
        </Box>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserMenu user={user} onSignOut={onSignOut} />
          </Box>
        )}
      </Box>

      {/* Collaboration Banner */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4, 
        p: 3, 
        backgroundColor: 'primary.dark', 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'primary.main'
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Share. Shop. Sync. Simple. �
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create lists, share instantly with QR codes, and collaborate in real-time across any location.
        </Typography>
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
        <BrowserRouter basename="/My-Grocery">
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
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
