import type { Id } from "@threadway/backend/convex/dataModel";

export interface Integration {
    name: string;
    authConfigId: string;
    description: string;
    iconKey: string;
    slug: string;
}

export interface Connection {
    _id: Id<"connections">;
    authConfigId: string;
    toolkitSlug?: string;
}

export interface PendingIntegration {
    authConfigId: string;
    name: string;
}