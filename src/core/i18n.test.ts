import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createI18n } from './i18n'
import type { I18n } from '../types'

describe('1. Instance Creation', () => {
  describe('createI18n(options)', () => {
    describe('Valid Inputs', () => {
      it('creates instance with defaultLocale only', () => {
        const i18n = createI18n({ defaultLocale: 'en' })
        expect(i18n).toBeDefined()
        expect(i18n.getLocale()).toBe('en')
      })

      it('creates instance with defaultLocale and initial translations', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        expect(i18n.t('hello')).toBe('Hello')
      })

      it('creates instance with fallbackLocale', () => {
        const i18n = createI18n({
          defaultLocale: 'de',
          fallbackLocale: 'en',
          translations: { en: { hello: 'Hello' }, de: { goodbye: 'Auf Wiedersehen' } },
        })
        expect(i18n).toBeDefined()
        expect(i18n.getLocale()).toBe('de')
      })

      it('creates instance with loadPath function for lazy loading', async () => {
        const loadPath = async (locale: string) => {
          return { hello: `Hello from ${locale}` }
        }
        const i18n = createI18n({ defaultLocale: 'en', loadPath })
        expect(i18n).toBeDefined()
      })

      it('sets current locale to defaultLocale on creation', () => {
        const i18n = createI18n({ defaultLocale: 'fr' })
        expect(i18n.getLocale()).toBe('fr')
      })

      it('accepts translations for multiple locales', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { hello: 'Hello' },
            es: { hello: 'Hola' },
            fr: { hello: 'Bonjour' },
          },
        })
        const availableLocales = i18n.getAvailableLocales()
        expect(availableLocales).toContain('en')
        expect(availableLocales).toContain('es')
        expect(availableLocales).toContain('fr')
      })
    })

    describe('Invalid Inputs (Fail Fast)', () => {
      it('throws TypeError if options is null or undefined', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => createI18n(null)).toThrow(TypeError)
        expect(() => createI18n(null)).toThrow('options is required')
        // @ts-expect-error - Testing runtime validation
        expect(() => createI18n(undefined)).toThrow(TypeError)
        expect(() => createI18n(undefined)).toThrow('options is required')
      })

      it('throws TypeError if options is not an object', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => createI18n('en')).toThrow(TypeError)
        expect(() => createI18n('en')).toThrow('options must be an object')
      })

      it('throws TypeError if defaultLocale is missing', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => createI18n({})).toThrow(TypeError)
        expect(() => createI18n({})).toThrow('defaultLocale is required')
      })

      it('throws TypeError if defaultLocale is empty string', () => {
        expect(() => createI18n({ defaultLocale: '' })).toThrow(TypeError)
        expect(() => createI18n({ defaultLocale: '' })).toThrow('defaultLocale cannot be empty')
      })

      it('throws TypeError if defaultLocale is not a string', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => createI18n({ defaultLocale: 123 })).toThrow(TypeError)
        expect(() => createI18n({ defaultLocale: 123 })).toThrow('defaultLocale must be a string')
      })

      it('throws TypeError if translations is not an object', () => {
        expect(() =>
          createI18n({
            defaultLocale: 'en',
            // @ts-expect-error - Testing runtime validation
            translations: 'invalid',
          })
        ).toThrow(TypeError)
        expect(() =>
          createI18n({
            defaultLocale: 'en',
            // @ts-expect-error - Testing runtime validation
            translations: 'invalid',
          })
        ).toThrow('translations must be an object')
      })

      it('throws TypeError if loadPath is not a function', () => {
        expect(() =>
          createI18n({
            defaultLocale: 'en',
            // @ts-expect-error - Testing runtime validation
            loadPath: 'invalid',
          })
        ).toThrow(TypeError)
        expect(() =>
          createI18n({
            defaultLocale: 'en',
            // @ts-expect-error - Testing runtime validation
            loadPath: 'invalid',
          })
        ).toThrow('loadPath must be a function')
      })
    })
  })
})

describe('2. Basic Translation', () => {
  describe('i18n.t(key)', () => {
    describe('Simple Keys', () => {
      it('returns translation for simple key', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        expect(i18n.t('hello')).toBe('Hello')
      })

      it('returns translation for nested key (dot notation)', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { common: { save: 'Save' } } },
        })
        expect(i18n.t('common.save')).toBe('Save')
      })

      it('returns translation for deeply nested key', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { a: { b: { c: { d: { e: 'Deep' } } } } } },
        })
        expect(i18n.t('a.b.c.d.e')).toBe('Deep')
      })

      it('returns the key itself if translation is missing', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        expect(i18n.t('missing.key')).toBe('missing.key')
      })

      it('returns the key itself if locale has no translations', () => {
        const i18n = createI18n({ defaultLocale: 'en', translations: {} })
        expect(i18n.t('hello')).toBe('hello')
      })

      it('handles single-segment keys', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { greeting: 'Hi' } },
        })
        expect(i18n.t('greeting')).toBe('Hi')
      })
    })

    describe('Key Edge Cases', () => {
      it('key lookup is case-sensitive', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { Hello: 'uppercase', hello: 'lowercase' } },
        })
        expect(i18n.t('Hello')).toBe('uppercase')
        expect(i18n.t('hello')).toBe('lowercase')
      })

      it('handles keys that are numeric strings', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { '404': 'Not Found', '500': 'Server Error' } },
        })
        expect(i18n.t('404')).toBe('Not Found')
      })

      it('handles keys with underscores', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { error_message: 'Error' } },
        })
        expect(i18n.t('error_message')).toBe('Error')
      })

      it('handles keys with hyphens', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { 'error-message': 'Error' } },
        })
        expect(i18n.t('error-message')).toBe('Error')
      })

      it('trims whitespace from key before lookup', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        expect(i18n.t('  hello  ')).toBe('Hello')
      })

      it('returns empty string for empty string key', () => {
        const i18n = createI18n({ defaultLocale: 'en' })
        expect(i18n.t('')).toBe('')
      })

      it('handles key that resolves to empty string translation', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { empty: '' } },
        })
        expect(i18n.t('empty')).toBe('')
      })

      it('handles key pointing to object (not leaf value) - returns key', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { common: { save: 'Save' } } },
        })
        expect(i18n.t('common')).toBe('common')
      })
    })

    describe('Invalid Key Inputs (Fail Fast)', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if key is null', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t(null)).toThrow(TypeError)
        expect(() => i18n.t(null)).toThrow('key must be a string')
      })

      it('throws TypeError if key is undefined', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t(undefined)).toThrow(TypeError)
        expect(() => i18n.t(undefined)).toThrow('key must be a string')
      })

      it('throws TypeError if key is a number', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t(123)).toThrow(TypeError)
        expect(() => i18n.t(123)).toThrow('key must be a string')
      })

      it('throws TypeError if key is an object', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t({ key: 'hello' })).toThrow(TypeError)
        expect(() => i18n.t({ key: 'hello' })).toThrow('key must be a string')
      })
    })
  })
})

