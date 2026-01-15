// ============================================
// LIBRARY VERIFICATION
// ============================================

if (typeof window.Library === 'undefined' || typeof window.Library.createI18n !== 'function') {
  throw new Error('window.Library.createI18n is not defined. Ensure the built library is loaded before demo.js')
}

const { createI18n } = window.Library

// ============================================
// DEMO DATA
// ============================================

const demoTranslations = {
  en: {
    common: {
      buttons: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit' },
      labels: { name: 'Name', email: 'Email', password: 'Password' }
    },
    messages: {
      greeting: 'Hello, {{name}}! You have {{count}} new messages from {{sender}}.',
      items: { zero: 'No items', one: '{{count}} item', other: '{{count}} items' },
      notification: 'You have {{count}} new {{type}}'
    },
    errors: {
      required: '{{field}} is required',
      invalid: 'Invalid {{field}}'
    }
  },
  ru: {
    common: {
      buttons: { save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Редактировать' },
      labels: { name: 'Имя', email: 'Электронная почта', password: 'Пароль' }
    },
    messages: {
      greeting: 'Привет, {{name}}! У вас {{count}} новых сообщений от {{sender}}.',
      items: {
        zero: 'Нет предметов',
        one: '{{count}} предмет',
        few: '{{count}} предмета',
        many: '{{count}} предметов',
        other: '{{count}} предмета'
      }
    }
  },
  ar: {
    messages: {
      items: {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{{count}} عناصر',
        many: '{{count}} عنصرًا',
        other: '{{count}} عنصر'
      }
    }
  },
  de: {
    messages: {
      items: { one: '{{count}} Artikel', other: '{{count}} Artikel' }
    }
  },
  pl: {
    messages: {
      items: {
        one: '{{count}} element',
        few: '{{count}} elementy',
        many: '{{count}} elementów',
        other: '{{count}} elementu'
      }
    }
  }
}

// Create i18n instances for demo
const i18nEn = createI18n({ defaultLocale: 'en', translations: demoTranslations })
const i18nRu = createI18n({ defaultLocale: 'ru', translations: demoTranslations })

// ============================================
// EXHIBIT 1: PLURAL RULE VISUALIZER
// ============================================

const pluralForms = {
  en: { one: '{{count}} item', other: '{{count}} items' },
  ru: { one: '{{count}} предмет', few: '{{count}} предмета', many: '{{count}} предметов', other: '{{count}} предмета' },
  ar: { zero: 'لا عناصر', one: 'عنصر واحد', two: 'عنصران', few: '{{count}} عناصر', many: '{{count}} عنصرًا', other: '{{count}} عنصر' },
  de: { one: '{{count}} Artikel', other: '{{count}} Artikel' },
  pl: { one: '{{count}} element', few: '{{count}} elementy', many: '{{count}} elementów', other: '{{count}} elementu' }
}

const localePairs = {
  'en-ru': ['en', 'ru'],
  'en-ar': ['en', 'ar'],
  'de-pl': ['de', 'pl']
}

let currentLocalePair = ['en', 'ru']

function updatePluralDisplay(count) {
  const [locale1, locale2] = currentLocalePair

  // Update count display
  document.getElementById('plural-count').textContent = count

  // Get plural forms
  const rules1 = new Intl.PluralRules(locale1)
  const rules2 = new Intl.PluralRules(locale2)
  const form1 = count === 0 && pluralForms[locale1].zero ? 'zero' : rules1.select(count)
  const form2 = count === 0 && pluralForms[locale2].zero ? 'zero' : rules2.select(count)

  // Render forms for locale 1
  const formsContainer1 = document.getElementById('plural-forms-en')
  formsContainer1.innerHTML = ''
  for (const [form, template] of Object.entries(pluralForms[locale1])) {
    const row = document.createElement('div')
    row.className = `plural-form-row ${form === form1 ? 'active' : ''}`
    row.innerHTML = `
      <span class="plural-form-name">${form}</span>
      <span class="plural-form-value">${template}</span>
    `
    formsContainer1.appendChild(row)
  }

  // Render forms for locale 2
  const formsContainer2 = document.getElementById('plural-forms-ru')
  formsContainer2.innerHTML = ''
  for (const [form, template] of Object.entries(pluralForms[locale2])) {
    const row = document.createElement('div')
    row.className = `plural-form-row ${form === form2 ? 'active' : ''}`
    row.innerHTML = `
      <span class="plural-form-name">${form}</span>
      <span class="plural-form-value">${template}</span>
    `
    formsContainer2.appendChild(row)
  }

  // Update API calls
  document.getElementById('plural-api-en').textContent = `Intl.PluralRules('${locale1}').select(${count}) → "${form1}"`
  document.getElementById('plural-api-ru').textContent = `Intl.PluralRules('${locale2}').select(${count}) → "${form2}"`

  // Update results
  const template1 = pluralForms[locale1][form1] || pluralForms[locale1].other
  const template2 = pluralForms[locale2][form2] || pluralForms[locale2].other
  document.getElementById('plural-result-en').textContent = `"${template1.replace('{{count}}', count)}"`
  document.getElementById('plural-result-ru').textContent = `"${template2.replace('{{count}}', count)}"`

  // Update state
  document.getElementById('plural-state').textContent = `new Intl.PluralRules('${locale1}').select(${count}) // "${form1}"`

  // Update locale headers
  const localeNames = { en: 'English', ru: 'Russian', ar: 'Arabic', de: 'German', pl: 'Polish' }
  document.querySelector('#plural-locale-1 .plural-locale-name').textContent = `${localeNames[locale1]} (${locale1})`
  document.querySelector('#plural-locale-2 .plural-locale-name').textContent = `${localeNames[locale2]} (${locale2})`

  const formCounts = { en: 2, ru: 4, ar: 6, de: 2, pl: 4 }
  document.querySelector('#plural-locale-1 .tag').textContent = `${formCounts[locale1]} forms`
  document.querySelector('#plural-locale-2 .tag').textContent = `${formCounts[locale2]} forms`
}

// Plural slider
document.getElementById('plural-slider').addEventListener('input', (e) => {
  updatePluralDisplay(parseInt(e.target.value, 10))
})

// Locale pair buttons
document.querySelectorAll('[data-locale-pair]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-locale-pair]').forEach(b => b.removeAttribute('data-active'))
    btn.setAttribute('data-active', 'true')
    currentLocalePair = localePairs[btn.dataset.localePair]
    updatePluralDisplay(parseInt(document.getElementById('plural-slider').value, 10))
  })
})

