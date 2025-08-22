import { nextJsHandler } from "@convex-dev/better-auth/nextjs";
import { env } from "@env";

export const { GET, POST } = nextJsHandler({
    convexSiteUrl: env.NEXT_PUBLIC_CONVEX_SITE_URL
});