describe('3. Fallback Behavior', () => {
  describe('With fallbackLocale Configured', () => {
    it('returns fallback translation if missing in current locale', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { goodbye: 'Auf Wiedersehen' },
        },
      })
      expect(i18n.t('hello')).toBe('Hello')
    })

    it('returns key if missing in both current and fallback locale', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { goodbye: 'Tschüss' },
        },
      })
      expect(i18n.t('missing')).toBe('missing')
    })

    it('prefers current locale over fallback when both have key', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { hello: 'Hallo' },
        },
      })
      expect(i18n.t('hello')).toBe('Hallo')
    })

    it('fallback works for nested keys', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { common: { save: 'Save' } },
          de: {},
        },
      })
      expect(i18n.t('common.save')).toBe('Save')
    })

    it('fallback chain only goes one level deep', () => {
      const i18n = createI18n({
        defaultLocale: 'fr',
        fallbackLocale: 'de',
        translations: {
          en: { hello: 'Hello' },
          de: {},
          fr: {},
        },
      })
      expect(i18n.t('hello')).toBe('hello')
    })
  })

  describe('Without fallbackLocale', () => {
    it('returns key directly if missing (no fallback lookup)', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      expect(i18n.t('missing')).toBe('missing')
    })
  })
})

describe('4. Interpolation', () => {
  describe('i18n.t(key, params)', () => {
    describe('Basic Interpolation', () => {
      it('replaces single placeholder with param value', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { greeting: 'Hello, {{name}}!' } },
        })
        expect(i18n.t('greeting', { name: 'World' })).toBe('Hello, World!')
      })

      it('replaces multiple different placeholders', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: '{{greeting}}, {{name}}!' } },
        })
        expect(i18n.t('msg', { greeting: 'Hello', name: 'World' })).toBe('Hello, World!')
      })

      it('replaces same placeholder appearing multiple times', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: '{{name}} met {{name}}' } },
        })
        expect(i18n.t('msg', { name: 'Alice' })).toBe('Alice met Alice')
      })

      it('handles placeholder at start of string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: '{{name}} logged in' } },
        })
        expect(i18n.t('msg', { name: 'Alice' })).toBe('Alice logged in')
      })

      it('handles placeholder at end of string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Welcome, {{name}}' } },
        })
        expect(i18n.t('msg', { name: 'Alice' })).toBe('Welcome, Alice')
      })

      it('handles adjacent placeholders with no separator', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: '{{first}}{{last}}' } },
        })
        expect(i18n.t('msg', { first: 'John', last: 'Doe' })).toBe('JohnDoe')
      })

      it('handles placeholder with spaces inside braces', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Hello, {{ name }}!' } },
        })
        expect(i18n.t('msg', { name: 'World' })).toBe('Hello, World!')
      })
    })

    describe('Missing Parameters', () => {
      it('leaves placeholder intact when param is missing', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { greeting: 'Hello, {{name}}!' } },
        })
        expect(i18n.t('greeting', {})).toBe('Hello, {{name}}!')
      })

      it('leaves placeholder intact when params object is omitted', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { greeting: 'Hello, {{name}}!' } },
        })
        expect(i18n.t('greeting')).toBe('Hello, {{name}}!')
      })

      it('replaces found params, leaves missing params as placeholders', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: '{{greeting}}, {{name}}!' } },
        })
        expect(i18n.t('msg', { greeting: 'Hello' })).toBe('Hello, {{name}}!')
      })
    })

    describe('Extra Parameters', () => {
      it('ignores extra params not in template', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { greeting: 'Hello, {{name}}!' } },
        })
        expect(i18n.t('greeting', { name: 'World', unused: 'ignored' })).toBe('Hello, World!')
      })
    })

    describe('Parameter Value Types', () => {
      it('converts number to string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Count: {{count}}' } },
        })
        expect(i18n.t('msg', { count: 42 })).toBe('Count: 42')
      })

      it('converts negative number to string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Temperature: {{temp}}' } },
        })
        expect(i18n.t('msg', { temp: -5 })).toBe('Temperature: -5')
      })

      it('converts float to string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Price: {{price}}' } },
        })
        expect(i18n.t('msg', { price: 19.99 })).toBe('Price: 19.99')
      })

      it("converts boolean true to string 'true'", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Active: {{status}}' } },
        })
        expect(i18n.t('msg', { status: true })).toBe('Active: true')
      })

      it("converts boolean false to string 'false'", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Active: {{status}}' } },
        })
        expect(i18n.t('msg', { status: false })).toBe('Active: false')
      })

      it('converts null to empty string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Value: {{val}}' } },
        })
        expect(i18n.t('msg', { val: null })).toBe('Value: ')
      })

      it('converts undefined to empty string', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Value: {{val}}' } },
        })
        expect(i18n.t('msg', { val: undefined })).toBe('Value: ')
      })

      it("converts zero to string '0' (not empty)", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Count: {{count}}' } },
        })
        expect(i18n.t('msg', { count: 0 })).toBe('Count: 0')
      })

      it('does NOT escape HTML in interpolated values', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { msg: 'Content: {{html}}' } },
        })
        expect(i18n.t('msg', { html: '<b>bold</b>' })).toBe('Content: <b>bold</b>')
      })
    })

    describe('Invalid Params Input', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { greeting: 'Hello, {{name}}!' } },
        })
      })

      it('throws TypeError if params is not an object or undefined', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t('greeting', 'invalid')).toThrow(TypeError)
        expect(() => i18n.t('greeting', 'invalid')).toThrow('params must be an object')
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t('greeting', 123)).toThrow(TypeError)
        expect(() => i18n.t('greeting', 123)).toThrow('params must be an object')
      })

      it('accepts null as params (treated as empty object)', () => {
        // @ts-expect-error - Testing runtime validation
        expect(i18n.t('greeting', null)).toBe('Hello, {{name}}!')
      })
    })
  })
})

