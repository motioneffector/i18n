# Translation Keys & Namespaces

Translation keys are the foundation of looking up text. They're dot-notation paths that navigate through your nested translation objects, letting you organize translations hierarchically and access them with simple string keys.

## How It Works

Think of your translations as a file system. The key `common.buttons.save` is like a path: start at `common`, go into `buttons`, find `save`. The translation object mirrors this structure:

```typescript
{
  common: {
    buttons: {
      save: 'Save',
      cancel: 'Cancel'
    },
    labels: {
      name: 'Name',
      email: 'Email'
    }
  }
}
```

Namespaces take this further. Instead of writing `t('common.buttons.save')` everywhere, create a scoped function that adds the prefix automatically:

```typescript
const tButtons = i18n.t.namespace('common.buttons')
tButtons('save')   // Same as t('common.buttons.save')
tButtons('cancel') // Same as t('common.buttons.cancel')
```

## Basic Usage

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      simple: 'A simple key',
      nested: {
        deep: {
          value: 'A deeply nested value'
        }
      }
    }
  }
})

i18n.t('simple')              // "A simple key"
i18n.t('nested.deep.value')   // "A deeply nested value"
```

## Key Points

- **Keys are case-sensitive** - `Hello` and `hello` are different keys
- **Missing keys return the key itself** - `t('missing.key')` returns `"missing.key"` by default
- **Keys pointing to objects return the key** - If `common` contains nested keys, `t('common')` returns `"common"`
- **Namespaces are dynamic** - They use the current locale, so switching locales updates all namespaced translations

## Examples

### Organizing by Feature

Group translations by feature or page for maintainability:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      auth: {
        login: {
          title: 'Sign In',
          submit: 'Log In',
          forgot: 'Forgot password?'
        },
        register: {
          title: 'Create Account',
          submit: 'Sign Up'
        }
      },
      dashboard: {
        welcome: 'Welcome back, {{name}}',
        stats: {
          users: 'Active users',
          revenue: 'Revenue'
        }
      }
    }
  }
})

// In your login component
const tLogin = i18n.t.namespace('auth.login')
tLogin('title')   // "Sign In"
tLogin('submit')  // "Log In"
```

### Nesting Namespaces

Namespaces can be nested for deep structures:

```typescript
const tAuth = i18n.t.namespace('auth')
const tLogin = tAuth.namespace('login')

tLogin('title')  // Same as t('auth.login.title')
```

Or use a single call with a dotted prefix:

```typescript
const tLogin = i18n.t.namespace('auth.login')
tLogin('title')  // "Sign In"
```

## Related

- **[Using Interpolation](Guide-Using-Interpolation)** - Add dynamic values to your translations
- **[Organizing with Namespaces](Guide-Namespaces)** - Best practices for large applications
- **[Core API](API-Core)** - Full documentation for `t()` and `namespace()`
