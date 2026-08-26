import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('LostLink foundation shell', () => {
  it('identifies the project without exposing unfinished domain UI', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'LostLink' })).toBeInTheDocument();
    expect(screen.getByText('Service foundation is running.')).toBeInTheDocument();
  });
});