describe('5. Pluralization', () => {
  describe('i18n.t(key, { count: n })', () => {
    describe('Basic Plural Selection (English)', () => {
      it("uses 'one' form when count is 1", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 1 })).toBe('1 item')
      })

      it("uses 'other' form when count is 0", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 0 })).toBe('0 items')
      })

      it("uses 'other' form when count is 2", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 2 })).toBe('2 items')
      })

      it("uses 'other' form when count is 100", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 100 })).toBe('100 items')
      })
    })

    describe('Zero Form (Optional)', () => {
      it("uses 'zero' form when count is 0 AND zero form is defined", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { zero: 'No items', one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 0 })).toBe('No items')
      })

      it('falls back to Intl.PluralRules result if zero form not defined', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 0 })).toBe('0 items')
      })
    })

    describe('Language-Specific Rules via Intl.PluralRules', () => {
      it('uses correct plural form for Russian (few: 2-4)', () => {
        const i18n = createI18n({
          defaultLocale: 'ru',
          translations: {
            ru: {
              items: {
                one: '{{count}} предмет',
                few: '{{count}} предмета',
                many: '{{count}} предметов',
                other: '{{count}} предмета',
              },
            },
          },
        })
        expect(i18n.t('items', { count: 2 })).toBe('2 предмета')
        expect(i18n.t('items', { count: 3 })).toBe('3 предмета')
        expect(i18n.t('items', { count: 4 })).toBe('4 предмета')
      })

      it('uses correct plural form for Russian (many: 5-20, 0)', () => {
        const i18n = createI18n({
          defaultLocale: 'ru',
          translations: {
            ru: {
              items: {
                one: '{{count}} предмет',
                few: '{{count}} предмета',
                many: '{{count}} предметов',
                other: '{{count}} предмета',
              },
            },
          },
        })
        expect(i18n.t('items', { count: 5 })).toBe('5 предметов')
        expect(i18n.t('items', { count: 11 })).toBe('11 предметов')
        expect(i18n.t('items', { count: 20 })).toBe('20 предметов')
      })

      it('uses correct plural form for Arabic (two form)', () => {
        const i18n = createI18n({
          defaultLocale: 'ar',
          translations: {
            ar: {
              items: {
                zero: 'لا عناصر',
                one: 'عنصر واحد',
                two: 'عنصران',
                few: '{{count}} عناصر',
                many: '{{count}} عنصرًا',
                other: '{{count}} عنصر',
              },
            },
          },
        })
        expect(i18n.t('items', { count: 2 })).toBe('عنصران')
      })
    })

    describe('Fallback Behavior', () => {
      it("falls back to 'other' if specific plural form is missing", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 1 })).toBe('1 items')
      })

      it("returns key if 'other' form is also missing", () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item' } },
          },
        })
        expect(i18n.t('items', { count: 5 })).toBe('items')
      })
    })

    describe('Edge Cases', () => {
      it('count is also available for interpolation in plural strings', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: {
              items: { one: 'Only {{count}} item left', other: '{{count}} items left' },
            },
          },
        })
        expect(i18n.t('items', { count: 1 })).toBe('Only 1 item left')
      })

      it('handles negative counts (uses absolute value for plural rule)', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: -1 })).toBe('-1 item')
      })

      it('handles decimal counts (Intl.PluralRules handles these)', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 1.5 })).toBe('1.5 items')
      })

      it('handles very large counts', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: { items: { one: '{{count}} item', other: '{{count}} items' } },
          },
        })
        expect(i18n.t('items', { count: 1000000 })).toBe('1000000 items')
      })

      it('pluralization works with other interpolation params', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: {
            en: {
              items: {
                one: '{{name}} has {{count}} item',
                other: '{{name}} has {{count}} items',
              },
            },
          },
        })
        expect(i18n.t('items', { count: 3, name: 'Alice' })).toBe('Alice has 3 items')
      })

      it('non-plural key with count param - count used for interpolation only', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { message: 'You have {{count}} new messages' } },
        })
        expect(i18n.t('message', { count: 5 })).toBe('You have 5 new messages')
      })
    })
  })
})

