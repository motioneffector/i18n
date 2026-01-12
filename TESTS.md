# @motioneffector/i18n - Test Specification

Test-driven development specification for the internationalization library.

**Design Decisions:** See QUESTIONS.md for rationale behind key design choices.

---

## 1. Instance Creation

### `createI18n(options)`

#### Valid Inputs

```
✓ creates instance with defaultLocale only
  - Input: { defaultLocale: 'en' }
  - Returns: i18n instance with locale set to 'en'

✓ creates instance with defaultLocale and initial translations
  - Input: { defaultLocale: 'en', translations: { en: { hello: 'Hello' } } }
  - Returns: i18n instance, t('hello') returns 'Hello'

✓ creates instance with fallbackLocale
  - Input: { defaultLocale: 'de', fallbackLocale: 'en', translations: { en: {...}, de: {...} } }
  - Returns: i18n instance with fallback configured

✓ creates instance with loadPath function for lazy loading
  - Input: { defaultLocale: 'en', loadPath: async (locale) => fetchTranslations(locale) }
  - Returns: i18n instance with lazy loading configured

✓ sets current locale to defaultLocale on creation
  - After creation, getLocale() returns defaultLocale value

✓ accepts translations for multiple locales
  - Input: { defaultLocale: 'en', translations: { en: {...}, es: {...}, fr: {...} } }
  - All three locales available via getAvailableLocales()
```

#### Invalid Inputs (Fail Fast)

```
✓ throws TypeError if options is null or undefined
  - Input: createI18n(null)
  - Throws: TypeError with message "options is required"

✓ throws TypeError if options is not an object
  - Input: createI18n('en')
  - Throws: TypeError with message "options must be an object"

✓ throws TypeError if defaultLocale is missing
  - Input: createI18n({})
  - Throws: TypeError with message "defaultLocale is required"

✓ throws TypeError if defaultLocale is empty string
  - Input: createI18n({ defaultLocale: '' })
  - Throws: TypeError with message "defaultLocale cannot be empty"

✓ throws TypeError if defaultLocale is not a string
  - Input: createI18n({ defaultLocale: 123 })
  - Throws: TypeError with message "defaultLocale must be a string"

✓ throws TypeError if translations is not an object
  - Input: createI18n({ defaultLocale: 'en', translations: 'invalid' })
  - Throws: TypeError with message "translations must be an object"

✓ throws TypeError if loadPath is not a function
  - Input: createI18n({ defaultLocale: 'en', loadPath: 'invalid' })
  - Throws: TypeError with message "loadPath must be a function"
```

---

## 2. Basic Translation

### `i18n.t(key)`

#### Simple Keys

```
✓ returns translation for simple key
  - translations: { en: { hello: 'Hello' } }
  - t('hello') → 'Hello'

✓ returns translation for nested key (dot notation)
  - translations: { en: { common: { save: 'Save' } } }
  - t('common.save') → 'Save'

✓ returns translation for deeply nested key
  - translations: { en: { a: { b: { c: { d: { e: 'Deep' } } } } } }
  - t('a.b.c.d.e') → 'Deep'

✓ returns the key itself if translation is missing
  - translations: { en: { hello: 'Hello' } }
  - t('missing.key') → 'missing.key'

✓ returns the key itself if locale has no translations
  - translations: {} (empty)
  - t('hello') → 'hello'

✓ handles single-segment keys
  - translations: { en: { greeting: 'Hi' } }
  - t('greeting') → 'Hi'
```

#### Key Edge Cases

```
✓ key lookup is case-sensitive
  - translations: { en: { Hello: 'uppercase', hello: 'lowercase' } }
  - t('Hello') → 'uppercase'
  - t('hello') → 'lowercase'

✓ handles keys that are numeric strings
  - translations: { en: { '404': 'Not Found', '500': 'Server Error' } }
  - t('404') → 'Not Found'

✓ handles keys with underscores
  - translations: { en: { error_message: 'Error' } }
  - t('error_message') → 'Error'

✓ handles keys with hyphens
  - translations: { en: { 'error-message': 'Error' } }
  - t('error-message') → 'Error'

✓ trims whitespace from key before lookup
  - translations: { en: { hello: 'Hello' } }
  - t('  hello  ') → 'Hello'

✓ returns empty string for empty string key
  - t('') → ''

✓ handles key that resolves to empty string translation
  - translations: { en: { empty: '' } }
  - t('empty') → ''

✓ handles key pointing to object (not leaf value) - returns key
  - translations: { en: { common: { save: 'Save' } } }
  - t('common') → 'common' (because common is an object, not a string)
```

#### Invalid Key Inputs (Fail Fast)

