# Locale Management API

Methods for getting, setting, and querying locale information.

---

## `getLocale()`

Returns the current locale code.

**Signature:**

```typescript
function getLocale(): string
```

**Returns:** `string` — The current locale code (e.g., `"en"`, `"de-DE"`).

**Example:**

```typescript
const i18n = createI18n({ defaultLocale: 'en' })

i18n.getLocale()  // "en"

i18n.setLocale('de')
i18n.getLocale()  // "de"
```

---

## `setLocale()`

Changes the current locale synchronously. Translations must already be loaded.

**Signature:**

```typescript
function setLocale(locale: string): I18n
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | Yes | The locale code to switch to |

**Returns:** `I18n` — The i18n instance for chaining.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { hello: 'Hello' },
    es: { hello: 'Hola' }
  }
})

i18n.setLocale('es').t('hello')  // "Hola"
```

**Throws:**

- `TypeError` — If `locale` is not a string or is empty
- `Error` — If locale has no translations and no fallback is configured

**Behavior:**

- Fires `onChange` callbacks when locale actually changes
- Does not fire callbacks if setting to current locale
- Allows setting to unknown locale if `fallbackLocale` is configured

---

## `setLocaleAsync()`

Changes the current locale, loading translations if necessary.

**Signature:**

```typescript
function setLocaleAsync(locale: string): Promise<I18n>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | Yes | The locale code to switch to |

**Returns:** `Promise<I18n>` — Resolves to the i18n instance after loading and switching.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: { hello: 'Hello' } },
  loadPath: async (locale) => {
    const res = await fetch(`/locales/${locale}.json`)
    return res.json()
  }
})

// Automatically loads Spanish translations, then switches
await i18n.setLocaleAsync('es')
i18n.t('hello')  // "Hola"
```

**Behavior:**

- Uses cached translations if already loaded
- Calls `loadPath` if locale is not loaded and `loadPath` is configured
- Falls back to `setLocale()` after loading

---

## `getAvailableLocales()`

Returns an array of locale codes that have loaded translations.

**Signature:**

```typescript
function getAvailableLocales(): string[]
```

**Returns:** `string[]` — Array of locale codes with loaded translations.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { hello: 'Hello' },
    es: { hello: 'Hola' },
    fr: { hello: 'Bonjour' }
  }
})

i18n.getAvailableLocales()  // ["en", "es", "fr"]

i18n.addTranslations('de', { hello: 'Hallo' })
i18n.getAvailableLocales()  // ["en", "es", "fr", "de"]
```

**Behavior:**

- Returns a copy of the internal array (safe to modify)
- Order matches insertion order
- Empty array if no translations loaded

---

## `isLocaleLoaded()`

Checks if a locale has translations loaded.

**Signature:**

```typescript
function isLocaleLoaded(locale: string): boolean
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | Yes | The locale code to check |

**Returns:** `boolean` — `true` if translations exist for this locale.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: { hello: 'Hello' } }
})

i18n.isLocaleLoaded('en')  // true
i18n.isLocaleLoaded('es')  // false

await i18n.loadLocale('es')
i18n.isLocaleLoaded('es')  // true
```
