"use client"

import { api } from "@threadway/backend/convex/api"
import type { Id } from "@threadway/backend/convex/dataModel"
import { useRef, useEffect } from "react"
import { useQuery } from "convex/react"
import { MyIntegrationCard } from "./integration-card"
import { DeleteConfirmationDialog, type DeleteConfirmationDialogRef } from "./delete-confirmation-dialog"

interface Integration {
    _id: Id<"connections">
    name: string
}

interface MyIntegrationsSectionProps {
    searchTerm: string
    onIntegrationsLoad?: (integrations: Integration[]) => void
}

export function MyIntegrationsSection({ searchTerm, onIntegrationsLoad }: MyIntegrationsSectionProps) {
    const deleteDialogRef = useRef<DeleteConfirmationDialogRef>(null);

    const myIntegrations = useQuery(api.integrations.queries.listUsersConnections);
    const searchIntegrations = myIntegrations && searchTerm.trim() ? myIntegrations.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ) : undefined;

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
                            onDelete={(id, name) => deleteDialogRef.current?.openDialog(id as Id<"connections">, name)}
                        />
                    ))}
                </div>
            </div>

            <DeleteConfirmationDialog ref={deleteDialogRef} />
        </>
    )
}
