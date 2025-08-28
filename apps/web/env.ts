import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url().min(1),
  },
  server: {
    LOOPS_API_KEY: z.string().min(1),
  },
  // you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  }
});