```
✓ throws TypeError if key is null
  - t(null) throws TypeError with message "key must be a string"

✓ throws TypeError if key is undefined
  - t(undefined) throws TypeError with message "key must be a string"

✓ throws TypeError if key is a number
  - t(123) throws TypeError with message "key must be a string"

✓ throws TypeError if key is an object
  - t({ key: 'hello' }) throws TypeError with message "key must be a string"
```

---

## 3. Fallback Behavior

### With fallbackLocale Configured

```
✓ returns fallback translation if missing in current locale
  - translations: { en: { hello: 'Hello' }, de: { goodbye: 'Auf Wiedersehen' } }
  - locale: 'de', fallbackLocale: 'en'
  - t('hello') → 'Hello' (from fallback)

✓ returns key if missing in both current and fallback locale
  - translations: { en: { hello: 'Hello' }, de: { goodbye: 'Tschüss' } }
  - locale: 'de', fallbackLocale: 'en'
  - t('missing') → 'missing'

✓ prefers current locale over fallback when both have key
  - translations: { en: { hello: 'Hello' }, de: { hello: 'Hallo' } }
  - locale: 'de', fallbackLocale: 'en'
  - t('hello') → 'Hallo' (from current locale)

✓ fallback works for nested keys
  - translations: { en: { common: { save: 'Save' } }, de: {} }
  - locale: 'de', fallbackLocale: 'en'
  - t('common.save') → 'Save' (from fallback)

✓ fallback chain only goes one level deep
  - No cascading fallbacks (fallback's fallback is not checked)
```

### Without fallbackLocale

```
✓ returns key directly if missing (no fallback lookup)
  - translations: { en: { hello: 'Hello' } }
  - locale: 'en', no fallbackLocale
  - t('missing') → 'missing'
```

---

## 4. Interpolation

### `i18n.t(key, params)`

#### Basic Interpolation

```
✓ replaces single placeholder with param value
  - translation: 'Hello, {{name}}!'
  - t('greeting', { name: 'World' }) → 'Hello, World!'

✓ replaces multiple different placeholders
  - translation: '{{greeting}}, {{name}}!'
  - t('msg', { greeting: 'Hello', name: 'World' }) → 'Hello, World!'

✓ replaces same placeholder appearing multiple times
  - translation: '{{name}} met {{name}}'
  - t('msg', { name: 'Alice' }) → 'Alice met Alice'

✓ handles placeholder at start of string
  - translation: '{{name}} logged in'
  - t('msg', { name: 'Alice' }) → 'Alice logged in'

✓ handles placeholder at end of string
  - translation: 'Welcome, {{name}}'
  - t('msg', { name: 'Alice' }) → 'Welcome, Alice'

✓ handles adjacent placeholders with no separator
  - translation: '{{first}}{{last}}'
  - t('msg', { first: 'John', last: 'Doe' }) → 'JohnDoe'

✓ handles placeholder with spaces inside braces
  - translation: 'Hello, {{ name }}!'
  - t('msg', { name: 'World' }) → 'Hello, World!'
```

#### Missing Parameters

```
✓ leaves placeholder intact when param is missing
  - translation: 'Hello, {{name}}!'
  - t('greeting', {}) → 'Hello, {{name}}!'

✓ leaves placeholder intact when params object is omitted
  - translation: 'Hello, {{name}}!'
  - t('greeting') → 'Hello, {{name}}!'

✓ replaces found params, leaves missing params as placeholders
  - translation: '{{greeting}}, {{name}}!'
  - t('msg', { greeting: 'Hello' }) → 'Hello, {{name}}!'
```

#### Extra Parameters

```
✓ ignores extra params not in template
  - translation: 'Hello, {{name}}!'
  - t('greeting', { name: 'World', unused: 'ignored' }) → 'Hello, World!'
```

#### Parameter Value Types

```
✓ converts number to string
  - translation: 'Count: {{count}}'
  - t('msg', { count: 42 }) → 'Count: 42'

✓ converts negative number to string
  - translation: 'Temperature: {{temp}}'
  - t('msg', { temp: -5 }) → 'Temperature: -5'

✓ converts float to string
  - translation: 'Price: {{price}}'
  - t('msg', { price: 19.99 }) → 'Price: 19.99'

✓ converts boolean true to string 'true'
  - translation: 'Active: {{status}}'
  - t('msg', { status: true }) → 'Active: true'

✓ converts boolean false to string 'false'
  - translation: 'Active: {{status}}'
  - t('msg', { status: false }) → 'Active: false'

✓ converts null to empty string
  - translation: 'Value: {{val}}'
  - t('msg', { val: null }) → 'Value: '

✓ converts undefined to empty string
  - translation: 'Value: {{val}}'
  - t('msg', { val: undefined }) → 'Value: '

✓ converts zero to string '0' (not empty)
  - translation: 'Count: {{count}}'
  - t('msg', { count: 0 }) → 'Count: 0'

✓ does NOT escape HTML in interpolated values
  - translation: 'Content: {{html}}'
  - t('msg', { html: '<b>bold</b>' }) → 'Content: <b>bold</b>'
  - (Framework is responsible for escaping, not i18n library)
```

