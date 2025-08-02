import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import {
  ContentCopy,
  Share,
  QrCode,
  Email,
  Sms,
  Link as LinkIcon,
  Close,
  Visibility,
  Edit,
  AdminPanelSettings,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

interface SmartShareDialogProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  items: Array<{ id: string; text: string; done: boolean; category?: string }>;
}

interface SharePermissions {
  canView: boolean;
  canAddItems: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
}

interface ShareSettings {
  permissions: SharePermissions;
  expiresIn: '1h' | '1d' | '1w' | 'never';
  shareMode: 'all' | 'selected';
  selectedItems: string[];
  allowAnonymous: boolean;
  maxUses?: number;
}

export default function SmartShareDialog({ 
  open, 
  onClose, 
  listId, 
  listName, 
  items 
}: SmartShareDialogProps): React.ReactElement {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    permissions: {
      canView: true,
      canAddItems: true,
      canEditItems: false,
      canDeleteItems: false,
    },
    expiresIn: '1w',
    shareMode: 'all',
    selectedItems: [],
    allowAnonymous: true,
  });

  const [shareLink, setShareLink] = useState<string>('');
  const [showQR, setShowQR] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Generate smart share link
  const generateShareLink = async (): Promise<string> => {
    // In real implementation, this would call your backend API
    const shareToken = generateToken();
    const baseUrl = window.location.origin;
    
    // Create share record in database
    await createShareRecord({
      token: shareToken,
      listId,
      settings: shareSettings,
      createdAt: new Date(),
    });

    return `${baseUrl}/join/${shareToken}`;
  };

  const generateToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const createShareRecord = async (record: any): Promise<void> => {
    // Mock API call - replace with actual Firebase/backend call
    console.log('Creating share record:', record);
  };

  const handleCreateLink = async (): Promise<void> => {
    try {
      const link = await generateShareLink();
      setShareLink(link);
      setSnackbar({
        open: true,
        message: 'Share link created successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create share link',
        severity: 'error'
      });
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        severity: 'error'
      });
    }
  };

  const handleShareVia = (method: 'sms' | 'email' | 'native'): void => {
    const text = `Join my grocery list "${listName}": ${shareLink}`;
    
    switch (method) {
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(text)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Grocery List: ${listName}`)}&body=${encodeURIComponent(text)}`);
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: `Grocery List: ${listName}`,
            text: `Join my grocery list "${listName}"`,
            url: shareLink,
          });
        }
        break;
    }
  };

  const getPermissionPreset = (): string => {
    const { canView, canAddItems, canEditItems, canDeleteItems } = shareSettings.permissions;
    
    if (canView && !canAddItems && !canEditItems && !canDeleteItems) return 'Viewer';
    if (canView && canAddItems && canEditItems && !canDeleteItems) return 'Editor';
    if (canView && canAddItems && canEditItems && canDeleteItems) return 'Admin';
    return 'Custom';
  };

  const setPermissionPreset = (preset: 'viewer' | 'editor' | 'admin'): void => {
    const presets = {
      viewer: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false },
      editor: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: false },
      admin: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true },
    };
    
    setShareSettings(prev => ({
      ...prev,
      permissions: presets[preset]
    }));
  };

  const handleItemSelection = (itemId: string): void => {
    setShareSettings(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId]
    }));
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Share color="primary" />
            <Typography variant="h6">Share "{listName}"</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Quick Permission Presets */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permission Level
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['viewer', 'editor', 'admin'].map((preset) => (
                <Chip
                  key={preset}
                  label={preset.charAt(0).toUpperCase() + preset.slice(1)}
                  onClick={() => setPermissionPreset(preset as any)}
                  color={getPermissionPreset().toLowerCase() === preset ? 'primary' : 'default'}
                  variant={getPermissionPreset().toLowerCase() === preset ? 'filled' : 'outlined'}
                  icon={
                    preset === 'viewer' ? <Visibility /> :
                    preset === 'editor' ? <Edit /> : <AdminPanelSettings />
                  }
                />
              ))}
            </Box>
          </Box>

          {/* Share Settings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Share Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shareSettings.allowAnonymous}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, allowAnonymous: e.target.checked }))}
                  />
                }
                label="Allow access without account"
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Expires in:</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    { value: '1h', label: '1 Hour' },
                    { value: '1d', label: '1 Day' },
                    { value: '1w', label: '1 Week' },
                    { value: 'never', label: 'Never' }
                  ].map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      size="small"
                      onClick={() => setShareSettings(prev => ({ ...prev, expiresIn: option.value as any }))}
                      color={shareSettings.expiresIn === option.value ? 'primary' : 'default'}
                      variant={shareSettings.expiresIn === option.value ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Item Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              What to Share
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label="All Items"
                onClick={() => setShareSettings(prev => ({ ...prev, shareMode: 'all' }))}
                color={shareSettings.shareMode === 'all' ? 'primary' : 'default'}
                variant={shareSettings.shareMode === 'all' ? 'filled' : 'outlined'}
              />
              <Chip
                label="Selected Items"
                onClick={() => setShareSettings(prev => ({ ...prev, shareMode: 'selected' }))}
                color={shareSettings.shareMode === 'selected' ? 'primary' : 'default'}
                variant={shareSettings.shareMode === 'selected' ? 'filled' : 'outlined'}
              />
            </Box>

            {shareSettings.shareMode === 'selected' && (
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <List dense>
                  {items.map((item) => (
                    <ListItem key={item.id} button onClick={() => handleItemSelection(item.id)}>
                      <ListItemIcon>
                        <Checkbox
                          checked={shareSettings.selectedItems.includes(item.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        secondary={item.category}
                        sx={{ textDecoration: item.done ? 'line-through' : 'none' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Generate/Share Link Section */}
          {!shareLink ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCreateLink}
              startIcon={<LinkIcon />}
              sx={{ mb: 2 }}
            >
              Create Share Link
            </Button>
          ) : (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Share Link Created!
              </Typography>
              
              <TextField
                fullWidth
                value={shareLink}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton onClick={handleCopyLink}>
                      <ContentCopy />
                    </IconButton>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Quick Share Actions */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  onClick={handleCopyLink}
                  size="small"
                >
                  Copy
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Sms />}
                  onClick={() => handleShareVia('sms')}
                  size="small"
                >
                  SMS
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => handleShareVia('email')}
                  size="small"
                >
                  Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCode />}
                  onClick={() => setShowQR(!showQR)}
                  size="small"
                >
                  QR Code
                </Button>
                {navigator.share && (
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={() => handleShareVia('native')}
                    size="small"
                  >
                    Share
                  </Button>
                )}
              </Box>

              {/* QR Code */}
              {showQR && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <QRCodeSVG value={shareLink} size={150} />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