// ============================================
// EXHIBIT 2: INTERPOLATION MACHINE
// ============================================

const interpTemplate = 'Hello, {{name}}! You have {{count}} new messages from {{sender}}.'
const interpParams = { name: 'Alice', count: '3', sender: 'Bob' }

function renderInterpolation() {
  // Render template with highlighted placeholders
  const templateEl = document.getElementById('interp-template')
  let templateHtml = interpTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return `<span class="interp-placeholder" data-param="${key}">${match}</span>`
  })
  templateEl.innerHTML = templateHtml

  // Render parameter inputs
  const paramsEl = document.getElementById('interp-params')
  paramsEl.innerHTML = ''
  const placeholders = interpTemplate.match(/\{\{(\w+)\}\}/g) || []
  const paramNames = [...new Set(placeholders.map(p => p.replace(/[{}]/g, '').trim()))]

  paramNames.forEach(param => {
    const div = document.createElement('div')
    div.className = 'interp-param'
    div.innerHTML = `
      <span class="interp-param-name">${param}:</span>
      <input type="text" class="input input-mono interp-param-input" data-param="${param}" value="${interpParams[param] || ''}">
    `
    paramsEl.appendChild(div)
  })

  // Update output
  updateInterpOutput()

  // Add input listeners
  document.querySelectorAll('.interp-param-input').forEach(input => {
    input.addEventListener('input', (e) => {
      interpParams[e.target.dataset.param] = e.target.value
      updateInterpOutput()
    })
  })
}

function updateInterpOutput() {
  let output = interpTemplate
  const outputEl = document.getElementById('interp-output')

  for (const [key, value] of Object.entries(interpParams)) {
    if (value) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      output = output.replace(regex, `<span class="substituted">${value}</span>`)
    }
  }

  outputEl.innerHTML = output

  // Update state
  const paramsStr = Object.entries(interpParams)
    .filter(([k,v]) => v)
    .map(([k,v]) => `${k}: '${v}'`)
    .join(', ')
  document.getElementById('interp-state').textContent = `i18n.t('greeting', { ${paramsStr} })`
}

