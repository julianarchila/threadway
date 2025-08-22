import { defineConfig } from "drizzle-kit";
import { env } from "@env";

export default defineConfig({
  schema: "./src/server/db/schema",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.POSTGRES_URL || "",
  },
});
