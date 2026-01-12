# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-11

### Added
- Initial public release
- Core translation system with key-based lookups
- Interpolation support with `{{placeholder}}` syntax
- Automatic pluralization using `Intl.PluralRules`
- Nested key support with dot notation
- Fallback locale chain for missing translations
- Lazy loading with `loadPath` configuration
- Change event callbacks (`onChange`)
- Missing translation callbacks (`onMissing`)
- Configurable missing behavior (key, empty, throw)
- Namespace scoping for translation functions
- Built-in formatting helpers:
  - `formatNumber()` using `Intl.NumberFormat`
  - `formatDate()` using `Intl.DateTimeFormat`
  - `formatRelativeTime()` using `Intl.RelativeTimeFormat`
- Full TypeScript support with complete type definitions
- Zero dependencies
- Comprehensive test suite (200+ tests)
- Interactive demo page

[0.1.0]: https://github.com/motioneffector/i18n/releases/tag/v0.1.0