async function animateSubstitution() {
  const placeholders = document.querySelectorAll('.interp-placeholder')

  for (const placeholder of placeholders) {
    const param = placeholder.dataset.param
    const value = interpParams[param]

    if (!value) continue

    // Highlight placeholder
    placeholder.classList.add('highlight')
    await sleep(300)

    // Highlight input
    const input = document.querySelector(`.interp-param-input[data-param="${param}"]`)
    if (input) {
      input.style.background = 'var(--accent-blue)'
      input.style.color = 'white'
    }
    await sleep(300)

    // Reset highlights
    placeholder.classList.remove('highlight')
    if (input) {
      input.style.background = ''
      input.style.color = ''
    }
    await sleep(200)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

document.getElementById('interp-animate').addEventListener('click', animateSubstitution)
document.getElementById('interp-reset').addEventListener('click', () => {
  interpParams.name = 'Alice'
  interpParams.count = '3'
  interpParams.sender = 'Bob'
  renderInterpolation()
})

// ============================================
// EXHIBIT 3: FORMAT DISSECTOR
// ============================================

const formatLocales = ['en-US', 'de-DE', 'fr-FR', 'hi-IN']
let currentFormatPart = 'thousand'

function getFormatParts(value, locale, options) {
  const formatter = new Intl.NumberFormat(locale, options)
  return formatter.formatToParts(value)
}

function renderFormatAnatomy() {
  const value = parseFloat(document.getElementById('format-value').value) || 1234567.89
  const formatType = document.getElementById('format-type').value

  let options = {}
  switch (formatType) {
    case 'currency':
      options = { style: 'currency', currency: 'USD' }
      break
    case 'percent':
      options = { style: 'percent' }
      break
    case 'compact':
      options = { notation: 'compact' }
      break
    default:
      options = { style: 'decimal' }
  }

  const anatomyEl = document.getElementById('format-anatomy')
  anatomyEl.innerHTML = ''

  // Render for two locales
  const showLocales = ['en-US', 'de-DE']
  showLocales.forEach(locale => {
    const parts = getFormatParts(value, locale, options)

    const localeDiv = document.createElement('div')
    localeDiv.className = 'format-locale-display'

    const localeNames = { 'en-US': 'English (US)', 'de-DE': 'German', 'fr-FR': 'French', 'hi-IN': 'Hindi' }
    localeDiv.innerHTML = `<div class="format-locale-name">${localeNames[locale]}</div>`

    const dissectedDiv = document.createElement('div')
    dissectedDiv.className = 'format-dissected'

    parts.forEach(part => {
      const partEl = document.createElement('span')
      partEl.className = 'format-part'
      partEl.dataset.type = part.type
      partEl.textContent = part.value

      const labelEl = document.createElement('span')
      labelEl.className = 'format-part-label'
      labelEl.textContent = part.type
      partEl.appendChild(labelEl)

      // Highlight based on current selection
      if (
        (currentFormatPart === 'thousand' && part.type === 'group') ||
        (currentFormatPart === 'decimal' && part.type === 'decimal') ||
        (currentFormatPart === 'symbol' && part.type === 'currency') ||
        (currentFormatPart === 'digits' && part.type === 'integer')
      ) {
        partEl.classList.add('highlight')
      }

      dissectedDiv.appendChild(partEl)
    })

    localeDiv.appendChild(dissectedDiv)
    anatomyEl.appendChild(localeDiv)
  })

  // Update comparison grid
  updateFormatComparison(value, options)

  // Update state
  const optStr = JSON.stringify(options).replace(/"/g, "'")
  document.getElementById('format-state').textContent = `i18n.formatNumber(${value}, ${optStr})`
}

function updateFormatComparison(value, options) {
  const grid = document.getElementById('format-comparison-grid')
  grid.innerHTML = ''

  const partLabels = {
    thousand: 'Thousand Separator',
    decimal: 'Decimal Separator',
    symbol: 'Currency Symbol',
    digits: 'Formatted Number'
  }

  document.getElementById('format-comparison-title').textContent = `${partLabels[currentFormatPart]} Comparison`

  formatLocales.forEach(locale => {
    const parts = getFormatParts(value, locale, options)
    let displayValue = ''
    let description = ''

    switch (currentFormatPart) {
      case 'thousand':
        const groupPart = parts.find(p => p.type === 'group')
        displayValue = groupPart ? `"${groupPart.value}"` : '(none)'
        description = groupPart?.value === ',' ? 'comma' : groupPart?.value === '.' ? 'period' : groupPart?.value === ' ' ? 'space' : ''
        break
      case 'decimal':
        const decPart = parts.find(p => p.type === 'decimal')
        displayValue = decPart ? `"${decPart.value}"` : '(none)'
        description = decPart?.value === '.' ? 'period' : decPart?.value === ',' ? 'comma' : ''
        break
      case 'symbol':
        const symPart = parts.find(p => p.type === 'currency')
        if (symPart) {
          const symIndex = parts.indexOf(symPart)
          const position = symIndex < parts.length / 2 ? 'before' : 'after'
          displayValue = symPart.value
          description = position
        } else {
          displayValue = '(none)'
        }
        break
      case 'digits':
        displayValue = new Intl.NumberFormat(locale, options).format(value)
        description = 'full format'
        break
    }

    const item = document.createElement('div')
    item.className = 'format-comparison-item'
    item.innerHTML = `
      <div class="format-comparison-locale">${locale}</div>
      <div class="format-comparison-value">${displayValue}</div>
      ${description ? `<div class="format-comparison-desc">${description}</div>` : ''}
    `
    grid.appendChild(item)
  })
}

document.getElementById('format-value').addEventListener('input', renderFormatAnatomy)
document.getElementById('format-type').addEventListener('change', renderFormatAnatomy)

document.querySelectorAll('.format-part-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.format-part-btn').forEach(b => b.removeAttribute('data-active'))
    btn.setAttribute('data-active', 'true')
    currentFormatPart = btn.dataset.part
    renderFormatAnatomy()
  })
})