describe('6. Locale Management', () => {
  describe('i18n.getLocale()', () => {
    it('returns current locale code after creation', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      expect(i18n.getLocale()).toBe('en')
    })

    it('returns updated locale after setLocale()', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      i18n.setLocale('de')
      expect(i18n.getLocale()).toBe('de')
    })
  })

  describe('i18n.setLocale(locale)', () => {
    it('changes current locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      i18n.setLocale('de')
      expect(i18n.getLocale()).toBe('de')
    })

    it('subsequent t() calls use new locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { hello: 'Hallo' },
        },
      })
      i18n.setLocale('de')
      expect(i18n.t('hello')).toBe('Hallo')
    })

    it('fires onChange callbacks', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.setLocale('de')
      expect(callback).toHaveBeenCalledWith('de', 'en')
    })

    it('does not fire onChange if locale is unchanged', () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.setLocale('en')
      expect(callback).not.toHaveBeenCalled()
    })

    it('returns the i18n instance for chaining', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { hello: 'Hallo' },
        },
      })
      expect(i18n.setLocale('de').t('hello')).toBe('Hallo')
    })

    describe('setLocale with Missing Translations', () => {
      it('allows setting locale with no translations if fallbackLocale exists', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          fallbackLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        i18n.setLocale('de')
        expect(i18n.t('hello')).toBe('Hello')
      })

      it('allows setting locale with no translations if loadPath exists', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          loadPath: async () => ({ hello: 'Loaded' }),
        })
        expect(() => i18n.setLocale('de')).not.toThrow()
      })

      it('throws Error if locale has no translations, no fallback, and no loadPath', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        expect(() => i18n.setLocale('xx')).toThrow(Error)
        expect(() => i18n.setLocale('xx')).toThrow("No translations available for locale 'xx'")
      })
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      })

      it('throws TypeError if locale is not a string', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.setLocale(123)).toThrow(TypeError)
      })

      it('throws TypeError if locale is empty string', () => {
        expect(() => i18n.setLocale('')).toThrow(TypeError)
      })

      it('throws TypeError if locale is null or undefined', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.setLocale(null)).toThrow(TypeError)
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.setLocale(undefined)).toThrow(TypeError)
      })
    })
  })

  describe('i18n.getAvailableLocales()', () => {
    it('returns array of locale codes with loaded translations', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {}, fr: {} },
      })
      const locales = i18n.getAvailableLocales()
      expect(locales).toContain('en')
      expect(locales).toContain('de')
      expect(locales).toContain('fr')
    })

    it('returns empty array if no translations loaded', () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: {} })
      expect(i18n.getAvailableLocales()).toEqual([])
    })

    it('updates after addTranslations()', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      i18n.addTranslations('es', { hello: 'Hola' })
      expect(i18n.getAvailableLocales()).toContain('es')
    })

    it("returned array is a copy (modifying it doesn't affect internal state)", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      const locales = i18n.getAvailableLocales()
      locales.push('fake')
      expect(i18n.getAvailableLocales()).not.toContain('fake')
    })
  })
})

describe('7. Translation Management', () => {
  describe('i18n.addTranslations(locale, translations)', () => {
    it('adds translations for a new locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      i18n.addTranslations('es', { hello: 'Hola' })
      i18n.setLocale('es')
      expect(i18n.t('hello')).toBe('Hola')
    })

    it('merges translations into existing locale (shallow keys)', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      i18n.addTranslations('en', { goodbye: 'Goodbye' })
      expect(i18n.t('hello')).toBe('Hello')
      expect(i18n.t('goodbye')).toBe('Goodbye')
    })

    it('deep merges nested translation objects', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { common: { save: 'Save' } } },
      })
      i18n.addTranslations('en', { common: { cancel: 'Cancel' } })
      expect(i18n.t('common.save')).toBe('Save')
      expect(i18n.t('common.cancel')).toBe('Cancel')
    })

    it('overwrites existing keys on conflict', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      i18n.addTranslations('en', { hello: 'Hi' })
      expect(i18n.t('hello')).toBe('Hi')
    })

    it('locale becomes available in getAvailableLocales()', () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      i18n.addTranslations('ja', { hello: 'こんにちは' })
      expect(i18n.getAvailableLocales()).toContain('ja')
    })

    it('returns the i18n instance for chaining', () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      expect(i18n.addTranslations('es', { hello: 'Hola' }).setLocale('es').t('hello')).toBe('Hola')
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if locale is not a string', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.addTranslations(123, {})).toThrow(TypeError)
      })

      it('throws TypeError if locale is empty string', () => {
        expect(() => i18n.addTranslations('', {})).toThrow(TypeError)
      })

      it('throws TypeError if translations is null', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.addTranslations('en', null)).toThrow(TypeError)
      })

      it('throws TypeError if translations is not an object', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.addTranslations('en', 'invalid')).toThrow(TypeError)
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.addTranslations('en', [])).toThrow(TypeError)
      })
    })
  })

  describe('i18n.hasKey(key, locale?)', () => {
    it('returns true if key exists in current locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      expect(i18n.hasKey('hello')).toBe(true)
    })

    it("returns false if key doesn't exist in current locale", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      expect(i18n.hasKey('missing')).toBe(false)
    })

    it('returns true if key exists in specified locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { hallo: 'Hallo' },
        },
      })
      expect(i18n.hasKey('hallo', 'de')).toBe(true)
    })

    it("returns false if key doesn't exist in specified locale", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { hallo: 'Hallo' },
        },
      })
      expect(i18n.hasKey('hello', 'de')).toBe(false)
    })

    it('checks nested keys correctly', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { common: { save: 'Save' } } },
      })
      expect(i18n.hasKey('common.save')).toBe(true)
      expect(i18n.hasKey('common.delete')).toBe(false)
      expect(i18n.hasKey('common')).toBe(true)
    })

    it('does NOT check fallback locale', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: {},
        },
      })
      expect(i18n.hasKey('hello')).toBe(false)
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if key is not a string', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.hasKey(123)).toThrow(TypeError)
      })

      it('throws TypeError if locale param is not a string (when provided)', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.hasKey('hello', 123)).toThrow(TypeError)
      })
    })
  })

  describe('i18n.getTranslations(locale?)', () => {
    it('returns all translations for current locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello', goodbye: 'Bye' } },
      })
      const translations = i18n.getTranslations()
      expect(translations).toEqual({ hello: 'Hello', goodbye: 'Bye' })
    })

    it('returns all translations for specified locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: { hello: 'Hallo' },
        },
      })
      expect(i18n.getTranslations('de')).toEqual({ hello: 'Hallo' })
    })

    it("returns empty object if locale doesn't exist", () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      expect(i18n.getTranslations('xx')).toEqual({})
    })

    it("returned object is a deep copy (modifications don't affect internal state)", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      const copy = i18n.getTranslations()
      copy.hello = 'Modified'
      expect(i18n.t('hello')).toBe('Hello')
    })
  })
})

