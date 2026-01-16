# Core API

The main entry points for creating an i18n instance and translating text.

---

## `createI18n()`

Creates a new internationalization instance with translation and locale management methods.

**Signature:**

```typescript
function createI18n(options: I18nOptions): I18n
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `I18nOptions` | Yes | Configuration options for the i18n instance |

**Returns:** `I18n` — The i18n instance with all translation and management methods.

**Example:**

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: { greeting: 'Hello, {{name}}!' },
    es: { greeting: '¡Hola, {{name}}!' }
  }
})
```

**Throws:**

- `TypeError` — If `options` is null, undefined, or not an object
- `TypeError` — If `defaultLocale` is missing, empty, or not a string
- `TypeError` — If `translations` is provided but not an object
- `TypeError` — If `loadPath` is provided but not a function

---

## `t()`

Translates a key with optional interpolation parameters.

**Signature:**

```typescript
function t(key: string, params?: InterpolationParams): string
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | The translation key (dot notation for nested keys) |
| `params` | `InterpolationParams` | No | Values to interpolate into the translation |

**Returns:** `string` — The translated string, or the key if not found (depending on missing behavior).

**Example:**

```typescript
// Simple key
i18n.t('greeting')  // "Hello"

// Nested key
i18n.t('common.buttons.save')  // "Save"

// With interpolation
i18n.t('welcome', { name: 'Alice' })  // "Welcome, Alice!"

// With pluralization
i18n.t('items', { count: 5 })  // "5 items"
```

**Throws:**

- `TypeError` — If `key` is not a string
- `TypeError` — If `params` is provided but not an object
- `I18nError` — If translation is missing and behavior is `'throw'`

**Behavior:**

- Returns empty string for empty key
- Trims whitespace from key before lookup
- Missing translations: returns key, empty string, or throws (configurable)
- Fallback locale is checked if configured and key is missing

---

## `t.namespace()`

Creates a scoped translate function with a key prefix.

**Signature:**

```typescript
function namespace(prefix: string | null | undefined): TranslateFunction
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prefix` | `string \| null \| undefined` | Yes | The prefix to prepend to all keys. Pass `null` or `undefined` to reset to root. |

**Returns:** `TranslateFunction` — A new translate function that prepends the prefix to all keys.

**Example:**

```typescript
const tButtons = i18n.t.namespace('common.buttons')

tButtons('save')    // Same as i18n.t('common.buttons.save')
tButtons('cancel')  // Same as i18n.t('common.buttons.cancel')

// Nesting namespaces
const tCommon = i18n.t.namespace('common')
const tLabels = tCommon.namespace('labels')
tLabels('name')  // Same as i18n.t('common.labels.name')

// Reset to root
const tRoot = tButtons.namespace(null)
tRoot('greeting')  // Same as i18n.t('greeting')
```

**Throws:**

- `TypeError` — If `prefix` is not a string, null, or undefined

---

## `i18n.namespace()`

Alias for `t.namespace()`. Creates a scoped translate function.

**Signature:**

```typescript
function namespace(prefix: string | null | undefined): TranslateFunction
```

**Example:**

```typescript
const tErrors = i18n.namespace('errors')
tErrors('notFound')  // Same as i18n.t('errors.notFound')
```

---

## Types

### `I18nOptions`

Configuration options for creating an i18n instance.

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
| `defaultLocale` | `string` | Yes | The initial locale to use |
| `fallbackLocale` | `string` | No | Locale to check when translation is missing |
| `translations` | `Record<string, TranslationObject>` | No | Initial translations keyed by locale |
| `loadPath` | `LoadPathFunction` | No | Function to load translations dynamically |

### `InterpolationParams`

Values to interpolate into translation strings.

```typescript
type InterpolationParams = Record<string, string | number | boolean | null | undefined>
```

### `TranslateFunction`

The translate function type, including the `namespace` method.

```typescript
interface TranslateFunction {
  (key: string, params?: InterpolationParams): string
  namespace: (prefix: string | null | undefined) => TranslateFunction
}
```
