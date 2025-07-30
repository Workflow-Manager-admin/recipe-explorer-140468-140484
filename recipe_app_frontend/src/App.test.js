import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const header = screen.getByText(/Recipe Explorer/i);
  expect(header).toBeInTheDocument();
});
