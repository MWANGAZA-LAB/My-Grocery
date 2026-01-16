// Tests for smartShareService
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { smartShareService } from './smartShareService';

// Mock Firebase
vi.mock('../firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-123' }
  }
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-token-id' }),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000 }),
    fromDate: (date: Date) => ({ toDate: () => date, seconds: date.getTime() / 1000 })
  }
}));

describe('SmartShareService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateShareUrl', () => {
    it('should generate a valid share URL', () => {
      const token = 'abc123xyz';
      const url = smartShareService.generateShareUrl(token);
      
      expect(url).toContain('/join/');
      expect(url).toContain(token);
    });

    it('should use window.location.origin', () => {
      const token = 'test-token';
      const url = smartShareService.generateShareUrl(token);
      
      expect(url).toBe(`${window.location.origin}/join/${token}`);
    });
  });

  describe('createShareToken', () => {
    it('should create a share token with provided settings', async () => {
      const { addDoc } = require('firebase/firestore');
      
      const settings = {
        permissions: {
          canView: true,
          canAddItems: true,
          canEditItems: false,
          canDeleteItems: false,
        },
        expiresIn: '1d' as const,
        shareMode: 'all' as const,
        selectedItems: [],
        allowAnonymous: true,
      };

      const token = await smartShareService.createShareToken(
        'list-123',
        'user-456',
        settings
      );

      expect(addDoc).toHaveBeenCalled();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(32); // Token should be 32 characters
    });

    it('should generate cryptographically secure tokens', async () => {
      const settings = {
        permissions: {
          canView: true,
          canAddItems: false,
          canEditItems: false,
          canDeleteItems: false,
        },
        expiresIn: 'never' as const,
        shareMode: 'all' as const,
        selectedItems: [],
        allowAnonymous: false,
      };

      const token1 = await smartShareService.createShareToken('list-1', 'user-1', settings);
      const token2 = await smartShareService.createShareToken('list-2', 'user-2', settings);

      expect(token1).not.toBe(token2);
    });
  });

  describe('validateShareToken', () => {
    it('should return null for non-existent token', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

      const result = await smartShareService.validateShareToken('non-existent-token');
      
      expect(result).toBeNull();
    });

    it('should return token data for valid token', async () => {
      const { getDocs } = require('firebase/firestore');
      const mockTokenData = {
        id: 'token-doc-id',
        token: 'valid-token',
        listId: 'list-123',
        createdBy: 'user-456',
        settings: {
          permissions: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false },
          expiresIn: '1w',
          shareMode: 'all',
          selectedItems: [],
          allowAnonymous: true,
        },
        usageCount: 0,
        isActive: true,
        expiresAt: { toDate: () => new Date(Date.now() + 86400000) } // Tomorrow
      };

      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: mockTokenData.id,
          data: () => mockTokenData
        }]
      });

      const result = await smartShareService.validateShareToken('valid-token');
      
      expect(result).not.toBeNull();
      expect(result?.token).toBe('valid-token');
      expect(result?.listId).toBe('list-123');
    });

    it('should return null and deactivate expired token', async () => {
      const { getDocs, updateDoc } = require('firebase/firestore');
      const mockTokenData = {
        id: 'token-doc-id',
        token: 'expired-token',
        listId: 'list-123',
        createdBy: 'user-456',
        settings: {
          permissions: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false },
          expiresIn: '1h',
          shareMode: 'all',
          selectedItems: [],
          allowAnonymous: true,
        },
        usageCount: 0,
        isActive: true,
        expiresAt: { toDate: () => new Date(Date.now() - 86400000) } // Yesterday (expired)
      };

      getDocs.mockResolvedValue({
        empty: false,
        docs: [{
          id: mockTokenData.id,
          data: () => mockTokenData,
          ref: { id: mockTokenData.id }
        }]
      });

      const result = await smartShareService.validateShareToken('expired-token');
      
      expect(result).toBeNull();
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('joinListWithToken', () => {
    it('should return error for invalid token', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

      const result = await smartShareService.joinListWithToken('invalid-token', 'user-123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired share token');
    });

    it('should succeed for valid token and add user to list', async () => {
      const { getDocs, getDoc, addDoc, updateDoc } = require('firebase/firestore');
      
      // Mock validateShareToken
      const mockTokenData = {
        id: 'token-doc-id',
        token: 'valid-token',
        listId: 'list-123',
        createdBy: 'owner-456',
        settings: {
          permissions: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false },
          expiresIn: '1w',
          shareMode: 'all',
          selectedItems: [],
          allowAnonymous: true,
        },
        usageCount: 0,
        isActive: true,
        expiresAt: { toDate: () => new Date(Date.now() + 86400000) }
      };

      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: mockTokenData.id, data: () => mockTokenData }]
      });

      // Mock getUserListAccess - user doesn't have access yet
      getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

      // Mock getDoc for list
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ allowedUsers: ['owner-456'] })
      });

      const result = await smartShareService.joinListWithToken('valid-token', 'new-user-789');
      
      expect(result.success).toBe(true);
      expect(result.listId).toBe('list-123');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('getListMembers', () => {
    it('should return empty array for list with no members', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

      const members = await smartShareService.getListMembers('list-123');
      
      expect(members).toEqual([]);
    });

    it('should return array of members for list', async () => {
      const { getDocs } = require('firebase/firestore');
      const mockMembers = [
        {
          id: 'member-1',
          listId: 'list-123',
          userId: 'user-1',
          permissions: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false },
          isGuest: false
        },
        {
          id: 'member-2',
          listId: 'list-123',
          userId: 'user-2',
          permissions: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false },
          isGuest: true,
          guestName: 'Guest User'
        }
      ];

      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: mockMembers.map(m => ({ id: m.id, data: () => m }))
      });

      const members = await smartShareService.getListMembers('list-123');
      
      expect(members).toHaveLength(2);
      expect(members[0].userId).toBe('user-1');
      expect(members[1].guestName).toBe('Guest User');
    });
  });
});
