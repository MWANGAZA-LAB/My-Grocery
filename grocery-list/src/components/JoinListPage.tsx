import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  PersonAdd,
  Login,
  Visibility,
  Edit,
  AdminPanelSettings,
} from '@mui/icons-material';
import { auth } from '../firebase';
import { smartShareService, ShareToken } from '../services/smartShareService';
import { signInAnonymously } from 'firebase/auth';

export default function JoinListPage(): React.ReactElement {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [shareToken, setShareToken] = useState<ShareToken | null>(null);
  const [error, setError] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [showGuestForm, setShowGuestForm] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async (): Promise<void> => {
    try {
      setLoading(true);
      const tokenData = await smartShareService.validateShareToken(token!);
      
      if (!tokenData) {
        setError('This share link is invalid or has expired.');
        return;
      }

      setShareToken(tokenData);
    } catch (err) {
      setError('Failed to validate share link.');
      console.error('Token validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithAccount = async (): Promise<void> => {
    if (!shareToken || !auth.currentUser) return;

    try {
      setJoining(true);
      const result = await smartShareService.joinListWithToken(
        token!,
        auth.currentUser.uid,
        false
      );

      if (result.success) {
        navigate(`/list/${result.listId}`);
      } else {
        setError(result.error || 'Failed to join list');
      }
    } catch (err) {
      setError('Failed to join list');
      console.error('Join error:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleJoinAsGuest = async (): Promise<void> => {
    if (!shareToken || !guestName.trim()) return;

    try {
      setJoining(true);
      
      // Create anonymous session
      const userCredential = await signInAnonymously(auth);
      
      const result = await smartShareService.joinListWithToken(
        token!,
        userCredential.user.uid,
        true,
        guestName.trim()
      );

      if (result.success) {
        navigate(`/list/${result.listId}`);
      } else {
        setError(result.error || 'Failed to join list');
      }
    } catch (err) {
      setError('Failed to join as guest');
      console.error('Guest join error:', err);
    } finally {
      setJoining(false);
    }
  };

  const getPermissionIcon = (permissions: any) => {
    if (permissions.canDeleteItems) return <AdminPanelSettings color="error" />;
    if (permissions.canEditItems) return <Edit color="warning" />;
    return <Visibility color="success" />;
  };

  const getPermissionLabel = (permissions: any) => {
    if (permissions.canDeleteItems) return 'Admin';
    if (permissions.canEditItems) return 'Editor';
    return 'Viewer';
  };

  const getPermissionDescription = (permissions: any) => {
    const actions = [];
    if (permissions.canView) actions.push('View items');
    if (permissions.canAddItems) actions.push('Add items');
    if (permissions.canEditItems) actions.push('Edit items');
    if (permissions.canDeleteItems) actions.push('Delete items');
    return actions.join(', ');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Validating share link...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={() => navigate('/')} variant="contained">
            Go Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!shareToken) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="warning">
            Share link not found.
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 2 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <ShoppingCart sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" gutterBottom>
            You're invited to join a grocery list!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Someone has shared their grocery list with you
          </Typography>
        </Box>

        {/* Share Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {getPermissionIcon(shareToken.settings.permissions)}
              <Box>
                <Typography variant="h6">
                  {getPermissionLabel(shareToken.settings.permissions)} Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getPermissionDescription(shareToken.settings.permissions)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {shareToken.settings.allowAnonymous && (
                <Chip
                  label="Guest access allowed"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
              {shareToken.expiresAt && (
                <Chip
                  label={`Expires ${shareToken.expiresAt.toDate().toLocaleDateString()}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {shareToken.settings.shareMode === 'selected' && (
                <Chip
                  label="Limited items"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Join Options */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {auth.currentUser ? (
            // User is already signed in
            <Button
              variant="contained"
              size="large"
              onClick={handleJoinWithAccount}
              disabled={joining}
              startIcon={joining ? <CircularProgress size={20} /> : <Login />}
              fullWidth
            >
              {joining ? 'Joining...' : 'Join with My Account'}
            </Button>
          ) : (
            // User is not signed in
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login', { state: { returnTo: `/join/${token}` } })}
                startIcon={<Person />}
                fullWidth
              >
                Sign In to Join
              </Button>

              {shareToken.settings.allowAnonymous && (
                <>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    or
                  </Typography>

                  {!showGuestForm ? (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => setShowGuestForm(true)}
                      startIcon={<PersonAdd />}
                      fullWidth
                    >
                      Join as Guest
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Your name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your name"
                        fullWidth
                        autoFocus
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setShowGuestForm(false)}
                          fullWidth
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleJoinAsGuest}
                          disabled={!guestName.trim() || joining}
                          startIcon={joining ? <CircularProgress size={20} /> : <PersonAdd />}
                          fullWidth
                        >
                          {joining ? 'Joining...' : 'Join as Guest'}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Don't trust this link?{' '}
            <Button size="small" onClick={() => navigate('/')}>
              Go to homepage
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