describe('8. Lazy Loading', () => {
  describe('i18n.loadLocale(locale)', () => {
    it('loads translations via loadPath function', async () => {
      const loadPath = vi.fn(async (locale: string) => {
        if (locale === 'de') return { hello: 'Hallo' }
        return {}
      })
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
        loadPath,
      })
      await i18n.loadLocale('de')
      i18n.setLocale('de')
      expect(i18n.t('hello')).toBe('Hallo')
    })

    it('returns a Promise that resolves when loading completes', async () => {
      const loadPath = async () => ({ hello: 'Hallo' })
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      const promise = i18n.loadLocale('de')
      expect(promise).toBeInstanceOf(Promise)
      await expect(promise).resolves.toBeUndefined()
    })

    it('adds loaded translations to internal store', async () => {
      const loadPath = async () => ({ hello: 'Hallo' })
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      await i18n.loadLocale('de')
      expect(i18n.getAvailableLocales()).toContain('de')
    })

    it('merges with existing translations for same locale', async () => {
      const loadPath = async () => ({ loaded: 'Loaded' })
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { de: { existing: 'Existing' } },
        loadPath,
      })
      await i18n.loadLocale('de')
      i18n.setLocale('de')
      expect(i18n.t('existing')).toBe('Existing')
      expect(i18n.t('loaded')).toBe('Loaded')
    })

    it('only calls loadPath once per locale (caches result)', async () => {
      const loadPath = vi.fn(async () => ({ hello: 'Hallo' }))
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      await i18n.loadLocale('de')
      await i18n.loadLocale('de')
      expect(loadPath).toHaveBeenCalledTimes(1)
    })

    it('can force reload with forceReload option', async () => {
      const loadPath = vi.fn(async () => ({ hello: 'Hallo' }))
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      await i18n.loadLocale('de')
      await i18n.loadLocale('de', { forceReload: true })
      expect(loadPath).toHaveBeenCalledTimes(2)
    })

    it('handles concurrent loads for same locale (deduplication)', async () => {
      const loadPath = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return { hello: 'Hallo' }
      })
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      const [result1, result2] = await Promise.all([i18n.loadLocale('de'), i18n.loadLocale('de')])
      expect(loadPath).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })

    describe('Error Handling', () => {
      it('rejects promise if loadPath throws', async () => {
        const loadPath = async () => {
          throw new Error('Network error')
        }
        const i18n = createI18n({
          defaultLocale: 'en',
          loadPath,
        })
        await expect(i18n.loadLocale('de')).rejects.toThrow('Network error')
      })

      it('rejects promise if loadPath returns invalid data', async () => {
        const loadPath = async () => null as any
        const i18n = createI18n({
          defaultLocale: 'en',
          loadPath,
        })
        await expect(i18n.loadLocale('de')).rejects.toThrow(TypeError)
      })

      it('rejects promise if loadPath returns non-object', async () => {
        const loadPath = async () => 'invalid' as any
        const i18n = createI18n({
          defaultLocale: 'en',
          loadPath,
        })
        await expect(i18n.loadLocale('de')).rejects.toThrow(TypeError)
      })

      it('throws Error if loadPath not configured', () => {
        const i18n = createI18n({ defaultLocale: 'en' })
        expect(() => i18n.loadLocale('de')).toThrow(Error)
        expect(() => i18n.loadLocale('de')).toThrow('loadPath not configured')
      })
    })
  })

  describe('i18n.isLocaleLoaded(locale)', () => {
    it('returns true if locale translations are loaded', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      expect(i18n.isLocaleLoaded('en')).toBe(true)
    })

    it('returns false if locale translations not loaded', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      expect(i18n.isLocaleLoaded('xx')).toBe(false)
    })

    it('returns true after loadLocale completes', async () => {
      const loadPath = async () => ({ hello: 'Hallo' })
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      await i18n.loadLocale('de')
      expect(i18n.isLocaleLoaded('de')).toBe(true)
    })
  })

  describe('Auto-Loading on setLocale', () => {
    it('setLocale does NOT auto-load (explicit loading required)', () => {
      const loadPath = vi.fn(async () => ({ hello: 'Hallo' }))
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
        loadPath,
      })
      expect(() => i18n.setLocale('de')).toThrow()
      expect(loadPath).not.toHaveBeenCalled()
    })

    it('setLocaleAsync auto-loads if locale not present', async () => {
      const loadPath = vi.fn(async () => ({ hello: 'Hallo' }))
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
        loadPath,
      })
      await i18n.setLocaleAsync('de')
      expect(loadPath).toHaveBeenCalledWith('de')
      expect(i18n.getLocale()).toBe('de')
    })

    it('setLocaleAsync uses cached translations if already loaded', async () => {
      const loadPath = vi.fn(async () => ({ hello: 'Hallo' }))
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
        loadPath,
      })
      await i18n.loadLocale('de')
      await i18n.setLocaleAsync('de')
      expect(loadPath).toHaveBeenCalledTimes(1)
    })
  })
})

