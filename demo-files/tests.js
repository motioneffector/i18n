// Import library to ensure it is available (also set by demo.js)
import * as Library from '../dist/index.js'
if (!window.Library) window.Library = Library

// ============================================
// DEMO INTEGRITY TESTS
// These tests verify the demo itself is correctly structured.
// They are IDENTICAL across all @motioneffector demos.
// Do not modify, skip, or weaken these tests.
// ============================================

function registerIntegrityTests() {
  // ─────────────────────────────────────────────
  // STRUCTURAL INTEGRITY
  // ─────────────────────────────────────────────

  testRunner.registerTest('[Integrity] Library is loaded', () => {
    if (typeof window.Library === 'undefined') {
      throw new Error('window.Library is undefined - library not loaded')
    }
  })

  testRunner.registerTest('[Integrity] Library has exports', () => {
    const exports = Object.keys(window.Library)
    if (exports.length === 0) {
      throw new Error('window.Library has no exports')
    }
  })

  testRunner.registerTest('[Integrity] Test runner exists', () => {
    const runner = document.getElementById('test-runner')
    if (!runner) {
      throw new Error('No element with id="test-runner"')
    }
  })

  testRunner.registerTest('[Integrity] Test runner is first section after header', () => {
    const main = document.querySelector('main')
    if (!main) {
      throw new Error('No <main> element found')
    }
    const firstSection = main.querySelector('section')
    if (!firstSection || firstSection.id !== 'test-runner') {
      throw new Error('Test runner must be the first <section> inside <main>')
    }
  })

  testRunner.registerTest('[Integrity] Run All Tests button exists with correct format', () => {
    const btn = document.getElementById('run-all-tests')
    if (!btn) {
      throw new Error('No button with id="run-all-tests"')
    }
    const text = btn.textContent.trim()
    if (!text.includes('Run All Tests')) {
      throw new Error(`Button text must include "Run All Tests", got: "${text}"`)
    }
    const icon = btn.querySelector('.btn-icon')
    if (!icon || !icon.textContent.includes('▶')) {
      throw new Error('Button must have play icon (▶) in .btn-icon element')
    }
  })

  testRunner.registerTest('[Integrity] At least one exhibit exists', () => {
    const exhibits = document.querySelectorAll('.exhibit')
    if (exhibits.length === 0) {
      throw new Error('No elements with class="exhibit"')
    }
  })

  testRunner.registerTest('[Integrity] All exhibits have unique IDs', () => {
    const exhibits = document.querySelectorAll('.exhibit')
    const ids = new Set()
    exhibits.forEach(ex => {
      if (!ex.id) {
        throw new Error('Exhibit missing id attribute')
      }
      if (ids.has(ex.id)) {
        throw new Error(`Duplicate exhibit id: ${ex.id}`)
      }
      ids.add(ex.id)
    })
  })

  testRunner.registerTest('[Integrity] All exhibits registered for walkthrough', () => {
    const exhibitElements = document.querySelectorAll('.exhibit')
    const registeredCount = testRunner.exhibits.length
    // Subtract any non-exhibit registrations if needed
    if (registeredCount < exhibitElements.length) {
      throw new Error(
        `Only ${registeredCount} exhibits registered for walkthrough, ` +
        `but ${exhibitElements.length} .exhibit elements exist`
      )
    }
  })

  testRunner.registerTest('[Integrity] CSS loaded from demo-files/', () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]')
    const hasExternal = Array.from(links).some(link =>
      link.href.includes('demo-files/')
    )
    if (!hasExternal) {
      throw new Error('No stylesheet loaded from demo-files/ directory')
    }
  })

  testRunner.registerTest('[Integrity] No inline style tags', () => {
    const styles = document.querySelectorAll('style')
    if (styles.length > 0) {
      throw new Error(`Found ${styles.length} inline <style> tags - extract to demo-files/demo.css`)
    }
  })

  testRunner.registerTest('[Integrity] No inline onclick handlers', () => {
    const withOnclick = document.querySelectorAll('[onclick]')
    if (withOnclick.length > 0) {
      throw new Error(`Found ${withOnclick.length} elements with onclick - use addEventListener`)
    }
  })

  // ─────────────────────────────────────────────
  // NO AUTO-PLAY VERIFICATION
  // ─────────────────────────────────────────────

  testRunner.registerTest('[Integrity] Output areas are empty on load', () => {
    const outputs = document.querySelectorAll('.exhibit-output, .output, [data-output]')
    outputs.forEach(output => {
      // Allow placeholder text but not actual content
      const hasPlaceholder = output.dataset.placeholder ||
        output.classList.contains('placeholder') ||
        output.querySelector('.placeholder')

      const text = output.textContent.trim()
      const children = output.children.length

      // If it has content that isn't a placeholder, that's a violation
      if ((text.length > 50 || children > 1) && !hasPlaceholder) {
        throw new Error(
          `Output area appears pre-populated: "${text.substring(0, 50)}..." - ` +
          `outputs must be empty until user interaction`
        )
      }
    })
  })

  testRunner.registerTest('[Integrity] No setTimeout calls on module load', () => {
    // This test verifies by checking a flag set during load
    // The test-runner.js must set window.__demoLoadComplete = true after load
    // Any setTimeout from module load would not have completed
    if (window.__suspiciousTimersDetected) {
      throw new Error(
        'Detected setTimeout/setInterval during page load - ' +
        'demos must not auto-run'
      )
    }
  })

  // ─────────────────────────────────────────────
  // REAL LIBRARY VERIFICATION
  // ─────────────────────────────────────────────

  testRunner.registerTest('[Integrity] Library functions are callable', () => {
    const lib = window.Library
    const exports = Object.keys(lib)

    // At least one export must be a function
    const hasFunctions = exports.some(key => typeof lib[key] === 'function')
    if (!hasFunctions) {
      throw new Error('Library exports no callable functions')
    }
  })

  testRunner.registerTest('[Integrity] No mock implementations detected', () => {
    // Check for common mock patterns in window
    const suspicious = [
      'mockParse', 'mockValidate', 'fakeParse', 'fakeValidate',
      'stubParse', 'stubValidate', 'testParse', 'testValidate'
    ]
    suspicious.forEach(name => {
      if (typeof window[name] === 'function') {
        throw new Error(`Detected mock function: window.${name} - use real library`)
      }
    })
  })

  // ─────────────────────────────────────────────
  // VISUAL FEEDBACK VERIFICATION
  // ─────────────────────────────────────────────

  testRunner.registerTest('[Integrity] CSS includes animation definitions', () => {
    const sheets = document.styleSheets
    let hasAnimations = false

    try {
      for (const sheet of sheets) {
        // Skip cross-origin stylesheets
        if (!sheet.href || sheet.href.includes('demo-files/')) {
          const rules = sheet.cssRules || sheet.rules
          for (const rule of rules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE ||
                (rule.style && (
                  rule.style.animation ||
                  rule.style.transition ||
                  rule.style.animationName
                ))) {
              hasAnimations = true
              break
            }
          }
        }
        if (hasAnimations) break
      }
    } catch (e) {
      // CORS error - assume external sheet has animations
      hasAnimations = true
    }

    if (!hasAnimations) {
      throw new Error('No CSS animations or transitions found - visual feedback required')
    }
  })

  testRunner.registerTest('[Integrity] Interactive elements have hover states', () => {
    const buttons = document.querySelectorAll('button, .btn')
    if (buttons.length === 0) return // No buttons to check

    // Check that enabled buttons have pointer cursor (disabled buttons should have not-allowed)
    const enabledBtn = Array.from(buttons).find(btn => !btn.disabled)
    if (!enabledBtn) return // All buttons are disabled, skip check

    const styles = window.getComputedStyle(enabledBtn)
    if (styles.cursor !== 'pointer') {
      throw new Error('Buttons should have cursor: pointer')
    }
  })

  // ─────────────────────────────────────────────
  // WALKTHROUGH REGISTRATION VERIFICATION
  // ─────────────────────────────────────────────

  testRunner.registerTest('[Integrity] Walkthrough demonstrations are async functions', () => {
    testRunner.exhibits.forEach(exhibit => {
      if (typeof exhibit.demonstrate !== 'function') {
        throw new Error(`Exhibit "${exhibit.name}" has no demonstrate function`)
      }
      // Check if it's async by seeing if it returns a thenable
      const result = exhibit.demonstrate.toString()
      if (!result.includes('async') && !result.includes('Promise')) {
        console.warn(`Exhibit "${exhibit.name}" demonstrate() may not be async`)
      }
    })
  })

  testRunner.registerTest('[Integrity] Each exhibit has required elements', () => {
    const exhibits = document.querySelectorAll('.exhibit')
    exhibits.forEach(exhibit => {
      // Must have a title
      const title = exhibit.querySelector('.exhibit-title, h2, h3')
      if (!title) {
        throw new Error(`Exhibit ${exhibit.id} missing title element`)
      }

      // Must have an interactive area
      const interactive = exhibit.querySelector(
        '.exhibit-interactive, .exhibit-content, [data-interactive]'
      )
      if (!interactive) {
        throw new Error(`Exhibit ${exhibit.id} missing interactive area`)
      }
    })
  })
}

