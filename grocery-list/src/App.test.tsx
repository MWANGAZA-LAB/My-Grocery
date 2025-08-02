import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders grocery app', () => {
    // Test that the app renders without crashing
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