describe('9. Change Events', () => {
  describe('i18n.onChange(callback)', () => {
    it('callback fires when locale changes via setLocale()', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.setLocale('de')
      expect(callback).toHaveBeenCalled()
    })

    it('callback receives new locale as first argument', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.setLocale('de')
      expect(callback).toHaveBeenCalledWith('de', 'en')
    })

    it('callback receives previous locale as second argument', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.setLocale('de')
      expect(callback).toHaveBeenCalledWith('de', 'en')
    })

    it('returns unsubscribe function', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback = vi.fn()
      const unsubscribe = i18n.onChange(callback)
      unsubscribe()
      i18n.setLocale('de')
      expect(callback).not.toHaveBeenCalled()
    })

    it('multiple callbacks can be registered', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      i18n.onChange(callback1)
      i18n.onChange(callback2)
      i18n.setLocale('de')
      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })

    it('callbacks invoked in registration order', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const order: number[] = []
      i18n.onChange(() => order.push(1))
      i18n.onChange(() => order.push(2))
      i18n.setLocale('de')
      expect(order).toEqual([1, 2])
    })

    it('does NOT fire when translations added (only locale change)', () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.addTranslations('en', { new: 'New' })
      expect(callback).not.toHaveBeenCalled()
    })

    it('does NOT fire when same locale is set again', () => {
      const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      const callback = vi.fn()
      i18n.onChange(callback)
      i18n.setLocale('en')
      expect(callback).not.toHaveBeenCalled()
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if callback is not a function', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.onChange('invalid')).toThrow(TypeError)
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.onChange(null)).toThrow(TypeError)
      })
    })
  })
})

describe('10. Missing Translation Handling', () => {
  describe('i18n.onMissing(callback)', () => {
    it('callback fires when translation is missing in current locale', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      const callback = vi.fn()
      i18n.onMissing(callback)
      i18n.t('nonexistent')
      expect(callback).toHaveBeenCalled()
    })

    it('callback receives key as first argument', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      const callback = vi.fn()
      i18n.onMissing(callback)
      i18n.t('missing.key')
      expect(callback).toHaveBeenCalledWith('missing.key', 'en')
    })

    it('callback receives current locale as second argument', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      const callback = vi.fn()
      i18n.onMissing(callback)
      i18n.t('missing')
      expect(callback).toHaveBeenCalledWith('missing', 'en')
    })

    it('callback fires even when fallback provides translation', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: {},
        },
      })
      const callback = vi.fn()
      i18n.onMissing(callback)
      expect(i18n.t('hello')).toBe('Hello')
      expect(callback).toHaveBeenCalledWith('hello', 'de')
    })

    it('returns unsubscribe function', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      const callback = vi.fn()
      const unsubscribe = i18n.onMissing(callback)
      unsubscribe()
      i18n.t('missing')
      expect(callback).not.toHaveBeenCalled()
    })

    it('multiple callbacks can be registered', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      const cb1 = vi.fn()
      const cb2 = vi.fn()
      i18n.onMissing(cb1)
      i18n.onMissing(cb2)
      i18n.t('missing')
      expect(cb1).toHaveBeenCalled()
      expect(cb2).toHaveBeenCalled()
    })

    it('does NOT fire when translation exists', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      const callback = vi.fn()
      i18n.onMissing(callback)
      i18n.t('hello')
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('i18n.setMissingBehavior(behavior)', () => {
    it("'key' - returns the key itself (default behavior)", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      i18n.setMissingBehavior('key')
      expect(i18n.t('missing.key')).toBe('missing.key')
    })

    it("'empty' - returns empty string", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      i18n.setMissingBehavior('empty')
      expect(i18n.t('missing.key')).toBe('')
    })

    it("'throw' - throws an error", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {} },
      })
      i18n.setMissingBehavior('throw')
      expect(() => i18n.t('missing.key')).toThrow(Error)
      expect(() => i18n.t('missing.key')).toThrow('Missing translation: missing.key')
    })

    it('behavior applies after fallback check', () => {
      const i18n = createI18n({
        defaultLocale: 'de',
        fallbackLocale: 'en',
        translations: {
          en: { hello: 'Hello' },
          de: {},
        },
      })
      i18n.setMissingBehavior('throw')
      expect(i18n.t('hello')).toBe('Hello')
      expect(() => i18n.t('missing')).toThrow()
    })

    it('returns the i18n instance for chaining', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      expect(i18n.setMissingBehavior('throw').t('hello')).toBe('Hello')
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if behavior is not valid', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.setMissingBehavior('invalid')).toThrow(TypeError)
      })
    })
  })
})

