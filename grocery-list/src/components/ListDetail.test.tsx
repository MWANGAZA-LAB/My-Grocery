import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material';
import ListDetail from './ListDetail';

// Mock react-router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({
      id: undefined // Return undefined to avoid Firebase calls in test
    }),
    useNavigate: () => vi.fn()
  };
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('ListDetail', () => {
  it('renders without crashing', () => {
    // Test that the component renders without throwing errors
    const { container } = renderWithProviders(<ListDetail />);
    expect(container).toBeInTheDocument();
  });
});
