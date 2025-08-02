import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ListDetail from './ListDetail';

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid' }
  },
  db: {}
}));

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test-list-id'
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
    renderWithProviders(<ListDetail />);
    // Component should render without throwing errors
    expect(document.body).toBeInTheDocument();
  });
});
