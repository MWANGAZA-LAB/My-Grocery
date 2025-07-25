import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface GroceryItem {
  id: string;
  text: string;
  quantity: string;
  done: boolean;
  addedBy: string;
  updatedAt: Timestamp;
}

export interface GroceryList {
  id: string;
  name: string;
  ownerId: string;
  allowedUsers: string[];
  archived?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  progress?: {
    checked: number;
    total: number;
  };
}

export interface AppUser extends User {
  // Additional properties can be added here if needed
}

export interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError: (error: string) => void;
  width?: number;
  height?: number;
}

export interface HomeProps {
  user: AppUser | null;
}

export interface Progress {
  [listId: string]: {
    checked: number;
    total: number;
  };
}
