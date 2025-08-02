import { db } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface SharePermissions {
  canView: boolean;
  canAddItems: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
}

export interface ShareSettings {
  permissions: SharePermissions;
  expiresIn: '1h' | '1d' | '1w' | 'never';
  shareMode: 'all' | 'selected';
  selectedItems: string[];
  allowAnonymous: boolean;
  maxUses?: number;
}

export interface ShareToken {
  id: string;
  token: string;
  listId: string;
  createdBy: string;
  settings: ShareSettings;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  usageCount: number;
  isActive: boolean;
}

export interface ShareMember {
  id: string;
  listId: string;
  userId: string;
  joinedAt: Timestamp;
  joinedVia: 'token' | 'email' | 'qr';
  permissions: SharePermissions;
  isGuest: boolean;
  guestName?: string;
}

class SmartShareService {
  
  /**
   * Generate a secure, unique share token
   */
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Calculate expiration timestamp based on duration
   */
  private getExpirationTime(expiresIn: string): Timestamp | undefined {
    if (expiresIn === 'never') return undefined;
    
    const now = new Date();
    switch (expiresIn) {
      case '1h':
        now.setHours(now.getHours() + 1);
        break;
      case '1d':
        now.setDate(now.getDate() + 1);
        break;
      case '1w':
        now.setDate(now.getDate() + 7);
        break;
    }
    
    return Timestamp.fromDate(now);
  }

  /**
   * Create a new share token for a list
   */
  async createShareToken(
    listId: string, 
    createdBy: string, 
    settings: ShareSettings
  ): Promise<string> {
    const token = this.generateToken();
    const expiresAt = this.getExpirationTime(settings.expiresIn);

    const shareTokenData: Omit<ShareToken, 'id'> = {
      token,
      listId,
      createdBy,
      settings,
      createdAt: serverTimestamp() as Timestamp,
      expiresAt,
      usageCount: 0,
      isActive: true,
    };

    await addDoc(collection(db, 'shareTokens'), shareTokenData);
    return token;
  }

