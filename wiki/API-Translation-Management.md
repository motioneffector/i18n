# Translation Management API

Methods for adding, loading, and inspecting translation data.

---

## `addTranslations()`

Adds or merges translations for a locale.

**Signature:**

```typescript
function addTranslations(locale: string, translations: TranslationObject): I18n
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | Yes | The locale code to add translations for |
| `translations` | `TranslationObject` | Yes | The translations to add |

**Returns:** `I18n` — The i18n instance for chaining.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: { hello: 'Hello' } }
})

// Add new locale
i18n.addTranslations('es', { hello: 'Hola', goodbye: 'Adiós' })

// Merge into existing locale
i18n.addTranslations('en', { goodbye: 'Goodbye' })

i18n.t('hello')    // "Hello"
i18n.t('goodbye')  // "Goodbye"
```

**Throws:**

- `TypeError` — If `locale` is not a string or is empty
- `TypeError` — If `translations` is not an object

**Behavior:**

- Creates new locale if it doesn't exist
- Deep merges with existing translations
- Overwrites keys on conflict
- Locale becomes available in `getAvailableLocales()`

---

## `loadLocale()`

Loads translations for a locale using the configured `loadPath` function.

**Signature:**

```typescript
function loadLocale(locale: string, options?: LoadLocaleOptions): Promise<void>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | Yes | The locale code to load |
| `options` | `LoadLocaleOptions` | No | Loading options |

**Returns:** `Promise<void>` — Resolves when loading is complete.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  loadPath: async (locale) => {
    const res = await fetch(`/locales/${locale}.json`)
    return res.json()
  }
})

// Load and wait
await i18n.loadLocale('de')
i18n.setLocale('de')

// Force reload
await i18n.loadLocale('de', { forceReload: true })
```

**Throws:**

- `Error` — If `loadPath` is not configured
- `TypeError` — If `loadPath` returns non-object data
- Any error thrown by `loadPath`

**Behavior:**

- Returns immediately if locale is already loaded (unless `forceReload`)
- Deduplicates concurrent requests for the same locale
- Merges loaded translations with any existing ones

---

## `getTranslations()`

Returns a copy of the translations for a locale.

**Signature:**

```typescript
function getTranslations(locale?: string): TranslationObject
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | No | The locale to get translations for. Defaults to current locale. |

**Returns:** `TranslationObject` — A deep copy of the translations.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { hello: 'Hello', nested: { key: 'value' } }
  }
})

// Get current locale's translations
const enTrans = i18n.getTranslations()
// { hello: 'Hello', nested: { key: 'value' } }

// Get specific locale
const deTrans = i18n.getTranslations('de')
// {} (empty if not loaded)

// Safe to modify - it's a copy
enTrans.hello = 'Modified'
i18n.t('hello')  // Still "Hello"
```

**Behavior:**

- Returns empty object if locale doesn't exist
- Returns deep copy (modifications don't affect internal state)

---

## `hasKey()`

Checks if a translation key exists in a locale.

**Signature:**

```typescript
function hasKey(key: string, locale?: string): boolean
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | The translation key to check |
| `locale` | `string` | No | The locale to check. Defaults to current locale. |

**Returns:** `boolean` — `true` if the key exists (even if it's a namespace).

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      hello: 'Hello',
      common: { save: 'Save' }
    }
  }
})

i18n.hasKey('hello')          // true
i18n.hasKey('missing')        // false
i18n.hasKey('common')         // true (it's a namespace)
i18n.hasKey('common.save')    // true
i18n.hasKey('common.delete')  // false
```

**Throws:**

- `TypeError` — If `key` is not a string
- `TypeError` — If `locale` is provided but not a string

**Behavior:**

- Does NOT check fallback locale
- Returns `true` for namespace keys (objects), not just leaf values

---

## Types

### `TranslationObject`

A nested object containing translation strings.

```typescript
interface TranslationObject {
  [key: string]: TranslationValue
}

type TranslationValue = string | TranslationObject | PluralTranslations
```

### `PluralTranslations`

Plural forms for a translation key.

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

### `LoadPathFunction`

Function type for dynamic translation loading.

```typescript
type LoadPathFunction = (locale: string) => Promise<TranslationObject>
```
