# Your First Translation

This guide walks you through setting up internationalization in about 5 minutes.

By the end, you'll have a working i18n instance that translates text with dynamic values and handles plural forms.

## What We're Building

A simple translation system that:
- Displays a personalized greeting
- Shows item counts with correct singular/plural forms
- Can switch between English and Spanish

## Step 1: Create an i18n Instance

Every translation starts with an i18n instance. Create one with your default locale and translations:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      items: {
        one: '{{count}} item in cart',
        other: '{{count}} items in cart'
      }
    }
  }
})
```

The `translations` object maps locale codes to translation dictionaries. Each dictionary contains your translation keys and their values.

## Step 2: Translate with Interpolation

Use the `t()` function to translate keys. Pass dynamic values as the second argument:

```typescript
const message = i18n.t('greeting', { name: 'Alice' })
console.log(message)  // "Hello, Alice!"
```

The `{{name}}` placeholder gets replaced with the value you provide. You can use as many placeholders as you need.

## Step 3: Handle Pluralization

For counts, pass a `count` parameter. The library automatically selects the correct plural form:

```typescript
console.log(i18n.t('items', { count: 1 }))  // "1 item in cart"
console.log(i18n.t('items', { count: 3 }))  // "3 items in cart"
console.log(i18n.t('items', { count: 0 }))  // "0 items in cart"
```

English uses `one` for exactly 1 and `other` for everything else. Other languages have more forms like `zero`, `two`, `few`, and `many`.

## Step 4: Add Another Locale

Add Spanish translations and switch locales:

```typescript
i18n.addTranslations('es', {
  greeting: '¡Hola, {{name}}!',
  items: {
    one: '{{count}} artículo en el carrito',
    other: '{{count}} artículos en el carrito'
  }
})

i18n.setLocale('es')
console.log(i18n.t('greeting', { name: 'Alice' }))  // "¡Hola, Alice!"
console.log(i18n.t('items', { count: 2 }))  // "2 artículos en el carrito"
```

## The Complete Code

Here's everything together:

```typescript
import { createI18n } from '@motioneffector/i18n'

// Create i18n instance with English translations
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      items: {
        one: '{{count}} item in cart',
        other: '{{count}} items in cart'
      }
    }
  }
})

// Basic usage
console.log(i18n.t('greeting', { name: 'Alice' }))  // "Hello, Alice!"
console.log(i18n.t('items', { count: 1 }))          // "1 item in cart"
console.log(i18n.t('items', { count: 5 }))          // "5 items in cart"

// Add Spanish and switch
i18n.addTranslations('es', {
  greeting: '¡Hola, {{name}}!',
  items: {
    one: '{{count}} artículo en el carrito',
    other: '{{count}} artículos en el carrito'
  }
})

i18n.setLocale('es')
console.log(i18n.t('greeting', { name: 'Alice' }))  // "¡Hola, Alice!"
console.log(i18n.t('items', { count: 2 }))          // "2 artículos en el carrito"
```

## What's Next?

Now that you have the basics:

- **[Understand translation keys better](Concept-Translation-Keys)** - Learn about dot notation and namespaces
- **[Handle complex pluralization](Guide-Pluralization)** - Support languages with multiple plural forms
- **[Load translations on demand](Guide-Lazy-Loading)** - Reduce bundle size with lazy loading
- **[Explore the API](API-Core)** - Full reference when you need details
