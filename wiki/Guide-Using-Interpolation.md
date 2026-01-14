# Using Interpolation

This guide shows you how to insert dynamic values into your translations. You'll learn to use placeholders, handle different value types, and avoid common pitfalls.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand translation keys](Concept-Translation-Keys)

## Overview

We'll add dynamic values to translations by:

1. Adding placeholders to translation strings
2. Passing values when calling `t()`
3. Handling edge cases like missing or null values

## Step 1: Add Placeholders to Translations

Define your translations with `{{placeholder}}` syntax. Choose descriptive names:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      welcome: 'Welcome, {{username}}!',
      balance: 'Your balance is {{amount}}',
      status: '{{user}} is currently {{status}}'
    }
  }
})
```

Placeholders can appear anywhere in the string and can include spaces inside the braces (`{{ username }}` works too).

## Step 2: Pass Values When Translating

Call `t()` with a second argument containing your values:

```typescript
// Single placeholder
i18n.t('welcome', { username: 'Alice' })
// "Welcome, Alice!"

// Multiple placeholders
i18n.t('status', { user: 'Bob', status: 'online' })
// "Bob is currently online"

// Numeric values
i18n.t('balance', { amount: 150.00 })
// "Your balance is 150"
```

The keys in your params object must match the placeholder names exactly (case-sensitive).

## Step 3: Handle Edge Cases

Understand how different values behave:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      info: 'Value: {{value}}'
    }
  }
})

// String - used as-is
i18n.t('info', { value: 'hello' })     // "Value: hello"

// Number - converted to string
i18n.t('info', { value: 42 })          // "Value: 42"
i18n.t('info', { value: 3.14159 })     // "Value: 3.14159"

// Boolean - becomes "true" or "false"
i18n.t('info', { value: true })        // "Value: true"

// Null/undefined - becomes empty string
i18n.t('info', { value: null })        // "Value: "
i18n.t('info', { value: undefined })   // "Value: "

// Missing param - placeholder stays visible
i18n.t('info', {})                     // "Value: {{value}}"
i18n.t('info')                         // "Value: {{value}}"
```

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      order: {
        summary: '{{customer}} ordered {{quantity}} x {{product}}',
        total: 'Total: {{currency}}{{amount}}',
        status: 'Order #{{orderId}} is {{status}}'
      }
    }
  }
})

// Simple greeting
console.log(i18n.t('greeting', { name: 'World' }))
// "Hello, World!"

// Order information
console.log(i18n.t('order.summary', {
  customer: 'Alice',
  quantity: 3,
  product: 'Widget'
}))
// "Alice ordered 3 x Widget"

console.log(i18n.t('order.total', {
  currency: '$',
  amount: 29.97
}))
// "Total: $29.97"

console.log(i18n.t('order.status', {
  orderId: 12345,
  status: 'shipped'
}))
// "Order #12345 is shipped"
```

## Variations

### Reusing the Same Placeholder

A placeholder can appear multiple times in one string:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      palindrome: '{{word}} spelled backwards is {{word}}'
    }
  }
})

i18n.t('palindrome', { word: 'level' })
// "level spelled backwards is level"
```

### Combining with Namespaces

Use interpolation with namespaced translate functions:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      errors: {
        notFound: '{{resource}} not found',
        unauthorized: '{{user}} lacks permission for {{action}}'
      }
    }
  }
})

const tErrors = i18n.t.namespace('errors')

tErrors('notFound', { resource: 'User' })
// "User not found"

tErrors('unauthorized', { user: 'Guest', action: 'delete' })
// "Guest lacks permission for delete"
```

## Troubleshooting

### Placeholder Not Being Replaced

**Symptom:** You see `{{name}}` in the output instead of the value.

**Cause:** The param name doesn't match the placeholder exactly, or you forgot to pass params.

**Solution:** Check for typos and case sensitivity. `{{Name}}` and `{{name}}` are different.

```typescript
// Wrong - case mismatch
i18n.t('greeting', { Name: 'Alice' })  // "Hello, {{name}}!"

// Right
i18n.t('greeting', { name: 'Alice' })  // "Hello, Alice!"
```

### TypeError: params must be an object

**Symptom:** You get a TypeError when calling `t()`.

**Cause:** You passed a non-object as the second argument.

**Solution:** Always pass an object, even for single values:

```typescript
// Wrong
i18n.t('greeting', 'Alice')

// Right
i18n.t('greeting', { name: 'Alice' })
```

## See Also

- **[Interpolation Concept](Concept-Interpolation)** - How interpolation works under the hood
- **[Pluralization Guide](Guide-Pluralization)** - Combine interpolation with plural forms
- **[Core API](API-Core)** - Full `t()` function documentation
