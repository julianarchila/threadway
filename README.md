# Threadway 

## Development Setup

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 10.14.0 or higher)
- Access to the Convex project
- Twilio account (for WhatsApp integration)
- OpenAI API account

### Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Convex backend**
   ```bash
   cd packages/backend
   pnpm dev:setup
   ```
   This will generate a `.env.local` file in the backend package with your Convex development URL.

3. **Configure web app environment**
   
   Copy the `CONVEX_URL` from `packages/backend/.env.local` and create `apps/web/.env.local`:
   ```bash
   # Copy the URL from packages/backend/.env.local
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
   ```

4. **Start development servers**
   ```bash
   # From project root
   pnpm dev
   ```
   This will start both the web app (localhost:3000) and Convex backend.

### External Services Setup

#### Twilio (WhatsApp Integration)

1. Create a [Twilio account](https://www.twilio.com/)
2. Go to the [WhatsApp Sandbox](https://console.twilio.com/)
3. Get your credentials from the Twilio Console:
   - Account SID
   - Auth Token  
4. Set the webhook URL in Twilio Sandbox to: `https://your-convex-url.convex.cloud/twilio/webhooks`

#### OpenAI

1. Create an [OpenAI account](https://platform.openai.com/)
2. Generate an API key from the [API Keys page](https://platform.openai.com/api-keys)

### Environment Variables

Set the following environment variables in your **Convex Dashboard** (not locally):

**Required:**
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_NUMBER` - Your Twilio WhatsApp sandbox number (format: +1234567890)
- `TWILIO_ENV` - Set to `development` for local development
- `OPENAI_API_KEY` - Your OpenAI API key
- `CONVEX_SITE_URL` - Your Convex deployment URL (for auth)


### Development Commands

```bash
# Start all services
pnpm dev

# Start only web app
pnpm dev:web

# Start only backend
pnpm dev:backend

# Build all packages
pnpm build

# Type check all packages
pnpm check-types

```

### Project Structure

- `apps/web/` - Next.js 15 frontend with React 19
- `packages/backend/` - Convex backend with Better Auth
- Uses Turbo for monorepo management
- TypeScript throughout with strict mode
