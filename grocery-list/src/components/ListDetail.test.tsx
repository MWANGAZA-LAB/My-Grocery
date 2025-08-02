import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ListDetail from './ListDetail';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: undefined // Return undefined to avoid Firebase calls in test
  }),
  useNavigate: () => jest.fn()
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

describe('ListDetail', () => {
  test('renders without crashing', () => {
    // Test that the component renders without throwing errors
    const { container } = renderWithProviders(<ListDetail />);
    expect(container).toBeInTheDocument();
  });
});
