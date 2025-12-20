import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageToggle from './LanguageToggle';
import { LanguageProvider } from '@/context/LanguageContext';

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders language buttons', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    // Component uses "EN" not "English"
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('اردو')).toBeInTheDocument();
  });

  it('changes language on click', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('EN'));
    expect(document.documentElement.lang).toBe('en');

    fireEvent.click(screen.getByText('اردو'));
    expect(document.documentElement.lang).toBe('ur');
  });
});
