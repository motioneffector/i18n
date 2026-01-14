# Event Callbacks API

Methods for subscribing to events and configuring behavior.

---

## `onChange()`

Subscribes to locale change events.

**Signature:**

```typescript
function onChange(callback: ChangeCallback): () => void
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `callback` | `ChangeCallback` | Yes | Function called when locale changes |

**Returns:** `() => void` — Unsubscribe function.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: {}, es: {} }
})

// Subscribe
const unsubscribe = i18n.onChange((newLocale, prevLocale) => {
  console.log(`Changed from ${prevLocale} to ${newLocale}`)
  document.documentElement.lang = newLocale
})

i18n.setLocale('es')
// Console: "Changed from en to es"

// Unsubscribe when done
unsubscribe()

i18n.setLocale('en')
// No console output - unsubscribed
```

**Throws:**

- `TypeError` — If `callback` is not a function

**Behavior:**

- Callbacks fire in registration order
- Does not fire when setting locale to current value
- Does not fire when adding translations (only locale changes)
- Multiple callbacks can be registered
- Callback errors are caught and logged, don't affect other callbacks

---

## `onMissing()`

Subscribes to missing translation events.

**Signature:**

```typescript
function onMissing(callback: MissingCallback): () => void
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `callback` | `MissingCallback` | Yes | Function called when a translation is missing |

**Returns:** `() => void` — Unsubscribe function.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: { hello: 'Hello' },
    de: {}  // Empty
  }
})

// Subscribe
const unsubscribe = i18n.onMissing((key, locale) => {
  console.warn(`Missing: "${key}" in "${locale}"`)
})

i18n.t('hello')     // "Hello" - no callback
i18n.t('missing')   // "missing" - callback fires
// Console: Missing: "missing" in "en"

i18n.setLocale('de')
i18n.t('hello')     // "Hello" (fallback) - callback still fires!
// Console: Missing: "hello" in "de"

// Unsubscribe
unsubscribe()
```

**Throws:**

- `TypeError` — If `callback` is not a function

**Behavior:**

- Fires when key is missing in current locale (even if found in fallback)
- Fires before the missing behavior (key/empty/throw) is applied
- Multiple callbacks can be registered
- Callback errors are caught and logged

---

## `setMissingBehavior()`

Configures what happens when a translation is missing.

**Signature:**

```typescript
function setMissingBehavior(behavior: MissingBehavior): I18n
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `behavior` | `MissingBehavior` | Yes | The behavior mode |

**Returns:** `I18n` — The i18n instance for chaining.

**Example:**

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: {} }
})

// 'key' - Return the key itself (default)
i18n.setMissingBehavior('key')
i18n.t('missing.key')  // "missing.key"

// 'empty' - Return empty string
i18n.setMissingBehavior('empty')
i18n.t('missing.key')  // ""

// 'throw' - Throw an error
i18n.setMissingBehavior('throw')
i18n.t('missing.key')  // throws I18nError
```

**Throws:**

- `TypeError` — If `behavior` is not `'key'`, `'empty'`, or `'throw'`

**Behavior:**

- Default is `'key'`
- Applied after checking fallback locale
- `onMissing` callbacks fire before the behavior is applied
- `'throw'` mode throws `I18nError` with message `"Missing translation: {key}"`

---

## Types

### `ChangeCallback`

Callback for locale change events.

```typescript
type ChangeCallback = (newLocale: string, prevLocale: string) => void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `newLocale` | `string` | The new current locale |
| `prevLocale` | `string` | The previous locale |

### `MissingCallback`

Callback for missing translation events.

```typescript
type MissingCallback = (key: string, locale: string) => void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | The missing translation key |
| `locale` | `string` | The locale where the key was missing |

### `MissingBehavior`

Behavior modes for missing translations.

```typescript
type MissingBehavior = 'key' | 'empty' | 'throw'
```

| Value | Description |
|-------|-------------|
| `'key'` | Return the key string (default) |
| `'empty'` | Return empty string |
| `'throw'` | Throw an `I18nError` |
