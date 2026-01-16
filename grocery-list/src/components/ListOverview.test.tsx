import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material';
import ListOverview from './ListOverview';

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
  it('renders without crashing', () => {
    // Test that the component renders without throwing errors
    const { container } = renderWithProviders(<ListOverview />);
    expect(container).toBeInTheDocument();
  });
});
