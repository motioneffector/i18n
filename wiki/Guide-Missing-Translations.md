# Handling Missing Translations

This guide shows you how to detect and handle missing translations during development and production. You'll learn to configure callbacks, set behavior modes, and implement robust fallback strategies.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand locale management](Concept-Locale-Management)

## Overview

We'll handle missing translations by:

1. Setting up `onMissing` callbacks for detection
2. Configuring missing behavior modes
3. Implementing development-time logging
4. Setting up production fallbacks

## Step 1: Detect Missing Translations

Subscribe to the `onMissing` event to know when a translation is missing:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { greeting: 'Hello' }
  }
})

// Subscribe to missing translations
i18n.onMissing((key, locale) => {
  console.warn(`Missing translation: "${key}" in locale "${locale}"`)
})

i18n.t('greeting')       // "Hello" - no callback
i18n.t('farewell')       // "farewell" - callback fires
// Console: Missing translation: "farewell" in locale "en"
```

## Step 2: Configure Missing Behavior

Choose what happens when a translation is missing:

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
i18n.t('missing.key')  // throws Error: Missing translation: missing.key
```

## Step 3: Set Up Development Logging

During development, log missing translations to catch them early:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: { /* your translations */ }
  }
})

if (process.env.NODE_ENV === 'development') {
  const missingKeys = new Set<string>()

  i18n.onMissing((key, locale) => {
    const cacheKey = `${locale}:${key}`
    if (!missingKeys.has(cacheKey)) {
      missingKeys.add(cacheKey)
      console.warn(
        `%c[i18n] Missing: "${key}" in "${locale}"`,
        'color: orange; font-weight: bold'
      )
    }
  })
}
```

## Step 4: Configure Fallback Locale

Use `fallbackLocale` to show translations from a default language when missing:

```typescript
const i18n = createI18n({
  defaultLocale: 'de',
  fallbackLocale: 'en',  // Fall back to English
  translations: {
    en: {
      greeting: 'Hello',
      newFeature: 'Try our new feature!'
    },
    de: {
      greeting: 'Hallo'
      // 'newFeature' not translated yet
    }
  }
})

i18n.t('greeting')     // "Hallo" (found in German)
i18n.t('newFeature')   // "Try our new feature!" (falls back to English)
```

Note: `onMissing` still fires when falling back, so you know which translations need work.

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: {
      app: { title: 'My App' },
      errors: { generic: 'Something went wrong' }
    },
    es: {
      app: { title: 'Mi Aplicación' }
      // errors not translated
    }
  }
})

// Development: strict mode with logging
if (process.env.NODE_ENV === 'development') {
  const reported = new Set<string>()

  i18n.onMissing((key, locale) => {
    const id = `${locale}:${key}`
    if (!reported.has(id)) {
      reported.add(id)
      console.group('Missing Translation')
      console.log('Key:', key)
      console.log('Locale:', locale)
      console.log('Add to translations:', `{ "${key}": "..." }`)
      console.groupEnd()
    }
  })

  // Throw to catch missing translations early
  i18n.setMissingBehavior('throw')
}

// Production: graceful fallback
if (process.env.NODE_ENV === 'production') {
  // Silent fallback to key
  i18n.setMissingBehavior('key')

  // Optional: report to analytics
  i18n.onMissing((key, locale) => {
    analytics.track('missing_translation', { key, locale })
  })
}

// Usage
try {
  i18n.setLocale('es')
  console.log(i18n.t('app.title'))      // "Mi Aplicación"
  console.log(i18n.t('errors.generic')) // "Something went wrong" (fallback)
} catch (error) {
  // Only in development with 'throw' behavior
  console.error(error)
}
```

## Variations

### Collecting Missing Keys for Export

Build a list of missing translations for your localization team:

```typescript
const missingTranslations: Record<string, string[]> = {}

i18n.onMissing((key, locale) => {
  if (!missingTranslations[locale]) {
    missingTranslations[locale] = []
  }
  if (!missingTranslations[locale].includes(key)) {
    missingTranslations[locale].push(key)
  }
})

// Later, export for translation
function exportMissing(): string {
  return JSON.stringify(missingTranslations, null, 2)
}
```

### Custom Fallback Values

Return custom fallback values for specific keys:

```typescript
const fallbacks: Record<string, string> = {
  'errors.network': 'Network error. Please try again.',
  'errors.auth': 'Please log in to continue.'
}

i18n.onMissing((key) => {
  if (fallbacks[key]) {
    // Note: onMissing can't change the return value,
    // so add these to your translations instead
    console.log(`Using fallback for ${key}`)
  }
})
```

### Unsubscribing from Events

Clean up when no longer needed:

```typescript
const unsubscribe = i18n.onMissing((key, locale) => {
  console.log(`Missing: ${key} in ${locale}`)
})

// Later, stop listening
unsubscribe()
```

## Troubleshooting

### Callback Fires Even with Fallback

**Symptom:** `onMissing` fires even though the translation appears.

**Cause:** The key was missing in the current locale but found in the fallback.

**Explanation:** This is intentional. It tells you which translations need to be added to the current locale:

```typescript
i18n.setLocale('de')
i18n.t('greeting')  // Shows English fallback
// onMissing fires with ('greeting', 'de')
// This means: "Add 'greeting' to German translations"
```

### Throw Mode Breaking the App

**Symptom:** App crashes when a translation is missing.

**Cause:** You're using `'throw'` behavior in production.

**Solution:** Only use `'throw'` in development:

```typescript
if (process.env.NODE_ENV === 'development') {
  i18n.setMissingBehavior('throw')
} else {
  i18n.setMissingBehavior('key')
}
```

### Too Many Console Warnings

**Symptom:** Console is flooded with missing translation warnings.

**Cause:** The same missing key is being accessed repeatedly.

**Solution:** Deduplicate the warnings:

```typescript
const reported = new Set<string>()

i18n.onMissing((key, locale) => {
  const id = `${locale}:${key}`
  if (!reported.has(id)) {
    reported.add(id)
    console.warn(`Missing: ${key} in ${locale}`)
  }
})
```

## See Also

- **[Locale Management Concept](Concept-Locale-Management)** - Fallback behavior
- **[Changing Locales Guide](Guide-Changing-Locales)** - Runtime locale switching
- **[Event Callbacks API](API-Events)** - Full `onMissing` documentation