#### Invalid Params Input

```
✓ throws TypeError if params is not an object or undefined
  - t('key', 'invalid') throws TypeError with message "params must be an object"
  - t('key', 123) throws TypeError with message "params must be an object"

✓ accepts null as params (treated as empty object)
  - translation: 'Hello, {{name}}!'
  - t('greeting', null) → 'Hello, {{name}}!'
```

---

## 5. Pluralization

Uses `Intl.PluralRules` for language-correct plural forms.

### Translation Structure

```typescript
// English (two forms: one, other)
{
  "items": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}

// Russian (four forms: one, few, many, other)
{
  "items": {
    "one": "{{count}} предмет",
    "few": "{{count}} предмета",
    "many": "{{count}} предметов",
    "other": "{{count}} предмета"
  }
}

// Arabic (six forms: zero, one, two, few, many, other)
{
  "items": {
    "zero": "لا عناصر",
    "one": "عنصر واحد",
    "two": "عنصران",
    "few": "{{count}} عناصر",
    "many": "{{count}} عنصرًا",
    "other": "{{count}} عنصر"
  }
}
```

### `i18n.t(key, { count: n })`

#### Basic Plural Selection (English)

```
✓ uses 'one' form when count is 1
  - locale: 'en'
  - translation: { items: { one: '{{count}} item', other: '{{count}} items' } }
  - t('items', { count: 1 }) → '1 item'

✓ uses 'other' form when count is 0
  - t('items', { count: 0 }) → '0 items'

✓ uses 'other' form when count is 2
  - t('items', { count: 2 }) → '2 items'

✓ uses 'other' form when count is 100
  - t('items', { count: 100 }) → '100 items'
```

#### Zero Form (Optional)

```
✓ uses 'zero' form when count is 0 AND zero form is defined
  - translation: { items: { zero: 'No items', one: '{{count}} item', other: '{{count}} items' } }
  - t('items', { count: 0 }) → 'No items'

✓ falls back to Intl.PluralRules result if zero form not defined
  - translation: { items: { one: '{{count}} item', other: '{{count}} items' } }
  - t('items', { count: 0 }) → '0 items' (other form, per English rules)
```

#### Language-Specific Rules via Intl.PluralRules

```
✓ uses correct plural form for Russian (few: 2-4)
  - locale: 'ru'
  - translation: { items: { one: '...', few: '{{count}} предмета', many: '...', other: '...' } }
  - t('items', { count: 2 }) → '2 предмета' (few form)
  - t('items', { count: 3 }) → '3 предмета' (few form)
  - t('items', { count: 4 }) → '4 предмета' (few form)

✓ uses correct plural form for Russian (many: 5-20, 0)
  - locale: 'ru'
  - t('items', { count: 5 }) → '5 предметов' (many form)
  - t('items', { count: 11 }) → '11 предметов' (many form)
  - t('items', { count: 20 }) → '20 предметов' (many form)

✓ uses correct plural form for Arabic (two form)
  - locale: 'ar'
  - translation: { items: { ..., two: 'عنصران', ... } }
  - t('items', { count: 2 }) → 'عنصران' (two form)
```

#### Fallback Behavior

```
✓ falls back to 'other' if specific plural form is missing
  - translation: { items: { other: '{{count}} items' } } (only 'other' defined)
  - t('items', { count: 1 }) → '1 items' (other form used as fallback)

✓ returns key if 'other' form is also missing
  - translation: { items: { one: '{{count}} item' } } (no 'other')
  - t('items', { count: 5 }) → 'items'
```

#### Edge Cases

```
✓ count is also available for interpolation in plural strings
  - translation: { items: { one: 'Only {{count}} item left', other: '{{count}} items left' } }
  - t('items', { count: 1 }) → 'Only 1 item left'

✓ handles negative counts (uses absolute value for plural rule)
  - t('items', { count: -1 }) → '-1 item' (one form, displays actual value)

✓ handles decimal counts (Intl.PluralRules handles these)
  - locale: 'en'
  - t('items', { count: 1.5 }) → '1.5 items' (other form per English rules)

✓ handles very large counts
  - t('items', { count: 1000000 }) → '1000000 items'

✓ pluralization works with other interpolation params
  - translation: { items: { one: '{{name}} has {{count}} item', other: '{{name}} has {{count}} items' } }
  - t('items', { count: 3, name: 'Alice' }) → 'Alice has 3 items'

✓ non-plural key with count param - count used for interpolation only
  - translation: { message: 'You have {{count}} new messages' } (not plural structure)
  - t('message', { count: 5 }) → 'You have 5 new messages'
```

