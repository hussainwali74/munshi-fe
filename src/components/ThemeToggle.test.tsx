
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '@/context/ThemeContext';

describe('ThemeToggle', () => {
  it('renders toggle buttons', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByTitle('Light Mode')).toBeInTheDocument();
    expect(screen.getByTitle('Dark Mode')).toBeInTheDocument();
    expect(screen.getByTitle('System Preference')).toBeInTheDocument();
  });

  it('changes theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTitle('Dark Mode'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByTitle('Light Mode'));
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
