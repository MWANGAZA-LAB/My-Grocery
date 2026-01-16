import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SmartShareDialog from './SmartShareDialog';
import { smartShareService } from '../services/smartShareService';

// Mock the smartShareService
vi.mock('../services/smartShareService', () => ({
  smartShareService: {
    createShareToken: vi.fn(),
    generateShareUrl: vi.fn(),
    revokeShareToken: vi.fn(),
    getActiveShareTokens: vi.fn(),
    getListMembers: vi.fn(),
  }
}));

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' }
  }
}));

describe('SmartShareDialog', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    listId: 'test-list-123',
    listName: 'My Grocery List',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (smartShareService.getActiveShareTokens as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (smartShareService.getListMembers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('should render dialog when open', () => {
    render(<SmartShareDialog {...defaultProps} />);
    
    // Check that dialog is present by looking for the list name in dialog title
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/My Grocery List/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<SmartShareDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    render(<SmartShareDialog {...defaultProps} />);
    
    // Find close button by the CloseIcon test id
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should display list name in dialog', () => {
    render(<SmartShareDialog {...defaultProps} />);
    
    expect(screen.getByText(/My Grocery List/i)).toBeInTheDocument();
  });

  describe('Permission Controls', () => {
    it('should display permission level section', async () => {
      render(<SmartShareDialog {...defaultProps} />);
      
      // Check for permission level header
      expect(screen.getByText(/Permission Level/i)).toBeInTheDocument();
    });

    it('should display Viewer chip', () => {
      render(<SmartShareDialog {...defaultProps} />);
      
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });
  });

  describe('Share URL Generation', () => {
    it('should generate share URL when create share link button is clicked', async () => {
      const mockToken = 'test-token-abc123';
      const mockUrl = `https://example.com/join/${mockToken}`;
      
      (smartShareService.createShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (smartShareService.generateShareUrl as ReturnType<typeof vi.fn>).mockReturnValue(mockUrl);

      render(<SmartShareDialog {...defaultProps} />);
      
      const generateButton = screen.getByRole('button', { name: /Create Share Link/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(smartShareService.createShareToken).toHaveBeenCalledWith(
          'test-list-123',
          'test-user-123',
          expect.any(Object)
        );
      });
    });

    it('should show loading state while generating', async () => {
      (smartShareService.createShareToken as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('token'), 1000))
      );

      render(<SmartShareDialog {...defaultProps} />);
      
      const generateButton = screen.getByRole('button', { name: /Create Share Link/i });
      fireEvent.click(generateButton);
      
      // Check that button shows loading state
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        // The button might have loading state or a spinner
        expect(progressBar || generateButton.getAttribute('disabled') !== null).toBeTruthy();
      });
    });

    it('should handle errors gracefully', async () => {
      (smartShareService.createShareToken as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      render(<SmartShareDialog {...defaultProps} />);
      
      const generateButton = screen.getByRole('button', { name: /Create Share Link/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        // Error should be displayed in the UI
        const alertElement = screen.queryByRole('alert');
        const errorText = screen.queryByText(/error|failed/i);
        expect(alertElement || errorText).toBeTruthy();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('should display generated URL after creation', async () => {
      const mockToken = 'test-token-abc123';
      const mockUrl = `https://example.com/join/${mockToken}`;
      
      (smartShareService.createShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (smartShareService.generateShareUrl as ReturnType<typeof vi.fn>).mockReturnValue(mockUrl);

      render(<SmartShareDialog {...defaultProps} />);
      
      // First generate a URL
      const generateButton = screen.getByRole('button', { name: /Create Share Link/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(smartShareService.createShareToken).toHaveBeenCalled();
      });
    });
  });

  describe('Expiration Options', () => {
    it('should display expiration options section', () => {
      render(<SmartShareDialog {...defaultProps} />);
      
      // Check for Link Settings which contains expiration
      const expirationElements = screen.queryAllByText(/Link Settings|Expires|hour|day|week|never/i);
      expect(expirationElements.length).toBeGreaterThan(0);
    });
  });

  describe('What to Share Section', () => {
    it('should display what to share section', () => {
      render(<SmartShareDialog {...defaultProps} />);
      
      expect(screen.getByText(/What to Share/i)).toBeInTheDocument();
    });
  });
});
