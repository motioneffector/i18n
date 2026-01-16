# Interpolation

Interpolation lets you inject dynamic values into translation strings. Instead of concatenating strings manually, you define placeholders like `{{name}}` in your translations and pass values when translating.

## How It Works

Placeholders use double curly braces: `{{placeholder}}`. When you call `t()` with a params object, each placeholder is replaced with its corresponding value:

```
Template:  "Hello, {{name}}! You have {{count}} messages."
Params:    { name: 'Alice', count: 5 }
Result:    "Hello, Alice! You have 5 messages."
```

Values are converted to strings automatically. Numbers, booleans, and strings all work. Null and undefined become empty strings.

## Basic Usage

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      status: '{{user}} is {{status}}',
      price: 'Total: {{amount}}'
    }
  }
})

i18n.t('greeting', { name: 'World' })           // "Hello, World!"
i18n.t('status', { user: 'Alice', status: 'online' })  // "Alice is online"
i18n.t('price', { amount: 99.99 })              // "Total: 99.99"
```

## Key Points

- **Spaces inside braces are allowed** - `{{ name }}` works the same as `{{name}}`
- **Missing params leave the placeholder** - Useful for debugging: you'll see `{{name}}` in the output
- **Extra params are ignored** - Pass what you have; unused params don't cause errors
- **Values are not HTML-escaped** - Handle XSS prevention at your rendering layer

## Examples

### Multiple Placeholders

Use as many placeholders as you need:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      transfer: '{{sender}} sent {{amount}} to {{recipient}}'
    }
  }
})

i18n.t('transfer', {
  sender: 'Alice',
  amount: '$50',
  recipient: 'Bob'
})
// "Alice sent $50 to Bob"
```

### Same Placeholder Multiple Times

A placeholder can appear more than once:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      compare: '{{name}} vs {{name}}: It\'s a tie!'
    }
  }
})

i18n.t('compare', { name: 'Team A' })
// "Team A vs Team A: It's a tie!"
```

### Value Type Conversion

Different types are handled automatically:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      info: 'Count: {{count}}, Active: {{active}}, Name: {{name}}'
    }
  }
})

i18n.t('info', { count: 42, active: true, name: null })
// "Count: 42, Active: true, Name: "
```

| Type | Result |
|------|--------|
| `string` | Used as-is |
| `number` | Converted to string (`42` -> `"42"`) |
| `boolean` | `"true"` or `"false"` |
| `null` | Empty string |
| `undefined` | Empty string |

## Related

- **[Using Interpolation](Guide-Using-Interpolation)** - Step-by-step guide with more examples
- **[Pluralization](Concept-Pluralization)** - Combine interpolation with plural forms
- **[Core API](API-Core)** - Full `t()` function documentation
