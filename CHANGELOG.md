# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial implementation of i18n library
- Core translation functionality with nested key lookup using dot notation
- String interpolation with `{{placeholder}}` syntax
- Pluralization support using Intl.PluralRules API
- Locale fallback chain support
- Lazy loading of translation files via async `loadPath` function
- Event system with `onChange` and `onMissing` callbacks
- Configurable missing translation behavior (key, empty, throw)
- Namespace scoping for translations
- Formatting utilities: `formatNumber`, `formatDate`, `formatRelativeTime`
- TypeScript support with strict type checking
- Comprehensive test suite with 200 test cases
- Custom I18nError class for library-specific errors

### Technical Details

- Built with TypeScript and Vite
- Uses Object.create(null) for translation storage to prevent prototype pollution
- Safe handling of reserved JavaScript properties (__proto__, constructor, prototype)
- Strict ESLint and Prettier configuration
- Full test coverage using Vitest
