# UI Components Library

This directory contains reusable UI components inspired by React Bits design patterns, built with modern React and Tailwind CSS.

## Components

### Button

A versatile button component with multiple variants and states.

```tsx
import { Button } from '../components/ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="success">Success</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// With loading state
<Button loading>Loading...</Button>

// With icons
<Button leftIcon={<UserIcon />} rightIcon={<ArrowIcon />}>
  With Icons
</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

### Input

A form input component with built-in validation states and icons.

```tsx
import { Input } from '../components/ui';

// Basic usage
<Input label="Username" placeholder="Enter username" />

// With icon
<Input
  label="Email"
  icon={<EnvelopeIcon />}
  placeholder="Enter email"
/>

// With right icon (e.g., password toggle)
<Input
  label="Password"
  icon={<LockIcon />}
  rightIcon={<EyeIcon />}
  onRightIconClick={() => setShowPassword(!showPassword)}
  type={showPassword ? "text" : "password"}
/>

// With error
<Input
  label="Username"
  error="Username is required"
  placeholder="Enter username"
/>
```

### Card

A container component with multiple styling variants.

```tsx
import { Card } from '../components/ui';

// Basic usage
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// With variants
<Card variant="default">Default Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="outlined">Outlined Card</Card>
<Card variant="glass">Glass Card</Card>

// With different padding
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>
<Card padding="xl">Extra large padding</Card>
```

### AuthLayout

A specialized layout component for authentication pages.

```tsx
import AuthLayout from "../components/AuthLayout";

<AuthLayout
  title="Welcome Back"
  subtitle="Sign in to your account"
  icon={<AcademicCapIcon />}
  footer={<p>Terms and conditions</p>}
>
  {/* Your form content */}
  <form>...</form>
</AuthLayout>;
```

## Design System

### Colors

- **Primary**: Blue gradient (`from-blue-600 to-indigo-600`)
- **Secondary**: Gray (`gray-100`, `gray-200`)
- **Success**: Green gradient (`from-green-600 to-emerald-600`)
- **Destructive**: Red gradient (`from-red-600 to-pink-600`)
- **Warning**: Yellow (`yellow-500`)
- **Info**: Blue (`blue-500`)

### Spacing

- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)

### Border Radius

- **sm**: `0.375rem` (6px)
- **md**: `0.5rem` (8px)
- **lg**: `0.75rem` (12px)
- **xl**: `1rem` (16px)
- **2xl**: `1.5rem` (24px)

### Shadows

- **sm**: `shadow-sm`
- **md**: `shadow-md`
- **lg**: `shadow-lg`
- **xl**: `shadow-xl`
- **2xl**: `shadow-2xl`

## Usage Guidelines

1. **Consistency**: Use the same component variants throughout your application
2. **Accessibility**: All components include proper ARIA attributes and keyboard navigation
3. **Responsive**: Components are built with mobile-first responsive design
4. **Performance**: Components use React.memo and optimized re-renders where appropriate
5. **TypeScript**: Full TypeScript support with proper type definitions

## Customization

You can customize the appearance by modifying the Tailwind classes in each component. The components use CSS custom properties and Tailwind's design tokens for consistent theming.

## Examples

See the authentication pages (`Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`) for complete examples of how to use these components together.