// ============================================
// EXHIBIT 4: TRANSLATION TREE WALKER
// ============================================

const treeData = {
  common: {
    buttons: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit' },
    labels: { name: 'Name', email: 'Email', password: 'Password' }
  },
  messages: {
    greeting: 'Hello, {{name}}!',
    items: { one: '{{count}} item', other: '{{count}} items' }
  },
  errors: {
    required: '{{field}} is required',
    invalid: 'Invalid {{field}}'
  }
}

function renderTree(node, path = [], visited = [], current = null, found = false, notFound = false) {
  const container = document.createElement('div')
  container.className = 'tree-node'

  for (const [key, value] of Object.entries(node)) {
    const nodeDiv = document.createElement('div')
    nodeDiv.className = 'tree-node'

    const currentPath = [...path, key]
    const pathStr = currentPath.join('.')
    const isVisited = visited.includes(pathStr)
    const isCurrent = current === pathStr
    const isFound = found && isCurrent
    const isNotFound = notFound && isCurrent

    const content = document.createElement('div')
    content.className = 'tree-node-content'
    if (isVisited && !isCurrent) content.classList.add('visited')
    if (isCurrent && !isFound && !isNotFound) content.classList.add('current')
    if (isFound) content.classList.add('found')
    if (isNotFound) content.classList.add('not-found')

    content.dataset.path = pathStr

    if (typeof value === 'string') {
      content.innerHTML = `<strong>${key}</strong>: "${value}"`
    } else {
      content.innerHTML = `<strong>${key}</strong>`
    }

    content.addEventListener('click', () => {
      document.getElementById('tree-key').value = pathStr
      lookupKey(pathStr)
    })

    nodeDiv.appendChild(content)

    if (typeof value === 'object' && value !== null) {
      const children = document.createElement('div')
      children.className = 'tree-children'
      children.appendChild(renderTree(value, currentPath, visited, current, found, notFound))
      nodeDiv.appendChild(children)
    }

    container.appendChild(nodeDiv)
  }

  return container
}

