# Types Reference

All TypeScript types exported by the library.

---

## Core Types

### `I18n`

The main i18n instance interface with all translation and management methods.

```typescript
interface I18n {
  t: TranslateFunction
  getLocale: () => string
  setLocale: (locale: string) => I18n
  setLocaleAsync: (locale: string) => Promise<I18n>
  getAvailableLocales: () => string[]
  addTranslations: (locale: string, translations: TranslationObject) => I18n
  hasKey: (key: string, locale?: string) => boolean
  getTranslations: (locale?: string) => TranslationObject
  loadLocale: (locale: string, options?: LoadLocaleOptions) => Promise<void>
  isLocaleLoaded: (locale: string) => boolean
  onChange: (callback: ChangeCallback) => () => void
  onMissing: (callback: MissingCallback) => () => void
  setMissingBehavior: (behavior: MissingBehavior) => I18n
  namespace: (prefix: string | null | undefined) => TranslateFunction
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string
}
```

---

### `I18nOptions`

Configuration options for `createI18n()`.

```typescript
interface I18nOptions {
  defaultLocale: string
  fallbackLocale?: string
  translations?: Record<string, TranslationObject>
  loadPath?: LoadPathFunction
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `defaultLocale` | `string` | Yes | The initial locale code |
| `fallbackLocale` | `string` | No | Locale to use when translation is missing |
| `translations` | `Record<string, TranslationObject>` | No | Initial translations keyed by locale |
| `loadPath` | `LoadPathFunction` | No | Async function to load translations |

**Example:**

```typescript
const options: I18nOptions = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: { greeting: 'Hello' },
    es: { greeting: 'Hola' }
  },
  loadPath: async (locale) => {
    const res = await fetch(`/locales/${locale}.json`)
    return res.json()
  }
}
```

---

### `TranslateFunction`

The `t()` function type with the `namespace` method.

```typescript
interface TranslateFunction {
  (key: string, params?: InterpolationParams): string
  namespace: (prefix: string | null | undefined) => TranslateFunction
}
```

**Example:**

```typescript
const t: TranslateFunction = i18n.t

t('greeting')                    // Call as function
t('greeting', { name: 'World' }) // With params
t.namespace('common')            // Create namespaced function
```

---

## Translation Types

### `TranslationObject`

A nested object containing translation values.

```typescript
interface TranslationObject {
  [key: string]: TranslationValue
}
```

**Example:**

```typescript
const translations: TranslationObject = {
  greeting: 'Hello',
  nested: {
    key: 'Nested value'
  },
  items: {
    one: '{{count}} item',
    other: '{{count}} items'
  }
}
```

---

### `TranslationValue`

A union type for all possible translation values.

```typescript
type TranslationValue = string | TranslationObject | PluralTranslations
```

---

### `PluralTranslations`

Object containing plural forms for a translation.

```typescript
interface PluralTranslations {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `zero` | No | Form for zero (custom, not Intl-based) |
| `one` | No | Form for singular (1 in English) |
| `two` | No | Form for dual (Arabic) |
| `few` | No | Form for few (Russian 2-4) |
| `many` | No | Form for many (Russian 5-20) |
| `other` | Yes | Default/fallback form |

**Example:**

```typescript
const plurals: PluralTranslations = {
  zero: 'No items',
  one: '{{count}} item',
  other: '{{count}} items'
}
```

---

### `InterpolationParams`

Parameters for interpolation in translations.

```typescript
type InterpolationParams = Record<string, string | number | boolean | null | undefined>
```

**Example:**

```typescript
const params: InterpolationParams = {
  name: 'Alice',
  count: 5,
  active: true,
  optional: null
}
```

---

## Callback Types

### `ChangeCallback`

Callback function for locale change events.

```typescript
type ChangeCallback = (newLocale: string, prevLocale: string) => void
```

**Example:**

```typescript
const callback: ChangeCallback = (newLocale, prevLocale) => {
  console.log(`Changed from ${prevLocale} to ${newLocale}`)
}
```

---

### `MissingCallback`

Callback function for missing translation events.

```typescript
type MissingCallback = (key: string, locale: string) => void
```

**Example:**

```typescript
const callback: MissingCallback = (key, locale) => {
  console.warn(`Missing: ${key} in ${locale}`)
}
```

---

## Configuration Types

### `MissingBehavior`

Behavior mode when a translation is missing.

```typescript
type MissingBehavior = 'key' | 'empty' | 'throw'
```

| Value | Description |
|-------|-------------|
| `'key'` | Return the key string (default) |
| `'empty'` | Return empty string |
| `'throw'` | Throw an `I18nError` |

---

### `LoadPathFunction`

Async function type for loading translations dynamically.

```typescript
type LoadPathFunction = (locale: string) => Promise<TranslationObject>
```

**Example:**

```typescript
const loadPath: LoadPathFunction = async (locale) => {
  const response = await fetch(`/locales/${locale}.json`)
  if (!response.ok) throw new Error(`Failed to load ${locale}`)
  return response.json()
}
```

---

### `LoadLocaleOptions`

Options for `loadLocale()`.

```typescript
interface LoadLocaleOptions {
  forceReload?: boolean
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `forceReload` | `boolean` | `false` | Force reload even if already loaded |

---

## Error Types

### `I18nError`

Error thrown for i18n-specific errors (e.g., missing translations in throw mode).

```typescript
class I18nError extends Error {
  name: 'I18nError'
}
```

**Example:**

```typescript
import { I18nError } from '@motioneffector/i18n'

try {
  i18n.setMissingBehavior('throw')
  i18n.t('missing.key')
} catch (error) {
  if (error instanceof I18nError) {
    console.error('Translation error:', error.message)
  }
}
```
