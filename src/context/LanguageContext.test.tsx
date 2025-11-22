
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';

// Test component to consume context
const TestComponent = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="dir">{dir}</div>
      <div data-testid="translation">{t('common.dashboard')}</div>
      <button onClick={() => setLanguage('en')}>Set English</button>
      <button onClick={() => setLanguage('ur')}>Set Urdu</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to english', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
    // Check translation for English
    expect(screen.getByTestId('translation').textContent).toBe('Dashboard');
    // Check urdu-text class not present
    expect(document.documentElement.classList.contains('urdu-text')).toBe(false);
  });

  it('can switch to urdu', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Set Urdu'));
    expect(screen.getByTestId('language').textContent).toBe('ur');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
    expect(screen.getByTestId('translation').textContent).toBe('ڈیش بورڈ');
    expect(localStorage.getItem('language')).toBe('ur');
    // Check urdu-text class added
    expect(document.documentElement.classList.contains('urdu-text')).toBe(true);
  });
});
