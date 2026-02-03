import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import TranslationManager from '../TranslationManager';
import { useLanguage } from '@/context/LanguageContext';
import { getMergedTranslations, updateCustomTranslation, deleteCustomTranslation } from '../translation-actions';

jest.mock('@/context/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('../translation-actions', () => ({
  getMergedTranslations: jest.fn(),
  updateCustomTranslation: jest.fn(),
  deleteCustomTranslation: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon" />,
  Edit2: () => <span data-testid="edit-icon" />,
  X: () => <span data-testid="close-icon" />,
  Check: () => <span data-testid="check-icon" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  RotateCcw: () => <span data-testid="revert-icon" />,
}));

jest.mock('@/components/Skeleton', () => ({
  SkeletonTranslationCard: () => <div data-testid="skeleton-card" />,
}));

jest.mock('@/lib/translations', () => ({
  translations: {
    en: {
      common: {
        dashboard: 'Dashboard',
      },
      settings: {
        translations: 'Translations',
      },
    },
    ur: {
      common: {
        dashboard: 'ڈیش بورڈ',
      },
      settings: {
        translations: 'تراجم',
      },
    },
  },
}));

const t = (key: string, vars?: Record<string, string | number>) => {
  const dictionary: Record<string, string> = {
    'settings.translationManager.searchPlaceholder': 'Search translations...',
    'settings.translationManager.customBadge': 'Custom',
    'settings.translationManager.editTitle': 'Edit',
    'settings.translationManager.revertTitle': 'Revert to Default',
    'settings.translationManager.languageEnglish': 'English',
    'settings.translationManager.languageUrdu': 'Urdu (اردو)',
    'settings.translationManager.revertConfirm': 'Revert {language} to default?',
    'settings.translationManager.revertConfirmBoth': 'Revert both English and Urdu?',
    'settings.translationManager.updateSuccess': 'Translations updated',
    'settings.translationManager.saveFailed': 'Failed to save',
    'settings.translationManager.loadFailed': 'Failed to load translations',
    'settings.translationManager.revertSuccess': 'Reverted {language} to default',
    'settings.translationManager.revertFailed': 'Failed to revert',
    'settings.translationManager.noResults': 'No translations found for "{term}"',
  };

  let value = dictionary[key] || key;
  if (vars) {
    value = value.replace(/\{(\w+)\}/g, (_, match) => {
      const replacement = vars[match];
      return replacement === undefined ? `{${match}}` : String(replacement);
    });
  }
  return value;
};

describe('TranslationManager', () => {
  beforeEach(() => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      t,
      dir: 'ltr',
      setLanguage: jest.fn(),
    });

    (getMergedTranslations as jest.Mock).mockResolvedValue({
      system: [
        { key: 'common.dashboard', lang: 'en', value: 'Dashboard' },
        { key: 'common.dashboard', lang: 'ur', value: 'ڈیش بورڈ' },
      ],
      custom: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and shows custom badge when custom translation exists', async () => {
    (getMergedTranslations as jest.Mock).mockResolvedValueOnce({
      system: [
        { key: 'common.dashboard', lang: 'en', value: 'Dashboard' },
        { key: 'common.dashboard', lang: 'ur', value: 'ڈیش بورڈ' },
      ],
      custom: [{ key: 'common.dashboard', lang: 'en', value: 'My Dashboard' }],
    });

    render(<TranslationManager />);

    expect(screen.getByPlaceholderText('Search translations...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('saves updated translations', async () => {
    render(<TranslationManager />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    const englishInput = screen.getByDisplayValue('Dashboard');
    fireEvent.change(englishInput, { target: { value: 'Updated Dashboard' } });

    const editContainer = englishInput.closest('div')?.parentElement;
    if (!editContainer) {
      throw new Error('Edit container not found');
    }

    const buttons = within(editContainer).getAllByRole('button');
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(updateCustomTranslation).toHaveBeenCalledWith('common.dashboard', 'en', 'Updated Dashboard');
    });
  });

  it('reverts custom translations when confirmed', async () => {
    (getMergedTranslations as jest.Mock).mockResolvedValueOnce({
      system: [
        { key: 'common.dashboard', lang: 'en', value: 'Dashboard' },
        { key: 'common.dashboard', lang: 'ur', value: 'ڈیش بورڈ' },
      ],
      custom: [{ key: 'common.dashboard', lang: 'en', value: 'Custom Dashboard' }],
    });

    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<TranslationManager />);

    await waitFor(() => {
      expect(screen.getByText('Custom Dashboard')).toBeInTheDocument();
    });

    const revertButton = screen.getByTitle('Revert to Default');
    fireEvent.click(revertButton);

    await waitFor(() => {
      expect(deleteCustomTranslation).toHaveBeenCalledWith('common.dashboard', 'en');
    });

    confirmSpy.mockRestore();
  });
});