function lookupKey(key) {
  const parts = key.split('.')
  const visited = []
  let current = treeData
  let found = true
  let lastValid = null

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const pathSoFar = parts.slice(0, i + 1).join('.')

    if (current && typeof current === 'object' && part in current) {
      visited.push(pathSoFar)
      lastValid = pathSoFar
      current = current[part]
    } else {
      found = false
      break
    }
  }

  // Render tree
  const viz = document.getElementById('tree-viz')
  viz.innerHTML = ''
  const finalPath = found ? parts.join('.') : lastValid
  viz.appendChild(renderTree(treeData, [], visited, finalPath, found && typeof current === 'string', !found))

  // Render path
  const pathEl = document.getElementById('tree-path')
  pathEl.innerHTML = '<span class="tree-path-segment">translations["en"]</span>'
  parts.forEach((part, i) => {
    const isActive = i < visited.length
    pathEl.innerHTML += `<span class="tree-path-arrow">→</span><span class="tree-path-segment ${isActive ? 'active' : ''}">${part}</span>`
  })

  // Render result
  const resultEl = document.getElementById('tree-result-value')
  if (found && typeof current === 'string') {
    resultEl.textContent = `"${current}"`
    resultEl.className = 'tree-result-value success'
  } else if (found && typeof current === 'object') {
    resultEl.textContent = '[object]'
    resultEl.className = 'tree-result-value success'
  } else {
    resultEl.textContent = `NOT FOUND (failed at "${parts[visited.length]}")`
    resultEl.className = 'tree-result-value error'
  }

  // Update state
  const pathStr = visited.length > 0
    ? `translations["en"] -> ${visited.join(' -> ')} -> ${found ? `"${current}"` : 'NOT FOUND'}`
    : `translations["en"] -> NOT FOUND`
  document.getElementById('tree-state').textContent = pathStr
}

document.getElementById('tree-lookup').addEventListener('click', () => {
  lookupKey(document.getElementById('tree-key').value)
})

document.getElementById('tree-key').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') lookupKey(e.target.value)
})

document.querySelectorAll('.tree-suggestion').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('tree-key').value = btn.dataset.key
    lookupKey(btn.dataset.key)
  })
})

// ============================================
// TEST RUNNER
// ============================================