---

## 6. Locale Management

### `i18n.getLocale()`

```
✓ returns current locale code after creation
  - createI18n({ defaultLocale: 'en' })
  - getLocale() → 'en'

✓ returns updated locale after setLocale()
  - setLocale('de')
  - getLocale() → 'de'
```

### `i18n.setLocale(locale)`

```
✓ changes current locale
  - setLocale('de')
  - getLocale() → 'de'

✓ subsequent t() calls use new locale
  - translations: { en: { hello: 'Hello' }, de: { hello: 'Hallo' } }
  - setLocale('de')
  - t('hello') → 'Hallo'

✓ fires onChange callbacks
  - Register callback, call setLocale('de')
  - Callback invoked with ('de', 'en')

✓ does not fire onChange if locale is unchanged
  - locale is 'en', call setLocale('en')
  - Callback is NOT invoked

✓ returns the i18n instance for chaining
  - setLocale('de').t('hello') works
```

#### setLocale with Missing Translations

```
✓ allows setting locale with no translations if fallbackLocale exists
  - translations: { en: { hello: 'Hello' } }, fallbackLocale: 'en'
  - setLocale('de') succeeds
  - t('hello') → 'Hello' (from fallback)

✓ allows setting locale with no translations if loadPath exists
  - loadPath configured
  - setLocale('de') succeeds (translations can be loaded lazily)

✓ throws Error if locale has no translations, no fallback, and no loadPath
  - translations: { en: { hello: 'Hello' } }, no fallback, no loadPath
  - setLocale('xx') throws Error "No translations available for locale 'xx'"
```

#### Invalid Inputs

```
✓ throws TypeError if locale is not a string
  - setLocale(123) throws TypeError

✓ throws TypeError if locale is empty string
  - setLocale('') throws TypeError

✓ throws TypeError if locale is null or undefined
  - setLocale(null) throws TypeError
```

### `i18n.getAvailableLocales()`

```
✓ returns array of locale codes with loaded translations
  - translations: { en: {...}, de: {...}, fr: {...} }
  - getAvailableLocales() → ['en', 'de', 'fr'] (order may vary)

✓ returns empty array if no translations loaded
  - translations: {}
  - getAvailableLocales() → []

✓ updates after addTranslations()
  - Initial: { en: {...} }
  - addTranslations('es', {...})
  - getAvailableLocales() includes 'es'

✓ returned array is a copy (modifying it doesn't affect internal state)
  - locales = getAvailableLocales()
  - locales.push('fake')
  - getAvailableLocales() does NOT include 'fake'
```

---

## 7. Translation Management

### `i18n.addTranslations(locale, translations)`

```
✓ adds translations for a new locale
  - Initial: { en: {...} }
  - addTranslations('es', { hello: 'Hola' })
  - setLocale('es'), t('hello') → 'Hola'

✓ merges translations into existing locale (shallow keys)
  - Initial: { en: { hello: 'Hello' } }
  - addTranslations('en', { goodbye: 'Goodbye' })
  - t('hello') → 'Hello', t('goodbye') → 'Goodbye'

✓ deep merges nested translation objects
  - Initial: { en: { common: { save: 'Save' } } }
  - addTranslations('en', { common: { cancel: 'Cancel' } })
  - t('common.save') → 'Save', t('common.cancel') → 'Cancel'

✓ overwrites existing keys on conflict
  - Initial: { en: { hello: 'Hello' } }
  - addTranslations('en', { hello: 'Hi' })
  - t('hello') → 'Hi'

✓ locale becomes available in getAvailableLocales()
  - addTranslations('ja', {...})
  - getAvailableLocales() includes 'ja'

✓ returns the i18n instance for chaining
  - addTranslations('es', {...}).setLocale('es') works
```

#### Invalid Inputs

```
✓ throws TypeError if locale is not a string
  - addTranslations(123, {}) throws TypeError

✓ throws TypeError if locale is empty string
  - addTranslations('', {}) throws TypeError

✓ throws TypeError if translations is null
  - addTranslations('en', null) throws TypeError

✓ throws TypeError if translations is not an object
  - addTranslations('en', 'invalid') throws TypeError
  - addTranslations('en', []) throws TypeError
```

### `i18n.hasKey(key, locale?)`

```
✓ returns true if key exists in current locale
  - locale: 'en', translations: { en: { hello: 'Hello' } }
  - hasKey('hello') → true

✓ returns false if key doesn't exist in current locale
  - hasKey('missing') → false

✓ returns true if key exists in specified locale
  - translations: { en: { hello: 'Hello' }, de: { hallo: 'Hallo' } }
  - Current locale: 'en'
  - hasKey('hallo', 'de') → true

✓ returns false if key doesn't exist in specified locale
  - hasKey('hello', 'de') → false

✓ checks nested keys correctly
  - translations: { en: { common: { save: 'Save' } } }
  - hasKey('common.save') → true
  - hasKey('common.delete') → false
  - hasKey('common') → true (the namespace exists)

✓ does NOT check fallback locale
  - translations: { en: { hello: 'Hello' }, de: {} }, fallbackLocale: 'en'
  - locale: 'de'
  - hasKey('hello') → false (only checks 'de', not fallback)
```

