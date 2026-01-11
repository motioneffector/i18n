# @motioneffector/i18n

A lightweight TypeScript internationalization library for web applications.

## Overview

This library provides a simple, type-safe system for managing translations in web applications. It enforces a "no hardcoded strings" architecture where all user-facing text flows through translation keys, enabling multi-language support from day one.

## Features

- **Translation Keys**: All text referenced by keys, never hardcoded strings
- **Nested Namespaces**: Organize translations hierarchically (e.g., `editor.buttons.save`)
- **Interpolation**: Insert dynamic values into translated strings
- **Pluralization**: Handle singular/plural forms correctly per language
- **Fallback Chain**: Missing translations fall back to default language
- **Lazy Loading**: Load language files on demand
- **Type Safety**: Full TypeScript support with typed translation keys
- **Tiny Footprint**: Minimal bundle size, no heavy dependencies

## Core Concepts

### Translation Files

Translations are stored as JSON objects, typically one per language:

```typescript
// en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "editor": {
    "title": "Document Editor",
    "unsaved_changes": "You have {{count}} unsaved changes"
  },
  "errors": {
    "not_found": "{{item}} not found",
    "network": "Network error. Please try again."
  }
}
```

### Key Lookup

Retrieve translations using dot-notation keys:

```typescript
t('common.save')           // "Save"
t('editor.title')          // "Document Editor"
```

### Interpolation

Insert dynamic values using `{{placeholder}}` syntax:

```typescript
t('errors.not_found', { item: 'User' })  // "User not found"
t('editor.unsaved_changes', { count: 3 }) // "You have 3 unsaved changes"
```

## API

### `createI18n(options)`

Creates an i18n instance.

**Options:**
- `defaultLocale`: Default language code (e.g., `'en'`)
- `fallbackLocale`: Fallback when translation missing (optional)
- `translations`: Initial translation data (optional)
- `loadPath`: Function to load translation files (optional)

### `i18n.t(key, params?)`

Translate a key, optionally with interpolation parameters.

### `i18n.setLocale(locale)`

Switch to a different language.

### `i18n.getLocale()`

Returns the current locale code.

### `i18n.addTranslations(locale, translations)`

Add or merge translations for a locale at runtime.

### `i18n.hasKey(key)`

Check if a translation key exists.

### `i18n.onchange(callback)`

Subscribe to locale change events.

## React Integration

```tsx
// Use with React via context
const { t } = useI18n()

return <button>{t('common.save')}</button>
```

## Use Cases

- Multi-language web applications
- Applications with future localization plans (start with keys early)
- White-label products requiring text customization
- Any application enforcing consistent text management

## Design Philosophy

This library enforces a strict pattern: **no hardcoded user-facing strings**. Every piece of text should be a translation key. This enables:

1. Easy addition of new languages later
2. Consistent terminology across the application
3. Text changes without code changes
4. Community translation contributions

Even if you only support one language today, using translation keys from the start makes future localization trivial.

## Installation

```bash
npm install @motioneffector/i18n
```

## License

MIT
