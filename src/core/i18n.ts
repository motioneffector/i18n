import type {
  I18n,
  I18nOptions,
  InterpolationParams,
  TranslateFunction,
  TranslationObject,
  TranslationValue,
  MissingBehavior,
  ChangeCallback,
  MissingCallback,
  LoadLocaleOptions,
  PluralTranslations,
} from '../types'
import { I18nError } from '../errors'

/**
 * Creates a new internationalization (i18n) instance.
 *
 * @param options - Configuration options for the i18n instance
 * @returns An i18n instance with translation and locale management methods
 *
 * @example
 * ```typescript
 * const i18n = createI18n({
 *   defaultLocale: 'en',
 *   translations: {
 *     en: { hello: 'Hello', greeting: 'Hello, {{name}}!' },
 *     es: { hello: 'Hola', greeting: '¡Hola, {{name}}!' }
 *   }
 * })
 *
 * i18n.t('hello') // "Hello"
 * i18n.t('greeting', { name: 'World' }) // "Hello, World!"
 * ```
 *
 * @throws {TypeError} If options is null, undefined, or not an object
 * @throws {TypeError} If defaultLocale is missing, empty, or not a string
 * @throws {TypeError} If translations is provided but not an object
 * @throws {TypeError} If loadPath is provided but not a function
 */
