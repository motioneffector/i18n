import { describe, it, expect } from 'vitest'
import { createI18n } from './core/i18n'
import type { I18nOptions, InterpolationParams } from './types'

// ============================================
// FUZZ TEST CONFIGURATION
// ============================================

const THOROUGH_MODE = process.env.FUZZ_THOROUGH === '1'
const THOROUGH_DURATION_MS = 10_000 // 10 seconds per test in thorough mode
const STANDARD_ITERATIONS = 200 // iterations per test in standard mode
const BASE_SEED = 12345 // reproducible seed for standard mode

// ============================================
// SEEDED PRNG
// ============================================

function createSeededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

// ============================================
// FUZZ LOOP HELPER
// ============================================

interface FuzzLoopResult {
  iterations: number
  seed: number
  durationMs: number
}

/**
 * Executes a fuzz test body in either standard or thorough mode.
 *
 * Standard mode: Runs exactly STANDARD_ITERATIONS times with BASE_SEED
 * Thorough mode: Runs for THOROUGH_DURATION_MS with time-based seed
 *
 * On failure, throws with full reproduction information.
 */
function fuzzLoop(
  testFn: (random: () => number, iteration: number) => void
): FuzzLoopResult {
  const startTime = Date.now()
  const seed = THOROUGH_MODE ? startTime : BASE_SEED
  const random = createSeededRandom(seed)

  let iteration = 0

  try {
    if (THOROUGH_MODE) {
      // Time-based: run until duration exceeded
      while (Date.now() - startTime < THOROUGH_DURATION_MS) {
        testFn(random, iteration)
        iteration++
      }
    } else {
      // Iteration-based: run fixed count
      for (iteration = 0; iteration < STANDARD_ITERATIONS; iteration++) {
        testFn(random, iteration)
      }
    }
  } catch (error) {
    const elapsed = Date.now() - startTime
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Fuzz test failed!\n` +
        `  Mode: ${THOROUGH_MODE ? 'thorough' : 'standard'}\n` +
        `  Seed: ${seed}\n` +
        `  Iteration: ${iteration}\n` +
        `  Elapsed: ${elapsed}ms\n` +
        `  Error: ${message}\n\n` +
        `To reproduce, run with:\n` +
        `  BASE_SEED=${seed} and start at iteration ${iteration}`
    )
  }

  return {
    iterations: iteration,
    seed,
    durationMs: Date.now() - startTime,
  }
}

/**
 * Async version of fuzzLoop for testing async functions.
 */
async function fuzzLoopAsync(
  testFn: (random: () => number, iteration: number) => Promise<void>
): Promise<FuzzLoopResult> {
  const startTime = Date.now()
  const seed = THOROUGH_MODE ? startTime : BASE_SEED
  const random = createSeededRandom(seed)

  let iteration = 0

  try {
    if (THOROUGH_MODE) {
      while (Date.now() - startTime < THOROUGH_DURATION_MS) {
        await testFn(random, iteration)
        iteration++
      }
    } else {
      for (iteration = 0; iteration < STANDARD_ITERATIONS; iteration++) {
        await testFn(random, iteration)
      }
    }
  } catch (error) {
    const elapsed = Date.now() - startTime
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Fuzz test failed!\n` +
        `  Mode: ${THOROUGH_MODE ? 'thorough' : 'standard'}\n` +
        `  Seed: ${seed}\n` +
        `  Iteration: ${iteration}\n` +
        `  Elapsed: ${elapsed}ms\n` +
        `  Error: ${message}\n\n` +
        `To reproduce, run with:\n` +
        `  BASE_SEED=${seed} and start at iteration ${iteration}`
    )
  }

  return {
    iterations: iteration,
    seed,
    durationMs: Date.now() - startTime,
  }
}

// ============================================
// VALUE GENERATORS
// ============================================

function generateString(random: () => number, maxLen = 100): string {
  const len = Math.floor(random() * maxLen)
  return Array.from({ length: len }, () =>
    String.fromCharCode(Math.floor(random() * 0xffff))
  ).join('')
}