#### Invalid Inputs

```
✓ throws TypeError if key is not a string
  - hasKey(123) throws TypeError

✓ throws TypeError if locale param is not a string (when provided)
  - hasKey('hello', 123) throws TypeError
```

### `i18n.getTranslations(locale?)`

```
✓ returns all translations for current locale
  - locale: 'en', translations: { en: { hello: 'Hello', goodbye: 'Bye' } }
  - getTranslations() → { hello: 'Hello', goodbye: 'Bye' }

✓ returns all translations for specified locale
  - getTranslations('de') → translations for 'de'

✓ returns empty object if locale doesn't exist
  - getTranslations('xx') → {}

✓ returned object is a deep copy (modifications don't affect internal state)
  - copy = getTranslations()
  - copy.hello = 'Modified'
  - t('hello') still returns original value
```

---

## 8. Lazy Loading

### `loadPath` Option

```typescript
createI18n({
  defaultLocale: 'en',
  translations: { en: {...} },  // Initial translations
  loadPath: async (locale) => {
    const response = await fetch(`/locales/${locale}.json`);
    return response.json();
  }
});
```

### `i18n.loadLocale(locale)`

```
✓ loads translations via loadPath function
  - loadPath returns { hello: 'Hallo' } for 'de'
  - await loadLocale('de')
  - setLocale('de'), t('hello') → 'Hallo'

✓ returns a Promise that resolves when loading completes
  - const promise = loadLocale('de')
  - promise is a Promise
  - await promise completes without error

✓ adds loaded translations to internal store
  - await loadLocale('de')
  - getAvailableLocales() includes 'de'

✓ merges with existing translations for same locale
  - translations: { de: { existing: 'Existing' } }
  - loadPath returns { loaded: 'Loaded' } for 'de'
  - await loadLocale('de')
  - t('existing') and t('loaded') both work

✓ only calls loadPath once per locale (caches result)
  - loadPath mock
  - await loadLocale('de')
  - await loadLocale('de') again
  - loadPath called only once

✓ can force reload with forceReload option
  - await loadLocale('de')
  - await loadLocale('de', { forceReload: true })
  - loadPath called twice

✓ handles concurrent loads for same locale (deduplication)
  - Start loadLocale('de') twice simultaneously
  - loadPath called only once
  - Both promises resolve to same result
```

#### Error Handling

```
✓ rejects promise if loadPath throws
  - loadPath throws Error('Network error')
  - await loadLocale('de') rejects with same error

✓ rejects promise if loadPath returns invalid data
  - loadPath returns null
  - await loadLocale('de') rejects with TypeError

✓ rejects promise if loadPath returns non-object
  - loadPath returns 'invalid'
  - await loadLocale('de') rejects with TypeError

✓ throws Error if loadPath not configured
  - No loadPath in options
  - loadLocale('de') throws Error "loadPath not configured"
```

### `i18n.isLocaleLoaded(locale)`

```
✓ returns true if locale translations are loaded
  - translations: { en: {...} }
  - isLocaleLoaded('en') → true

✓ returns false if locale translations not loaded
  - isLocaleLoaded('xx') → false

✓ returns true after loadLocale completes
  - await loadLocale('de')
  - isLocaleLoaded('de') → true
```

### Auto-Loading on setLocale

```
✓ setLocale does NOT auto-load (explicit loading required)
  - loadPath configured, no 'de' translations
  - setLocale('de') throws (or uses fallback) - does NOT auto-load
  - User must call loadLocale('de') first

✓ setLocaleAsync auto-loads if locale not present
  - await setLocaleAsync('de')
  - loadPath called for 'de'
  - locale switched to 'de'

✓ setLocaleAsync uses cached translations if already loaded
  - await loadLocale('de')
  - await setLocaleAsync('de')
  - loadPath NOT called again
```

---

## 9. Change Events

### `i18n.onChange(callback)`

