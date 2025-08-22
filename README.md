# whatsapp-mcp-client

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, tRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js 15** - Full-stack React framework with App Router
- **TailwindCSS v4** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **tRPC** - End-to-end type-safe APIs
- **Drizzle ORM** - TypeScript-first database ORM
- **PostgreSQL** - Database engine
- **Better Auth** - Email & password authentication
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Start the PostgreSQL database:
```bash
pnpm db:start
```

2. Update your `apps/web/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:
```bash
pnpm db:push
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the application.

## Project Structure

```
whatsapp-mcp-client/
├── docker-compose.yml          # Database setup
├── apps/
│   └── web/                    # Unified Next.js application
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   │   ├── (pages)/    # Frontend pages
│       │   │   ├── api/        # API routes
│       │   │   └── trpc/       # tRPC endpoint
│       │   ├── server/         # Server-side code
│       │   │   ├── routers/    # tRPC routers
│       │   │   ├── db/         # Database schema & config
│       │   │   └── lib/        # Server utilities
│       │   ├── components/     # UI components
│       │   └── utils/          # Client utilities
│       └── drizzle.config.ts   # Database config
└── packages/                   # Future shared packages
```

## Available Scripts

- `pnpm dev`: Start the application in development mode
- `pnpm build`: Build the application
- `pnpm check-types`: Check TypeScript types
- `pnpm db:push`: Push schema changes to database
- `pnpm db:studio`: Open database studio UI
- `pnpm db:start`: Start PostgreSQL database
- `pnpm db:stop`: Stop PostgreSQL database
- `pnpm db:down`: Remove PostgreSQL database
# threadway
