import { render, screen } from '@testing-library/react';
import dasdas from './dasdas';

describe('dasdas', () => {
  it('renders', () => {
    render(<dasdas />);
    expect(screen.getByText('dasdas Page')).toBeInTheDocument();
  });
});
