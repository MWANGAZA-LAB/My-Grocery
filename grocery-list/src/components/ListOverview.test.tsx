import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ListOverview from './ListOverview';

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid' }
  },
  db: {}
}));

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

describe('ListOverview', () => {
  test('renders without crashing', () => {
    renderWithProviders(<ListOverview />);
    // Component should render without throwing errors
    expect(document.body).toBeInTheDocument();
  });
});
