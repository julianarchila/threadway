# Web App Agent Guidelines

## Commands
- `pnpm run dev` - Start Next.js development server (localhost:3000)
- `pnpm run build` - Build production bundle
- `pnpm run start` - Start production server
- `pnpm run lint` - Lint with Next.js ESLint config
- From root: `pnpm dev:web` - Start web app only
- From root: `pnpm check-types` - Type check web app

## File Structure

### App Router Structure (Next.js 15)
```
src/app/
├── layout.tsx          # Root layout with metadata, fonts, providers
├── page.tsx            # Landing page (/)
├── dashboard/
│   ├── layout.tsx      # Protected layout with auth checks
│   └── page.tsx        # Dashboard page (/dashboard)
├── login/
│   └── page.tsx        # Login page (/login)
└── api/
    └── auth/
        └── [...all]/
            └── route.ts # Better Auth API routes
```

### Component Organization
```
components/
├── ui/                 # Radix UI + shadcn/ui primitives
│   ├── button.tsx      # CVA variants, asChild prop
│   ├── input.tsx       # Form inputs
│   └── ...
├── auth/               # Authentication components
│   ├── phone-auth-form.tsx
│   └── user-menu.tsx
├── landing/            # Landing page components
└── shared/             # Reusable business components
```

### Other Directories
```
lib/                    # Utilities and configurations
├── utils.ts            # cn() utility for className merging
└── auth-client.ts      # Better Auth client setup

providers/              # React context providers
├── providers.tsx       # Root provider composition
├── theme-provider.tsx  # Dark/light theme
└── ConvexClientProvider.tsx

hooks/                  # Custom React hooks
assets/                 # Static images and media
```

## Core Patterns

### Next.js 15 App Router
- **File-based routing**: Use `page.tsx` for routes, `layout.tsx` for layouts
- **Server Components**: Default, use `"use client"` only when needed
- **Metadata API**: Define metadata in `layout.tsx` and `page.tsx`
- **Route Protection**: Check auth in layout components, redirect if needed

### Authentication Flow
- **Better Auth**: Phone number + OTP authentication
- **Server-side checks**: Use `getToken()` and `fetchQuery()` in layouts
- **Client-side**: Use `authClient` from `@/lib/auth-client`
- **Protected routes**: Wrap in layouts that check session

### Component Patterns
- **Default exports**: For page components and main UI components
- **Named exports**: For utilities and multiple related components
- **CVA patterns**: Use `class-variance-authority` for component variants
- **Radix UI**: Prefer Radix primitives with custom styling
- **asChild prop**: Use for composition (renders as child element)

### Form Handling
- **Tanstack React Form**: Primary form library
- **Zod validation**: Client-side validation with backend schemas
- **Field-level validation**: Real-time validation on blur/change
- **Toast notifications**: Use `sonner` for success/error feedback

### Styling & Theming
- **Tailwind CSS v4**: Latest with modern config
- **CSS Variables**: Brand colors defined in CSS custom properties
- **Dark Mode**: System preference with manual toggle
- **Design Tokens**: Use semantic color tokens (primary, secondary, etc.)
- **Brand Gradient**: Use `.bg-brand-gradient` utility class

### State Management
- **useState**: Simple component state
- **Tanstack React Form**: Form state and validation
- **Convex**: Server state via queries/mutations
- **Context**: Theme and authentication state

### Error Handling
- **Error Boundaries**: Use React error boundaries for UI errors
- **Toast Notifications**: User-facing error messages
- **Form Validation**: Field-level and submit-level validation
- **Loading States**: Handle async operations with loading indicators

## Best Practices

### Imports
```ts
// External libraries first
import { useState } from "react"
import { Button } from "@radix-ui/react-button"

// Internal with @/ alias
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/auth/user-menu"

// Relative imports last
import "./styles.css"
```

### Component Structure
```tsx
"use client" // Only when needed

// Types first
interface Props {
  // ...
}

// Component with proper typing
export default function MyComponent({ }: Props) {
  // Hooks at top
  const [state, setState] = useState()
  
  // Early returns
  if (!data) return <LoadingSpinner />
  
  // JSX
  return (
    <div className={cn("base-styles", className)}>
      {/* content */}
    </div>
  )
}
```

### Styling
- Use `cn()` utility for conditional classes
- Prefer semantic color tokens over hardcoded colors
- Use Tailwind utilities, avoid custom CSS when possible
- Follow brand color scheme (emerald/teal gradient)
