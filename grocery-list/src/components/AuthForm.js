import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export default function AuthForm({ mode, onSubmit, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" align="center">
        {mode === 'signup' ? 'Sign Up' : 'Log In'}
      </Typography>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <Typography color="error" align="center">{error}</Typography>}
      <Button variant="contained" type="submit" fullWidth>
        {mode === 'signup' ? 'Sign Up' : 'Log In'}
      </Button>
    </Box>
  );
} 