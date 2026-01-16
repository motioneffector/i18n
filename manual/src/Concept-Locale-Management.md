# Locale Management

The i18n instance has a "current locale" that all translations use. Change it with `setLocale()` and all subsequent `t()` calls use the new locale. Locale management also includes fallback behavior for missing translations and lazy-loading translations on demand.

## How It Works

When you create an i18n instance, you specify a `defaultLocale`. This becomes the current locale. All `t()` calls look up translations in the current locale's dictionary:

```
setLocale('en')  ->  t('hello') looks in translations.en
setLocale('de')  ->  t('hello') looks in translations.de
```

If a translation is missing, the fallback chain kicks in:

1. Look in current locale
2. Look in fallback locale (if configured)
3. Return the key itself (or empty string, or throw, depending on settings)

## Basic Usage

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: { greeting: 'Hello' },
    de: { greeting: 'Hallo' },
    fr: { greeting: 'Bonjour' }
  }
})

i18n.getLocale()        // "en"
i18n.t('greeting')      // "Hello"

i18n.setLocale('de')
i18n.getLocale()        // "de"
i18n.t('greeting')      // "Hallo"
```

## Key Points

- **`setLocale()` is synchronous** - Translations must already be loaded
- **`setLocaleAsync()` auto-loads** - Uses `loadPath` to fetch translations if needed
- **Fallback is one level deep** - Goes current -> fallback -> key, not a chain
- **`onChange` fires on switch** - Subscribe to react to locale changes
- **Locale codes are case-sensitive** - `en-US` and `en-us` are different locales

## Examples

### Reacting to Locale Changes

Subscribe to locale changes to update your UI:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { hello: 'Hello' },
    es: { hello: 'Hola' }
  }
})

// Subscribe to changes
const unsubscribe = i18n.onChange((newLocale, prevLocale) => {
  console.log(`Changed from ${prevLocale} to ${newLocale}`)
  // Re-render your UI here
})

i18n.setLocale('es')  // Logs: "Changed from en to es"

// Later, when you're done:
unsubscribe()
```

### Fallback for Missing Translations

Configure a fallback locale to handle incomplete translations:

```typescript
const i18n = createI18n({
  defaultLocale: 'de',
  fallbackLocale: 'en',
  translations: {
    en: {
      hello: 'Hello',
      goodbye: 'Goodbye'
    },
    de: {
      hello: 'Hallo'
      // 'goodbye' not translated yet
    }
  }
})

i18n.t('hello')    // "Hallo" (found in German)
i18n.t('goodbye')  // "Goodbye" (falls back to English)
```

### Checking Available Locales

See which locales have loaded translations:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { hello: 'Hello' },
    de: { hello: 'Hallo' }
  }
})

i18n.getAvailableLocales()  // ["en", "de"]
i18n.isLocaleLoaded('en')   // true
i18n.isLocaleLoaded('fr')   // false
```

## Related

- **[Changing Locales](Guide-Changing-Locales)** - Step-by-step guide for runtime switching
- **[Lazy Loading Translations](Guide-Lazy-Loading)** - Load translations on demand
- **[Locale Management API](API-Locale-Management)** - Full method documentation