export function createI18n(options?: I18nOptions): I18n {
  // Validate options
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (options === undefined || options === null) {
    throw new TypeError('options is required')
  }

  if (typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object')
  }

  if (!('defaultLocale' in options)) {
    throw new TypeError('defaultLocale is required')
  }

  if (typeof options.defaultLocale !== 'string') {
    throw new TypeError('defaultLocale must be a string')
  }

  if (options.defaultLocale.trim() === '') {
    throw new TypeError('defaultLocale cannot be empty')
  }

  if (options.translations !== undefined) {
    if (typeof options.translations !== 'object' || Array.isArray(options.translations)) {
      throw new TypeError('translations must be an object')
    }
  }

  if (options.loadPath !== undefined && typeof options.loadPath !== 'function') {
    throw new TypeError('loadPath must be a function')
  }

  // Internal state
  const translations = new Map<string, TranslationObject>()
  let currentLocale = options.defaultLocale
  const fallbackLocale = options.fallbackLocale
  const loadPath = options.loadPath
  const changeCallbacks = new Set<ChangeCallback>()
  const missingCallbacks = new Set<MissingCallback>()
  let missingBehavior: MissingBehavior = 'key'
  const loadingPromises = new Map<string, Promise<void>>()
  const loadedLocales = new Set<string>()
  let lastCallbackError: Error | null = null

  // Initialize translations
  if (options.translations) {
    for (const [locale, trans] of Object.entries(options.translations)) {
      translations.set(locale, deepClone(trans))
      // Don't add to loadedLocales - that's only for dynamically loaded locales
    }
  }

  // Helper: Deep clone
  function deepClone(obj: TranslationObject): TranslationObject {
    const result = Object.create(null) as TranslationObject
    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

    for (const key of Object.keys(obj)) {
      // Skip dangerous keys that could lead to prototype pollution
      if (FORBIDDEN_KEYS.has(key)) {
        continue
      }

      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        if (value === undefined) continue
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = deepClone(value as TranslationObject)
        } else {
          result[key] = value
        }
      }
    }
    return result
  }

  // Helper: Deep merge
  function deepMerge(target: TranslationObject, source: TranslationObject): TranslationObject {
    const result = Object.create(null) as TranslationObject
    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

    // Copy all properties from target
    for (const key of Object.keys(target)) {
      // Skip dangerous keys that could lead to prototype pollution
      if (FORBIDDEN_KEYS.has(key)) {
        continue
      }

      if (Object.prototype.hasOwnProperty.call(target, key)) {
        const value = target[key]
        if (value !== undefined) {
          result[key] = value
        }
      }
    }

    // Merge properties from source
    for (const key of Object.keys(source)) {
      // Skip dangerous keys that could lead to prototype pollution
      if (FORBIDDEN_KEYS.has(key)) {
        continue
      }

      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key]
        if (value === undefined) continue
        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !isPluralTranslations(value)
        ) {
          const existing = result[key]
          if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            result[key] = deepMerge(existing as TranslationObject, value as TranslationObject)
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            result[key] = deepClone(value as TranslationObject)
          }
        } else {
          result[key] = value
        }
      }
    }

    return result
  }

  // Helper: Check if object is plural translations
  function isPluralTranslations(obj: TranslationValue): obj is PluralTranslations {
    if (typeof obj !== 'object') return false
    const keys = Object.keys(obj)
    const pluralKeys = ['zero', 'one', 'two', 'few', 'many', 'other']
    return keys.length > 0 && keys.every(k => pluralKeys.includes(k))
  }

  // Helper: Lookup nested key
  function lookupKey(locale: string, key: string): string | null {
    const trans = translations.get(locale)
    if (!trans) return null

    const parts = key.split('.')
    let current: TranslationValue = trans

    for (const part of parts) {
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        if (isPluralTranslations(current)) {
          return null
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const obj = current as TranslationObject
        if (Object.prototype.hasOwnProperty.call(obj, part)) {
          const nextValue = obj[part]
          if (nextValue === undefined) return null
          current = nextValue
        } else {
          return null
        }
      } else {
        return null
      }
    }

    if (typeof current === 'string') {
      return current
    }

    return null
  }

  // Helper: Interpolate placeholders
  function interpolate(template: string, params?: InterpolationParams): string {
    if (!params) return template

    let result = template
    for (const [key, value] of Object.entries(params)) {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      let replacement = ''
      if (value === null || value === undefined) {
        replacement = ''
      } else {
        replacement = String(value)
      }
      result = result.replace(placeholder, replacement)
    }
    return result
  }

  // Helper: Get plural form
  function getPluralForm(locale: string, count: number): string {
    if (count === 0) return 'zero'

    const absCount = Math.abs(count)
    const rules = new Intl.PluralRules(locale)
    const rule = rules.select(absCount)
    return rule
  }

  // Helper: Handle pluralization
  function handlePluralization(
    locale: string,
    key: string,
    params: InterpolationParams
  ): string | null {
    const trans = translations.get(locale)
    if (!trans) return null

    const parts = key.split('.')
    let current: TranslationValue = trans

    for (const part of parts) {
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        const obj = current as TranslationObject
        if (Object.prototype.hasOwnProperty.call(obj, part)) {
          const nextValue = obj[part]
          if (nextValue === undefined) return null
          current = nextValue
        } else {
          return null
        }
      } else {
        return null
      }
    }

    if (isPluralTranslations(current) && typeof params.count === 'number') {
      const plural = current
      const count = params.count
      const form = getPluralForm(locale, count)

      // Try exact form first
      if (form === 'zero' && plural.zero !== undefined) {
        return plural.zero
      }
      if (
        Object.prototype.hasOwnProperty.call(plural, form) &&
        plural[form as keyof PluralTranslations] !== undefined
      ) {
        const value = plural[form as keyof PluralTranslations]
        if (value !== undefined) {
          return value
        }
      }
      // Fallback to 'other'
      return plural.other
    }

    return null
  }

  // Core translate function
  function translate(key: string, params?: InterpolationParams): string {
    // Validate inputs
    if (typeof key !== 'string') {
      throw new TypeError('key must be a string')
    }

    if (params !== undefined) {
      if (typeof params !== 'object' || Array.isArray(params)) {
        throw new TypeError('params must be an object')
      }
    }

    const trimmedKey = key.trim()
    if (trimmedKey === '') return ''

    // Check if pluralization is needed
    const hasCount = params && 'count' in params && typeof params.count === 'number'

    // Try current locale first
    let result: string | null = null

    if (hasCount) {
      result = handlePluralization(currentLocale, trimmedKey, params)
    }

    result ??= lookupKey(currentLocale, trimmedKey)

    const foundInCurrentLocale = result !== null

    // Try fallback locale
    if (result === null && fallbackLocale) {
      if (hasCount) {
        result = handlePluralization(fallbackLocale, trimmedKey, params)
      }
      result ??= lookupKey(fallbackLocale, trimmedKey)
    }

    // Handle missing translation
    if (result === null) {
      missingCallbacks.forEach(cb => {
        try {
          cb(trimmedKey, currentLocale)
        } catch (e) {
          lastCallbackError = e instanceof Error ? e : new Error(String(e))
          console.error('Missing callback error:', e)
        }
      })

      switch (missingBehavior) {
        case 'empty':
          return ''
        case 'throw':
          throw new I18nError(`Missing translation: ${trimmedKey}`)
        case 'key':
        default:
          return trimmedKey
      }
    }

    // Fire missing callback if not found in current locale (even if found in fallback)
    if (!foundInCurrentLocale && fallbackLocale) {
      missingCallbacks.forEach(cb => {
        try {
          cb(trimmedKey, currentLocale)
        } catch (e) {
          lastCallbackError = e instanceof Error ? e : new Error(String(e))
          console.error('Missing callback error:', e)
        }
      })
    }

    // Interpolate
    return interpolate(result, params)
  }

  // Create translate function with namespace method
  function createTranslateFunction(prefix?: string): TranslateFunction {
    const fn = ((key: string, params?: InterpolationParams) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      return translate(fullKey, params)
    }) as TranslateFunction

    fn.namespace = (newPrefix: string | null | undefined) => {
      if (newPrefix !== undefined && newPrefix !== null && typeof newPrefix !== 'string') {
        throw new TypeError('prefix must be a string')
      }

      const normalizedPrefix = newPrefix ?? ''
      const combinedPrefix = prefix
        ? normalizedPrefix
          ? `${prefix}.${normalizedPrefix}`
          : prefix
        : normalizedPrefix

      return createTranslateFunction(combinedPrefix || undefined)
    }

    return fn
  }

  const t = createTranslateFunction()

  // Public API
  const i18n: I18n = {
    t,

    getLocale() {
      return currentLocale
    },

    setLocale(locale: string) {
      if (typeof locale !== 'string') {
        throw new TypeError('locale must be a string')
      }
      if (locale.trim() === '') {
        throw new TypeError('locale cannot be empty')
      }

      if (locale === currentLocale) {
        return i18n
      }

      // Check if locale is available
      // Only throw if we have loaded translations (not initial setup phase)
      // and the target locale is not available and there's no fallback
      const hasSomeTranslations = translations.size > 0
      if (!translations.has(locale) && hasSomeTranslations && !fallbackLocale) {
        throw new Error(`No translations available for locale '${locale}'`)
      }

      const prevLocale = currentLocale
      currentLocale = locale

      // Fire change callbacks
      changeCallbacks.forEach(cb => {
        try {
          cb(locale, prevLocale)
        } catch (e) {
          lastCallbackError = e instanceof Error ? e : new Error(String(e))
          console.error('Change callback error:', e)
        }
      })

      return i18n
    },

    async setLocaleAsync(locale: string) {
      if (!loadedLocales.has(locale) && loadPath) {
        await i18n.loadLocale(locale)
      }
      return i18n.setLocale(locale)
    },

    getAvailableLocales() {
      return Array.from(translations.keys())
    },

    addTranslations(locale: string, trans: TranslationObject) {
      if (typeof locale !== 'string') {
        throw new TypeError('locale must be a string')
      }
      if (locale.trim() === '') {
        throw new TypeError('locale cannot be empty')
      }
      if (trans === null || typeof trans !== 'object' || Array.isArray(trans)) {
        throw new TypeError('translations must be an object')
      }

      const existing = translations.get(locale)
      if (existing) {
        translations.set(locale, deepMerge(existing, trans))
      } else {
        translations.set(locale, deepClone(trans))
        loadedLocales.add(locale)
      }

      return i18n
    },

    hasKey(key: string, locale?: string) {
      if (typeof key !== 'string') {
        throw new TypeError('key must be a string')
      }
      if (locale !== undefined && typeof locale !== 'string') {
        throw new TypeError('locale must be a string')
      }

      const targetLocale = locale ?? currentLocale
      const result = lookupKey(targetLocale, key)
      if (result !== null) return true

      // Check if key points to an object (namespace)
      const trans = translations.get(targetLocale)
      if (!trans) return false

      const parts = key.split('.')
      let current: TranslationValue = trans

      for (const part of parts) {
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          const obj = current as TranslationObject
          if (Object.prototype.hasOwnProperty.call(obj, part)) {
            const nextValue = obj[part]
            if (nextValue === undefined) return false
            current = nextValue
          } else {
            return false
          }
        } else {
          return false
        }
      }

      return true
    },

    getTranslations(locale?: string) {
      const targetLocale = locale ?? currentLocale
      const trans = translations.get(targetLocale)
      return trans ? deepClone(trans) : {}
    },

    loadLocale(locale: string, options?: LoadLocaleOptions) {
      if (!loadPath) {
        throw new Error('loadPath not configured')
      }

      const forceReload = options?.forceReload ?? false

      // Return existing promise if loading
      if (!forceReload && loadingPromises.has(locale)) {
        const existingPromise = loadingPromises.get(locale)
        if (existingPromise) {
          return existingPromise
        }
      }

      // Return immediately if already loaded (unless force reload)
      if (!forceReload && loadedLocales.has(locale)) {
        return Promise.resolve()
      }

      const promise = (async () => {
        try {
          const data = await loadPath(locale)

          if (data === null || typeof data !== 'object' || Array.isArray(data)) {
            throw new TypeError('loadPath must return an object')
          }

          i18n.addTranslations(locale, data)
          loadedLocales.add(locale)
        } finally {
          loadingPromises.delete(locale)
        }
      })()

      loadingPromises.set(locale, promise)
      return promise
    },

    isLocaleLoaded(locale: string) {
      return translations.has(locale)
    },

    onChange(callback: ChangeCallback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function')
      }

      changeCallbacks.add(callback)
      return () => {
        changeCallbacks.delete(callback)
      }
    },

    onMissing(callback: MissingCallback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function')
      }

      missingCallbacks.add(callback)
      return () => {
        missingCallbacks.delete(callback)
      }
    },

    setMissingBehavior(behavior: MissingBehavior) {
      const validBehaviors: MissingBehavior[] = ['key', 'empty', 'throw']
      if (!validBehaviors.includes(behavior)) {
        throw new TypeError('behavior must be one of: key, empty, throw')
      }

      missingBehavior = behavior
      return i18n
    },

    namespace(prefix: string | null | undefined) {
      return t.namespace(prefix)
    },

    formatNumber(value: number, options?: Intl.NumberFormatOptions) {
      if (typeof value !== 'number') {
        throw new TypeError('value must be a number')
      }

      const formatter = new Intl.NumberFormat(currentLocale, options)
      return formatter.format(value)
    },

    formatDate(value: Date | number | string, options?: Intl.DateTimeFormatOptions) {
      let date: Date
      if (value instanceof Date) {
        date = value
      } else if (typeof value === 'number') {
        date = new Date(value)
      } else if (typeof value === 'string') {
        date = new Date(value)
      } else {
        throw new TypeError('value must be a valid date')
      }

      if (isNaN(date.getTime())) {
        throw new TypeError('value must be a valid date')
      }

      const formatter = new Intl.DateTimeFormat(currentLocale, options)
      return formatter.format(date)
    },

    formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit) {
      if (typeof value !== 'number') {
        throw new TypeError('value must be a number')
      }

      const formatter = new Intl.RelativeTimeFormat(currentLocale)
      return formatter.format(value, unit)
    },

    getLastCallbackError() {
      return lastCallbackError
    },
  }

  return i18n
}
