import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Typography, Button, Box, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import QRScanner from './QRScanner';
import { QRCodeSVG } from 'qrcode.react';

export default function ListOverview() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [progress, setProgress] = useState({}); // { [listId]: { checked, total } }
  const [showArchived, setShowArchived] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanError, setScanError] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [qrListId, setQrListId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'lists'),
      where('allowedUsers', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const listsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(listsData);
      // Use progress field from list doc
      const progressObj = {};
      listsData.forEach(list => {
        progressObj[list.id] = list.progress || { checked: 0, total: 0 };
      });
      setProgress(progressObj);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async () => {
    const name = prompt('List name?');
    if (!name) return;
    await addDoc(collection(db, 'lists'), {
      name,
      ownerId: user.uid,
      allowedUsers: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      archived: false
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" align="center" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold', fontStyle: 'italic' }}>
        <b><i>Share. Shop. Sync. Simple.</i></b>
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>My Lists</Typography>
        <Button startIcon={<FilterListIcon />} onClick={() => setShowArchived(a => !a)} size="small">
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </Box>
      <Button startIcon={<AddIcon />} variant="contained" fullWidth onClick={handleAdd} sx={{ mb: 2 }}>Add List</Button>
      <Button variant="outlined" fullWidth sx={{ mb: 2 }} onClick={() => setScanOpen(true)}>Scan QR</Button>
      {loading ? <Typography align="center">Loading...</Typography> :
        <List>
          {lists.filter(list => showArchived ? list.archived : !list.archived).map(list => (
            <ListItem key={list.id} button onClick={() => navigate(`/list/${list.id}`)}>
              <ListItemText
                primary={list.name}
                secondary={
                  list.archived ? 'Archived' :
                    (progress[list.id] ? `${progress[list.id].checked}/${progress[list.id].total} items checked` : '')
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ width: 60 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress[list.id] && progress[list.id].total > 0 ? (progress[list.id].checked / progress[list.id].total) * 100 : 0}
                  />
                </Box>
                <Button size="small" variant="outlined" sx={{ ml: 1 }} onClick={e => { e.stopPropagation(); setQrListId(list.id); setQrOpen(true); }}>Show QR</Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      }
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
        <DialogTitle>Share List via QR Code</DialogTitle>
        <DialogContent>
          {qrListId && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <QRCodeSVG value={window.location.origin + '/list/' + qrListId} size={180} />
              <Typography variant="body2" sx={{ mt: 2 }}>Let another user scan this code to join and collaborate on your list.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={scanOpen} onClose={() => setScanOpen(false)}>
        <DialogTitle>Scan QR Code to Join List</DialogTitle>
        <DialogContent>
          <QRScanner
            onScan={async data => {
              setScanOpen(false);
              setScanError('');
              // Extract listId from URL
              const match = data.match(/\/list\/(\w+)/);
              if (match) {
                const listId = match[1];
                // Check and add user to allowedUsers if needed
                const listRef = doc(db, 'lists', listId);
                const listSnap = await getDoc(listRef);
                if (listSnap.exists()) {
                  const listData = listSnap.data();
                  if (!listData.allowedUsers.includes(user.uid)) {
                    await updateDoc(listRef, { allowedUsers: [...listData.allowedUsers, user.uid] });
                  }
                  navigate(`/list/${listId}`);
                } else {
                  setScanError('List not found');
                }
              } else {
                setScanError('Invalid QR code');
              }
            }}
            onError={err => {
              if (typeof err === 'string' && err.includes('NotFoundException')) {
                setScanError('Point your camera at a QR code to join a list.');
              } else {
                setScanError(typeof err === 'string' ? err : err.message);
              }
            }}
            width={300}
            height={300}
          />
          {scanError && <Typography color="error">{scanError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 