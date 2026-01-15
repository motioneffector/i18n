# Lazy Loading Translations

This guide shows you how to load translation files on demand instead of bundling everything upfront. You'll learn to configure dynamic loading, handle loading states, and implement preloading strategies.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand locale management](Concept-Locale-Management)

## Overview

We'll implement lazy loading by:

1. Configuring a `loadPath` function
2. Loading locales explicitly or automatically
3. Handling loading states and errors
4. Implementing preloading for better UX

## Step 1: Configure loadPath

Provide a `loadPath` function that fetches translations for a given locale:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    // Include default locale inline for instant availability
    en: {
      greeting: 'Hello',
      loading: 'Loading...'
    }
  },
  loadPath: async (locale) => {
    const response = await fetch(`/locales/${locale}.json`)
    if (!response.ok) {
      throw new Error(`Failed to load ${locale}`)
    }
    return response.json()
  }
})
```

The `loadPath` function receives a locale code and must return a Promise that resolves to a translation object.

## Step 2: Load Locales on Demand

Use `loadLocale()` to fetch translations explicitly:

```typescript
// Load German translations
await i18n.loadLocale('de')

// Now you can switch to German
i18n.setLocale('de')
console.log(i18n.t('greeting'))  // "Hallo" (from loaded file)
```

Or use `setLocaleAsync()` to load and switch in one step:

```typescript
// Automatically loads if not already loaded, then switches
await i18n.setLocaleAsync('fr')
console.log(i18n.t('greeting'))  // "Bonjour"
```

## Step 3: Handle Loading States

Show feedback while translations load:

```typescript
async function switchLanguage(locale: string) {
  const button = document.querySelector('#lang-button')

  try {
    button.disabled = true
    button.textContent = i18n.t('loading')

    await i18n.setLocaleAsync(locale)

    // Locale is now active, update UI
    renderApp()
  } catch (error) {
    console.error('Failed to load locale:', error)
    // Show error message or fall back
  } finally {
    button.disabled = false
  }
}
```

## Step 4: Implement Preloading

Preload likely locales to reduce wait time when switching:

```typescript
// Preload on hover over language menu
languageMenu.addEventListener('mouseenter', () => {
  const locales = ['es', 'fr', 'de']
  locales.forEach(locale => {
    if (!i18n.isLocaleLoaded(locale)) {
      i18n.loadLocale(locale).catch(() => {
        // Ignore preload failures
      })
    }
  })
})
```

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  translations: {
    en: {
      app: {
        title: 'My App',
        loading: 'Loading language...',
        error: 'Failed to load language'
      }
    }
  },
  loadPath: async (locale) => {
    const response = await fetch(`/locales/${locale}.json`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  }
})

// Language switcher component
class LanguageSwitcher {
  private loading = false

  async switchTo(locale: string) {
    if (this.loading) return
    if (i18n.getLocale() === locale) return

    this.loading = true
    this.render()

    try {
      await i18n.setLocaleAsync(locale)
    } catch (error) {
      alert(i18n.t('app.error'))
    } finally {
      this.loading = false
      this.render()
    }
  }

  render() {
    const el = document.querySelector('#language-switcher')
    if (this.loading) {
      el.textContent = i18n.t('app.loading')
    } else {
      el.textContent = i18n.getLocale().toUpperCase()
    }
  }
}

// Check what's loaded
console.log(i18n.isLocaleLoaded('en'))  // true (bundled)
console.log(i18n.isLocaleLoaded('es'))  // false (not loaded yet)

// Load and switch
await i18n.setLocaleAsync('es')
console.log(i18n.isLocaleLoaded('es'))  // true
```

## Variations

### Static Imports with Code Splitting

Use dynamic imports for bundler-based code splitting:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: await import('./locales/en.json')
  },
  loadPath: async (locale) => {
    // Bundler will create separate chunks for each locale
    const module = await import(`./locales/${locale}.json`)
    return module.default
  }
})
```

### Caching Behavior

Loaded translations are cached automatically:

```typescript
// First call: fetches from server
await i18n.loadLocale('de')

// Second call: returns immediately (cached)
await i18n.loadLocale('de')

// Force reload to get fresh translations
await i18n.loadLocale('de', { forceReload: true })
```

### Concurrent Loading

Multiple `loadLocale()` calls for the same locale are deduplicated:

```typescript
// Only one network request is made
const [result1, result2] = await Promise.all([
  i18n.loadLocale('es'),
  i18n.loadLocale('es')
])
```

## Troubleshooting

### Error: loadPath not configured

**Symptom:** `loadLocale()` throws an error.

**Cause:** You didn't provide a `loadPath` function when creating the instance.

**Solution:** Add `loadPath` to your configuration:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  loadPath: async (locale) => {
    // Your loading logic here
  }
})
```

### TypeError: loadPath must return an object

**Symptom:** Loading fails with a TypeError.

**Cause:** Your `loadPath` function returned invalid data (null, array, string).

**Solution:** Ensure you return a plain object:

```typescript
loadPath: async (locale) => {
  const response = await fetch(`/locales/${locale}.json`)
  const data = await response.json()

  // Make sure it's an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid translation data')
  }

  return data
}
```

### Loading the Same Locale Multiple Times

**Symptom:** Network requests happen repeatedly for the same locale.

**Cause:** You might be using `forceReload` unintentionally.

**Solution:** Use the default caching behavior:

```typescript
// Cached (default)
await i18n.loadLocale('es')

// Only use forceReload when you need fresh data
await i18n.loadLocale('es', { forceReload: true })
```

## See Also

- **[Locale Management Concept](Concept-Locale-Management)** - How locales work
- **[Changing Locales Guide](Guide-Changing-Locales)** - Runtime locale switching
- **[Translation Management API](API-Translation-Management)** - Full `loadLocale()` documentation