const testRunner = {
  tests: [],
  results: [],
  running: false,

  register(name, fn) {
    this.tests.push({ name, fn })
  },

  async run() {
    if (this.running) return
    this.running = true
    this.results = []

    const output = document.getElementById('test-output')
    const progressFill = document.getElementById('progress-fill')
    const progressText = document.getElementById('progress-text')
    const summary = document.getElementById('test-summary')
    const passedCount = document.getElementById('passed-count')
    const failedCount = document.getElementById('failed-count')
    const skippedCount = document.getElementById('skipped-count')
    const runBtn = document.getElementById('run-tests')

    runBtn.disabled = true
    output.innerHTML = ''
    summary.classList.add('hidden')
    progressFill.style.width = '0%'
    progressFill.className = 'test-progress-fill'

    let passed = 0
    let failed = 0

    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i]
      const progress = ((i + 1) / this.tests.length) * 100

      progressFill.style.width = `${progress}%`
      progressText.textContent = `Running: ${test.name}`

      try {
        await test.fn()
        passed++
        this.results.push({ name: test.name, passed: true })
        output.innerHTML += `
          <div class="test-item">
            <span class="test-icon pass">&#10003;</span>
            <span class="test-name">${escapeHtml(test.name)}</span>
          </div>
        `
      } catch (e) {
        failed++
        this.results.push({ name: test.name, passed: false, error: e.message })
        output.innerHTML += `
          <div class="test-item">
            <span class="test-icon fail">&#10007;</span>
            <div>
              <div class="test-name">${escapeHtml(test.name)}</div>
              <div class="test-error">${escapeHtml(e.message)}</div>
            </div>
          </div>
        `
      }

      output.scrollTop = output.scrollHeight
      await new Promise(r => setTimeout(r, 20))
    }

    progressFill.classList.add(failed === 0 ? 'success' : 'failure')
    progressText.textContent = `Complete: ${passed}/${this.tests.length} passed`

    passedCount.textContent = passed
    failedCount.textContent = failed
    skippedCount.textContent = 0
    summary.classList.remove('hidden')

    runBtn.disabled = false
    this.running = false
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
      }
    },
    toBeDefined() {
      if (actual === undefined) throw new Error('Expected value to be defined')
    },
    toBeUndefined() {
      if (actual !== undefined) throw new Error(`Expected undefined but got ${JSON.stringify(actual)}`)
    },
    toContain(item) {
      if (!actual.includes(item)) throw new Error(`Expected array to contain ${JSON.stringify(item)}`)
    },
    toThrow(msg) {
      let threw = false
      let error = null
      try { actual() } catch (e) { threw = true; error = e }
      if (!threw) throw new Error('Expected function to throw')
      if (msg && !error.message.includes(msg)) throw new Error(`Expected error message to include "${msg}" but got "${error.message}"`)
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`)
    }
  }
}

// Register tests
testRunner.register('creates instance with defaultLocale only', () => {
  const i18n = createI18n({ defaultLocale: 'en' })
  expect(i18n).toBeDefined()
  expect(i18n.getLocale()).toBe('en')
})

testRunner.register('creates instance with translations', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' } }
  })
  expect(i18n.t('hello')).toBe('Hello')
})

testRunner.register('throws if options is missing', () => {
  expect(() => createI18n()).toThrow('options is required')
})

testRunner.register('throws if defaultLocale is missing', () => {
  expect(() => createI18n({})).toThrow('defaultLocale is required')
})

testRunner.register('returns translation for simple key', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' } }
  })
  expect(i18n.t('hello')).toBe('Hello')
})

testRunner.register('returns translation for nested key', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { common: { save: 'Save' } } }
  })
  expect(i18n.t('common.save')).toBe('Save')
})

testRunner.register('returns key if translation missing', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {} }
  })
  expect(i18n.t('missing')).toBe('missing')
})

testRunner.register('uses fallback locale when translation missing', () => {
  const i18n = createI18n({
    defaultLocale: 'de',
    fallbackLocale: 'en',
    translations: {
      en: { hello: 'Hello' },
      de: {}
    }
  })
  expect(i18n.t('hello')).toBe('Hello')
})

testRunner.register('interpolates single placeholder', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { greeting: 'Hello, {{name}}!' } }
  })
  expect(i18n.t('greeting', { name: 'World' })).toBe('Hello, World!')
})

testRunner.register('interpolates multiple placeholders', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { msg: '{{a}} and {{b}}' } }
  })
  expect(i18n.t('msg', { a: 'X', b: 'Y' })).toBe('X and Y')
})

testRunner.register('leaves placeholder if param missing', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { greeting: 'Hello, {{name}}!' } }
  })
  expect(i18n.t('greeting', {})).toBe('Hello, {{name}}!')
})

testRunner.register('converts number params to string', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { msg: 'Count: {{n}}' } }
  })
  expect(i18n.t('msg', { n: 42 })).toBe('Count: 42')
})

testRunner.register('pluralization: uses one form for count=1', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { items: { one: '{{count}} item', other: '{{count}} items' } } }
  })
  expect(i18n.t('items', { count: 1 })).toBe('1 item')
})

testRunner.register('pluralization: uses other form for count>1', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { items: { one: '{{count}} item', other: '{{count}} items' } } }
  })
  expect(i18n.t('items', { count: 5 })).toBe('5 items')
})

testRunner.register('pluralization: uses zero form when defined', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { items: { zero: 'No items', one: '{{count}} item', other: '{{count}} items' } } }
  })
  expect(i18n.t('items', { count: 0 })).toBe('No items')
})

testRunner.register('setLocale changes current locale', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {}, de: {} }
  })
  i18n.setLocale('de')
  expect(i18n.getLocale()).toBe('de')
})

testRunner.register('setLocale returns instance for chaining', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' }, de: { hello: 'Hallo' } }
  })
  expect(i18n.setLocale('de').t('hello')).toBe('Hallo')
})

testRunner.register('getAvailableLocales returns all locale codes', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {}, de: {}, fr: {} }
  })
  const locales = i18n.getAvailableLocales()
  expect(locales).toContain('en')
  expect(locales).toContain('de')
  expect(locales).toContain('fr')
})

testRunner.register('addTranslations adds new locale', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {} }
  })
  i18n.addTranslations('es', { hello: 'Hola' })
  expect(i18n.getAvailableLocales()).toContain('es')
})

testRunner.register('addTranslations merges with existing', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' } }
  })
  i18n.addTranslations('en', { goodbye: 'Bye' })
  expect(i18n.t('hello')).toBe('Hello')
  expect(i18n.t('goodbye')).toBe('Bye')
})

testRunner.register('hasKey returns true for existing key', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' } }
  })
  expect(i18n.hasKey('hello')).toBe(true)
})

testRunner.register('hasKey returns false for missing key', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {} }
  })
  expect(i18n.hasKey('missing')).toBe(false)
})

testRunner.register('getTranslations returns copy of translations', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' } }
  })
  const trans = i18n.getTranslations()
  trans.hello = 'Modified'
  expect(i18n.t('hello')).toBe('Hello')
})

testRunner.register('onChange fires on locale change', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {}, de: {} }
  })
  let called = false
  i18n.onChange(() => { called = true })
  i18n.setLocale('de')
  expect(called).toBe(true)
})

testRunner.register('onChange unsubscribe works', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {}, de: {} }
  })
  let called = false
  const unsub = i18n.onChange(() => { called = true })
  unsub()
  i18n.setLocale('de')
  expect(called).toBe(false)
})

testRunner.register('onMissing fires for missing key', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {} }
  })
  let missingKey = null
  i18n.onMissing((key) => { missingKey = key })
  i18n.t('nonexistent')
  expect(missingKey).toBe('nonexistent')
})

testRunner.register('setMissingBehavior: key returns key', () => {
  const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
  i18n.setMissingBehavior('key')
  expect(i18n.t('missing')).toBe('missing')
})

testRunner.register('setMissingBehavior: empty returns empty string', () => {
  const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
  i18n.setMissingBehavior('empty')
  expect(i18n.t('missing')).toBe('')
})

testRunner.register('setMissingBehavior: throw throws error', () => {
  const i18n = createI18n({ defaultLocale: 'en', translations: { en: {} } })
  i18n.setMissingBehavior('throw')
  expect(() => i18n.t('missing')).toThrow('Missing translation')
})

testRunner.register('namespace creates scoped function', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { common: { save: 'Save' } } }
  })
  const tCommon = i18n.namespace('common')
  expect(tCommon('save')).toBe('Save')
})

testRunner.register('nested namespaces work', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { a: { b: { c: 'Deep' } } } }
  })
  const tAB = i18n.namespace('a').namespace('b')
  expect(tAB('c')).toBe('Deep')
})

testRunner.register('formatNumber formats according to locale', () => {
  const i18n = createI18n({ defaultLocale: 'en-US' })
  const result = i18n.formatNumber(1234567.89)
  expect(result).toBe('1,234,567.89')
})

testRunner.register('formatNumber with currency option', () => {
  const i18n = createI18n({ defaultLocale: 'en-US' })
  const result = i18n.formatNumber(99.99, { style: 'currency', currency: 'USD' })
  expect(result).toBe('$99.99')
})

testRunner.register('formatDate formats date object', () => {
  const i18n = createI18n({ defaultLocale: 'en-US' })
  const result = i18n.formatDate(new Date('2024-03-15'))
  expect(result).toBeTruthy()
})

testRunner.register('formatRelativeTime formats past time', () => {
  const i18n = createI18n({ defaultLocale: 'en' })
  const result = i18n.formatRelativeTime(-1, 'day')
  expect(result).toContain('ago')
})

testRunner.register('formatRelativeTime formats future time', () => {
  const i18n = createI18n({ defaultLocale: 'en' })
  const result = i18n.formatRelativeTime(2, 'day')
  expect(result).toContain('in')
})

testRunner.register('handles deeply nested keys (10 levels)', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { a: { b: { c: { d: { e: { f: { g: { h: { i: { j: 'Deep' } } } } } } } } } } }
  })
  expect(i18n.t('a.b.c.d.e.f.g.h.i.j')).toBe('Deep')
})

testRunner.register('blocks __proto__ key for security', () => {
  const malicious = JSON.parse('{"__proto__": {"polluted": "yes"}}')
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: malicious }
  })
  expect(({}).polluted).toBeUndefined()
  expect(i18n.t('__proto__')).toBe('__proto__')
})

testRunner.register('blocks constructor key for security', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { constructor: { prototype: { polluted: 'yes' } } } }
  })
  expect(({}).polluted).toBeUndefined()
})

testRunner.register('isLocaleLoaded returns true for loaded locale', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: {} }
  })
  expect(i18n.isLocaleLoaded('en')).toBe(true)
})

testRunner.register('isLocaleLoaded returns false for unloaded locale', () => {
  const i18n = createI18n({ defaultLocale: 'en' })
  expect(i18n.isLocaleLoaded('xx')).toBe(false)
})

testRunner.register('key lookup is case-sensitive', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { Hello: 'UPPER', hello: 'lower' } }
  })
  expect(i18n.t('Hello')).toBe('UPPER')
  expect(i18n.t('hello')).toBe('lower')
})

testRunner.register('trims whitespace from key', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    translations: { en: { hello: 'Hello' } }
  })
  expect(i18n.t('  hello  ')).toBe('Hello')
})

testRunner.register('empty key returns empty string', () => {
  const i18n = createI18n({ defaultLocale: 'en' })
  expect(i18n.t('')).toBe('')
})

document.getElementById('run-tests').addEventListener('click', async () => {
  await testRunner.run()
})

// Fuzz test runner
let fuzzRunning = false
document.getElementById('run-fuzz').addEventListener('click', async () => {
  if (fuzzRunning) return
  fuzzRunning = true

  const output = document.getElementById('test-output')
  const progressFill = document.getElementById('progress-fill')
  const progressText = document.getElementById('progress-text')
  const summary = document.getElementById('test-summary')
  const runBtn = document.getElementById('run-fuzz')

  runBtn.disabled = true
  output.innerHTML = ''
  summary.classList.add('hidden')
  progressFill.style.width = '0%'
  progressFill.className = 'test-progress-fill'

  const duration = 10000 // 10 seconds
  const startTime = Date.now()
  let iterations = 0
  let errors = 0

  function randomString(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-{{}} '
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  function randomKey() {
    const segments = Math.floor(Math.random() * 5) + 1
    return Array.from({ length: segments }, () => randomString(Math.floor(Math.random() * 10) + 1)).join('.')
  }

  function randomParams() {
    const count = Math.floor(Math.random() * 5)
    const params = {}
    for (let i = 0; i < count; i++) {
      const types = ['string', 'number', 'boolean', 'null']
      const type = types[Math.floor(Math.random() * types.length)]
      let value
      switch (type) {
        case 'number': value = Math.random() * 1000 - 500; break
        case 'boolean': value = Math.random() > 0.5; break
        case 'null': value = null; break
        default: value = randomString(Math.floor(Math.random() * 20))
      }
      params[randomString(5)] = value
    }
    return params
  }

  const i18n = createI18n({
    defaultLocale: 'en',
    fallbackLocale: 'en',
    translations: { en: { test: 'value', nested: { key: '{{param}}' } } }
  })

  while (Date.now() - startTime < duration) {
    iterations++
    const progress = ((Date.now() - startTime) / duration) * 100
    progressFill.style.width = `${progress}%`
    progressText.textContent = `Fuzz testing: ${iterations} iterations, ${errors} errors`

    try {
      // Random translation lookup
      i18n.t(randomKey(), randomParams())

      // Random hasKey check
      i18n.hasKey(randomKey())

      // Random formatNumber
      if (Math.random() > 0.5) {
        i18n.formatNumber(Math.random() * 1000000 - 500000)
      }
    } catch (e) {
      if (!(e instanceof I18nError) && !(e instanceof TypeError) && !(e instanceof RangeError)) {
        errors++
        output.innerHTML += `
          <div class="test-item">
            <span class="test-icon fail">&#10007;</span>
            <div>
              <div class="test-name">Iteration ${iterations}</div>
              <div class="test-error">${escapeHtml(e.message)}</div>
            </div>
          </div>
        `
        output.scrollTop = output.scrollHeight
      }
    }

    // Yield to UI
    if (iterations % 1000 === 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }

  progressFill.classList.add(errors === 0 ? 'success' : 'failure')
  progressText.textContent = `Fuzz complete: ${iterations} iterations, ${errors} unexpected errors`

  if (errors === 0) {
    output.innerHTML = `
      <div class="test-item">
        <span class="test-icon pass">&#10003;</span>
        <span class="test-name">Fuzz test passed: ${iterations} random operations with no unexpected errors</span>
      </div>
    `
  }

  document.getElementById('passed-count').textContent = errors === 0 ? '1' : '0'
  document.getElementById('failed-count').textContent = errors > 0 ? '1' : '0'
  document.getElementById('skipped-count').textContent = '0'
  summary.classList.remove('hidden')

  runBtn.disabled = false
  fuzzRunning = false
})

// ============================================
// RESET PAGE
// ============================================

document.getElementById('reset-page').addEventListener('click', () => {
  location.reload()
})

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Populate input fields with example values
  document.getElementById('plural-slider').value = 21
  document.getElementById('format-value').value = 1234567.89
  document.getElementById('format-type').value = 'currency'
  document.getElementById('tree-key').value = 'common.buttons.save'

  // Render exhibits with empty outputs (functions are defined but not called automatically)
  // Users must interact with the exhibits to see results
})