```
✓ callback fires when locale changes via setLocale()
  - Register callback
  - setLocale('de')
  - Callback invoked

✓ callback receives new locale as first argument
  - callback = (newLocale) => ...
  - setLocale('de')
  - newLocale === 'de'

✓ callback receives previous locale as second argument
  - Initial locale: 'en'
  - callback = (newLocale, prevLocale) => ...
  - setLocale('de')
  - prevLocale === 'en'

✓ returns unsubscribe function
  - const unsubscribe = onChange(callback)
  - unsubscribe()
  - setLocale('de')
  - callback NOT invoked

✓ multiple callbacks can be registered
  - onChange(callback1)
  - onChange(callback2)
  - setLocale('de')
  - Both callbacks invoked

✓ callbacks invoked in registration order
  - Track invocation order
  - onChange(callback1)
  - onChange(callback2)
  - setLocale('de')
  - callback1 invoked before callback2

✓ does NOT fire when translations added (only locale change)
  - onChange(callback)
  - addTranslations('en', { new: 'New' })
  - callback NOT invoked

✓ does NOT fire when same locale is set again
  - locale: 'en'
  - onChange(callback)
  - setLocale('en')
  - callback NOT invoked
```

#### Invalid Inputs

```
✓ throws TypeError if callback is not a function
  - onChange('invalid') throws TypeError
  - onChange(null) throws TypeError
```

---

## 10. Missing Translation Handling

### `i18n.onMissing(callback)`

```
✓ callback fires when translation is missing in current locale
  - onMissing(callback)
  - t('nonexistent')
  - callback invoked

✓ callback receives key as first argument
  - callback = (key, locale) => ...
  - t('missing.key')
  - key === 'missing.key'

✓ callback receives current locale as second argument
  - locale: 'en'
  - t('missing')
  - locale === 'en'

✓ callback fires even when fallback provides translation
  - translations: { en: { hello: 'Hello' }, de: {} }
  - locale: 'de', fallback: 'en'
  - onMissing(callback)
  - t('hello') → 'Hello'
  - callback invoked with ('hello', 'de') - reports miss in primary locale

✓ returns unsubscribe function
  - const unsubscribe = onMissing(callback)
  - unsubscribe()
  - t('missing')
  - callback NOT invoked

✓ multiple callbacks can be registered
  - onMissing(cb1), onMissing(cb2)
  - t('missing')
  - Both invoked

✓ does NOT fire when translation exists
  - translations: { en: { hello: 'Hello' } }
  - onMissing(callback)
  - t('hello')
  - callback NOT invoked
```

### `i18n.setMissingBehavior(behavior)`

```
✓ 'key' - returns the key itself (default behavior)
  - setMissingBehavior('key')
  - t('missing.key') → 'missing.key'

✓ 'empty' - returns empty string
  - setMissingBehavior('empty')
  - t('missing.key') → ''

✓ 'throw' - throws an error
  - setMissingBehavior('throw')
  - t('missing.key') throws Error "Missing translation: missing.key"

✓ behavior applies after fallback check
  - fallback: 'en', translations: { en: { hello: 'Hello' }, de: {} }
  - locale: 'de', setMissingBehavior('throw')
  - t('hello') → 'Hello' (found in fallback, no throw)
  - t('missing') throws (not in fallback either)

✓ returns the i18n instance for chaining
  - setMissingBehavior('throw').t('hello') works
```

#### Invalid Inputs

```
✓ throws TypeError if behavior is not valid
  - setMissingBehavior('invalid') throws TypeError
  - Valid values: 'key', 'empty', 'throw'
```

---

## 11. Namespace Scoping

### `t.namespace(prefix)` or `i18n.namespace(prefix)`

```
✓ returns a scoped translate function
  - translations: { en: { common: { save: 'Save', cancel: 'Cancel' } } }
  - const tCommon = t.namespace('common')
  - tCommon('save') → 'Save'

✓ scoped function looks up 'prefix.key'
  - t.namespace('common')('save') looks up 'common.save'

✓ scoped function inherits interpolation
  - translations: { en: { greetings: { hello: 'Hello, {{name}}!' } } }
  - const tGreet = t.namespace('greetings')
  - tGreet('hello', { name: 'World' }) → 'Hello, World!'

✓ scoped function inherits pluralization
  - translations: { en: { shop: { items: { one: '{{count}} item', other: '{{count}} items' } } } }
  - const tShop = t.namespace('shop')
  - tShop('items', { count: 5 }) → '5 items'

✓ can nest namespaces
  - translations: { en: { a: { b: { c: { msg: 'Deep' } } } } }
  - const tAB = t.namespace('a').namespace('b')
  - tAB('c.msg') → 'Deep'

✓ can nest namespaces via chained call
  - const tABC = t.namespace('a.b.c')
  - tABC('msg') → 'Deep'

✓ scoped function uses current locale (not snapshot)
  - tCommon = t.namespace('common')
  - setLocale('de')
  - tCommon('save') uses 'de' locale

✓ empty prefix returns equivalent of base t
  - t.namespace('')('hello') === t('hello')
```

#### Invalid Inputs

```
✓ throws TypeError if prefix is not a string
  - t.namespace(123) throws TypeError

✓ allows null/undefined to mean no prefix
  - t.namespace(null)('hello') === t('hello')
  - t.namespace(undefined)('hello') === t('hello')
```

