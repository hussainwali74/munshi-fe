
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageToggle from './LanguageToggle';
import { LanguageProvider } from '@/context/LanguageContext';

describe('LanguageToggle', () => {
  it('renders language buttons', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('اردو')).toBeInTheDocument();
  });

  it('changes language on click', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('English'));
    expect(document.documentElement.lang).toBe('en');

    fireEvent.click(screen.getByText('اردو'));
    expect(document.documentElement.lang).toBe('ur');
  });
});
