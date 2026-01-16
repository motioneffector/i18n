# Formatting API

Methods for locale-aware formatting of numbers, dates, and relative times.

---

## `formatNumber()`

Formats a number according to the current locale.

**Signature:**

```typescript
function formatNumber(value: number, options?: Intl.NumberFormatOptions): string
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `number` | Yes | The number to format |
| `options` | `Intl.NumberFormatOptions` | No | Formatting options passed to `Intl.NumberFormat` |

**Returns:** `string` — The formatted number string.

**Example:**

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })

// Basic formatting
i18n.formatNumber(1234567.89)  // "1,234,567.89"

// Currency
i18n.formatNumber(99.99, {
  style: 'currency',
  currency: 'USD'
})  // "$99.99"

// Percentage
i18n.formatNumber(0.156, { style: 'percent' })  // "16%"

// Compact notation
i18n.formatNumber(1500000, { notation: 'compact' })  // "1.5M"

// Precision control
i18n.formatNumber(3.14159, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
})  // "3.1416"

// Different locale
i18n.setLocale('de-DE')
i18n.formatNumber(1234.56)  // "1.234,56"
```

**Throws:**

- `TypeError` — If `value` is not a number

**Common Options:**

| Option | Values | Description |
|--------|--------|-------------|
| `style` | `'decimal'`, `'currency'`, `'percent'`, `'unit'` | Number format style |
| `currency` | `'USD'`, `'EUR'`, `'GBP'`, etc. | Currency code (required for currency style) |
| `notation` | `'standard'`, `'scientific'`, `'engineering'`, `'compact'` | Number notation |
| `minimumFractionDigits` | `0-20` | Minimum decimal places |
| `maximumFractionDigits` | `0-20` | Maximum decimal places |
| `unit` | `'kilometer'`, `'celsius'`, etc. | Unit for unit style |

---

## `formatDate()`

Formats a date according to the current locale.

**Signature:**

```typescript
function formatDate(
  value: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): string
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `Date \| number \| string` | Yes | The date to format (Date object, timestamp, or ISO string) |
| `options` | `Intl.DateTimeFormatOptions` | No | Formatting options passed to `Intl.DateTimeFormat` |

**Returns:** `string` — The formatted date string.

**Example:**

```typescript
const i18n = createI18n({ defaultLocale: 'en-US' })
const date = new Date('2024-03-15T14:30:00')

// Default format
i18n.formatDate(date)  // "3/15/2024"

// Date styles
i18n.formatDate(date, { dateStyle: 'short' })   // "3/15/24"
i18n.formatDate(date, { dateStyle: 'medium' })  // "Mar 15, 2024"
i18n.formatDate(date, { dateStyle: 'long' })    // "March 15, 2024"
i18n.formatDate(date, { dateStyle: 'full' })    // "Friday, March 15, 2024"

// With time
i18n.formatDate(date, {
  dateStyle: 'medium',
  timeStyle: 'short'
})  // "Mar 15, 2024, 2:30 PM"

// Custom format
i18n.formatDate(date, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})  // "Friday, March 15, 2024"

// From timestamp
i18n.formatDate(1710510600000)  // Formatted date

// From ISO string
i18n.formatDate('2024-03-15T14:30:00Z')  // Formatted date
```

**Throws:**

- `TypeError` — If `value` is not a valid date

**Common Options:**

| Option | Values | Description |
|--------|--------|-------------|
| `dateStyle` | `'full'`, `'long'`, `'medium'`, `'short'` | Preset date format |
| `timeStyle` | `'full'`, `'long'`, `'medium'`, `'short'` | Preset time format |
| `weekday` | `'long'`, `'short'`, `'narrow'` | Weekday representation |
| `year` | `'numeric'`, `'2-digit'` | Year representation |
| `month` | `'numeric'`, `'2-digit'`, `'long'`, `'short'`, `'narrow'` | Month representation |
| `day` | `'numeric'`, `'2-digit'` | Day representation |
| `hour` | `'numeric'`, `'2-digit'` | Hour representation |
| `minute` | `'numeric'`, `'2-digit'` | Minute representation |

---

## `formatRelativeTime()`

Formats a relative time value (e.g., "3 days ago", "in 2 hours").

**Signature:**

```typescript
function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit
): string
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `number` | Yes | The numeric value (negative for past, positive for future) |
| `unit` | `Intl.RelativeTimeFormatUnit` | Yes | The time unit |

**Returns:** `string` — The formatted relative time string.

**Example:**

```typescript
const i18n = createI18n({ defaultLocale: 'en' })

// Past (negative values)
i18n.formatRelativeTime(-1, 'second')  // "1 second ago"
i18n.formatRelativeTime(-5, 'minute')  // "5 minutes ago"
i18n.formatRelativeTime(-2, 'hour')    // "2 hours ago"
i18n.formatRelativeTime(-1, 'day')     // "1 day ago"
i18n.formatRelativeTime(-3, 'week')    // "3 weeks ago"
i18n.formatRelativeTime(-1, 'month')   // "1 month ago"
i18n.formatRelativeTime(-2, 'year')    // "2 years ago"

// Future (positive values)
i18n.formatRelativeTime(1, 'day')      // "in 1 day"
i18n.formatRelativeTime(2, 'week')     // "in 2 weeks"

// Different locale
i18n.setLocale('de')
i18n.formatRelativeTime(-1, 'day')     // "vor 1 Tag"
i18n.formatRelativeTime(2, 'hour')     // "in 2 Stunden"
```

**Throws:**

- `TypeError` — If `value` is not a number
- `RangeError` — If `unit` is not a valid time unit

**Valid Units:**

| Unit | Description |
|------|-------------|
| `'second'` | Seconds |
| `'minute'` | Minutes |
| `'hour'` | Hours |
| `'day'` | Days |
| `'week'` | Weeks |
| `'month'` | Months |
| `'quarter'` | Quarters |
| `'year'` | Years |
