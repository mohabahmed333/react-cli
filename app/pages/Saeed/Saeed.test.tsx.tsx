import { render, screen } from '@testing-library/react';
import Saeed from './Saeed';

describe('Saeed', () => {
  it('renders', () => {
    render(<Saeed />);
    expect(screen.getByText('Saeed Page')).toBeInTheDocument();
  });
});
