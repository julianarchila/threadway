import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./helpers";
import { IntegrationsError } from "./error";
import { err, ok, Result, ResultAsync } from "neverthrow";

// Small helper for URL validation
function validateUrl(mcpUrl: string): Result<URL, IntegrationsError> {
    try {
        const parsed = new URL(mcpUrl);
        if (!/^https?:$/.test(parsed.protocol)) {
            return err(
                new IntegrationsError(
                    "INTEGRATION_CREATION_FAILED",
                    "MCP URL must start with http:// or https://"
                )
            );
        }
        return ok(parsed);
    } catch {
        return err(
            new IntegrationsError(
                "INTEGRATION_CREATION_FAILED",
                "MCP URL must be a valid http(s) URL"
            )
        );
    }
}

// Mutation to create a new integration
export const createIntegration = mutation({
    args: {
        name: v.string(),
        mcpUrl: v.string(),
        apiKey: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ResultAsync.fromPromise(
            getAuthenticatedUser(ctx),
            (e) =>
                new IntegrationsError(
                    "INTEGRATION_CREATION_FAILED",
                    "Failed to authenticate user",
                    e
                )
        )
            .andThen(({ user }) => {
                // Normalize & validate inputs
                const name = args.name.trim();
                const mcpUrl = args.mcpUrl.trim();
                const apiKey =
                    typeof args.apiKey === "string" ? args.apiKey.trim() : undefined;

                if (!name) {
                    return err(
                        new IntegrationsError(
                            "INTEGRATION_CREATION_FAILED",
                            "Integration name is required"
                        )
                    );
                }
                if (!mcpUrl) {
                    return err(
                        new IntegrationsError(
                            "INTEGRATION_CREATION_FAILED",
                            "MCP URL is required"
                        )
                    );
                }

                // URL validation
                const urlResult = validateUrl(mcpUrl);
                if (urlResult.isErr()) return err(urlResult.error);

                // Proceed with user + validated inputs
                return ok({ user, name, mcpUrl, apiKey });
            })
            .andThen(({ user, name, mcpUrl, apiKey }) =>
                ResultAsync.fromPromise(
                    ctx.db
                        .query("integrations")
                        .withIndex("by_user_nameLower", (q) =>
                            q.eq("userId", user._id).eq("nameLower", name.toLowerCase())
                        )
                        .first(),
                    (e) =>
                        new IntegrationsError(
                            "INTEGRATION_CREATION_FAILED",
                            "Database query failed",
                            e
                        )
                ).andThen((existingIntegration) => {
                    if (existingIntegration) {
                        return err(
                            new IntegrationsError(
                                "INTEGRATION_CREATION_FAILED",
                                "You already have an integration with this name"
                            )
                        );
                    }
                    return ok({ user, name, mcpUrl, apiKey });
                })
            )
            .andThen(({ user, name, mcpUrl, apiKey }) =>
                ResultAsync.fromPromise(
                    ctx.db.insert("integrations", {
                        userId: user._id,
                        name,
                        nameLower: name.toLowerCase(),
                        mcpUrl,
                        apiKey: apiKey || "",
                    }),
                    (e) =>
                        new IntegrationsError(
                            "INTEGRATION_CREATION_FAILED",
                            "Failed to insert integration",
                            e
                        )
                )
            )
            .match(
                (integrationId) => integrationId, // success
                (error) => {
                    throw error; // Convex expects exceptions on failure
                }
            );
    },
});

// Mutation to delete an integration (only if it belongs to the user)
export const deleteIntegration = mutation({
    args: { integrationId: v.id("integrations") },
    handler: async (ctx, args) => {
        return await ResultAsync.fromPromise(
            getAuthenticatedUser(ctx),
            (e) =>
                new IntegrationsError(
                    "INTEGRATION_DELETION_FAILED",
                    "Failed to authenticate user",
                    e
                )
        )
            .andThen(({ user }) =>
                ResultAsync.fromPromise(
                    ctx.db.get(args.integrationId),
                    (e) =>
                        new IntegrationsError(
                            "INTEGRATION_DELETION_FAILED",
                            "Database query failed",
                            e
                        )
                ).andThen((integration) => {
                    if (!integration) {
                        return err(
                            new IntegrationsError(
                                "INTEGRATION_DELETION_FAILED",
                                "Integration not found"
                            )
                        );
                    }
                    if (integration.userId !== user._id) {
                        return err(
                            new IntegrationsError(
                                "INTEGRATION_DELETION_FAILED",
                                "You do not have permissions to delete this integration"
                            )
                        );
                    }
                    return ok(args.integrationId);
                })
            )
            .andThen((integrationId) =>
                ResultAsync.fromPromise(
                    ctx.db.delete(integrationId),
                    (e) =>
                        new IntegrationsError(
                            "INTEGRATION_DELETION_FAILED",
                            "Failed to delete integration",
                            e
                        )
                ).map(() => ({
                    success: true,
                    message: "Integration deleted successfully",
                }))
            )
            .match(
                (result) => result,
                (error) => {
                    throw error; // Convex still needs thrown error
                }
            );
    },
});
