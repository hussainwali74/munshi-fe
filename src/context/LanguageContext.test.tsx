
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

  it('defaults to urdu', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language').textContent).toBe('ur');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
    // Check translation for Urdu
    expect(screen.getByTestId('translation').textContent).toBe('ڈیش بورڈ');
    // Check body class
    expect(document.body.classList.contains('urdu-text')).toBe(true);
  });

  it('can switch to english', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Set English'));
    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
    expect(screen.getByTestId('translation').textContent).toBe('Dashboard');
    expect(localStorage.getItem('language')).toBe('en');
    // Check body class removed
    expect(document.body.classList.contains('urdu-text')).toBe(false);
  });
});
