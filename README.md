# @motioneffector/i18n

Lightweight, type-safe internationalization library with zero dependencies for modern web applications. Built with TypeScript and designed for simplicity and performance.

[![npm version](https://img.shields.io/npm/v/@motioneffector/i18n.svg)](https://www.npmjs.com/package/@motioneffector/i18n)
[![license](https://img.shields.io/npm/l/@motioneffector/i18n.svg)](https://github.com/motioneffector/i18n/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Demo

[Try the interactive demo](https://motioneffector.github.io/i18n/) to see the library in action.

## Installation

```bash
npm install @motioneffector/i18n
```

## Quick Start

```typescript
import { createI18n } from '@motioneffector/i18n'

// Create an i18n instance
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      welcome: 'Welcome, {{name}}!',
      items: {
        one: '{{count}} item',
        other: '{{count}} items'
      }
    }
  }
})

// Translate with interpolation
i18n.t('welcome', { name: 'Alice' })  // "Welcome, Alice!"

// Automatic pluralization
i18n.t('items', { count: 1 })  // "1 item"
i18n.t('items', { count: 5 })  // "5 items"
```

## Features

- **Zero Dependencies** - Lightweight and self-contained
- **Type Safe** - Full TypeScript support with typed translation keys
- **Interpolation** - Dynamic value insertion with `{{placeholder}}` syntax
- **Pluralization** - Language-correct plural forms using `Intl.PluralRules`
- **Nested Keys** - Organize translations hierarchically with dot notation
- **Fallback Locale** - Graceful handling of missing translations
- **Lazy Loading** - Load translation files on demand
- **Change Events** - React to locale changes with callbacks
- **Format Helpers** - Built-in number, date, and relative time formatting
- **Tree-Shakeable** - ESM build for optimal bundle size

## API Reference

### `createI18n(options)`

Creates an i18n instance with the specified configuration.

**Options:**
- `defaultLocale` (required) - Initial locale code (e.g., `'en'`, `'de'`)
- `fallbackLocale` (optional) - Fallback locale when translation is missing
- `translations` (optional) - Initial translation data as a nested object
- `loadPath` (optional) - Async function to load translations for a locale

**Returns:** `I18n` instance

**Example:**
```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: { hello: 'Hello' },
    de: { hello: 'Hallo' }
  }
})
```

### `i18n.t(key, params?)`

Translates a key with optional interpolation and pluralization.

**Parameters:**
- `key` - Translation key in dot notation (e.g., `'common.save'`)
- `params` (optional) - Object with interpolation values or `count` for pluralization

**Returns:** Translated string

**Examples:**
```typescript
// Simple translation
i18n.t('common.save')  // "Save"

// Interpolation
i18n.t('greeting', { name: 'Bob' })  // "Hello, Bob!"

// Pluralization (automatically uses Intl.PluralRules)
i18n.t('items', { count: 0 })  // "0 items" (other)
i18n.t('items', { count: 1 })  // "1 item" (one)
i18n.t('items', { count: 5 })  // "5 items" (other)
```

### `i18n.setLocale(locale)`

Switches to a different locale. Throws an error if locale has no translations and no fallback is configured.

**Parameters:**
- `locale` - Locale code to switch to

**Returns:** `I18n` instance (for chaining)

**Example:**
```typescript
i18n.setLocale('de')
i18n.t('hello')  // "Hallo"
```

### `i18n.setLocaleAsync(locale)`

Switches to a different locale with automatic lazy loading if `loadPath` is configured.

**Parameters:**
- `locale` - Locale code to switch to

**Returns:** `Promise<I18n>` (for chaining)

**Example:**
```typescript
await i18n.setLocaleAsync('fr')  // Loads 'fr' if not yet loaded
```

### `i18n.getLocale()`

Returns the current locale code.

**Returns:** `string`

**Example:**
```typescript
i18n.getLocale()  // "en"
```

### `i18n.getAvailableLocales()`

Returns an array of all loaded locale codes.

**Returns:** `string[]`

**Example:**
```typescript
i18n.getAvailableLocales()  // ["en", "de", "fr"]
```

### `i18n.addTranslations(locale, translations)`

Adds or merges translations for a locale at runtime.

**Parameters:**
- `locale` - Locale code
- `translations` - Translation object to add/merge

**Returns:** `I18n` instance (for chaining)

**Example:**
```typescript
i18n.addTranslations('en', {
  new_feature: {
    title: 'New Feature',
    description: 'Check out our new feature!'
  }
})
```

### `i18n.hasKey(key, locale?)`

Checks if a translation key exists in the specified locale (or current locale if not specified).

**Parameters:**
- `key` - Translation key to check
- `locale` (optional) - Locale to check (defaults to current locale)

**Returns:** `boolean`

**Example:**
```typescript
i18n.hasKey('common.save')  // true
i18n.hasKey('missing.key')  // false
```

### `i18n.getTranslations(locale?)`

Returns all translations for the specified locale (or current locale if not specified).

**Parameters:**
- `locale` (optional) - Locale to retrieve (defaults to current locale)

**Returns:** `TranslationObject` (deep copy)

**Example:**
```typescript
const translations = i18n.getTranslations('en')
```

### `i18n.loadLocale(locale, options?)`

Loads translations for a locale using the configured `loadPath` function.

**Parameters:**
- `locale` - Locale to load
- `options` (optional) - Options object
  - `forceReload` - Force reload even if already loaded (default: `false`)

**Returns:** `Promise<void>`

**Example:**
```typescript
await i18n.loadLocale('es')
```

### `i18n.isLocaleLoaded(locale)`

Checks if translations for a locale are loaded.

**Parameters:**
- `locale` - Locale to check

**Returns:** `boolean`

**Example:**
```typescript
i18n.isLocaleLoaded('en')  // true
```

### `i18n.onChange(callback)`

Subscribes to locale change events.

**Parameters:**
- `callback` - Function called when locale changes: `(newLocale: string, oldLocale: string) => void`

**Returns:** `() => void` (unsubscribe function)

**Example:**
```typescript
const unsubscribe = i18n.onChange((newLocale, oldLocale) => {
  console.log(`Locale changed from ${oldLocale} to ${newLocale}`)
})

// Later, to unsubscribe:
unsubscribe()
```

### `i18n.onMissing(callback)`

Subscribes to missing translation events (useful for logging/debugging).

**Parameters:**
- `callback` - Function called when translation is missing: `(key: string, locale: string) => void`

**Returns:** `() => void` (unsubscribe function)

**Example:**
```typescript
i18n.onMissing((key, locale) => {
  console.warn(`Missing translation: ${key} in ${locale}`)
})
```

### `i18n.setMissingBehavior(behavior)`

Configures what happens when a translation is missing.

**Parameters:**
- `behavior` - One of:
  - `'key'` - Return the key itself (default)
  - `'empty'` - Return an empty string
  - `'throw'` - Throw an error

**Returns:** `I18n` instance (for chaining)

**Example:**
```typescript
i18n.setMissingBehavior('throw')  // Throw errors for missing translations in dev
```

### `t.namespace(prefix)` or `i18n.namespace(prefix)`

Creates a scoped translation function with a key prefix.

**Parameters:**
- `prefix` - Namespace prefix (e.g., `'common'` or `'editor.toolbar'`)

**Returns:** `TranslateFunction` with the prefix applied

**Example:**
```typescript
const tCommon = i18n.t.namespace('common')
tCommon('save')    // Same as i18n.t('common.save')
tCommon('cancel')  // Same as i18n.t('common.cancel')
```

### `i18n.formatNumber(value, options?)`

Formats a number according to the current locale using `Intl.NumberFormat`.

**Parameters:**
- `value` - Number to format
- `options` (optional) - `Intl.NumberFormat` options

**Returns:** `string`

**Example:**
```typescript
i18n.formatNumber(1234567.89)  // "1,234,567.89" (en-US)
i18n.formatNumber(1234.5, { style: 'currency', currency: 'USD' })  // "$1,234.50"
```

### `i18n.formatDate(value, options?)`

Formats a date according to the current locale using `Intl.DateTimeFormat`.

**Parameters:**
- `value` - Date object, timestamp, or ISO string
- `options` (optional) - `Intl.DateTimeFormat` options

**Returns:** `string`

**Example:**
```typescript
i18n.formatDate(new Date('2024-03-15'))  // "3/15/2024" (en-US)
i18n.formatDate(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
```

### `i18n.formatRelativeTime(value, unit)`

Formats relative time according to the current locale using `Intl.RelativeTimeFormat`.

**Parameters:**
- `value` - Numeric value (negative for past, positive for future)
- `unit` - Time unit: `'second'`, `'minute'`, `'hour'`, `'day'`, `'week'`, `'month'`, `'year'`

**Returns:** `string`

**Example:**
```typescript
i18n.formatRelativeTime(-1, 'day')   // "1 day ago"
i18n.formatRelativeTime(2, 'week')   // "in 2 weeks"
```

## Advanced Usage

### Lazy Loading

Load translation files on demand to reduce initial bundle size:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: { /* initial translations */ } },
  loadPath: async (locale) => {
    const response = await fetch(`/locales/${locale}.json`)
    return response.json()
  }
})

// Load and switch to a new locale
await i18n.setLocaleAsync('fr')  // Automatically loads if not cached
```

### Pluralization

The library uses `Intl.PluralRules` for language-correct pluralization:

```typescript
// English: 'one' and 'other'
const translations = {
  items: {
    one: '{{count}} item',
    other: '{{count}} items'
  }
}

// Russian: 'one', 'few', 'many', 'other'
const translationsRu = {
  items: {
    one: '{{count}} предмет',
    few: '{{count}} предмета',
    many: '{{count}} предметов',
    other: '{{count}} предмета'
  }
}
```

### Nested Namespaces

Organize translations hierarchically:

```typescript
const translations = {
  en: {
    editor: {
      toolbar: {
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline'
      },
      menu: {
        file: 'File',
        edit: 'Edit'
      }
    }
  }
}

// Access with dot notation
i18n.t('editor.toolbar.bold')  // "Bold"

// Or use namespace scoping
const tToolbar = i18n.t.namespace('editor.toolbar')
tToolbar('bold')     // "Bold"
tToolbar('italic')   // "Italic"
```

## Error Handling

The library exports a custom error class for translation-related errors:

```typescript
import { I18nError } from '@motioneffector/i18n'

try {
  i18n.setMissingBehavior('throw')
  i18n.t('missing.key')
} catch (e) {
  if (e instanceof I18nError) {
    console.error('Translation error:', e.message)
  }
}
```

## Browser Support

Works in all modern browsers that support ES2022+ features including:
- `Intl.PluralRules`
- `Intl.NumberFormat`
- `Intl.DateTimeFormat`
- `Intl.RelativeTimeFormat`

For older browsers, use a polyfill or transpiler.

## TypeScript Support

The library is written in TypeScript and includes complete type definitions. You can optionally use generic types for strict type checking of translation keys:

```typescript
type Translations = {
  en: {
    common: {
      save: string
      cancel: string
    }
  }
}

const i18n = createI18n<Translations>({
  defaultLocale: 'en',
  translations: { /* ... */ }
})

// TypeScript will autocomplete and validate keys
i18n.t('common.save')  // ✓ Valid
i18n.t('common.invalid')  // ✗ TypeScript error
```

## License

MIT © [motioneffector](https://github.com/motioneffector)
