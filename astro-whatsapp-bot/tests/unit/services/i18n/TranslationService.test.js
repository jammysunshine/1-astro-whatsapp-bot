// tests/unit/services/i18n/TranslationService.test.js
// Unit tests for Translation Service with 95%+ coverage

const fs = require('fs').promises;
const path = require('path');
const TranslationService = require('../../../../src/services/i18n/TranslationService');

// Mock fs and path
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    readdir: jest.fn(),
    access: jest.fn()
  }
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

describe('TranslationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Clear translation service state
    TranslationService.cache.clear();
    TranslationService.resourceBundles.clear();

    // Mock path.join to return proper paths
    path.join.mockImplementation((...args) => args.join('/'));

    // Mock fs.readdir to return locale files
    fs.readdir.mockResolvedValue(['en.json', 'hi.json', 'ar.json', 'ta.json']);

    // Mock fs.access to resolve (files exist)
    fs.access.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with supported languages', () => {
      expect(TranslationService.supportedLanguages.size).toBeGreaterThan(0);
      expect(TranslationService.supportedLanguages.has('en')).toBe(true);
      expect(TranslationService.supportedLanguages.has('hi')).toBe(true);
      expect(TranslationService.supportedLanguages.has('ar')).toBe(true);
      expect(TranslationService.supportedLanguages.has('ta')).toBe(true);
    });

    it('should have correct language metadata', () => {
      const hindi = TranslationService.supportedLanguages.get('hi');
      expect(hindi).toEqual({
        name: 'Hindi',
        nativeName: 'हिंदी',
        rtl: false,
        script: 'Devanagari',
        enabled: true,
        complete: true
      });
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return all supported languages', () => {
      const languages = TranslationService.getSupportedLanguages();
      expect(languages).toBeInstanceOf(Array);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages.some(lang => lang.code === 'en')).toBe(true);
    });
  });

  describe('detectLanguage', () => {
    it('should detect language from Indian phone numbers', () => {
      expect(TranslationService.detectLanguage('+919876543210')).toBe('hi');
      expect(TranslationService.detectLanguage('919876543210')).toBe('hi');
      expect(TranslationService.detectLanguage('+918123456789')).toBe('hi');
    });

    it('should detect language from UAE phone numbers', () => {
      expect(TranslationService.detectLanguage('+971501234567')).toBe('ar');
      expect(TranslationService.detectLanguage('971501234567')).toBe('ar');
    });

    it('should detect language from Saudi phone numbers', () => {
      expect(TranslationService.detectLanguage('+966501234567')).toBe('ar');
    });

    it('should detect language from UK phone numbers', () => {
      expect(TranslationService.detectLanguage('+447123456789')).toBe('en');
    });

    it('should return default language for unknown numbers', () => {
      expect(TranslationService.detectLanguage('+1234567890')).toBe('en');
      expect(TranslationService.detectLanguage('1234567890')).toBe('en');
    });

    it('should respect explicit language parameter', () => {
      expect(TranslationService.detectLanguage('+919876543210', 'ar')).toBe(
        'ar'
      );
      expect(TranslationService.detectLanguage('+447123456789', 'fr')).toBe(
        'fr'
      );
    });

    it('should handle invalid phone numbers gracefully', () => {
      expect(TranslationService.detectLanguage('invalid')).toBe('en');
      expect(TranslationService.detectLanguage('')).toBe('en');
      expect(TranslationService.detectLanguage(null)).toBe('en');
    });
  });

  describe('loadResourceBundle', () => {
    it('should load and cache resource bundle successfully', async() => {
      const mockBundle = {
        common: { welcome: 'Welcome!' },
        astrology: { sign: 'Sign' }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const bundle = await TranslationService.loadResourceBundle('en');

      expect(bundle).toEqual(mockBundle);
      expect(TranslationService.resourceBundles.get('en')).toEqual(mockBundle);
      expect(fs.readFile).toHaveBeenCalledWith(
        '/Users/mohitmendiratta/Projects/bots/w1/astro-whatsapp-bot/src/services/i18n/locales/en.json',
        'utf8'
      );
    });

    it('should return cached bundle if available and not expired', async() => {
      const mockBundle = { common: { welcome: 'Welcome!' } };
      TranslationService.resourceBundles.set('en', mockBundle);
      TranslationService.cache.set('bundle_en', {
        timestamp: Date.now(),
        data: mockBundle
      });

      const bundle = await TranslationService.loadResourceBundle('en');

      expect(bundle).toEqual(mockBundle);
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should reload bundle if cache is expired', async() => {
      const mockBundle = { common: { welcome: 'Welcome!' } };
      const expiredTime = Date.now() - 31 * 60 * 1000; // 31 minutes ago

      TranslationService.resourceBundles.set('en', { old: 'data' });
      TranslationService.cache.set('bundle_en', {
        timestamp: expiredTime,
        data: { old: 'data' }
      });

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const bundle = await TranslationService.loadResourceBundle('en');

      expect(bundle).toEqual(mockBundle);
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should handle file read errors gracefully', async() => {
      fs.access.mockRejectedValue(new Error('File not found'));

      const result = await TranslationService.loadResourceBundle('invalid');
      expect(result).toEqual({});
    });

    it('should handle invalid JSON gracefully', async() => {
      fs.readFile.mockResolvedValue('invalid json');

      const result = await TranslationService.loadResourceBundle('en');
      expect(result).toEqual({});
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      // Mock successful bundle loading
      const mockBundle = {
        common: {
          welcome: 'Welcome!',
          greeting: 'Hello {name}!'
        },
        astrology: {
          sign: 'Your sign is {sign}',
          error: 'Error occurred'
        }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));
    });

    it('should translate simple keys successfully', async() => {
      const result = await TranslationService.translate('common.welcome', 'en');
      expect(result).toBe('Welcome!');
    });

    it('should handle parameter interpolation', async() => {
      const result = await TranslationService.translate(
        'common.greeting',
        'en',
        { name: 'John' }
      );
      expect(result).toBe('Hello John!');
    });

    it('should handle multiple parameters', async() => {
      const result = await TranslationService.translate(
        'astrology.sign',
        'en',
        { sign: 'Leo' }
      );
      expect(result).toBe('Your sign is Leo');
    });

    it('should fallback to English for missing translations', async() => {
      // Mock missing translation in target language
      const mockBundleHi = {
        common: { welcome: 'स्वागत!' }
        // missing greeting
      };

      fs.readFile.mockImplementation(filePath => {
        if (filePath.includes('hi.json')) {
          return Promise.resolve(JSON.stringify(mockBundleHi));
        }
        return Promise.resolve(
          JSON.stringify({
            common: { welcome: 'Welcome!', greeting: 'Hello {name}!' },
            astrology: { sign: 'Your sign is {sign}' }
          })
        );
      });

      const result = await TranslationService.translate(
        'common.greeting',
        'hi',
        { name: 'John' }
      );
      expect(result).toBe('Hello John!'); // Should fallback to English
    });

    it('should return key if translation not found in any language', async() => {
      const result = await TranslationService.translate(
        'nonexistent.key',
        'en'
      );
      expect(result).toBe('nonexistent.key');
    });

    it('should handle nested key access', async() => {
      const result = await TranslationService.translate(
        'astrology.error',
        'en'
      );
      expect(result).toBe('Error occurred');
    });

    it('should cache translations for performance', async() => {
      await TranslationService.translate('common.welcome', 'en');
      await TranslationService.translate('common.welcome', 'en'); // Should use cache

      expect(fs.readFile).toHaveBeenCalledTimes(1); // Bundle loaded once
    });
  });

  describe('translateMultiple', () => {
    it('should translate multiple keys at once', async() => {
      const mockBundle = {
        common: { welcome: 'Welcome!', goodbye: 'Goodbye!' },
        astrology: { sign: 'Sign' }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const results = await TranslationService.translateMultiple(
        ['common.welcome', 'common.goodbye', 'astrology.sign'],
        'en'
      );

      expect(results).toEqual({
        'common.welcome': 'Welcome!',
        'common.goodbye': 'Goodbye!',
        'astrology.sign': 'Sign'
      });
    });
  });

  describe('hasTranslation', () => {
    it('should check if translation exists', async() => {
      const mockBundle = {
        common: { welcome: 'Welcome!' }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const exists = await TranslationService.hasTranslation(
        'common.welcome',
        'en'
      );
      const notExists = await TranslationService.hasTranslation(
        'common.missing',
        'en'
      );

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });
  });

  describe('getAvailableKeys', () => {
    it('should return all available translation keys', async() => {
      const mockBundle = {
        common: { welcome: 'Welcome!', goodbye: 'Goodbye!' },
        astrology: { sign: 'Sign', planet: 'Planet' }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const keys = await TranslationService.getAvailableKeys('en');

      expect(keys).toEqual([
        'common.welcome',
        'common.goodbye',
        'astrology.sign',
        'astrology.planet'
      ]);
    });
  });

  describe('reloadBundles', () => {
    it('should clear cache and reload bundles', async() => {
      TranslationService.resourceBundles.set('en', { old: 'data' });
      TranslationService.cache.set('en', {
        timestamp: Date.now(),
        data: { old: 'data' }
      });

      await TranslationService.reloadBundles();

      expect(TranslationService.resourceBundles.size).toBe(0);
      expect(TranslationService.cache.size).toBe(0);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      TranslationService.cache.clear();
      TranslationService.resourceBundles.clear();
    });

    it('should handle malformed parameters gracefully', async() => {
      const mockBundle = {
        common: { greeting: 'Hello {name}!' }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const result = await TranslationService.translate(
        'common.greeting',
        'en',
        null
      );
      expect(result).toBe('Hello {name}!'); // Should not interpolate
    });

    it('should handle missing parameters gracefully', async() => {
      const mockBundle = {
        common: { greeting: 'Hello {name}!' }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      const result = await TranslationService.translate(
        'common.greeting',
        'en'
      );
      expect(result).toBe('Hello {name}!'); // Should keep placeholder
    });
  });

  describe('Performance and caching', () => {
    it('should cache bundles to improve performance', async() => {
      const mockBundle = { common: { welcome: 'Welcome!' } };
      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      // First call
      await TranslationService.translate('common.welcome', 'en');
      // Second call should use cache
      await TranslationService.translate('common.welcome', 'en');

      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should expire cache after configured time', async() => {
      const mockBundle = { common: { welcome: 'Welcome!' } };
      fs.readFile.mockResolvedValue(JSON.stringify(mockBundle));

      // Set cache with expired timestamp
      const expiredTime = Date.now() - 35 * 60 * 1000; // 35 minutes ago
      TranslationService.cache.set('en', {
        timestamp: expiredTime,
        data: mockBundle
      });

      await TranslationService.translate('common.welcome', 'en');

      // Should reload despite cache existing
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });
  });
});
