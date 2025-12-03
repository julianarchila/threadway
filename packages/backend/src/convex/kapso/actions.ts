import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";
import { KAPSO_CONFIG } from "../../lib/kapso/config";
import type {
    CreateCustomerRequest,
    CreateCustomerResponse,
    CreateSetupLinkRequest,
    CreateSetupLinkResponse,
} from "../../lib/kapso/types";
import {
    KapsoCustomerCreationError,
    KapsoSetupLinkCreationError,
} from "./error";

const KAPSO_API_KEY = process.env.KAPSO_API_KEY;
const KAPSO_PLATFORM_API_URL = "https://api.kapso.ai/platform/v1";

if (!KAPSO_API_KEY) {
    throw new Error("KAPSO_API_KEY environment variable is required");
}

const headers = {
    "X-API-Key": KAPSO_API_KEY,
    "Content-Type": "application/json",
};

/**
 * Internal action to create a Kapso customer
 */
export const createKapsoCustomer = internalAction({
    args: v.object({
        name: v.string(),
        externalCustomerId: v.string(),
    }),
    handler: async (ctx, args) => {
        const body: CreateCustomerRequest = {
            customer: {
                name: args.name,
                external_customer_id: args.externalCustomerId,
            },
        };

        const response = await fetch(`${KAPSO_PLATFORM_API_URL}/customers`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create Kapso customer: ${error}`);
        }

        const result = await response.json();
        return result as CreateCustomerResponse;
    },
});

/**
 * Internal action to create a setup link
 */
export const createKapsoSetupLink = internalAction({
    args: v.object({
        customerId: v.string(),
        provisionPhoneNumber: v.boolean(),
        connectionTypes: v.array(
            v.union(v.literal("coexistence"), v.literal("dedicated"))
        ),
    }),
    handler: async (ctx, args) => {
        const body: CreateSetupLinkRequest = {
            setup_link: {
                success_redirect_url: `${KAPSO_CONFIG.baseUrl}/api/webhooks/kapso/success`,
                failure_redirect_url: `${KAPSO_CONFIG.baseUrl}/api/webhooks/kapso/failed`,
                allowed_connection_types: args.connectionTypes,
                provision_phone_number: args.provisionPhoneNumber,
                phone_number_country_isos: KAPSO_CONFIG.defaultCountries,
                theme_config: KAPSO_CONFIG.defaultTheme,
            },
        };

        const response = await fetch(
            `${KAPSO_PLATFORM_API_URL}/customers/${args.customerId}/setup_links`,
            {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create setup link: ${error}`);
        }

        const result = await response.json();
        return result as CreateSetupLinkResponse;
    },
});

/**
 * Public action to create WhatsApp setup link
 * This orchestrates the customer creation and setup link generation
 */
export const createWhatsAppSetupLink = action({
    args: v.object({
        provisionPhoneNumber: v.boolean(),
        connectionTypes: v.optional(
            v.array(v.union(v.literal("coexistence"), v.literal("dedicated")))
        ),
    }),
    handler: async (ctx, args): Promise<{
        setupUrl: string;
        expiresAt: string;
        kapsoCustomerId: string;
    }> => {
        // Get authenticated user
        const userId = await betterAuthComponent.getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.runQuery(internal.kapso.helpers.getUser, {
            userId: userId as Id<"users">,
        });

        if (!user) {
            throw new Error("User not found");
        }

        try {
            let kapsoCustomerId = user.kapsoCustomerId;

            // Create Kapso customer if not exists
            if (!kapsoCustomerId) {
                const customerResponse = await ctx.runAction(
                    internal.kapso.actions.createKapsoCustomer,
                    {
                        name: user.name || user.phoneNumber,
                        externalCustomerId: userId,
                    }
                );

                kapsoCustomerId = customerResponse.data.id;

                // Save Kapso customer ID to user
                await ctx.runMutation(internal.kapso.mutations.updateKapsoCustomerId, {
                    userId: userId as Id<"users">,
                    kapsoCustomerId,
                });
            }

            // Create setup link
            const setupLinkResponse = await ctx.runAction(
                internal.kapso.actions.createKapsoSetupLink,
                {
                    customerId: kapsoCustomerId,
                    provisionPhoneNumber: args.provisionPhoneNumber,
                    connectionTypes:
                        args.connectionTypes || KAPSO_CONFIG.defaultConnectionTypes,
                }
            );

            return {
                setupUrl: setupLinkResponse.data.url,
                expiresAt: setupLinkResponse.data.expires_at,
                kapsoCustomerId,
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("create Kapso customer")) {
                    throw new KapsoCustomerCreationError(error.message);
                }
                throw new KapsoSetupLinkCreationError(error.message);
            }
            throw error;
        }
    },
});
