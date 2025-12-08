/**
 * Kapso configuration constants
 */

import type { SetupLinkThemeConfig, ConnectionType } from "./types";

export const KAPSO_CONFIG = {
  // Convex backend URL for webhook callbacks
  baseUrl: process.env.CONVEX_URL,

  // Default connection types
  defaultConnectionTypes: ["coexistence", "dedicated"] as ConnectionType[],

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
  defaultCountries: ["US"],
};
