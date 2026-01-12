export type TranslationValue = string | TranslationObject | PluralTranslations

export interface TranslationObject {
  [key: string]: TranslationValue
}

export interface PluralTranslations {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

export type InterpolationParams = Record<string, string | number | boolean | null | undefined>

export type MissingBehavior = 'key' | 'empty' | 'throw'

export type LoadPathFunction = (locale: string) => Promise<TranslationObject>

export type ChangeCallback = (newLocale: string, prevLocale: string) => void

export type MissingCallback = (key: string, locale: string) => void

export interface I18nOptions {
  defaultLocale: string
  fallbackLocale?: string
  translations?: Record<string, TranslationObject>
  loadPath?: LoadPathFunction
}

export interface LoadLocaleOptions {
  forceReload?: boolean
}

export interface TranslateFunction {
  (key: string, params?: InterpolationParams): string
  namespace: (prefix: string | null | undefined) => TranslateFunction
}

export interface I18n {
  t: TranslateFunction
  getLocale: () => string
  setLocale: (locale: string) => I18n
  setLocaleAsync: (locale: string) => Promise<I18n>
  getAvailableLocales: () => string[]
  addTranslations: (locale: string, translations: TranslationObject) => I18n
  hasKey: (key: string, locale?: string) => boolean
  getTranslations: (locale?: string) => TranslationObject
  loadLocale: (locale: string, options?: LoadLocaleOptions) => Promise<void>
  isLocaleLoaded: (locale: string) => boolean
  onChange: (callback: ChangeCallback) => () => void
  onMissing: (callback: MissingCallback) => () => void
  setMissingBehavior: (behavior: MissingBehavior) => I18n
  namespace: (prefix: string | null | undefined) => TranslateFunction
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (
    value: Date | number | string,
    options?: Intl.DateTimeFormatOptions
  ) => string
  formatRelativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit
  ) => string
}