  /**
   * Validate and retrieve share token information
   */
  async validateShareToken(token: string): Promise<ShareToken | null> {
    const q = query(
      collection(db, 'shareTokens'),
      where('token', '==', token),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const tokenDoc = snapshot.docs[0];
    const tokenData = { id: tokenDoc.id, ...tokenDoc.data() } as ShareToken;

    // Check expiration
    if (tokenData.expiresAt && tokenData.expiresAt.toDate() < new Date()) {
      await this.deactivateToken(token);
      return null;
    }

    // Check usage limits
    if (tokenData.settings.maxUses && tokenData.usageCount >= tokenData.settings.maxUses) {
      await this.deactivateToken(token);
      return null;
    }

    return tokenData;
  }

  /**
   * Join a list using a share token
   */
  async joinListWithToken(
    token: string, 
    userId: string, 
    isGuest: boolean = false,
    guestName?: string
  ): Promise<{ success: boolean; listId?: string; error?: string }> {
    const shareToken = await this.validateShareToken(token);
    
    if (!shareToken) {
      return { success: false, error: 'Invalid or expired share token' };
    }

    // Check if user already has access
    const existingMember = await this.getUserListAccess(shareToken.listId, userId);
    if (existingMember) {
      return { success: true, listId: shareToken.listId };
    }

    // Add user to list members
    const memberData: Omit<ShareMember, 'id'> = {
      listId: shareToken.listId,
      userId,
      joinedAt: serverTimestamp() as Timestamp,
      joinedVia: 'token',
      permissions: shareToken.settings.permissions,
      isGuest,
      guestName,
    };

    await addDoc(collection(db, 'listMembers'), memberData);

    // Update token usage count
    const tokenDocRef = doc(db, 'shareTokens', shareToken.id);
    await updateDoc(tokenDocRef, {
      usageCount: shareToken.usageCount + 1
    });

    // Update list allowedUsers for backward compatibility
    const listDoc = await getDoc(doc(db, 'lists', shareToken.listId));
    if (listDoc.exists()) {
      const listData = listDoc.data();
      const allowedUsers = listData.allowedUsers || [];
      if (!allowedUsers.includes(userId)) {
        await updateDoc(doc(db, 'lists', shareToken.listId), {
          allowedUsers: [...allowedUsers, userId],
          updatedAt: serverTimestamp()
        });
      }
    }

    return { success: true, listId: shareToken.listId };
  }

  /**
   * Check if user has access to a list
   */
  async getUserListAccess(listId: string, userId: string): Promise<ShareMember | null> {
    const q = query(
      collection(db, 'listMembers'),
      where('listId', '==', listId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const memberDoc = snapshot.docs[0];
    return { id: memberDoc.id, ...memberDoc.data() } as ShareMember;
  }

  /**
   * Get all active share tokens for a list
   */
  async getListShareTokens(listId: string): Promise<ShareToken[]> {
    const q = query(
      collection(db, 'shareTokens'),
      where('listId', '==', listId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShareToken));
  }

  /**
   * Deactivate a share token
   */
  async deactivateToken(token: string): Promise<void> {
    const q = query(
      collection(db, 'shareTokens'),
      where('token', '==', token)
    );

    const snapshot = await getDocs(q);
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, { isActive: false });
    }
  }

  /**
   * Remove user access from a list
   */
  async removeUserAccess(listId: string, userId: string): Promise<void> {
    // Remove from listMembers
    const memberQuery = query(
      collection(db, 'listMembers'),
      where('listId', '==', listId),
      where('userId', '==', userId)
    );

    const memberSnapshot = await getDocs(memberQuery);
    for (const doc of memberSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Remove from list allowedUsers
    const listDoc = await getDoc(doc(db, 'lists', listId));
    if (listDoc.exists()) {
      const listData = listDoc.data();
      const allowedUsers = (listData.allowedUsers || []).filter((id: string) => id !== userId);
      await updateDoc(doc(db, 'lists', listId), {
        allowedUsers,
        updatedAt: serverTimestamp()
      });
    }
  }

  /**
   * Get all members of a list
   */
  async getListMembers(listId: string): Promise<ShareMember[]> {
    const q = query(
      collection(db, 'listMembers'),
      where('listId', '==', listId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShareMember));
  }

  /**
   * Update user permissions for a list
   */
  async updateUserPermissions(
    listId: string, 
    userId: string, 
    permissions: SharePermissions
  ): Promise<void> {
    const memberQuery = query(
      collection(db, 'listMembers'),
      where('listId', '==', listId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(memberQuery);
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, { permissions });
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'shareTokens'),
      where('expiresAt', '<=', now),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, { isActive: false });
    }
  }

  /**
   * Generate shareable URL for a token
   */
  generateShareUrl(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${token}`;
  }

  /**
   * Create anonymous user session for guest access
   */
  async createGuestSession(guestName: string): Promise<string> {
    // This would integrate with Firebase Auth for anonymous authentication
    // For now, return a mock guest user ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // In real implementation, you would:
    // const result = await signInAnonymously(auth);
    // return result.user.uid;
    
    return guestId;
  }
}

// Export singleton instance
export const smartShareService = new SmartShareService();

// Export utility functions
export const createShareLink = async (
  listId: string,
  createdBy: string,
  settings: ShareSettings
): Promise<string> => {
  const token = await smartShareService.createShareToken(listId, createdBy, settings);
  return smartShareService.generateShareUrl(token);
};

export const joinViaShareLink = async (
  token: string,
  userId?: string,
  guestName?: string
): Promise<{ success: boolean; listId?: string; error?: string }> => {
  let actualUserId = userId;
  let isGuest = false;

  // If no user ID provided, create guest session
  if (!actualUserId && guestName) {
    actualUserId = await smartShareService.createGuestSession(guestName);
    isGuest = true;
  }

  if (!actualUserId) {
    return { success: false, error: 'User authentication required' };
  }

  return smartShareService.joinListWithToken(token, actualUserId, isGuest, guestName);
};