function generateNumber(random: () => number): number {
  const type = Math.floor(random() * 10)
  switch (type) {
    case 0:
      return 0
    case 1:
      return -0
    case 2:
      return NaN
    case 3:
      return Infinity
    case 4:
      return -Infinity
    case 5:
      return Number.MAX_SAFE_INTEGER
    case 6:
      return Number.MIN_SAFE_INTEGER
    case 7:
      return Number.EPSILON
    default:
      return (random() - 0.5) * Number.MAX_SAFE_INTEGER * 2
  }
}

function generateArray<T>(
  random: () => number,
  generator: (r: () => number) => T,
  maxLen = 20
): T[] {
  const len = Math.floor(random() * maxLen)
  return Array.from({ length: len }, () => generator(random))
}

function generateObject(
  random: () => number,
  depth = 0,
  maxDepth = 3
): unknown {
  if (depth >= maxDepth) return null

  const type = Math.floor(random() * 6)
  switch (type) {
    case 0:
      return null
    case 1:
      return generateNumber(random)
    case 2:
      return generateString(random, 50)
    case 3:
      return depth < maxDepth - 1
        ? generateArray(
            random,
            (r) => generateObject(r, depth + 1, maxDepth),
            5
          )
        : []
    case 4: {
      const obj: Record<string, unknown> = {}
      const keyCount = Math.floor(random() * 5) + 1
      for (let i = 0; i < keyCount; i++) {
        const key = generateString(random, 10) || `key${i}`
        obj[key] = generateObject(random, depth + 1, maxDepth)
      }
      return obj
    }
    default:
      return undefined
  }
}

// I18n-specific generators

function generateLocaleCode(random: () => number): string {
  const formats = [
    () => 'en',
    () => 'de',
    () => 'fr',
    () => 'en-US',
    () => 'en-GB',
    () => 'zh-Hans',
    () => generateString(random, 10),
    () => '',
    () => '   ',
    () => '__proto__',
    () => 'constructor',
  ]
  return formats[Math.floor(random() * formats.length)]()
}

function generateTranslationKey(random: () => number): string {
  const patterns = [
    () => 'simple',
    () => 'nested.key',
    () => 'deeply.nested.key.path',
    () => '',
    () => '...',
    () => '.leading',
    () => 'trailing.',
    () => '__proto__',
    () => 'constructor.prototype',
    () => generateString(random, 100),
    () => '0',
    () => 'length',
    () => 'toString',
  ]
  return patterns[Math.floor(random() * patterns.length)]()
}

function generateInterpolationParams(
  random: () => number
): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  const keyCount = Math.floor(random() * 5) + 1
  for (let i = 0; i < keyCount; i++) {
    const key = ['name', 'count', 'value', generateString(random, 5)][
      Math.floor(random() * 4)
    ]
    obj[key] = generateParamValue(random)
  }
  return obj
}

function generateParamValue(random: () => number): unknown {
  const type = Math.floor(random() * 8)
  switch (type) {
    case 0:
      return generateString(random, 30)
    case 1:
      return generateNumber(random)
    case 2:
      return null
    case 3:
      return undefined
    case 4:
      return true
    case 5:
      return false
    case 6:
      return {}
    case 7:
      return []
    default:
      return generateString(random, 20)
  }
}

function generateTranslationObject(
  random: () => number,
  depth = 0,
  maxDepth = 3
): Record<string, unknown> {
  if (depth >= maxDepth) {
    return { value: generateString(random, 20) }
  }

  const obj: Record<string, unknown> = {}
  const keyCount = Math.floor(random() * 3) + 1

  for (let i = 0; i < keyCount; i++) {
    const key = [
      'hello',
      'goodbye',
      'common',
      'nested',
      generateString(random, 5),
    ][Math.floor(random() * 5)]
    const shouldNest = random() > 0.7 && depth < maxDepth - 1
    obj[key] = shouldNest
      ? generateTranslationObject(random, depth + 1, maxDepth)
      : generateString(random, 20)
  }

  return obj
}

