import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import JoinListPage from './JoinListPage';
import { smartShareService } from '../services/smartShareService';

// Mock the smartShareService
vi.mock('../services/smartShareService', () => ({
  smartShareService: {
    validateShareToken: vi.fn(),
    joinListWithToken: vi.fn(),
  }
}));

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' }
  }
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon-user-123' } })
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('JoinListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (token: string) => {
    return render(
      <MemoryRouter initialEntries={[`/join/${token}`]}>
        <Routes>
          <Route path="/join/:token" element={<JoinListPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should show loading state initially', () => {
    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves - stays in loading
    );

    renderWithRouter('test-token');
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error for invalid token', async () => {
    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    renderWithRouter('invalid-token');
    
    await waitFor(() => {
      expect(screen.getByText(/invalid|expired/i)).toBeInTheDocument();
    });
  });

  it('should display token info for valid token', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false },
        allowAnonymous: true,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      // Should show the invitation message
      expect(screen.getByText(/invited to join/i)).toBeInTheDocument();
    });
  });

  it('should show Join with My Account button when user is logged in', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: { canView: true, canAddItems: true },
        allowAnonymous: false,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Join with My Account/i })).toBeInTheDocument();
    });
  });

  it('should call joinListWithToken when Join button is clicked', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: { canView: true, canAddItems: true },
        allowAnonymous: false,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);
    (smartShareService.joinListWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      listId: 'list-123'
    });

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Join with My Account/i })).toBeInTheDocument();
    });

    const joinButton = screen.getByRole('button', { name: /Join with My Account/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(smartShareService.joinListWithToken).toHaveBeenCalledWith(
        'valid-token',
        'test-user-123',
        false
      );
    });
  });

  it('should navigate to list after successful join', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: { canView: true },
        allowAnonymous: false,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);
    (smartShareService.joinListWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      listId: 'list-123'
    });

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Join with My Account/i })).toBeInTheDocument();
    });

    const joinButton = screen.getByRole('button', { name: /Join with My Account/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/list/list-123');
    });
  });

  it('should show error when join fails', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: { canView: true },
        allowAnonymous: false,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);
    (smartShareService.joinListWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: 'Failed to join list'
    });

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Join with My Account/i })).toBeInTheDocument();
    });

    const joinButton = screen.getByRole('button', { name: /Join with My Account/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to join list/i)).toBeInTheDocument();
    });
  });

  it('should display permissions info', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: {
          canView: true,
          canAddItems: true,
          canEditItems: false,
          canDeleteItems: false
        },
        allowAnonymous: false,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      // Should show permission level (e.g., "Viewer Access")
      const accessText = screen.queryByText(/Access/i) || screen.queryByText(/View items/i);
      expect(accessText).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter('error-token');
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to validate share link/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should show go to homepage link', async () => {
    const mockTokenData = {
      token: 'valid-token',
      listId: 'list-123',
      settings: {
        permissions: { canView: true },
        allowAnonymous: false,
      }
    };

    (smartShareService.validateShareToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenData);

    renderWithRouter('valid-token');
    
    await waitFor(() => {
      expect(screen.getByText(/Go to homepage/i)).toBeInTheDocument();
    });
  });
});
