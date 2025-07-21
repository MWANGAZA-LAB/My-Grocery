import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from '@mui/material';
import './firebase';
import { auth } from './firebase';
import { onAuthStateChanged, signInAnonymously, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useEffect } from 'react';
import ListOverview from './components/ListOverview';
import ListDetail from './components/ListDetail';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import SyncStatus from './components/SyncStatus';

function Home({ user }) {
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [upgradeEmail, setUpgradeEmail] = React.useState('');
  const [upgradePassword, setUpgradePassword] = React.useState('');
  const [upgradeError, setUpgradeError] = React.useState('');

  const handleUpgrade = async () => {
    setUpgradeError('');
    try {
      const cred = EmailAuthProvider.credential(upgradeEmail, upgradePassword);
      await linkWithCredential(auth.currentUser, cred);
      // Create user doc in Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
      });
      setUpgradeOpen(false);
      setUpgradeEmail('');
      setUpgradePassword('');
    } catch (e) {
      setUpgradeError(e.message);
    }
  };

  return <>
    <ListOverview />
    {user && user.isAnonymous && (
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setUpgradeOpen(true)}>
        Sign up / Log in to save & share
      </Button>
    )}
    <Dialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)}>
      <DialogTitle>Upgrade Account</DialogTitle>
      <DialogContent>
        <TextField
          label="Email"
          type="email"
          value={upgradeEmail}
          onChange={e => setUpgradeEmail(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={upgradePassword}
          onChange={e => setUpgradePassword(e.target.value)}
          fullWidth
        />
        {upgradeError && <Typography color="error">{upgradeError}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setUpgradeOpen(false)}>Cancel</Button>
        <Button onClick={handleUpgrade} variant="contained">Upgrade</Button>
      </DialogActions>
    </Dialog>
  </>;
}

function App() {
  const [user, setUser] = React.useState(undefined); // undefined = loading, null = not logged in

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
    <Router>
      <SyncStatus />
      <CssBaseline />
      <Container maxWidth="sm">
        <Routes>
          <Route path="/list/:id" element={<ListDetail />} />
          <Route path="/" element={<Home user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