describe('11. Namespace Scoping', () => {
  describe('t.namespace(prefix) or i18n.namespace(prefix)', () => {
    it('returns a scoped translate function', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { common: { save: 'Save', cancel: 'Cancel' } } },
      })
      const tCommon = i18n.t.namespace('common')
      expect(tCommon('save')).toBe('Save')
    })

    it("scoped function looks up 'prefix.key'", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { common: { save: 'Save' } } },
      })
      const tCommon = i18n.t.namespace('common')
      expect(tCommon('save')).toBe('Save')
    })

    it('scoped function inherits interpolation', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { greetings: { hello: 'Hello, {{name}}!' } } },
      })
      const tGreet = i18n.t.namespace('greetings')
      expect(tGreet('hello', { name: 'World' })).toBe('Hello, World!')
    })

    it('scoped function inherits pluralization', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { shop: { items: { one: '{{count}} item', other: '{{count}} items' } } },
        },
      })
      const tShop = i18n.t.namespace('shop')
      expect(tShop('items', { count: 5 })).toBe('5 items')
    })

    it('can nest namespaces', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { a: { b: { c: { msg: 'Deep' } } } } },
      })
      const tAB = i18n.t.namespace('a').namespace('b')
      expect(tAB('c.msg')).toBe('Deep')
    })

    it('can nest namespaces via chained call', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { a: { b: { c: { msg: 'Deep' } } } } },
      })
      const tABC = i18n.t.namespace('a.b.c')
      expect(tABC('msg')).toBe('Deep')
    })

    it('scoped function uses current locale (not snapshot)', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { common: { save: 'Save' } },
          de: { common: { save: 'Speichern' } },
        },
      })
      const tCommon = i18n.t.namespace('common')
      i18n.setLocale('de')
      expect(tCommon('save')).toBe('Speichern')
    })

    it('empty prefix returns equivalent of base t', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      expect(i18n.t.namespace('')('hello')).toBe('Hello')
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
      })

      it('throws TypeError if prefix is not a string', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.t.namespace(123)).toThrow(TypeError)
      })

      it('allows null/undefined to mean no prefix', () => {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: { hello: 'Hello' } },
        })
        expect(i18n.t.namespace(null)('hello')).toBe('Hello')
        expect(i18n.t.namespace(undefined)('hello')).toBe('Hello')
      })
    })
  })
})

describe('12. Formatting Extensions', () => {
  describe('i18n.formatNumber(value, options?)', () => {
    it('formats number according to current locale', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatNumber(1234567.89)
      expect(result).toBe('1,234,567.89')
    })

    it('formats number according to different locale', () => {
      const i18n = createI18n({ defaultLocale: 'de-DE' })
      const result = i18n.formatNumber(1234567.89)
      expect(result).toBe('1.234.567,89')
    })

    it('accepts Intl.NumberFormat options', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatNumber(1234.5, { style: 'currency', currency: 'USD' })
      expect(result).toBe('$1,234.50')
    })

    it('handles negative numbers', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatNumber(-1234)
      expect(result).toBe('-1,234')
    })

    it('handles zero', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatNumber(0)
      expect(result).toBe('0')
    })

    it('handles very large numbers', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      expect(() => i18n.formatNumber(1e15)).not.toThrow()
    })

    it('handles decimals with precision options', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatNumber(1.23456, { maximumFractionDigits: 2 })
      expect(result).toBe('1.23')
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if value is not a number', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.formatNumber('abc')).toThrow(TypeError)
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.formatNumber(null)).toThrow(TypeError)
      })
    })
  })

  describe('i18n.formatDate(value, options?)', () => {
    it('formats Date object according to current locale', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatDate(new Date('2024-03-15'))
      expect(result).toContain('2024')
    })

    it('formats timestamp (number) as date', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatDate(1710460800000)
      expect(result).toBeTruthy()
    })

    it('formats ISO string as date', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const result = i18n.formatDate('2024-03-15T10:30:00Z')
      expect(result).toBeTruthy()
    })

    it('accepts Intl.DateTimeFormat options', () => {
      const i18n = createI18n({ defaultLocale: 'en-US' })
      const date = new Date('2024-03-15')
      const result = i18n.formatDate(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      expect(result).toContain('March')
      expect(result).toContain('2024')
    })

    it('formats according to locale', () => {
      const i18n = createI18n({ defaultLocale: 'de-DE' })
      const result = i18n.formatDate(new Date('2024-03-15'))
      expect(result).toContain('2024')
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if value is not a valid date', () => {
        expect(() => i18n.formatDate('invalid')).toThrow(TypeError)
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.formatDate(null)).toThrow(TypeError)
      })
    })
  })

  describe('i18n.formatRelativeTime(value, unit)', () => {
    it('formats relative time for past', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      expect(i18n.formatRelativeTime(-1, 'day')).toContain('ago')
      expect(i18n.formatRelativeTime(-3, 'hour')).toContain('ago')
    })

    it('formats relative time for future', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      expect(i18n.formatRelativeTime(1, 'day')).toContain('in')
      expect(i18n.formatRelativeTime(2, 'week')).toContain('in')
    })

    it('supports all standard units', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      expect(() => i18n.formatRelativeTime(1, 'second')).not.toThrow()
      expect(() => i18n.formatRelativeTime(1, 'minute')).not.toThrow()
      expect(() => i18n.formatRelativeTime(1, 'hour')).not.toThrow()
      expect(() => i18n.formatRelativeTime(1, 'day')).not.toThrow()
      expect(() => i18n.formatRelativeTime(1, 'week')).not.toThrow()
      expect(() => i18n.formatRelativeTime(1, 'month')).not.toThrow()
      expect(() => i18n.formatRelativeTime(1, 'year')).not.toThrow()
    })

    it('uses current locale', () => {
      const i18n = createI18n({ defaultLocale: 'de' })
      expect(i18n.formatRelativeTime(-1, 'day')).toContain('vor')
    })

    it('handles zero', () => {
      const i18n = createI18n({ defaultLocale: 'en' })
      const result = i18n.formatRelativeTime(0, 'day')
      expect(result).toBeTruthy()
    })

    describe('Invalid Inputs', () => {
      let i18n: I18n

      beforeEach(() => {
        i18n = createI18n({ defaultLocale: 'en' })
      })

      it('throws TypeError if value is not a number', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.formatRelativeTime('abc', 'day')).toThrow(TypeError)
      })

      it('throws TypeError if unit is not valid', () => {
        // @ts-expect-error - Testing runtime validation
        expect(() => i18n.formatRelativeTime(1, 'invalid')).toThrow()
      })
    })
  })
})

