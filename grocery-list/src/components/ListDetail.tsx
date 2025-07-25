import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { List, ListItem, ListItemText, Checkbox, IconButton, TextField, Button, Box, Typography, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { GroceryItem, GroceryList } from '../types';

export default function ListDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [list, setList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>('');
  const [newQty, setNewQty] = useState<string>('');
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteError, setInviteError] = useState<string>('');
  const [showQR, setShowQR] = useState<boolean>(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;
    const unsubItems = onSnapshot(
      query(collection(db, 'lists', id, 'items'), orderBy('updatedAt', 'desc')),
      snap => setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem)))
    );
    const unsubList = onSnapshot(doc(db, 'lists', id), docSnap => {
      if (docSnap.exists()) {
        setList({ id: docSnap.id, ...docSnap.data() } as GroceryList);
      }
      setLoading(false);
    });
    return () => { unsubItems(); unsubList(); };
  }, [id]);

  // Helper to update progress field in parent list doc
  const updateProgress = async (): Promise<void> => {
    if (!id) return;
    const itemsSnap = await getDocs(collection(db, 'lists', id, 'items'));
    const items = itemsSnap.docs.map(d => d.data());
    const total = items.length;
    const checked = items.filter(i => i.done).length;
    await updateDoc(doc(db, 'lists', id), { progress: { checked, total } });
  };

  const handleCheck = async (item: GroceryItem): Promise<void> => {
    if (!id) return;
    await updateDoc(doc(db, 'lists', id, 'items', item.id), {
      done: !item.done,
      updatedAt: serverTimestamp(),
    });
    await updateProgress();
  };

  const handleDelete = async (item: GroceryItem): Promise<void> => {
    if (!id) return;
    await deleteDoc(doc(db, 'lists', id, 'items', item.id));
    await updateProgress();
  };

  const handleAdd = async (): Promise<void> => {
    if (!newText || !id || !user) return;
    await addDoc(collection(db, 'lists', id, 'items'), {
      text: newText,
      quantity: newQty,
      done: false,
      addedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
    setNewText('');
    setNewQty('');
    setAddOpen(false);
    await updateProgress();
  };

  const handleArchive = async (): Promise<void> => {
    if (!id) return;
    await updateDoc(doc(db, 'lists', id), {
      archived: true,
      updatedAt: serverTimestamp(),
    });
    navigate('/');
  };

  const handleInvite = async (): Promise<void> => {
    if (!id || !list) return;
    setInviteError('');
    if (!inviteEmail) return;
    // Look up user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', inviteEmail));
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
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  if (!list) return <Typography align="center" sx={{ mt: 4 }}>List not found</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h5" align="center" gutterBottom>{list.name}</Typography>
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
      <Button startIcon={<AddIcon />} variant="contained" fullWidth onClick={() => setAddOpen(true)} sx={{ mt: 2 }}>Add Item</Button>
      <Button startIcon={<ArchiveIcon />} variant="outlined" fullWidth onClick={handleArchive} sx={{ mt: 1 }} disabled={list.archived}>Archive List</Button>
      <Button startIcon={<PersonAddIcon />} variant="outlined" fullWidth onClick={() => setShareOpen(true)} sx={{ mt: 1 }} disabled={list.archived || list.ownerId !== user?.uid}>Share List</Button>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item name"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity (optional)"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
        <DialogTitle>Share List</DialogTitle>
        <DialogContent>
          <TextField
            label="User email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
          />
          {inviteError && <Typography color="error">{inviteError}</Typography>}
          <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setShowQR(q => !q)}>
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
          {showQR && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <QRCodeSVG value={window.location.origin + '/list/' + id} size={180} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareOpen(false)}>Cancel</Button>
          <Button onClick={handleInvite} variant="contained">Invite</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
