
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { getMergedTranslations } from '@/app/settings/translation-actions';

jest.mock('@/app/settings/translation-actions', () => ({
  getMergedTranslations: jest.fn().mockResolvedValue({ system: [], custom: [] }),
}));

// Test component to consume context
const TestComponent = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="dir">{dir}</div>
      <div data-testid="translation">{t('common.dashboard')}</div>
      <div data-testid="interpolated">{t('employees.confirmDelete', { name: 'Ali' })}</div>
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
    expect(screen.getByTestId('interpolated').textContent).toBe('Are you sure you want to delete Ali?');
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
    expect(screen.getByTestId('interpolated').textContent).toBe('کیا آپ واقعی Ali کو حذف کرنا چاہتے ہیں؟');
    expect(localStorage.getItem('language')).toBe('ur');
    // Check urdu-text class added
    expect(document.documentElement.classList.contains('urdu-text')).toBe(true);
  });

  it('uses custom translations when provided', async () => {
    (getMergedTranslations as jest.Mock).mockResolvedValueOnce({
      system: [],
      custom: [{ key: 'common.dashboard', lang: 'en', value: 'Custom Dashboard' }],
    });

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('translation').textContent).toBe('Custom Dashboard');
    });
  });
});
