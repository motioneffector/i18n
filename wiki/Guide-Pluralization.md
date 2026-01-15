# Pluralization

This guide shows you how to handle singular and plural forms correctly across different languages. You'll learn to set up plural translations, handle edge cases, and support complex languages.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand interpolation](Concept-Interpolation)

## Overview

We'll implement pluralization by:

1. Structuring translations as plural objects
2. Passing `count` to select the right form
3. Adding custom `zero` text
4. Supporting complex languages like Russian

## Step 1: Structure Plural Translations

Instead of a single string, define an object with plural forms:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      // Regular string - not pluralized
      title: 'Shopping Cart',

      // Plural object - automatically selected based on count
      items: {
        one: '{{count}} item',
        other: '{{count}} items'
      }
    }
  }
})
```

For English, you need two forms:
- `one` - used when count is exactly 1
- `other` - used for 0, 2, 3, 4, 5, etc.

## Step 2: Use Count Parameter

Pass `{ count: n }` to trigger pluralization:

```typescript
i18n.t('items', { count: 0 })   // "0 items"
i18n.t('items', { count: 1 })   // "1 item"
i18n.t('items', { count: 2 })   // "2 items"
i18n.t('items', { count: 100 }) // "100 items"
```

The `count` value is automatically available for interpolation in the plural string.

## Step 3: Add Custom Zero Text

Use the `zero` form for special messaging when count is 0:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      notifications: {
        zero: 'No new notifications',
        one: '{{count}} new notification',
        other: '{{count}} new notifications'
      }
    }
  }
})

i18n.t('notifications', { count: 0 })  // "No new notifications"
i18n.t('notifications', { count: 1 })  // "1 new notification"
i18n.t('notifications', { count: 5 })  // "5 new notifications"
```

## Step 4: Support Complex Languages

Languages like Russian, Polish, and Arabic have more plural forms. The library uses `Intl.PluralRules` to select the right one:

```typescript
const i18n = createI18n({
  defaultLocale: 'ru',
  translations: {
    ru: {
      files: {
        one: '{{count}} файл',      // 1, 21, 31, 41...
        few: '{{count}} файла',     // 2-4, 22-24, 32-34...
        many: '{{count}} файлов',   // 0, 5-20, 25-30...
        other: '{{count}} файла'    // Fractional numbers
      }
    }
  }
})

i18n.t('files', { count: 1 })   // "1 файл"
i18n.t('files', { count: 2 })   // "2 файла"
i18n.t('files', { count: 5 })   // "5 файлов"
i18n.t('files', { count: 21 })  // "21 файл"
i18n.t('files', { count: 22 })  // "22 файла"
```

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      cart: {
        zero: 'Your cart is empty',
        one: 'You have {{count}} item in your cart',
        other: 'You have {{count}} items in your cart'
      },
      reviews: {
        zero: 'No reviews yet. Be the first!',
        one: '{{count}} customer review',
        other: '{{count}} customer reviews'
      },
      daysLeft: {
        one: '{{count}} day remaining',
        other: '{{count}} days remaining'
      }
    }
  }
})

// Shopping cart
console.log(i18n.t('cart', { count: 0 }))  // "Your cart is empty"
console.log(i18n.t('cart', { count: 1 }))  // "You have 1 item in your cart"
console.log(i18n.t('cart', { count: 3 }))  // "You have 3 items in your cart"

// Reviews
console.log(i18n.t('reviews', { count: 0 }))   // "No reviews yet. Be the first!"
console.log(i18n.t('reviews', { count: 42 }))  // "42 customer reviews"

// Countdown
console.log(i18n.t('daysLeft', { count: 1 }))  // "1 day remaining"
console.log(i18n.t('daysLeft', { count: 7 }))  // "7 days remaining"
```

## Variations

### Combining with Other Parameters

Use `count` alongside other interpolation params:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      userFiles: {
        one: '{{name}} has {{count}} file',
        other: '{{name}} has {{count}} files'
      }
    }
  }
})

i18n.t('userFiles', { name: 'Alice', count: 1 })
// "Alice has 1 file"

i18n.t('userFiles', { name: 'Bob', count: 42 })
// "Bob has 42 files"
```

### Handling Negative Numbers

Negative numbers work correctly. The plural rule uses the absolute value, but the display keeps the negative:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      change: {
        one: '{{count}} point change',
        other: '{{count}} points change'
      }
    }
  }
})

i18n.t('change', { count: -1 })   // "-1 point change"
i18n.t('change', { count: -5 })   // "-5 points change"
```

### Fallback Behavior

If a specific plural form is missing, the library falls back to `other`:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      items: {
        // Missing 'one' form
        other: '{{count}} items'
      }
    }
  }
})

i18n.t('items', { count: 1 })  // "1 items" (uses 'other')
i18n.t('items', { count: 5 })  // "5 items"
```

## Troubleshooting

### Wrong Plural Form Selected

**Symptom:** The translation shows "1 items" instead of "1 item".

**Cause:** Missing the `one` form in your translations.

**Solution:** Add all required plural forms for your language:

```typescript
// Wrong - missing 'one'
{ items: { other: '{{count}} items' } }

// Right
{ items: { one: '{{count}} item', other: '{{count}} items' } }
```

### Plural Not Working At All

**Symptom:** You see the key name instead of the translation.

**Cause:** `count` must be a number, not a string.

**Solution:** Ensure count is numeric:

```typescript
// Wrong - count is a string
i18n.t('items', { count: '5' })

// Right - count is a number
i18n.t('items', { count: 5 })
i18n.t('items', { count: parseInt(userInput) })
```

## Plural Forms Reference

| Language | Forms Needed |
|----------|--------------|
| English, German, Spanish, Italian | `one`, `other` |
| French | `one`, `other` (note: 0 uses `one` in French) |
| Russian, Ukrainian, Polish | `one`, `few`, `many`, `other` |
| Arabic | `zero`, `one`, `two`, `few`, `many`, `other` |
| Chinese, Japanese, Korean | `other` only |

## See Also

- **[Pluralization Concept](Concept-Pluralization)** - How plural selection works
- **[Interpolation Guide](Guide-Using-Interpolation)** - More on dynamic values
- **[Core API](API-Core)** - Full `t()` function documentation