describe('13. Edge Cases & Error Handling', () => {
  describe('Deep Nesting', () => {
    it('handles 10 levels of nesting', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { a: { b: { c: { d: { e: { f: { g: { h: { i: { j: 'Deep' } } } } } } } } } },
        },
      })
      expect(i18n.t('a.b.c.d.e.f.g.h.i.j')).toBe('Deep')
    })

    it('handles 20 levels of nesting without stack overflow', () => {
      const nested: any = { value: 'VeryDeep' }
      let obj: any = nested
      const keys = []
      for (let i = 19; i >= 0; i--) {
        const key = `level${i}`
        keys.push(key)
        obj = { [key]: obj }
      }
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: obj },
      })
      expect(() => i18n.t(keys.reverse().join('.') + '.value')).not.toThrow()
      expect(i18n.t(keys.join('.') + '.value')).toBe('VeryDeep')
    })
  })

  describe('Special Key Characters', () => {
    it('handles keys with underscores throughout', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { error_code_not_found: 'Error' } },
      })
      expect(i18n.t('error_code_not_found')).toBe('Error')
    })

    it('handles keys with hyphens throughout', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { 'error-code-not-found': 'Error' } },
      })
      expect(i18n.t('error-code-not-found')).toBe('Error')
    })

    it('handles keys that are reserved words', () => {
      const translations = Object.create(null)
      translations.constructor = 'Ctor'
      translations.prototype = 'Proto'
      translations['__proto__'] = 'DunderProto'

      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: translations,
        },
      })
      expect(i18n.t('constructor')).toBe('Ctor')
      expect(i18n.t('prototype')).toBe('Proto')
      expect(i18n.t('__proto__')).toBe('DunderProto')
    })

    it('handles keys with unicode characters', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { über: 'over', 日本語: 'Japanese' } },
      })
      expect(i18n.t('über')).toBe('over')
      expect(i18n.t('日本語')).toBe('Japanese')
    })
  })

  describe('Locale Code Handling', () => {
    it('handles simple locale codes (en, de, fr)', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {}, fr: {} },
      })
      expect(() => i18n.setLocale('en')).not.toThrow()
      expect(() => i18n.setLocale('de')).not.toThrow()
      expect(() => i18n.setLocale('fr')).not.toThrow()
    })

    it('handles locale codes with region (en-US, en-GB, pt-BR)', () => {
      const i18n = createI18n({
        defaultLocale: 'en-US',
        translations: { 'en-US': {}, 'en-GB': {}, 'pt-BR': {} },
      })
      expect(() => i18n.setLocale('en-US')).not.toThrow()
    })

    it('handles locale codes with script (zh-Hans, zh-Hant)', () => {
      const i18n = createI18n({
        defaultLocale: 'zh-Hans',
        translations: { 'zh-Hans': {}, 'zh-Hant': {} },
      })
      expect(() => i18n.setLocale('zh-Hans')).not.toThrow()
    })

    it('does NOT normalize locale codes', () => {
      const i18n = createI18n({
        defaultLocale: 'en-US',
        translations: { 'en-US': { hello: 'Hello US' }, 'en-us': { hello: 'Hello us' } },
      })
      i18n.setLocale('en-US')
      expect(i18n.t('hello')).toBe('Hello US')
      i18n.setLocale('en-us')
      expect(i18n.t('hello')).toBe('Hello us')
    })
  })

  describe('Concurrent Operations', () => {
    it("rapid setLocale calls don't corrupt state", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'EN' },
          de: { msg: 'DE' },
          fr: { msg: 'FR' },
          es: { msg: 'ES' },
        },
      })
      for (let i = 0; i < 100; i++) {
        i18n.setLocale(['en', 'de', 'fr', 'es'][i % 4])
      }
      expect(i18n.getLocale()).toBe('es')
      expect(i18n.t('msg')).toBe('ES')
    })

    it('concurrent loadLocale calls for different locales', async () => {
      const loadPath = async (locale: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { msg: locale.toUpperCase() }
      }
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath,
      })
      await Promise.all([i18n.loadLocale('de'), i18n.loadLocale('fr'), i18n.loadLocale('es')])
      expect(i18n.isLocaleLoaded('de')).toBe(true)
      expect(i18n.isLocaleLoaded('fr')).toBe(true)
      expect(i18n.isLocaleLoaded('es')).toBe(true)
    })

    it("onChange callbacks don't interfere with each other", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {}, fr: {} },
      })
      const results1: Array<[string, string]> = []
      const results2: Array<[string, string]> = []
      i18n.onChange((newL, oldL) => results1.push([newL, oldL]))
      i18n.onChange((newL, oldL) => results2.push([newL, oldL]))
      i18n.setLocale('de')
      i18n.setLocale('fr')
      expect(results1).toEqual([
        ['de', 'en'],
        ['fr', 'de'],
      ])
      expect(results2).toEqual([
        ['de', 'en'],
        ['fr', 'de'],
      ])
    })
  })

  describe('Memory & Cleanup', () => {
    it("unsubscribed callbacks don't hold references", () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: {}, de: {} },
      })
      const callback = vi.fn()
      const unsub = i18n.onChange(callback)
      unsub()
      i18n.setLocale('de')
      expect(callback).not.toHaveBeenCalled()
    })

    it('translations can be replaced entirely', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { hello: 'Hello' } },
      })
      i18n.addTranslations('en', { goodbye: 'Goodbye' })
      expect(i18n.t('hello')).toBe('Hello')
      expect(i18n.t('goodbye')).toBe('Goodbye')
    })
  })
})