// Prototype pollution test values
function generateMaliciousKey(random: () => number): string {
  const keys = [
    '__proto__',
    'constructor',
    'prototype',
    '__proto__.polluted',
    'constructor.prototype',
    'constructor.prototype.polluted',
  ]
  return keys[Math.floor(random() * keys.length)]
}

function generateMaliciousTranslations(random: () => number): unknown {
  const attacks = [
    { __proto__: { polluted: true } },
    { constructor: { prototype: { polluted: true } } },
    JSON.parse('{"__proto__": {"polluted": true}}'),
    Object.create(null, { dangerous: { value: true } }),
  ]
  return attacks[Math.floor(random() * attacks.length)]
}

// ============================================
// FUZZ TESTS
// ============================================

describe('Fuzz: createI18n', () => {
  it('rejects invalid options without corrupting process', () => {
    fuzzLoop((random, i) => {
      const badOptions = generateObject(random) as I18nOptions

      try {
        createI18n(badOptions)
        // If we get here, options were actually valid by accident
      } catch (e) {
        // Verify it's a proper error
        if (!(e instanceof TypeError) && !(e instanceof Error)) {
          throw new Error(`Wrong error type: ${e?.constructor?.name}`)
        }
        // Verify error message exists and is descriptive
        if (e instanceof Error && (!e.message || e.message.length === 0)) {
          throw new Error('Empty error message')
        }
      }
    })
  })

  it('handles edge case locale codes correctly', () => {
    fuzzLoop((random, i) => {
      const locale = generateLocaleCode(random)

      try {
        const i18n = createI18n({ defaultLocale: locale || 'en' })
        if (locale && locale.trim()) {
          if (i18n.getLocale() !== (locale || 'en')) {
            throw new Error(
              `Locale mismatch: expected ${locale}, got ${i18n.getLocale()}`
            )
          }
        }
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw new Error(`Unexpected error type: ${e?.constructor?.name}`)
        }
      }
    })
  })

  it('never mutates input options object', () => {
    fuzzLoop((random, i) => {
      const options: I18nOptions = {
        defaultLocale: 'en',
        translations: generateTranslationObject(random, 0, 3),
      }
      const optionsCopy = JSON.parse(JSON.stringify(options))

      try {
        createI18n(options)

        // Verify options unchanged
        if (JSON.stringify(options) !== JSON.stringify(optionsCopy)) {
          throw new Error('Options object was mutated')
        }
      } catch (e) {
        // Acceptable if TypeError, but options still shouldn't be mutated
        if (JSON.stringify(options) !== JSON.stringify(optionsCopy)) {
          throw new Error('Options object was mutated even on error')
        }
      }
    })
  })

  it('handles deeply nested translation objects', () => {
    fuzzLoop((random, i) => {
      const translations = generateTranslationObject(random, 0, 10)

      try {
        const i18n = createI18n({
          defaultLocale: 'en',
          translations: { en: translations },
        })

        // Verify we can call t() without crashing
        expect(typeof i18n.t('anything')).toBe('string')
      } catch (e) {
        // Stack overflow or other structural issues should be caught
        if (e instanceof RangeError) {
          // This is expected for very deep structures
        } else if (!(e instanceof TypeError)) {
          throw new Error(
            `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })
})

describe('Fuzz: i18n.t()', () => {
  it('always returns string for any key/params combination', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: {
          simple: 'Simple',
          nested: { key: 'Value' },
          interpolated: 'Hello {{name}}',
          plural: { one: '{{count}} item', other: '{{count}} items' },
        },
      },
    })

    fuzzLoop((random, i) => {
      const key = generateTranslationKey(random)
      const params =
        random() > 0.5 ? generateInterpolationParams(random) : undefined

      try {
        const result = i18n.t(key, params as InterpolationParams)

        if (typeof result !== 'string') {
          throw new Error(
            `Expected string, got ${typeof result}: ${JSON.stringify(result)}`
          )
        }

        // Verify no infinite loop (test should complete quickly)
      } catch (e) {
        // Only TypeError is acceptable for invalid inputs
        if (!(e instanceof TypeError)) {
          throw new Error(
            `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })

  it('never mutates params object', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: { en: { msg: 'Hello {{name}}' } },
    })

    fuzzLoop((random, i) => {
      const params = generateInterpolationParams(random)
      const paramsCopy = JSON.parse(JSON.stringify(params))

      try {
        i18n.t('msg', params as InterpolationParams)

        // Verify params unchanged
        if (JSON.stringify(params) !== JSON.stringify(paramsCopy)) {
          throw new Error('Params object was mutated')
        }
      } catch (e) {
        // Acceptable if TypeError
        if (!(e instanceof TypeError)) {
          throw new Error(
            `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })

  it('handles special keys without prototype pollution', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: { en: { safe: 'value' } },
    })

    fuzzLoop((random, i) => {
      const maliciousKey = generateMaliciousKey(random)

      try {
        const result = i18n.t(maliciousKey)

        // Should return string (likely the key itself or default)
        expect(typeof result).toBe('string')

        // Verify Object.prototype not polluted
        if ((Object.prototype as any).polluted) {
          throw new Error('Prototype pollution detected!')
        }
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw new Error(
            `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })

  it('completes within reasonable time', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: {
          test: 'Value {{a}} {{b}} {{c}}',
        },
      },
    })

    fuzzLoop((random, i) => {
      const key = generateTranslationKey(random)
      const params = generateInterpolationParams(random)

      const startTime = Date.now()

      try {
        i18n.t(key, params as InterpolationParams)

        const elapsed = Date.now() - startTime
        if (elapsed > 100) {
          throw new Error(
            `Translation took too long: ${elapsed}ms (should be < 100ms)`
          )
        }
      } catch (e) {
        // Only TypeError acceptable
        if (!(e instanceof TypeError)) {
          const elapsed = Date.now() - startTime
          if (elapsed > 100) {
            throw new Error(
              `Translation error took too long: ${elapsed}ms (should be < 100ms)`
            )
          }
        }
      }
    })
  })

  it('handles extreme param values correctly', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: {
          msg: 'Value: {{value}}, Count: {{count}}',
        },
      },
    })

    fuzzLoop((random, i) => {
      const extremeValues = [
        0,
        -0,
        NaN,
        Infinity,
        -Infinity,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        null,
        undefined,
        '',
        ' '.repeat(1000),
      ]

      const value = extremeValues[Math.floor(random() * extremeValues.length)]
      const result = i18n.t('msg', { value, count: value })

      expect(typeof result).toBe('string')
    })
  })
})