// ============================================
// LIBRARY-SPECIFIC TESTS
// ============================================

function registerLibraryTests() {
  // Basic functionality tests
  testRunner.registerTest('createI18n exists and is callable', () => {
    if (typeof window.Library.createI18n !== 'function') {
      throw new Error('Library.createI18n is not a function')
    }
  })

  testRunner.registerTest('createI18n creates an i18n instance', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: {
        en: { test: 'Test' }
      }
    })
    if (!i18n || typeof i18n.t !== 'function') {
      throw new Error('createI18n did not return a valid i18n instance')
    }
  })

  testRunner.registerTest('Simple translation works', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: {
        en: { hello: 'Hello' }
      }
    })
    const result = i18n.t('hello')
    if (result !== 'Hello') {
      throw new Error(`Expected "Hello", got "${result}"`)
    }
  })

  testRunner.registerTest('Nested key translation works', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: {
        en: { common: { buttons: { save: 'Save' } } }
      }
    })
    const result = i18n.t('common.buttons.save')
    if (result !== 'Save') {
      throw new Error(`Expected "Save", got "${result}"`)
    }
  })

  testRunner.registerTest('Interpolation with single parameter works', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: {
        en: { greeting: 'Hello, {{name}}!' }
      }
    })
    const result = i18n.t('greeting', { name: 'World' })
    if (result !== 'Hello, World!') {
      throw new Error(`Expected "Hello, World!", got "${result}"`)
    }
  })

  testRunner.registerTest('Interpolation with multiple parameters works', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: {
        en: { message: '{{name}} has {{count}} items' }
      }
    })
    const result = i18n.t('message', { name: 'Alice', count: 5 })
    if (result !== 'Alice has 5 items') {
      throw new Error(`Expected "Alice has 5 items", got "${result}"`)
    }
  })

  testRunner.registerTest('Pluralization works (English: one/other)', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: {
        en: { items: { one: '{{count}} item', other: '{{count}} items' } }
      }
    })
    const result1 = i18n.t('items', { count: 1 })
    const result2 = i18n.t('items', { count: 5 })
    if (result1 !== '1 item') {
      throw new Error(`Expected "1 item", got "${result1}"`)
    }
    if (result2 !== '5 items') {
      throw new Error(`Expected "5 items", got "${result2}"`)
    }
  })

  testRunner.registerTest('Pluralization works (Russian: few/many)', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'ru',
      translations: {
        ru: {
          items: {
            one: '{{count}} предмет',
            few: '{{count}} предмета',
            many: '{{count}} предметов',
            other: '{{count}} предмета'
          }
        }
      }
    })
    const result2 = i18n.t('items', { count: 2 })
    const result5 = i18n.t('items', { count: 5 })
    if (!result2.includes('предмета')) {
      throw new Error(`Expected "few" form, got "${result2}"`)
    }
    if (!result5.includes('предметов')) {
      throw new Error(`Expected "many" form, got "${result5}"`)
    }
  })

  testRunner.registerTest('getLocale returns current locale', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: {} }
    })
    if (i18n.getLocale() !== 'en') {
      throw new Error(`Expected "en", got "${i18n.getLocale()}"`)
    }
  })

  testRunner.registerTest('setLocale changes locale', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: {}, fr: {} }
    })
    i18n.setLocale('fr')
    if (i18n.getLocale() !== 'fr') {
      throw new Error(`Expected locale to change to "fr", got "${i18n.getLocale()}"`)
    }
  })

  testRunner.registerTest('Missing key returns key by default', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: {} }
    })
    const result = i18n.t('missing.key')
    if (result !== 'missing.key') {
      throw new Error(`Expected "missing.key", got "${result}"`)
    }
  })

  testRunner.registerTest('hasKey detects existing key', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: { test: 'Test' } }
    })
    if (!i18n.hasKey('test')) {
      throw new Error('hasKey should return true for existing key')
    }
  })

  testRunner.registerTest('hasKey detects missing key', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: { test: 'Test' } }
    })
    if (i18n.hasKey('missing')) {
      throw new Error('hasKey should return false for missing key')
    }
  })

  testRunner.registerTest('formatNumber formats numbers', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: {} }
    })
    const result = i18n.formatNumber(1234.56)
    if (!result.includes('1') || !result.includes('234')) {
      throw new Error(`Expected formatted number, got "${result}"`)
    }
  })

  testRunner.registerTest('formatDate formats dates', () => {
    const i18n = window.Library.createI18n({
      defaultLocale: 'en',
      translations: { en: {} }
    })
    const result = i18n.formatDate(new Date('2024-01-15'))
    if (!result.includes('2024') && !result.includes('24')) {
      throw new Error(`Expected formatted date with year, got "${result}"`)
    }
  })
}

