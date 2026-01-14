# Formatting Numbers, Dates, and Times

This guide shows you how to display numbers, dates, and relative times in locale-appropriate formats. You'll learn to use the built-in formatting methods and customize their output.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand locale management](Concept-Locale-Management)

## Overview

We'll format values by:

1. Formatting numbers with `formatNumber()`
2. Formatting dates with `formatDate()`
3. Showing relative time with `formatRelativeTime()`
4. Customizing format options

## Step 1: Format Numbers

Use `formatNumber()` for locale-appropriate number display:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({ defaultLocale: 'en-US' })

// Basic number formatting
i18n.formatNumber(1234567.89)  // "1,234,567.89"

// Switch to German
i18n.setLocale('de-DE')
i18n.formatNumber(1234567.89)  // "1.234.567,89"
```

Different locales use different separators for thousands and decimals.

## Step 2: Format Currencies and Percentages

Pass options to customize the format:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })

// Currency
i18n.formatNumber(99.99, {
  style: 'currency',
  currency: 'USD'
})
// "$99.99"

// Percentage
i18n.formatNumber(0.156, {
  style: 'percent'
})
// "16%"

// Percentage with decimals
i18n.formatNumber(0.156, {
  style: 'percent',
  minimumFractionDigits: 1
})
// "15.6%"
```

## Step 3: Format Dates

Use `formatDate()` with Date objects, timestamps, or ISO strings:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })
const date = new Date('2024-03-15T14:30:00')

// Default format
i18n.formatDate(date)
// "3/15/2024"

// With time
i18n.formatDate(date, {
  dateStyle: 'medium',
  timeStyle: 'short'
})
// "Mar 15, 2024, 2:30 PM"

// Full format
i18n.formatDate(date, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
// "Friday, March 15, 2024"
```

## Step 4: Format Relative Time

Use `formatRelativeTime()` for human-friendly time differences:

```typescript
const i18n = createI18n({ defaultLocale: 'en' })

// Past (negative values)
i18n.formatRelativeTime(-1, 'day')     // "1 day ago"
i18n.formatRelativeTime(-3, 'hour')    // "3 hours ago"
i18n.formatRelativeTime(-5, 'minute')  // "5 minutes ago"

// Future (positive values)
i18n.formatRelativeTime(1, 'day')      // "in 1 day"
i18n.formatRelativeTime(2, 'week')     // "in 2 weeks"
i18n.formatRelativeTime(3, 'month')    // "in 3 months"
```

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({ defaultLocale: 'en-US' })

// Product pricing
function formatPrice(amount: number, currency: string): string {
  return i18n.formatNumber(amount, {
    style: 'currency',
    currency
  })
}

console.log(formatPrice(1299.99, 'USD'))  // "$1,299.99"
console.log(formatPrice(1299.99, 'EUR'))  // "€1,299.99"

// Order dates
function formatOrderDate(date: Date): string {
  return i18n.formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

console.log(formatOrderDate(new Date()))  // "Jan 15, 2024"

// Last seen
function formatLastSeen(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    return i18n.formatRelativeTime(diffHours, 'hour')
  }

  return i18n.formatRelativeTime(diffDays, 'day')
}

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
console.log(formatLastSeen(yesterday))  // "1 day ago"

// Switch locale and see different formats
i18n.setLocale('de-DE')
console.log(formatPrice(1299.99, 'EUR'))  // "1.299,99 €"
console.log(formatOrderDate(new Date()))   // "15. Jan. 2024"
console.log(i18n.formatRelativeTime(-1, 'day'))  // "vor 1 Tag"
```

## Variations

### Compact Number Notation

Show large numbers in compact form:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })

i18n.formatNumber(1500, { notation: 'compact' })      // "1.5K"
i18n.formatNumber(1500000, { notation: 'compact' })   // "1.5M"
i18n.formatNumber(1500000000, { notation: 'compact' }) // "1.5B"
```

### Date Parts

Get just the parts you need:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })
const date = new Date('2024-03-15')

// Just the month and year
i18n.formatDate(date, { month: 'long', year: 'numeric' })
// "March 2024"

// Just the time
i18n.formatDate(date, { hour: 'numeric', minute: '2-digit' })
// "12:00 AM"

// Just the weekday
i18n.formatDate(date, { weekday: 'long' })
// "Friday"
```

### Unit Formatting

Format numbers with units:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })

i18n.formatNumber(100, {
  style: 'unit',
  unit: 'kilometer'
})
// "100 km"

i18n.formatNumber(25, {
  style: 'unit',
  unit: 'celsius'
})
// "25°C"
```

## Troubleshooting

### TypeError: value must be a number

**Symptom:** `formatNumber()` throws a TypeError.

**Cause:** You passed a string instead of a number.

**Solution:** Convert to number first:

```typescript
// Wrong
i18n.formatNumber('1234')

// Right
i18n.formatNumber(parseFloat('1234'))
i18n.formatNumber(Number('1234'))
```

### TypeError: value must be a valid date

**Symptom:** `formatDate()` throws a TypeError.

**Cause:** You passed an invalid date string or object.

**Solution:** Ensure the date is valid:

```typescript
// Wrong - invalid date string
i18n.formatDate('not-a-date')

// Right
i18n.formatDate(new Date('2024-03-15'))
i18n.formatDate(Date.now())  // Timestamp
i18n.formatDate('2024-03-15T14:30:00Z')  // ISO string
```

### RangeError: Invalid unit

**Symptom:** `formatRelativeTime()` throws a RangeError.

**Cause:** You passed an invalid unit.

**Solution:** Use a valid unit from the list:

```typescript
// Valid units
'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

// Wrong
i18n.formatRelativeTime(5, 'days')  // Plural not allowed

// Right
i18n.formatRelativeTime(5, 'day')
```

## See Also

- **[Formatting Concept](Concept-Formatting)** - How formatting works
- **[Formatting API](API-Formatting)** - Full method documentation
- **[Changing Locales Guide](Guide-Changing-Locales)** - How locale affects formatting
