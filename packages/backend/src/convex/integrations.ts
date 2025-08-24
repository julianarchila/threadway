import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";
import type { Id } from "./_generated/dataModel";

// Helper function para obtener el usuario autenticado usando Better Auth
async function getAuthenticatedUser(ctx: any) {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
        throw new Error("Usuario no autenticado");
    }

    // Obtener datos del usuario desde la base de datos
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    if (!user) {
        throw new Error("Usuario no encontrado en la base de datos");
    }

    return { userMetadata, user };
}

// Query para obtener las integraciones del usuario autenticado
export const getMyIntegrations = query({
    args: {},
    handler: async (ctx) => {
        const { user } = await getAuthenticatedUser(ctx);

        return await ctx.db
            .query("integrations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});

// Mutation para crear una nueva integración (automáticamente asignada al usuario autenticado)
export const createIntegration = mutation({
    args: {
        name: v.string(),
        mcpUrl: v.string(),
        apiKey: v.string(),
    },
    handler: async (ctx, args) => {
        const { user } = await getAuthenticatedUser(ctx);

        // Validar que los campos no estén vacíos
        if (!args.name.trim()) {
            throw new Error("El nombre de la integración es requerido");
        }
        if (!args.mcpUrl.trim()) {
            throw new Error("La URL MCP es requerida");
        }

        // Verificar que no existe una integración con el mismo nombre para este usuario
        const existingIntegration = await ctx.db
            .query("integrations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("name"), args.name.trim()))
            .first();

        if (existingIntegration) {
            throw new Error("Ya tienes una integración con este nombre");
        }

        const integrationId = await ctx.db.insert("integrations", {
            userId: user._id,
            name: args.name.trim(),
            mcpUrl: args.mcpUrl.trim(),
            apiKey: args.apiKey.trim() || undefined,
        });

        return integrationId;
    },
});

// Mutation para actualizar una integración (solo si pertenece al usuario)
export const updateIntegration = mutation({
    args: {
        integrationId: v.id("integrations"),
        name: v.optional(v.string()),
        mcpUrl: v.optional(v.string()),
        apiKey: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { user } = await getAuthenticatedUser(ctx);
        const { integrationId, ...updates } = args;

        // Verificar que la integración existe y pertenece al usuario
        const integration = await ctx.db.get(integrationId);
        if (!integration) {
            throw new Error("Integración no encontrada");
        }

        if (integration.userId !== user._id) {
            throw new Error("No tienes permisos para modificar esta integración");
        }

        // Validar y limpiar campos si se proporcionan
        const cleanUpdates: any = {};

        if (updates.name !== undefined) {
            if (!updates.name.trim()) {
                throw new Error("El nombre de la integración no puede estar vacío");
            }

            // Verificar que no existe otra integración con el mismo nombre
            const existingIntegration = await ctx.db
                .query("integrations")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .filter((q) => q.eq(q.field("name"), updates.name!.trim()))
                .first();

            if (existingIntegration && existingIntegration._id !== integrationId) {
                throw new Error("Ya tienes una integración con este nombre");
            }

            cleanUpdates.name = updates.name.trim();
        }

        if (updates.mcpUrl !== undefined) {
            if (!updates.mcpUrl.trim()) {
                throw new Error("La URL MCP no puede estar vacía");
            }
            cleanUpdates.mcpUrl = updates.mcpUrl.trim();
        }

        if (updates.apiKey !== undefined) {
            if (!updates.apiKey.trim()) {
                throw new Error("La API Key no puede estar vacía");
            }
            cleanUpdates.apiKey = updates.apiKey.trim();
        }

        // Solo actualizar si hay cambios
        if (Object.keys(cleanUpdates).length > 0) {
            await ctx.db.patch(integrationId, cleanUpdates);
        }

        return integrationId;
    },
});

// Mutation para eliminar una integración (solo si pertenece al usuario)
export const deleteIntegration = mutation({
    args: { integrationId: v.id("integrations") },
    handler: async (ctx, args) => {
        const { user } = await getAuthenticatedUser(ctx);

        // Verificar que la integración existe y pertenece al usuario
        const integration = await ctx.db.get(args.integrationId);
        if (!integration) {
            throw new Error("Integración no encontrada");
        }

        if (integration.userId !== user._id) {
            throw new Error("No tienes permisos para eliminar esta integración");
        }

        await ctx.db.delete(args.integrationId);
        return { success: true, message: "Integración eliminada exitosamente" };
    },
});

// Query para buscar integraciones por nombre (solo las del usuario)
export const searchMyIntegrations = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        const { user } = await getAuthenticatedUser(ctx);

        if (!args.searchTerm.trim()) {
            return [];
        }

        const integrations = await ctx.db
            .query("integrations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Filtrar por nombre que contenga el término de búsqueda
        return integrations.filter((integration) =>
            integration.name.toLowerCase().includes(args.searchTerm.toLowerCase())
        );
    },
});
