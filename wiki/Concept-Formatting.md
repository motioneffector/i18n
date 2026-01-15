# Formatting Utilities

Numbers, dates, and relative times need locale-specific formatting. Instead of adding external libraries, use the built-in formatting methods that wrap the browser's `Intl` APIs and automatically respect the current locale.

## How It Works

The i18n instance provides three formatting methods:

- `formatNumber()` - Uses `Intl.NumberFormat` for numbers, currencies, percentages
- `formatDate()` - Uses `Intl.DateTimeFormat` for dates and times
- `formatRelativeTime()` - Uses `Intl.RelativeTimeFormat` for "3 days ago" style text

Each method uses the current locale automatically. When you switch locales, formatting changes too:

```
Locale: en-US  ->  formatNumber(1234.5)  ->  "1,234.5"
Locale: de-DE  ->  formatNumber(1234.5)  ->  "1.234,5"
```

## Basic Usage

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({ defaultLocale: 'en-US' })

// Numbers
i18n.formatNumber(1234567.89)                    // "1,234,567.89"
i18n.formatNumber(0.75, { style: 'percent' })    // "75%"
i18n.formatNumber(99.99, {
  style: 'currency',
  currency: 'USD'
})                                               // "$99.99"

// Dates
i18n.formatDate(new Date())                      // "1/15/2024"
i18n.formatDate(new Date(), {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})                                               // "Monday, January 15, 2024"

// Relative time
i18n.formatRelativeTime(-1, 'day')               // "1 day ago"
i18n.formatRelativeTime(3, 'hour')               // "in 3 hours"
```

## Key Points

- **Uses current locale automatically** - No need to pass locale to each call
- **Accepts `Intl` options** - Full power of `Intl.NumberFormat` and `Intl.DateTimeFormat`
- **Date accepts multiple types** - `Date` objects, timestamps (numbers), or ISO strings
- **Relative time is directional** - Negative = past, positive = future

## Examples

### Currency Formatting

Format prices for different locales:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })

const price = 1299.99

// US format
i18n.formatNumber(price, { style: 'currency', currency: 'USD' })
// "$1,299.99"

// Switch to German
i18n.setLocale('de-DE')
i18n.formatNumber(price, { style: 'currency', currency: 'EUR' })
// "1.299,99 €"
```

### Date Styles

Different levels of detail for dates:

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })
const date = new Date('2024-03-15T14:30:00')

// Short
i18n.formatDate(date, { dateStyle: 'short' })
// "3/15/24"

// Medium
i18n.formatDate(date, { dateStyle: 'medium' })
// "Mar 15, 2024"

// Full with time
i18n.formatDate(date, {
  dateStyle: 'full',
  timeStyle: 'short'
})
// "Friday, March 15, 2024 at 2:30 PM"
```

### Relative Time

Show human-friendly time differences:

```typescript
const i18n = createI18n({ defaultLocale: 'en' })

i18n.formatRelativeTime(-5, 'minute')   // "5 minutes ago"
i18n.formatRelativeTime(-1, 'hour')     // "1 hour ago"
i18n.formatRelativeTime(-3, 'day')      // "3 days ago"
i18n.formatRelativeTime(1, 'week')      // "in 1 week"
i18n.formatRelativeTime(2, 'month')     // "in 2 months"

// In German
i18n.setLocale('de')
i18n.formatRelativeTime(-1, 'day')      // "vor 1 Tag"
```

## Supported Units for Relative Time

| Unit | Example |
|------|---------|
| `second` | "5 seconds ago" |
| `minute` | "in 3 minutes" |
| `hour` | "2 hours ago" |
| `day` | "in 1 day" |
| `week` | "3 weeks ago" |
| `month` | "in 6 months" |
| `year` | "2 years ago" |

## Related

- **[Formatting Guide](Guide-Formatting)** - Step-by-step guide with more examples
- **[Formatting API](API-Formatting)** - Full method documentation with all options
- **[Locale Management](Concept-Locale-Management)** - How locale affects formatting
