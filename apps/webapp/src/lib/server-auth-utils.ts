import { createAuth } from '@whatsapp-mcp-client/backend/lib/auth'
import { reactStartHelpers } from '@convex-dev/better-auth/react-start'

export const { fetchSession, reactStartHandler, getCookieName } =
// We are casting because createAuth expects GenericCtx but reactStartHelpers expects GenericActionCtx
  reactStartHelpers(createAuth as any, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_URL.replace('.cloud', '.site'),
  })