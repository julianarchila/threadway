/**
 * Single-source-of-truth for Composio integrations and their per-environment authConfigId.
 *
 * Requirements satisfied:
 * - Only "development" and "production" environments
 * - No default value in auth; if an env is missing, the integration is unavailable in that env
 * - listAvailableIntegrations() only returns integrations configured for the current env
 * - Keep the "authConfigId" name in the integration definition as the per-env object
 *
 * Notes:
 * - These config IDs are not secrets (per product decision), so it's fine to keep them in code.
 * - Current repository state: only development authConfigIds are set (production entries are omitted).
 */

type AppEnv = "development" | "production";

export function currentEnv(): AppEnv {
  const e = (process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "development")
    .toLowerCase();
  return e === "production" ? "production" : "development";
}

// Minimal integration definition (easy to add more metadata fields later)
export type IntegrationDef = {
  slug: string;
  // Per-env authConfigId. If an env is missing, the integration is unavailable in that env.
  authConfigId: Partial<Record<AppEnv, string>>;
  // Optional metadata for UI (extend freely without changing consumers)
  displayName?: string;
  iconKey?: string;
  description?: string;
};

// Append new integrations here.
// If an env isn't defined under authConfigId, it won't appear in that env.
export const INTEGRATIONS: ReadonlyArray<IntegrationDef> = [
  {
    slug: "gmail",
    authConfigId: {
      development: "ac_BuYuRGWQBTA5",
      // production: "ac_gmail_prod",
    },
    displayName: "Gmail",
    iconKey: "gmail",
    description: "Send and receive email",
  },
  {
    slug: "linear",
    authConfigId: {
      development: "ac_OdwEAmPZscbX",
      // production: "ac_linear_prod",
    },
    displayName: "Linear",
    iconKey: "linear",
    description: "Issue tracking",
  },
  {
    slug: "googlesheets",
    authConfigId: {
      development: "ac_q7BfgJYBQERZ",
      // production: "ac_sheets_prod",
    },
    displayName: "Google Sheets",
    iconKey: "googlesheets",
    description: "Spreadsheet access",
  },
];

export type ToolkitSlug = typeof INTEGRATIONS[number]["slug"];

const ENV = currentEnv();

// Build entries limited to the current env: [slug, authConfigId]
const ENV_ENTRIES = INTEGRATIONS
  .map((i) => {
    const id = i.authConfigId[ENV];
    return id ? [i.slug, id] as [ToolkitSlug, string] : null;
  })
  .filter((p): p is [ToolkitSlug, string] => p !== null);

// Map<slug, authConfigId> for the current env
export const AUTH_CONFIG_ID_BY_SLUG = new Map<ToolkitSlug, string>(ENV_ENTRIES);

// For validation and reverse lookups in the current env
export const AUTH_CONFIG_ID_SET = new Set<string>(Array.from(AUTH_CONFIG_ID_BY_SLUG.values()));
export const AUTH_CONFIG_ID_TO_SLUG = new Map<string, ToolkitSlug>(
  Array.from(AUTH_CONFIG_ID_BY_SLUG.entries()).map(([slug, id]) => [id, slug])
);

export function isValidAuthConfigId(id: string): boolean {
  return AUTH_CONFIG_ID_SET.has(id);
}

export function getAuthConfigId(slug: ToolkitSlug): string {
  const id = AUTH_CONFIG_ID_BY_SLUG.get(slug);
  if (!id) {
    throw new Error(`Integration "${slug}" is not configured for ${ENV}`);
  }
  return id;
}

// Shape returned to the frontend
export type AvailableIntegration = {
  slug: ToolkitSlug;
  authConfigId: string;
  // Optional metadata (available for UI consumption)
  displayName?: string;
  iconKey?: string;
  description?: string;
};

// Only return integrations configured for the current env
export function listAvailableIntegrations(): AvailableIntegration[] {
  return INTEGRATIONS.flatMap((i) => {
    const id = i.authConfigId[ENV];
    if (!id) return [];
    return [{
      slug: i.slug,
      authConfigId: id,
      displayName: i.displayName,
      iconKey: i.iconKey,
      description: i.description,
    }];
  });
}

/**
 * Transitional export:
 * Some existing code may import a Map named TOOLKIT_AUTH_CONFIG. Provide it here
 * as a Map<slug, authConfigId> for the current environment to minimize churn.
 * Callers that need richer data should use listAvailableIntegrations().
 */
export const TOOLKIT_AUTH_CONFIG = new Map<string, string>(AUTH_CONFIG_ID_BY_SLUG);