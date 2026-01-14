# @motioneffector/i18n

A translation function with superpowers. Call `t('key')` and get back localized text, with interpolation, pluralization, and formatting handled automatically. Zero dependencies, full TypeScript safety, works everywhere JavaScript runs.

## I want to...

| Goal | Where to go |
|------|-------------|
| Get up and running quickly | [Your First Translation](Your-First-Translation) |
| Understand how translation keys work | [Translation Keys & Namespaces](Concept-Translation-Keys) |
| Add dynamic values to my translations | [Using Interpolation](Guide-Using-Interpolation) |
| Handle singular/plural forms | [Pluralization](Guide-Pluralization) |
| Switch languages at runtime | [Changing Locales](Guide-Changing-Locales) |
| Load translations on demand | [Lazy Loading Translations](Guide-Lazy-Loading) |
| Look up a specific method | [API Reference](API-Core) |

## Key Concepts

### Translation Keys

Dot-notation paths into a nested translation object. Write `t('common.buttons.save')` to traverse `common -> buttons -> save`. Use namespaces to create scoped translate functions and avoid repeating prefixes.

### Interpolation

Template placeholders like `{{name}}` get replaced with values you pass. Call `t('greeting', { name: 'World' })` and `"Hello, {{name}}!"` becomes `"Hello, World!"`.

### Pluralization

Pass `{ count: n }` and the library picks the right plural form automatically. English needs `one` and `other`; the library handles complex languages like Russian and Arabic too.

## Quick Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      items: {
        one: 'You have {{count}} item',
        other: 'You have {{count}} items'
      }
    }
  }
})

// Simple translation with interpolation
i18n.t('greeting', { name: 'World' })  // "Hello, World!"

// Automatic pluralization
i18n.t('items', { count: 1 })  // "You have 1 item"
i18n.t('items', { count: 5 })  // "You have 5 items"
```

---

**[Full API Reference ->](API-Core)**
