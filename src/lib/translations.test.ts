
import { translations } from './translations';

describe('translations', () => {
  it('has valid structure', () => {
    expect(translations).toHaveProperty('en');
    expect(translations).toHaveProperty('ur');
  });

  // Helper function to get all keys recursively
  const getKeys = (obj: any, prefix = ''): string[] => {
    return Object.keys(obj).reduce((acc: string[], key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return [...acc, ...getKeys(value, newKey)];
      }
      return [...acc, newKey];
    }, []);
  };

  it('has matching keys for en and ur', () => {
    const enKeys = getKeys(translations.en).sort();
    const urKeys = getKeys(translations.ur).sort();

    // Check for missing keys in Urdu
    const missingInUrdu = enKeys.filter(key => !urKeys.includes(key));
    if (missingInUrdu.length > 0) {
        console.error('Missing keys in Urdu:', missingInUrdu);
    }
    expect(missingInUrdu).toEqual([]);

    // Check for missing keys in English
    const missingInEnglish = urKeys.filter(key => !enKeys.includes(key));
    if (missingInEnglish.length > 0) {
        console.error('Missing keys in English:', missingInEnglish);
    }
    expect(missingInEnglish).toEqual([]);
  });
});
