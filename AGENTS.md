# Agent Guidelines

## Build/Lint/Test Commands
- `pnpm dev` - Start development servers (web + backend)
- `pnpm build` - Build all packages 
- `pnpm check-types` - Type check all packages
- `pnpm dev:web` - Start web app only (localhost:3000)
- `pnpm dev:backend` - Start Convex backend only
- `cd apps/web && npm run lint` - Lint web app

## Code Style
- Use TypeScript with strict mode enabled
- Imports: Group by external libs, then internal (@/ paths), then relative
- Use `@/` path aliases for imports within web app
- Components: Default export for React components, named exports for utilities
- Use `"use client"` directive for client components in Next.js app dir
- Error handling: Use `neverthrow` Result types for error handling
- Validation: Use Zod for schema validation
- State: Use Tanstack React Form for form state, useState for simple state

## Naming Conventions  
- Files: kebab-case (phone-auth-form.tsx)
- Components: PascalCase (PhoneAuthForm)
- Functions/variables: camelCase
- Types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE

## Framework Specifics
- Next.js 15 with app router, React 19, TypeScript
- Backend: Convex with Better Auth for authentication
- UI: Tailwind CSS with Radix UI components, use `cn()` utility for className merging
