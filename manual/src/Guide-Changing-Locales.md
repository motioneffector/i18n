# Changing Locales

This guide shows you how to switch languages at runtime and react to locale changes. You'll learn synchronous and asynchronous switching, fallback configuration, and UI update patterns.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand locale management basics](Concept-Locale-Management)

## Overview

We'll implement locale switching by:

1. Setting up multiple locales
2. Switching with `setLocale()`
3. Subscribing to changes with `onChange`
4. Configuring fallback behavior

## Step 1: Define Multiple Locales

Include translations for each supported language:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello',
      farewell: 'Goodbye',
      buttons: {
        save: 'Save',
        cancel: 'Cancel'
      }
    },
    es: {
      greeting: 'Hola',
      farewell: 'Adiós',
      buttons: {
        save: 'Guardar',
        cancel: 'Cancelar'
      }
    },
    fr: {
      greeting: 'Bonjour',
      farewell: 'Au revoir',
      buttons: {
        save: 'Sauvegarder',
        cancel: 'Annuler'
      }
    }
  }
})
```

## Step 2: Switch Locales

Use `setLocale()` to change the current language:

```typescript
// Check current locale
console.log(i18n.getLocale())  // "en"
console.log(i18n.t('greeting'))  // "Hello"

// Switch to Spanish
i18n.setLocale('es')
console.log(i18n.getLocale())  // "es"
console.log(i18n.t('greeting'))  // "Hola"

// Switch to French
i18n.setLocale('fr')
console.log(i18n.t('greeting'))  // "Bonjour"
```

`setLocale()` returns the i18n instance for chaining:

```typescript
const greeting = i18n.setLocale('es').t('greeting')  // "Hola"
```

## Step 3: React to Locale Changes

Subscribe to `onChange` to update your UI when the locale changes:

```typescript
// Subscribe
const unsubscribe = i18n.onChange((newLocale, previousLocale) => {
  console.log(`Language changed: ${previousLocale} -> ${newLocale}`)

  // Update your UI here
  document.documentElement.lang = newLocale
  renderApp()
})

// Trigger a change
i18n.setLocale('es')
// Logs: "Language changed: en -> es"

// Later, unsubscribe when no longer needed
unsubscribe()
```

## Step 4: Configure Fallback

Use `fallbackLocale` to handle missing translations gracefully:

```typescript
const i18n = createI18n({
  defaultLocale: 'de',
  fallbackLocale: 'en',  // Use English when German is missing
  translations: {
    en: {
      greeting: 'Hello',
      newFeature: 'Check out this new feature!'
    },
    de: {
      greeting: 'Hallo'
      // 'newFeature' not translated yet
    }
  }
})

i18n.t('greeting')     // "Hallo" (found in German)
i18n.t('newFeature')   // "Check out this new feature!" (falls back to English)
```

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

// Create i18n with multiple locales
const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: {
      nav: { home: 'Home', about: 'About', contact: 'Contact' },
      welcome: 'Welcome to our site!',
      language: 'Language'
    },
    es: {
      nav: { home: 'Inicio', about: 'Acerca de', contact: 'Contacto' },
      welcome: '¡Bienvenido a nuestro sitio!',
      language: 'Idioma'
    }
  }
})

// Track current locale in DOM
function updateDocumentLang(locale: string) {
  document.documentElement.lang = locale
}

// Subscribe to changes
i18n.onChange((newLocale) => {
  updateDocumentLang(newLocale)
  console.log('UI should re-render now')
})

// Language selector handler
function handleLanguageChange(newLocale: string) {
  if (i18n.getAvailableLocales().includes(newLocale)) {
    i18n.setLocale(newLocale)
  } else {
    console.error(`Locale ${newLocale} is not available`)
  }
}

// Usage
handleLanguageChange('es')
console.log(i18n.t('welcome'))  // "¡Bienvenido a nuestro sitio!"
```

## Variations

### Persisting User Preference

Save the user's language choice to localStorage:

```typescript
// On app start, restore saved locale
const savedLocale = localStorage.getItem('locale')
if (savedLocale && i18n.getAvailableLocales().includes(savedLocale)) {
  i18n.setLocale(savedLocale)
}

// When locale changes, save it
i18n.onChange((newLocale) => {
  localStorage.setItem('locale', newLocale)
})
```

### Detecting Browser Language

Set initial locale based on browser preference:

```typescript
function detectLocale(): string {
  const browserLocales = navigator.languages || [navigator.language]
  const available = i18n.getAvailableLocales()

  for (const locale of browserLocales) {
    // Try exact match first (e.g., 'en-US')
    if (available.includes(locale)) {
      return locale
    }
    // Try language only (e.g., 'en')
    const lang = locale.split('-')[0]
    if (available.includes(lang)) {
      return lang
    }
  }

  return 'en'  // Default fallback
}

i18n.setLocale(detectLocale())
```

### Async Loading Before Switch

If translations need to be loaded, use `setLocaleAsync()`:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: { hello: 'Hello' } },
  loadPath: async (locale) => {
    const response = await fetch(`/locales/${locale}.json`)
    return response.json()
  }
})

// This loads translations if needed, then switches
await i18n.setLocaleAsync('es')
console.log(i18n.t('hello'))
```

## Troubleshooting

### Error: No translations available for locale

**Symptom:** `setLocale()` throws an error.

**Cause:** The locale doesn't exist and there's no fallback configured.

**Solution:** Either add translations for the locale, configure a `fallbackLocale`, or use `setLocaleAsync()` with `loadPath`:

```typescript
// Option 1: Add translations first
i18n.addTranslations('de', { hello: 'Hallo' })
i18n.setLocale('de')

// Option 2: Configure fallback
const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',  // Now any locale is allowed
  translations: { en: { hello: 'Hello' } }
})
```

### onChange Not Firing

**Symptom:** Your callback isn't called when you switch locales.

**Cause:** You're setting the locale to its current value.

**Solution:** `onChange` only fires when the locale actually changes:

```typescript
i18n.setLocale('en')  // Already 'en', no change, callback not fired
i18n.setLocale('es')  // Different locale, callback fires
```

## See Also

- **[Locale Management Concept](Concept-Locale-Management)** - How locales work
- **[Lazy Loading Guide](Guide-Lazy-Loading)** - Load translations on demand
- **[Locale Management API](API-Locale-Management)** - Full method documentation
