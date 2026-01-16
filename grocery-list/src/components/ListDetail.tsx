import React, { useEffect, useState, useCallback } from 'react';
import { db, auth } from '../firebase';
import { doc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, where, FirestoreError } from 'firebase/firestore';
import { List, ListItem, ListItemText, Checkbox, IconButton, TextField, Button, Box, Typography, Dialog, DialogTitle, DialogActions, DialogContent, Snackbar, Alert, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useParams, useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import { GroceryItem, GroceryList } from '../types';
import SmartShareDialog from './SmartShareDialog';
import { validateItemText, validateQuantity, validateEmail } from '../utils/validation';
import { debounce } from '../utils/rateLimiter';

export default function ListDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [list, setList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>('');
  const [newQty, setNewQty] = useState<string>('');
  const [smartShareOpen, setSmartShareOpen] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteError, setInviteError] = useState<string>('');
  const [showQR, setShowQR] = useState<boolean>(false);
  const [isNewList, setIsNewList] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [itemValidationError, setItemValidationError] = useState<string>('');
  const [qtyValidationError, setQtyValidationError] = useState<string>('');
  const [emailValidationError, setEmailValidationError] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;
    const unsubItems = onSnapshot(
      query(collection(db, 'lists', id, 'items'), orderBy('updatedAt', 'desc')),
      snap => {
        const itemsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
        setItems(itemsData);
      }
    );
    const unsubList = onSnapshot(doc(db, 'lists', id), docSnap => {
      if (docSnap.exists()) {
        setList({ id: docSnap.id, ...docSnap.data() } as GroceryList);
      }
      setLoading(false);
    });
    return () => { unsubItems(); unsubList(); };
  }, [id]);

  // Separate effect for handling new list auto-open
  useEffect(() => {
    if (!list || loading || items.length > 0 || addOpen) return;
    
    const listAge = list.createdAt?.toDate?.() || new Date();
    const isRecentlyCreated = (Date.now() - listAge.getTime()) < 30000; // Within 30 seconds
    
    if (isRecentlyCreated) {
      setIsNewList(true);
      setAddOpen(true);
    }
  }, [list, loading, items.length, addOpen]);

  // Debounced progress update to prevent rapid Firebase calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateProgress = useCallback(
    debounce(async () => {
      if (!id) return;
      try {
        const itemsSnap = await getDocs(collection(db, 'lists', id, 'items'));
        const itemsData = itemsSnap.docs.map(d => d.data());
        const total = itemsData.length;
        const checked = itemsData.filter(i => i.done).length;
        await updateDoc(doc(db, 'lists', id), { progress: { checked, total } });
      } catch (error) {
        // Progress update failed - non-critical, just log
      }
    }, 500),
    [id]
  );

  const handleCheck = async (item: GroceryItem): Promise<void> => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'lists', id, 'items', item.id), {
        done: !item.done,
        updatedAt: serverTimestamp(),
      });
      debouncedUpdateProgress();
    } catch (error) {
      const message = error instanceof FirestoreError ? error.message : 'Failed to update item';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDelete = async (item: GroceryItem): Promise<void> => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'lists', id, 'items', item.id));
      debouncedUpdateProgress();
      setSnackbar({ open: true, message: 'Item deleted', severity: 'success' });
    } catch (error) {
      const message = error instanceof FirestoreError ? error.message : 'Failed to delete item';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleAdd = async (): Promise<void> => {
    // Validate inputs
    const textValidation = validateItemText(newText);
    if (!textValidation.isValid) {
      setItemValidationError(textValidation.error || 'Invalid item name');
      return;
    }
    
    const qtyValidation = validateQuantity(newQty);
    if (!qtyValidation.isValid) {
      setQtyValidationError(qtyValidation.error || 'Invalid quantity');
      return;
    }

    if (!id || !user) return;
    
    setIsAdding(true);
    setItemValidationError('');
    setQtyValidationError('');
    
    try {
      await addDoc(collection(db, 'lists', id, 'items'), {
        text: newText.trim(),
        quantity: newQty.trim(),
        done: false,
        addedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      setNewText('');
      setNewQty('');
      setAddOpen(false);
      setIsNewList(false);
      debouncedUpdateProgress();
      setSnackbar({ open: true, message: 'Item added!', severity: 'success' });
    } catch (error) {
      const message = error instanceof FirestoreError ? error.message : 'Failed to add item';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleArchive = async (): Promise<void> => {
    if (!id) return;
    setIsArchiving(true);
    try {
      await updateDoc(doc(db, 'lists', id), {
        archived: true,
        updatedAt: serverTimestamp(),
      });
      setSnackbar({ open: true, message: 'List archived', severity: 'success' });
      navigate('/');
    } catch (error) {
      const message = error instanceof FirestoreError ? error.message : 'Failed to archive list';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleInvite = async (): Promise<void> => {
    if (!id || !list) return;
    
    // Validate email
    const emailValidation = validateEmail(inviteEmail);
    if (!emailValidation.isValid) {
      setEmailValidationError(emailValidation.error || 'Invalid email');
      return;
    }
    
    setInviteError('');
    setEmailValidationError('');
    setIsInviting(true);
    
    try {
      // Look up user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', inviteEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setInviteError('No user found with that email');
        return;
      }
      
      const userDoc = snap.docs[0];
      const userId = userDoc.id;
      
      if (list.allowedUsers.includes(userId)) {
        setInviteError('User already has access');
        return;
      }
      
      await updateDoc(doc(db, 'lists', id), {
        allowedUsers: [...list.allowedUsers, userId],
        updatedAt: serverTimestamp(),
      });
      
      setShareOpen(false);
      setInviteEmail('');
      setSnackbar({ open: true, message: 'User invited successfully!', severity: 'success' });
    } catch (error) {
      const message = error instanceof FirestoreError ? error.message : 'Failed to invite user';
      setInviteError(message);
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  if (!list) return <Typography align="center" sx={{ mt: 4 }}>List not found</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h5" align="center" gutterBottom>{list.name}</Typography>
      
      {/* Welcome message for new empty lists */}
      {items.length === 0 && isNewList && (
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3, 
          p: 3, 
          backgroundColor: 'success.dark', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'success.main'
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            🎉 List Created Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start adding items to your grocery list. Click "Add Item" below to get started!
          </Typography>
        </Box>
      )}
      
      {/* Empty state for lists without items */}
      {items.length === 0 && !isNewList && (
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3, 
          p: 3, 
          backgroundColor: 'grey.900', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.700'
        }}>
          <Typography variant="h6" gutterBottom>
            📝 Empty List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This list is empty. Add some items to get started!
          </Typography>
        </Box>
      )}
      <List>
        {items.map(item => (
          <ListItem key={item.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleDelete(item)}><DeleteIcon /></IconButton>
          }>
            <Checkbox checked={!!item.done} onChange={() => handleCheck(item)} />
            <ListItemText
              primary={item.text}
              secondary={item.quantity ? `Qty: ${item.quantity}` : ''}
              sx={{ textDecoration: item.done ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>
      
      {/* Prominent Add Item button for empty lists */}
      {items.length === 0 ? (
        <Button 
          startIcon={<AddIcon />} 
          variant="contained" 
          size="large"
          fullWidth 
          onClick={() => setAddOpen(true)} 
          sx={{ 
            mt: 2, 
            mb: 2,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          🛒 Add Your First Item
        </Button>
      ) : (
        <Button 
          startIcon={<AddIcon />} 
          variant="contained" 
          fullWidth 
          onClick={() => setAddOpen(true)} 
          sx={{ mt: 2 }}
        >
          Add Item
        </Button>
      )}
      
      <Button startIcon={isArchiving ? <CircularProgress size={20} /> : <ArchiveIcon />} variant="outlined" fullWidth onClick={handleArchive} sx={{ mt: 1 }} disabled={list.archived || isArchiving}>{isArchiving ? 'Archiving...' : 'Archive List'}</Button>
      <Button startIcon={<PersonAddIcon />} variant="outlined" fullWidth onClick={() => setSmartShareOpen(true)} sx={{ mt: 1 }} disabled={list.archived || list.ownerId !== user?.uid}>Smart Share</Button>
      <Button startIcon={<PersonAddIcon />} variant="outlined" fullWidth onClick={() => setShareOpen(true)} sx={{ mt: 1 }} disabled={list.archived || list.ownerId !== user?.uid}>Legacy Share</Button>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {items.length === 0 ? "🛒 Add Your First Item" : "Add Item"}
        </DialogTitle>
        <DialogContent>
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start building your grocery list! Add items with optional quantities.
            </Typography>
          )}
          <TextField
            label="Item name"
            value={newText}
            onChange={(e) => { setNewText(e.target.value); setItemValidationError(''); }}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
            error={!!itemValidationError}
            helperText={itemValidationError}
            disabled={isAdding}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            label="Quantity (optional)"
            value={newQty}
            onChange={(e) => { setNewQty(e.target.value); setQtyValidationError(''); }}
            fullWidth
            error={!!qtyValidationError}
            helperText={qtyValidationError}
            disabled={isAdding}
            inputProps={{ maxLength: 50 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddOpen(false); setItemValidationError(''); setQtyValidationError(''); }} disabled={isAdding}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={isAdding || !newText.trim()}>
            {isAdding ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Smart Share Dialog */}
      <SmartShareDialog
        open={smartShareOpen}
        onClose={() => setSmartShareOpen(false)}
        listId={id!}
        listName={list.name}
        items={items}
      />

      <Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
        <DialogTitle>Share List</DialogTitle>
        <DialogContent>
          <TextField
            label="User email"
            value={inviteEmail}
            onChange={(e) => { setInviteEmail(e.target.value); setEmailValidationError(''); setInviteError(''); }}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
            error={!!emailValidationError || !!inviteError}
            helperText={emailValidationError || inviteError}
            disabled={isInviting}
            type="email"
          />
          <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setShowQR(q => !q)}>
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
          {showQR && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
              <QRCodeSVG value={window.location.origin + (process.env.PUBLIC_URL || '') + '/list/' + id} size={180} level="M" includeMargin />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShareOpen(false); setEmailValidationError(''); setInviteError(''); }} disabled={isInviting}>Cancel</Button>
          <Button onClick={handleInvite} variant="contained" disabled={isInviting || !inviteEmail.trim()}>
            {isInviting ? <CircularProgress size={20} /> : 'Invite'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
