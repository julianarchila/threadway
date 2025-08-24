import { query } from "../_generated/server";
import { getAuthenticatedUser } from "./helpers";
import { IntegrationsError } from "./error";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";

// Query to get the authenticated user's integrations
export const getMyIntegrations = query({
    args: {},
    handler: async (ctx) => {
        return await ResultAsync.fromPromise(
            (async () => {
                const { user } = await getAuthenticatedUser(ctx);

                const integrations = await ctx.db
                    .query("integrations")
                    .withIndex("by_user", (q) => q.eq("userId", user._id))
                    .collect();

                return integrations.map((integration) => ({
                    _id: integration._id,
                    name: integration.name,
                    mcpUrl: integration.mcpUrl,
                }));
            })(),
            (error) =>
                new IntegrationsError(
                    "INTEGRATION_LOOKUP_FAILED",
                    "Failed to fetch integrations",
                    error
                )
        ).match(
            (ok) => ok,
            (err) => {
                throw err;
            }
        );
    },
});

// Query to search for integrations by name (only the user's integrations)
export const searchMyIntegrations = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        return await ResultAsync.fromPromise(
            (async () => {
                const { user } = await getAuthenticatedUser(ctx);

                const term = args.searchTerm.trim();
                if (!term) {
                    return [];
                }

                const integrations = await ctx.db
                    .query("integrations")
                    .withIndex("by_user", (q) => q.eq("userId", user._id))
                    .collect();

                const integrationsFilter = integrations.filter((integration) =>
                    integration.name.toLowerCase().includes(term.toLowerCase())
                );

                return integrationsFilter.map((integration) => ({
                    _id: integration._id,
                    name: integration.name,
                    mcpUrl: integration.mcpUrl,
                }));
            })(),
            (error) =>
                new IntegrationsError(
                    "INTEGRATION_LOOKUP_FAILED",
                    "Failed to search integrations",
                    error
                )
        ).match(
            (ok) => ok,
            (err) => {
                throw err;
            }
        );
    },
});