---

## 12. Formatting Extensions

### `i18n.formatNumber(value, options?)`

```
✓ formats number according to current locale
  - locale: 'en-US'
  - formatNumber(1234567.89) → '1,234,567.89'

✓ formats number according to different locale
  - locale: 'de-DE'
  - formatNumber(1234567.89) → '1.234.567,89'

✓ accepts Intl.NumberFormat options
  - formatNumber(1234.5, { style: 'currency', currency: 'USD' }) → '$1,234.50'

✓ handles negative numbers
  - formatNumber(-1234) → '-1,234'

✓ handles zero
  - formatNumber(0) → '0'

✓ handles very large numbers
  - formatNumber(1e15) formats without error

✓ handles decimals with precision options
  - formatNumber(1.23456, { maximumFractionDigits: 2 }) → '1.23'
```

#### Invalid Inputs

```
✓ throws TypeError if value is not a number
  - formatNumber('abc') throws TypeError
  - formatNumber(null) throws TypeError
```

### `i18n.formatDate(value, options?)`

```
✓ formats Date object according to current locale
  - locale: 'en-US'
  - formatDate(new Date('2024-03-15')) → '3/15/2024' (or similar)

✓ formats timestamp (number) as date
  - formatDate(1710460800000) → formatted date

✓ formats ISO string as date
  - formatDate('2024-03-15T10:30:00Z') → formatted date

✓ accepts Intl.DateTimeFormat options
  - formatDate(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  - → 'Friday, March 15, 2024'

✓ formats according to locale
  - locale: 'de-DE'
  - formatDate(date) → '15.3.2024' (or similar German format)
```

#### Invalid Inputs

```
✓ throws TypeError if value is not a valid date
  - formatDate('invalid') throws TypeError
  - formatDate(null) throws TypeError
```

### `i18n.formatRelativeTime(value, unit)`

```
✓ formats relative time for past
  - formatRelativeTime(-1, 'day') → '1 day ago' (or locale equivalent)
  - formatRelativeTime(-3, 'hour') → '3 hours ago'

✓ formats relative time for future
  - formatRelativeTime(1, 'day') → 'in 1 day'
  - formatRelativeTime(2, 'week') → 'in 2 weeks'

✓ supports all standard units
  - Units: 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'

✓ uses current locale
  - locale: 'de'
  - formatRelativeTime(-1, 'day') → 'vor 1 Tag'

✓ handles zero
  - formatRelativeTime(0, 'day') → 'in 0 days' or 'today' depending on locale
```

#### Invalid Inputs

```
✓ throws TypeError if value is not a number
  - formatRelativeTime('abc', 'day') throws TypeError

✓ throws TypeError if unit is not valid
  - formatRelativeTime(1, 'invalid') throws TypeError
```

---

## 13. Edge Cases & Error Handling

### Deep Nesting

```
✓ handles 10 levels of nesting
  - translations: { en: { a: { b: { c: { d: { e: { f: { g: { h: { i: { j: 'Deep' } } } } } } } } } } }
  - t('a.b.c.d.e.f.g.h.i.j') → 'Deep'

✓ handles 20 levels of nesting without stack overflow
  - Create deeply nested translation
  - t() returns correct value without error
```

### Special Key Characters

```
✓ handles keys with underscores throughout
  - t('error_code_not_found') works

✓ handles keys with hyphens throughout
  - t('error-code-not-found') works

✓ handles keys that are reserved words
  - translations: { en: { constructor: 'Ctor', prototype: 'Proto', __proto__: 'DunderProto' } }
  - t('constructor') → 'Ctor'
  - t('prototype') → 'Proto'
  - t('__proto__') → 'DunderProto' (doesn't access Object prototype)

✓ handles keys with unicode characters
  - translations: { en: { 'über': 'over', '日本語': 'Japanese' } }
  - t('über') → 'over'
  - t('日本語') → 'Japanese'
```

### Locale Code Handling

```
✓ handles simple locale codes (en, de, fr)
  - setLocale('en'), setLocale('de'), setLocale('fr') all work

✓ handles locale codes with region (en-US, en-GB, pt-BR)
  - setLocale('en-US') works
  - translations can be keyed by 'en-US'

✓ handles locale codes with script (zh-Hans, zh-Hant)
  - setLocale('zh-Hans') works

✓ does NOT normalize locale codes
  - 'en-US' and 'en-us' are treated as different locales
  - (User responsible for consistency)
```

### Concurrent Operations

```
✓ rapid setLocale calls don't corrupt state
  - Call setLocale 100 times rapidly with different locales
  - Final getLocale() returns the last set locale
  - Translations work correctly for final locale

✓ concurrent loadLocale calls for different locales
  - await Promise.all([loadLocale('de'), loadLocale('fr'), loadLocale('es')])
  - All three locales loaded correctly

✓ onChange callbacks don't interfere with each other
  - Multiple callbacks registered
  - Rapid setLocale calls
  - All callbacks receive correct old/new locale pairs
```

