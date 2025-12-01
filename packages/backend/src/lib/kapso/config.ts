/**
 * Kapso configuration constants
 */

import type { SetupLinkThemeConfig, ConnectionType } from "./types";

// Get base URL for redirects
const getBaseUrl = (): string => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const KAPSO_CONFIG = {
  baseUrl: getBaseUrl(),

  // Default redirect URLs
  defaultRedirects: {
    success: `${getBaseUrl()}/whatsapp/success`,
    failure: `${getBaseUrl()}/whatsapp/failed`,
  },

  // Default connection types
  defaultConnectionTypes: ["coexistence", "dedicated"] as ConnectionType[],

  // Default theme matching your app (emerald/teal brand)
  defaultTheme: {
    primary_color: "#059669", // emerald-600 (brand-from)
    background_color: "#ffffff",
    text_color: "#1f2937",
    muted_text_color: "#64748b",
    card_color: "#ecfdf5", // emerald-50
    border_color: "#a7f3d0", // emerald-200
  } as SetupLinkThemeConfig,

  // Default countries for phone provisioning
  // Note: Only US is supported by default. Other countries require custom Twilio credentials.
  // Contact Kapso sales to enable other countries.
  defaultCountries: ["US"],
};
