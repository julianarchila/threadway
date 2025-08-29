"use client"

import { api } from "@whatsapp-mcp-client/backend/convex/api"
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel"
import { useRef, useEffect } from "react"
import { useQuery } from "convex/react"
import { MyIntegrationCard } from "./integration-card"
import { DeleteConfirmationDialog, type DeleteConfirmationDialogRef } from "./delete-confirmation-dialog"

interface Integration {
    _id: Id<"integrations">
    name: string
    mcpUrl: string
}

interface MyIntegrationsSectionProps {
    searchTerm: string
    onIntegrationsLoad?: (integrations: Integration[]) => void
}

export function MyIntegrationsSection({ searchTerm, onIntegrationsLoad }: MyIntegrationsSectionProps) {
    const deleteDialogRef = useRef<DeleteConfirmationDialogRef>(null);

    const myIntegrations = useQuery(api.integrations.queries.getMyIntegrations);
    const searchIntegrations = useQuery(
        api.integrations.queries.searchMyIntegrations,
        searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
    );

    const displayedIntegrations = searchTerm.trim() ? (searchIntegrations || []) : (myIntegrations || []);

    useEffect(() => {
        if (myIntegrations && onIntegrationsLoad) {
            onIntegrationsLoad(myIntegrations);
        }
    }, [myIntegrations, onIntegrationsLoad]);

    if (myIntegrations === undefined) {
        return null;
    }

    if (displayedIntegrations.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mb-8">
                <h2 className="text-base font-semibold text-muted-foreground mb-4">My Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedIntegrations.map((integration) => (
                        <MyIntegrationCard
                            key={integration._id}
                            integration={integration}
                            onDelete={(id, name) => deleteDialogRef.current?.openDialog(id as Id<"integrations">, name)}
                        />
                    ))}
                </div>
            </div>

            <DeleteConfirmationDialog ref={deleteDialogRef} />
        </>
    )
}