### Memory & Cleanup

```
✓ unsubscribed callbacks don't hold references
  - const unsub = onChange(callback)
  - unsub()
  - callback reference can be garbage collected

✓ translations can be replaced entirely
  - addTranslations('en', { hello: 'Hello' })
  - addTranslations('en', { goodbye: 'Goodbye' })
  - Both keys accessible (merge behavior)
```

---

## 14. TypeScript Type Safety

### Generic Type Parameter

```typescript
// Type-safe translation keys
type TranslationKeys = {
  en: {
    common: {
      save: string;
      cancel: string;
    };
    errors: {
      not_found: string;
    };
  };
};

const i18n = createI18n<TranslationKeys>({
  defaultLocale: 'en',
  translations: { ... }
});
```

### Type Tests (Compile-Time)

```
✓ t() accepts valid nested key strings
  - t('common.save') compiles
  - t('errors.not_found') compiles

✓ t() errors on invalid keys (if strict mode enabled)
  - t('invalid.key') shows TypeScript error

✓ params object type-checked for interpolation
  - t('greeting', { name: string }) compiles
  - t('greeting', { wrong: number }) shows TypeScript error

✓ setLocale accepts valid locale strings
  - setLocale('en') compiles
  - setLocale('de') compiles

✓ getLocale() returns locale string type
  - const locale: string = getLocale() compiles

✓ onChange callback has correct parameter types
  - onChange((newLocale: string, oldLocale: string) => {}) compiles
```

---

## 15. Test Utilities

### Fixtures

```typescript
// Standard test translations
export const testTranslations = {
  en: {
    hello: 'Hello',
    goodbye: 'Goodbye',
    greeting: 'Hello, {{name}}!',
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    items: {
      one: '{{count}} item',
      other: '{{count}} items',
    },
    errors: {
      not_found: '{{item}} not found',
      required: '{{field}} is required',
    },
  },
  de: {
    hello: 'Hallo',
    goodbye: 'Auf Wiedersehen',
    greeting: 'Hallo, {{name}}!',
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
    },
    items: {
      one: '{{count}} Artikel',
      other: '{{count}} Artikel',
    },
  },
  es: {
    hello: 'Hola',
    goodbye: 'Adiós',
    greeting: '¡Hola, {{name}}!',
  },
};
```

### Helper Functions

```typescript
// Create i18n instance with test translations
function createTestI18n(options?: Partial<I18nOptions>) {
  return createI18n({
    defaultLocale: 'en',
    translations: testTranslations,
    ...options,
  });
}

// Create mock loadPath function
function createMockLoadPath(translations: Record<string, object>) {
  return vi.fn(async (locale: string) => {
    if (translations[locale]) {
      return translations[locale];
    }
    throw new Error(`No translations for ${locale}`);
  });
}

// Wait for all pending locale loads
async function flushLocaleLoads(i18n: I18n) {
  await new Promise(resolve => setTimeout(resolve, 0));
}
```

### Mocks

```typescript
// Mock for onMissing callback
const missingKeyMock = vi.fn();

// Mock for onChange callback
const localeChangeMock = vi.fn();

// Reset all mocks between tests
beforeEach(() => {
  missingKeyMock.mockClear();
  localeChangeMock.mockClear();
});
```

---

## Appendix: API Summary

| Method | Description |
|--------|-------------|
| `createI18n(options)` | Create i18n instance |
| `i18n.t(key, params?)` | Translate key with optional interpolation |
| `i18n.getLocale()` | Get current locale |
| `i18n.setLocale(locale)` | Set current locale (sync) |
| `i18n.setLocaleAsync(locale)` | Set locale with auto-loading |
| `i18n.getAvailableLocales()` | Get list of loaded locales |
| `i18n.addTranslations(locale, translations)` | Add/merge translations |
| `i18n.hasKey(key, locale?)` | Check if key exists |
| `i18n.getTranslations(locale?)` | Get all translations for locale |
| `i18n.loadLocale(locale, options?)` | Load translations via loadPath |
| `i18n.isLocaleLoaded(locale)` | Check if locale is loaded |
| `i18n.onChange(callback)` | Subscribe to locale changes |
| `i18n.onMissing(callback)` | Subscribe to missing key events |
| `i18n.setMissingBehavior(behavior)` | Configure missing key handling |
| `t.namespace(prefix)` | Create scoped translate function |
| `i18n.formatNumber(value, options?)` | Format number for locale |
| `i18n.formatDate(value, options?)` | Format date for locale |
| `i18n.formatRelativeTime(value, unit)` | Format relative time |