describe('Fuzz: setLocale/setLocaleAsync', () => {
  it('handles rapid locale switching without corruption', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'English' },
          de: { msg: 'Deutsch' },
          fr: { msg: 'Français' },
        },
      })

      const locales = ['en', 'de', 'fr']

      // Rapid switching
      for (let j = 0; j < 50; j++) {
        const locale = locales[Math.floor(random() * locales.length)]
        i18n.setLocale(locale)

        // Verify locale set correctly
        if (i18n.getLocale() !== locale) {
          throw new Error(
            `Locale mismatch: expected ${locale}, got ${i18n.getLocale()}`
          )
        }
      }
    })
  })

  it('handles invalid locale codes safely', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { msg: 'Test' } },
      })

      const invalidLocale = generateLocaleCode(random)

      try {
        i18n.setLocale(invalidLocale)
        // If successful, verify getLocale returns something
        expect(typeof i18n.getLocale()).toBe('string')
      } catch (e) {
        // Error is acceptable for truly invalid locales
        expect(e instanceof Error).toBe(true)
      }
    })
  })

  it('onChange callbacks fire with correct arguments', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'English' },
          de: { msg: 'Deutsch' },
        },
      })

      let callbackFired = false
      let receivedNew = ''
      let receivedOld = ''

      i18n.onChange((newLocale, oldLocale) => {
        callbackFired = true
        receivedNew = newLocale
        receivedOld = oldLocale
      })

      i18n.setLocale('de')

      if (!callbackFired) {
        throw new Error('onChange callback not fired')
      }
      if (receivedNew !== 'de') {
        throw new Error(`Expected new locale 'de', got '${receivedNew}'`)
      }
      if (receivedOld !== 'en') {
        throw new Error(`Expected old locale 'en', got '${receivedOld}'`)
      }
    })
  })

  it('concurrent setLocaleAsync calls maintain consistency', async () => {
    await fuzzLoopAsync(async (random, i) => {
      let loadCount = 0

      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath: async (locale) => {
          loadCount++
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { msg: `Loaded ${locale}` }
        },
      })

      const locale = `locale${i % 3}`

      // Concurrent async locale switches
      await Promise.all([
        i18n.setLocaleAsync(locale),
        i18n.setLocaleAsync(locale),
        i18n.setLocaleAsync(locale),
      ])

      // Verify final locale is correct
      if (i18n.getLocale() !== locale) {
        throw new Error(
          `Expected locale '${locale}', got '${i18n.getLocale()}'`
        )
      }

      // Verify loadPath called exactly once (deduplication)
      if (loadCount !== 1) {
        throw new Error(`Expected 1 load call, got ${loadCount}`)
      }
    })
  })
})

