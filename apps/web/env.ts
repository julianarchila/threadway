import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    TWILIO_AUTH_TOKEN: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    TWILIO_ACCOUNT_SID: z.string().min(1),
    TWILIO_NUMBER: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url().min(1),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.url().min(1),
    // NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  // you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_URL?.replace('.cloud', '.site'),
  }
});