// ============================================
// EXHIBIT REGISTRATIONS
// ============================================

function registerExhibits() {
  // Exhibit 1: Plural Rule Visualizer
  testRunner.registerExhibit(
    'Plural Rule Visualizer',
    document.getElementById('exhibit-plural'),
    async () => {
      const slider = document.getElementById('plural-slider')
      if (!slider) return

      // Demo the plural rules by showing different counts
      const counts = [1, 2, 5, 21]
      for (const count of counts) {
        slider.value = count
        slider.dispatchEvent(new Event('input'))
        await testRunner.delay(800)
      }
    }
  )

  // Exhibit 2: Interpolation Machine
  testRunner.registerExhibit(
    'Interpolation Machine',
    document.getElementById('exhibit-interp'),
    async () => {
      const animateBtn = document.getElementById('interp-animate')
      if (!animateBtn) return

      // Trigger the animation button
      animateBtn.click()
      await testRunner.delay(2000)
    }
  )

  // Exhibit 3: Format Dissector
  testRunner.registerExhibit(
    'Format Dissector',
    document.getElementById('exhibit-format'),
    async () => {
      const formatType = document.getElementById('format-type')
      if (!formatType) return

      // Cycle through format types
      const types = ['currency', 'percent', 'compact']
      for (const type of types) {
        formatType.value = type
        formatType.dispatchEvent(new Event('change'))
        await testRunner.delay(800)
      }
    }
  )

  // Exhibit 4: Translation Tree Walker
  testRunner.registerExhibit(
    'Translation Tree Walker',
    document.getElementById('exhibit-tree'),
    async () => {
      const keyInput = document.getElementById('tree-key')
      const lookupBtn = document.getElementById('tree-lookup')
      if (!keyInput || !lookupBtn) return

      // Try a few lookups
      const keys = ['common.buttons.save', 'messages.greeting', 'errors.required']
      for (const key of keys) {
        keyInput.value = key
        lookupBtn.click()
        await testRunner.delay(1000)
      }
    }
  )
}

// ============================================
// REGISTER ALL TESTS
// ============================================

// FIRST: Register integrity tests (same for all demos)
registerIntegrityTests()

// THEN: Register library-specific tests
registerLibraryTests()

// FINALLY: Register exhibits for walkthrough
registerExhibits()
