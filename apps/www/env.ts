import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {},
  server: {
    LOOPS_API_KEY: z.string().min(1),
  },
  // you only need to destructure client variables:
  experimental__runtimeEnv: {},
});
