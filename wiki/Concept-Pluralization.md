# Pluralization

Pluralization automatically selects the correct form of a word based on a count. Instead of writing `item + (count === 1 ? '' : 's')`, you define plural forms in your translations and let the library pick the right one using the browser's `Intl.PluralRules` API.

## How It Works

Pass `{ count: n }` to `t()`, and the library:

1. Looks up the translation key
2. Finds a plural object (with keys like `one`, `other`, `few`, `many`)
3. Uses `Intl.PluralRules` to determine which form fits the count
4. Returns that form with interpolation applied

```
Translation:  { one: '{{count}} item', other: '{{count}} items' }
t('key', { count: 1 })  ->  Intl says "one"   ->  "1 item"
t('key', { count: 5 })  ->  Intl says "other" ->  "5 items"
```

## Basic Usage

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      messages: {
        one: 'You have {{count}} new message',
        other: 'You have {{count}} new messages'
      }
    }
  }
})

i18n.t('messages', { count: 0 })   // "You have 0 new messages"
i18n.t('messages', { count: 1 })   // "You have 1 new message"
i18n.t('messages', { count: 42 })  // "You have 42 new messages"
```

## Key Points

- **English uses `one` and `other`** - That's all you need for most English text
- **`count` is available for interpolation** - Use `{{count}}` in your plural strings
- **Falls back to `other`** - If a specific form is missing, `other` is used
- **Custom `zero` form** - Define `zero` to show special text for count 0
- **Negative numbers work** - Uses absolute value for rule selection, keeps negative in output

## Examples

### Custom Zero Text

Show special text when count is zero:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      cart: {
        zero: 'Your cart is empty',
        one: '{{count}} item in your cart',
        other: '{{count}} items in your cart'
      }
    }
  }
})

i18n.t('cart', { count: 0 })  // "Your cart is empty"
i18n.t('cart', { count: 1 })  // "1 item in your cart"
i18n.t('cart', { count: 3 })  // "3 items in your cart"
```

### Complex Languages (Russian)

Russian has `one`, `few`, `many`, and `other` forms:

```typescript
const i18n = createI18n({
  defaultLocale: 'ru',
  translations: {
    ru: {
      items: {
        one: '{{count}} предмет',      // 1, 21, 31...
        few: '{{count}} предмета',     // 2-4, 22-24...
        many: '{{count}} предметов',   // 0, 5-20, 25-30...
        other: '{{count}} предмета'    // Fallback
      }
    }
  }
})

i18n.t('items', { count: 1 })   // "1 предмет"
i18n.t('items', { count: 2 })   // "2 предмета"
i18n.t('items', { count: 5 })   // "5 предметов"
i18n.t('items', { count: 21 })  // "21 предмет"
```

### Combining with Other Params

Pluralization works alongside regular interpolation:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      notifications: {
        one: '{{name}} has {{count}} notification',
        other: '{{name}} has {{count}} notifications'
      }
    }
  }
})

i18n.t('notifications', { name: 'Alice', count: 3 })
// "Alice has 3 notifications"
```

## Plural Forms by Language

| Language | Forms Used |
|----------|-----------|
| English, German, Spanish | `one`, `other` |
| French, Portuguese | `one`, `other` (0 uses `one` in French) |
| Russian, Polish | `one`, `few`, `many`, `other` |
| Arabic | `zero`, `one`, `two`, `few`, `many`, `other` |
| Japanese, Chinese | `other` only |

## Related

- **[Pluralization Guide](Guide-Pluralization)** - Step-by-step guide for implementing pluralization
- **[Interpolation](Concept-Interpolation)** - How placeholder replacement works
- **[Core API](API-Core)** - Full `t()` function documentation
