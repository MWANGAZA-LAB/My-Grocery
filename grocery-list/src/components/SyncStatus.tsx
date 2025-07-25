import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function SyncStatus(): React.ReactElement {
  const [online, setOnline] = useState<boolean>(window.navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
      {!online && (
        <Box sx={{ bgcolor: 'warning.main', color: 'black', py: 0.5, textAlign: 'center' }}>
          <Typography variant="body2">Offline: changes will sync when online</Typography>
        </Box>
      )}
    </Box>
  );
}
