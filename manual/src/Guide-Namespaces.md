# Organizing with Namespaces

This guide shows you how to keep translation keys manageable in large applications. You'll learn to create namespaced translate functions, organize by feature, and share them across components.

## Prerequisites

Before starting, you should:

- [Have a working i18n instance](Your-First-Translation)
- [Understand translation keys](Concept-Translation-Keys)

## Overview

We'll organize translations by:

1. Structuring translations hierarchically
2. Creating namespaced translate functions
3. Sharing namespaced functions across components
4. Nesting namespaces for deep structures

## Step 1: Structure Translations Hierarchically

Organize your translation keys by feature, page, or component:

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      common: {
        buttons: {
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit'
        },
        labels: {
          name: 'Name',
          email: 'Email',
          password: 'Password'
        }
      },
      auth: {
        login: {
          title: 'Sign In',
          submit: 'Log In',
          forgotPassword: 'Forgot password?'
        },
        register: {
          title: 'Create Account',
          submit: 'Sign Up',
          terms: 'I agree to the terms'
        }
      },
      dashboard: {
        welcome: 'Welcome back, {{name}}!',
        stats: {
          users: 'Active Users',
          revenue: 'Revenue',
          orders: 'Orders'
        }
      }
    }
  }
})
```

## Step 2: Create Namespaced Functions

Instead of writing the full path every time, create scoped translate functions:

```typescript
// Without namespace - repetitive
i18n.t('common.buttons.save')
i18n.t('common.buttons.cancel')
i18n.t('common.buttons.delete')

// With namespace - cleaner
const tButtons = i18n.t.namespace('common.buttons')
tButtons('save')    // "Save"
tButtons('cancel')  // "Cancel"
tButtons('delete')  // "Delete"
```

You can also use `i18n.namespace()` directly:

```typescript
const tButtons = i18n.namespace('common.buttons')
tButtons('save')  // "Save"
```

## Step 3: Use in Components

Export namespaced functions for use in specific features:

```typescript
// auth/translations.ts
export const tLogin = i18n.t.namespace('auth.login')
export const tRegister = i18n.t.namespace('auth.register')

// auth/LoginForm.tsx
import { tLogin } from './translations'

function LoginForm() {
  return (
    <form>
      <h1>{tLogin('title')}</h1>
      <button type="submit">{tLogin('submit')}</button>
      <a href="/forgot">{tLogin('forgotPassword')}</a>
    </form>
  )
}
```

## Step 4: Nest Namespaces

For deeply nested structures, chain namespace calls:

```typescript
const tCommon = i18n.t.namespace('common')
const tButtons = tCommon.namespace('buttons')
const tLabels = tCommon.namespace('labels')

tButtons('save')   // Same as t('common.buttons.save')
tLabels('email')   // Same as t('common.labels.email')
```

Or use a dotted path in a single call:

```typescript
const tButtons = i18n.t.namespace('common.buttons')
```

## Complete Example

```typescript
import { createI18n } from '@motioneffector/i18n'

const i18n = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      common: {
        buttons: { save: 'Save', cancel: 'Cancel' },
        errors: { required: '{{field}} is required', invalid: 'Invalid {{field}}' }
      },
      users: {
        list: { title: 'Users', empty: 'No users found' },
        form: {
          createTitle: 'New User',
          editTitle: 'Edit User',
          nameLabel: 'Full Name',
          emailLabel: 'Email Address'
        }
      },
      products: {
        list: { title: 'Products', empty: 'No products found' },
        form: {
          createTitle: 'New Product',
          editTitle: 'Edit Product',
          nameLabel: 'Product Name',
          priceLabel: 'Price'
        }
      }
    }
  }
})

// Shared utilities
const tButtons = i18n.t.namespace('common.buttons')
const tErrors = i18n.t.namespace('common.errors')

// Feature-specific
const tUserList = i18n.t.namespace('users.list')
const tUserForm = i18n.t.namespace('users.form')
const tProductList = i18n.t.namespace('products.list')
const tProductForm = i18n.t.namespace('products.form')

// Usage in components
function UserListPage() {
  console.log(tUserList('title'))  // "Users"
  console.log(tUserList('empty'))  // "No users found"
}

function UserFormPage({ isEdit }) {
  const title = isEdit ? tUserForm('editTitle') : tUserForm('createTitle')
  console.log(title)  // "Edit User" or "New User"
  console.log(tUserForm('nameLabel'))  // "Full Name"
  console.log(tButtons('save'))  // "Save" (shared)
}

function validateField(fieldName: string, value: string) {
  if (!value) {
    return tErrors('required', { field: fieldName })
    // "Full Name is required"
  }
  return null
}
```

## Variations

### Dynamic Namespace Selection

Choose namespace at runtime based on context:

```typescript
function getFormTranslations(entityType: 'users' | 'products') {
  return i18n.t.namespace(`${entityType}.form`)
}

const tForm = getFormTranslations('users')
tForm('createTitle')  // "New User"
```

### Resetting to Root

Pass `null` or empty string to get back to root:

```typescript
const tUsers = i18n.t.namespace('users')
const tRoot = tUsers.namespace(null)

tRoot('common.buttons.save')  // Back to full path
```

### Locale-Reactive Namespaces

Namespaced functions always use the current locale:

```typescript
const tButtons = i18n.t.namespace('common.buttons')

i18n.setLocale('en')
tButtons('save')  // "Save"

i18n.setLocale('es')
tButtons('save')  // "Guardar" (if Spanish translations exist)
```

## Troubleshooting

### Getting the Key Back Instead of Translation

**Symptom:** `tUsers('list.title')` returns `"users.list.title"`.

**Cause:** You're including the namespace prefix in the key.

**Solution:** Only pass the part after the namespace:

```typescript
const tUsers = i18n.t.namespace('users')

// Wrong - duplicates the namespace
tUsers('users.list.title')

// Right - just the relative path
tUsers('list.title')
```

### TypeError: prefix must be a string

**Symptom:** Error when creating a namespace.

**Cause:** You passed a number or invalid type.

**Solution:** Always pass a string (or null/undefined to reset):

```typescript
// Wrong
i18n.t.namespace(123)

// Right
i18n.t.namespace('users')
i18n.t.namespace(null)  // Reset to root
```

## See Also

- **[Translation Keys Concept](Concept-Translation-Keys)** - How key lookup works
- **[Using Interpolation Guide](Guide-Using-Interpolation)** - Use interpolation with namespaces
- **[Core API](API-Core)** - Full `namespace()` documentation
