import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
  provider: new VercelProvider(),
});