describe('Fuzz: addTranslations deep merge', () => {
  it('correctly merges deeply nested structures', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const trans1 = generateTranslationObject(random, 0, 3)
      const trans2 = generateTranslationObject(random, 0, 3)

      try {
        i18n.addTranslations('en', trans1)
        i18n.addTranslations('en', trans2)

        // Verify we can still call t() without crashing
        const result = i18n.t('anything')
        expect(typeof result).toBe('string')
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw new Error(
            `Unexpected error during merge: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })

  it('prevents prototype pollution', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      try {
        i18n.addTranslations('en', generateMaliciousTranslations(random) as any)

        // Verify Object.prototype not polluted
        if ((Object.prototype as any).polluted) {
          throw new Error('Prototype pollution detected!')
        }
      } catch (e) {
        // TypeError is acceptable
        if (!(e instanceof TypeError)) {
          throw new Error(
            `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })

  it('never mutates input translations object', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const translations = generateTranslationObject(random, 0, 3)
      const translationsCopy = JSON.parse(JSON.stringify(translations))

      try {
        i18n.addTranslations('en', translations)

        // Verify translations unchanged
        if (JSON.stringify(translations) !== JSON.stringify(translationsCopy)) {
          throw new Error('Translations object was mutated')
        }
      } catch (e) {
        // Even on error, input should not be mutated
        if (JSON.stringify(translations) !== JSON.stringify(translationsCopy)) {
          throw new Error('Translations object was mutated even on error')
        }
      }
    })
  })

  it('handles conflicting merge structures', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      // Add string value
      i18n.addTranslations('en', { key: 'string value' })

      // Try to merge object over string
      try {
        i18n.addTranslations('en', { key: { nested: 'object value' } })

        // Verify we can still call t() without crashing
        const result = i18n.t('key')
        expect(typeof result).toBe('string')
      } catch (e) {
        // Some implementations might throw on type conflicts
        if (!(e instanceof TypeError) && !(e instanceof Error)) {
          throw new Error(
            `Unexpected error: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    })
  })
})

describe('Fuzz: loadLocale', () => {
  it('handles loadPath errors gracefully', async () => {
    await fuzzLoopAsync(async (random, i) => {
      const shouldThrow = random() > 0.5

      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath: async (locale) => {
          if (shouldThrow) {
            throw new Error('Load failed')
          }
          return { msg: 'Loaded' }
        },
      })

      try {
        await i18n.loadLocale('test')
        // If successful, verify loaded
        expect(i18n.isLocaleLoaded('test')).toBe(true)
      } catch (e) {
        // Error is acceptable
        expect(e instanceof Error).toBe(true)
        // Verify locale not marked as loaded
        expect(i18n.isLocaleLoaded('test')).toBe(false)
      }
    })
  })

  it('concurrent loads for same locale are deduplicated', async () => {
    await fuzzLoopAsync(async (random, i) => {
      let callCount = 0

      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath: async (locale) => {
          callCount++
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { msg: `Loaded ${locale}` }
        },
      })

      const locale = `locale${i % 5}`

      // Load same locale concurrently
      await Promise.all([
        i18n.loadLocale(locale),
        i18n.loadLocale(locale),
        i18n.loadLocale(locale),
      ])

      // Verify loadPath called exactly once (deduplication)
      if (callCount !== 1) {
        throw new Error(`Expected loadPath to be called once, got ${callCount}`)
      }

      // Verify locale is loaded
      expect(i18n.isLocaleLoaded(locale)).toBe(true)
    })
  })

  it('forceReload bypasses cache correctly', async () => {
    await fuzzLoopAsync(async (random, i) => {
      let callCount = 0

      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath: async (locale) => {
          callCount++
          return { msg: `Load ${callCount}` }
        },
      })

      // First load
      await i18n.loadLocale('test')
      expect(callCount).toBe(1)

      // Load again without force (should use cache)
      await i18n.loadLocale('test')
      expect(callCount).toBe(1)

      // Load with forceReload
      await i18n.loadLocale('test', { forceReload: true })
      expect(callCount).toBe(2)
    })
  })

  it('handles very large translation objects', async () => {
    await fuzzLoopAsync(async (random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath: async (locale) => {
          // Generate large object (reduced for memory efficiency)
          const large: Record<string, string> = {}
          for (let j = 0; j < 100; j++) {
            large[`key${j}`] = `value${j}`.repeat(10)
          }
          return large
        },
      })

      const startTime = Date.now()
      await i18n.loadLocale('test')
      const elapsed = Date.now() - startTime

      // Should complete in reasonable time (< 1s)
      if (elapsed > 1000) {
        throw new Error(
          `Load took too long: ${elapsed}ms (should be < 1000ms)`
        )
      }

      expect(i18n.isLocaleLoaded('test')).toBe(true)
    })
  })
})

describe('Fuzz: onChange/onMissing callbacks', () => {
  it('rejects non-function callbacks', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const badCallback = generateObject(random)

      try {
        i18n.onChange(badCallback as any)
        throw new Error('Should have thrown TypeError for non-function')
      } catch (e) {
        expect(e instanceof TypeError).toBe(true)
      }
    })
  })

  it('handles callbacks that throw errors', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'Test' },
          de: { msg: 'Test' },
        },
      })

      // Only throw error occasionally to avoid excessive console output
      const shouldThrow = random() < 0.1
      i18n.onChange(() => {
        if (shouldThrow) {
          throw new Error('Callback error')
        }
      })

      // Should not crash when callback throws
      try {
        i18n.setLocale('de')
        // Locale should still be changed despite callback error
        expect(i18n.getLocale()).toBe('de')
      } catch (e) {
        // Should not propagate callback errors
        throw new Error('Callback error should not propagate')
      }
    })
  })

  it('unsubscribe prevents future calls', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'Test' },
          de: { msg: 'Test' },
          fr: { msg: 'Test' },
        },
      })

      let callCount = 0
      const unsubscribe = i18n.onChange(() => {
        callCount++
      })

      i18n.setLocale('de')
      expect(callCount).toBe(1)

      unsubscribe()

      i18n.setLocale('fr')
      // Should not have incremented
      expect(callCount).toBe(1)
    })
  })

  it('unsubscribe is idempotent', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'Test' },
          de: { msg: 'Test' },
        },
      })

      const unsubscribe = i18n.onChange(() => {})

      // Call unsubscribe multiple times
      unsubscribe()
      unsubscribe()
      unsubscribe()

      // Should not throw
      i18n.setLocale('de')
    })
  })

  it('multiple callbacks fire in registration order', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'Test' },
          de: { msg: 'Test' },
        },
      })

      const order: number[] = []

      i18n.onChange(() => order.push(1))
      i18n.onChange(() => order.push(2))
      i18n.onChange(() => order.push(3))

      i18n.setLocale('de')

      expect(order).toEqual([1, 2, 3])
    })
  })

  it('onMissing callback fires for missing keys', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { exists: 'value' } },
      })

      let missingKey = ''
      i18n.onMissing((key) => {
        missingKey = key
      })

      i18n.t('does.not.exist')

      expect(missingKey).toBe('does.not.exist')
    })
  })
})

describe('Fuzz: format functions', () => {
  it('formatNumber handles extreme values', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const value = generateNumber(random)

      try {
        const result = i18n.formatNumber(value)
        expect(typeof result).toBe('string')
      } catch (e) {
        // TypeError acceptable for invalid inputs
        expect(e instanceof TypeError).toBe(true)
      }
    })
  })

  it('formatDate handles various date inputs', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const dateInputs = [
        new Date(),
        new Date('2023-01-01'),
        new Date('invalid'),
        Date.now(),
        0,
        -1,
        generateNumber(random),
      ]

      const value = dateInputs[Math.floor(random() * dateInputs.length)]

      try {
        const result = i18n.formatDate(value)
        expect(typeof result).toBe('string')
      } catch (e) {
        // TypeError or RangeError acceptable for invalid dates
        expect(
          e instanceof TypeError ||
            e instanceof RangeError ||
            e instanceof Error
        ).toBe(true)
      }
    })
  })

  it('formatRelativeTime handles extreme values', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const value = generateNumber(random)
      const units = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']
      const unit = units[Math.floor(random() * units.length)] as any

      try {
        const result = i18n.formatRelativeTime(value, unit)
        expect(typeof result).toBe('string')
      } catch (e) {
        // RangeError or TypeError acceptable for invalid inputs
        expect(
          e instanceof TypeError ||
            e instanceof RangeError ||
            e instanceof Error
        ).toBe(true)
      }
    })
  })
})

describe('Fuzz: Property-Based Tests', () => {
  it('namespace scoping roundtrip equivalence', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: {
            a: {
              b: {
                c: 'value',
              },
            },
          },
        },
      })

      const segments = ['a', 'b', 'c']
      const fullKey = segments.join('.')
      const prefix = segments.slice(0, 2).join('.')
      const suffix = segments[2]

      const direct = i18n.t(fullKey)
      const namespaced = i18n.t.namespace(prefix)(suffix)

      // Should be equivalent
      expect(direct).toBe(namespaced)
    })
  })

  it('translation immutability', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { key: 'original' },
        },
      })

      const translations = i18n.getTranslations()

      // Mutate the copy
      if (translations.en && typeof translations.en === 'object') {
        ;(translations.en as any).key = 'mutated'
      }

      // Original should be unchanged
      expect(i18n.t('key')).toBe('original')
    })
  })

  it('interpolation determinism', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: {
          en: { msg: 'Hello {{name}}!' },
        },
      })

      const params = { name: generateString(random, 50) }

      const result1 = i18n.t('msg', params)
      const result2 = i18n.t('msg', params)
      const result3 = i18n.t('msg', params)

      // Should be deterministic
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })
  })

  it('deep merge commutativity for non-overlapping keys', () => {
    fuzzLoop((random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const trans1 = { a: 'value1', b: 'value2' }
      const trans2 = { c: 'value3', d: 'value4' }

      i18n.addTranslations('en', trans1)
      i18n.addTranslations('en', trans2)

      // All keys should be accessible
      expect(i18n.t('a')).toBe('value1')
      expect(i18n.t('b')).toBe('value2')
      expect(i18n.t('c')).toBe('value3')
      expect(i18n.t('d')).toBe('value4')
    })
  })

  it('pluralization correctness via Intl.PluralRules', () => {
    fuzzLoop((random, i) => {
      const locale = 'en'
      const i18n = createI18n({
        defaultLocale: locale,
        translations: {
          en: {
            items: {
              zero: 'no items',
              one: '{{count}} item',
              other: '{{count}} items',
            },
          },
        },
      })

      const counts = [0, 1, 2, 5, 21, 100, 1000]
      const count = counts[Math.floor(random() * counts.length)]

      const result = i18n.t('items', { count })

      // Verify form selection matches Intl.PluralRules
      const rules = new Intl.PluralRules(locale)
      const expectedForm = rules.select(count)

      if (count === 0) {
        expect(result).toBe('no items')
      } else if (expectedForm === 'one') {
        expect(result).toBe(`${count} item`)
      } else {
        expect(result).toBe(`${count} items`)
      }

      // Verify non-zero counts include the count string
      if (count !== 0) {
        expect(result.includes(String(count))).toBe(true)
      }
    })
  })
})

describe('Fuzz: Concurrency', () => {
  it('handles concurrent t() calls without corruption', async () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: { msg: 'Value {{n}}' },
      },
    })

    await fuzzLoopAsync(async (random, i) => {
      const promises = Array.from({ length: 100 }, (_, idx) =>
        Promise.resolve(i18n.t('msg', { n: idx }))
      )

      const results = await Promise.all(promises)

      // Verify all results are strings
      for (const result of results) {
        if (typeof result !== 'string') {
          throw new Error(`Expected string, got ${typeof result}`)
        }
      }

      // Verify results are correct
      for (let idx = 0; idx < results.length; idx++) {
        const expected = `Value ${idx}`
        if (results[idx] !== expected) {
          throw new Error(
            `Expected '${expected}', got '${results[idx]}' at index ${idx}`
          )
        }
      }
    })
  })

  it('handles concurrent addTranslations without corruption', async () => {
    await fuzzLoopAsync(async (random, i) => {
      const i18n = createI18n({ defaultLocale: 'en' })

      const promises = Array.from({ length: 10 }, (_, idx) =>
        Promise.resolve(i18n.addTranslations('en', { [`key${idx}`]: `value${idx}` }))
      )

      await Promise.all(promises)

      // Verify all translations were added
      for (let idx = 0; idx < 10; idx++) {
        const result = i18n.t(`key${idx}`)
        expect(result).toBe(`value${idx}`)
      }
    })
  })

  it('handles concurrent loadLocale calls correctly', async () => {
    await fuzzLoopAsync(async (random, i) => {
      let callCount = 0

      const i18n = createI18n({
        defaultLocale: 'en',
        loadPath: async (locale) => {
          callCount++
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { msg: `Loaded ${locale}` }
        },
      })

      callCount = 0
      const locale = `locale${i % 5}`

      // Load same locale concurrently
      await Promise.all([
        i18n.loadLocale(locale),
        i18n.loadLocale(locale),
        i18n.loadLocale(locale),
      ])

      // Verify loadPath called exactly once (deduplication)
      if (callCount !== 1) {
        throw new Error(`Expected loadPath to be called once, got ${callCount}`)
      }
    })
  })

  it('handles mixed sync and async operations', async () => {
    await fuzzLoopAsync(async (random, i) => {
      const i18n = createI18n({
        defaultLocale: 'en',
        translations: { en: { msg: 'Test' } },
        loadPath: async (locale) => {
          await new Promise((resolve) => setTimeout(resolve, 5))
          return { loaded: 'value' }
        },
      })

      // Mix of operations
      const operations = [
        () => i18n.t('msg'),
        () => i18n.addTranslations('en', { new: 'value' }),
        () => i18n.getLocale(),
        () => i18n.loadLocale('test'),
      ]

      const promises = Array.from({ length: 20 }, () => {
        const op = operations[Math.floor(random() * operations.length)]
        return Promise.resolve(op())
      })

      await Promise.all(promises)

      // Verify state is still consistent
      expect(typeof i18n.getLocale()).toBe('string')
      expect(typeof i18n.t('msg')).toBe('string')
    })
  })
})
