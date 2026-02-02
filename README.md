# @motioneffector/i18n

A lightweight, type-safe internationalization library with zero dependencies for modern web applications.

[![npm version](https://img.shields.io/npm/v/@motioneffector/i18n.svg)](https://www.npmjs.com/package/@motioneffector/i18n)
[![license](https://img.shields.io/npm/l/@motioneffector/i18n.svg)](https://github.com/motioneffector/i18n/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)


## Features

- **Simple Translation API** - Clean `t()` function with dot notation
- **Pluralization Support** - Intl-based plural rules for all languages
- **Nested Namespaces** - Organize translations hierarchically with dot notation
- **Dynamic Loading** - Lazy-load translations on demand with async support
- **Interpolation** - Template placeholders for dynamic values
- **Fallback Handling** - Graceful fallback to default locale when missing
- **Format Utilities** - Built-in number, date, and relative time formatting
- **Change Callbacks** - React to locale changes and missing translations

[Read the full manual →](https://motioneffector.github.io/i18n/manual/)

## Quick Start

```typescript
import { createI18n } from '@motioneffector/i18n'

// Create i18n instance with translations
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      items: {
        one: '{{count}} item',
        other: '{{count}} items'
      }
    }
  }
})

// Interpolation
i18n.t('greeting', { name: 'World' })  // "Hello, World!"

// Pluralization
i18n.t('items', { count: 1 })  // "1 item"
i18n.t('items', { count: 5 })  // "5 items"
```

## Testing & Validation

- **Comprehensive test suite** - 200 unit tests covering core functionality
- **Fuzz tested** - Randomized input testing to catch edge cases
- **Strict TypeScript** - Full type coverage with no `any` types
- **Zero dependencies** - No supply chain risk

## License

MIT © [motioneffector](https://github.com/motioneffector)
