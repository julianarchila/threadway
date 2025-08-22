import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    TWILIO_AUTH_TOKEN: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    NODE_ENV: z.string(),
    TWILIO_ACCOUNT_SID: z.string().min(1),
    TWILIO_NUMBER: z.string().min(1),
  },
  runtimeEnv: process.env,
});
