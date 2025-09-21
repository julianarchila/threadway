import { useState, useMemo, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@threadway/backend/convex/api';
import { useQuery, useAction, useMutation } from 'convex/react';
import type { Id } from '@threadway/backend/convex/dataModel';
import { toast } from 'sonner';
import { Route } from '@/routes/_dashboard/f/$workflowId';

import { IntegrationSearchDropdown } from './integration-search-dropdown';
import { WorkflowIntegrationsList } from './workflow-integrations-list';
import { RemoveIntegrationDialog } from './remove-integration-dialog';
import type { Integration, Connection, PendingIntegration } from './types';

export function IntegrationsInWorkflow() {
    const { workflowId } = Route.useParams();

    // Local component state
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [pendingIntegration, setPendingIntegration] = useState<PendingIntegration | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

    // Queries to fetch data
    const { data: availableFromApi } = useSuspenseQuery(
        convexQuery(api.integrations.queries.listAvailableIntegrations, {})
    );

    const myIntegrations = useQuery(api.integrations.queries.listUserConnections);
    const workflowConnections = useQuery(api.workflows.queries.getWorkflowConnections, {
        workflowId: workflowId as Id<"workflows">
    });

    // Mutations and actions
    const addIntegrationToWorkflow = useMutation(api.workflows.mutations.addIntegrationToWorkflow);
    const removeIntegrationFromWorkflow = useMutation(api.workflows.mutations.removeIntegrationFromWorkflow);
    const initiateConnection = useAction(api.integrations.actions.initiateConnection);

    // Data transformations
    const availableIntegrations = useMemo((): Integration[] => {
        const list = availableFromApi ?? [];
        return list.map((i: any) => ({
            name: i.displayName ?? i.slug,
            authConfigId: i.authConfigId,
            description: i.description,
            iconKey: i.iconKey,
            slug: i.slug,
        }));
    }, [availableFromApi]);

    const workflowAuthConfigIds = useMemo(() =>
        new Set(
            (workflowConnections ?? [])
                .filter((c) => c !== null)
                .map((c) => c!.authConfigId)
        ),
        [workflowConnections]
    );

    const myConnectionsMap = useMemo(() =>
        new Map((myIntegrations ?? []).map((connection) => [
            connection.authConfigId,
            connection
        ])),
        [myIntegrations]
    );

    const myAuthConfigIds = useMemo(() =>
        new Set((myIntegrations ?? []).map((m) => m.authConfigId)),
        [myIntegrations]
    );

    // Handlers
    const handleConnectIntegration = async (integration: Integration) => {
        if (myAuthConfigIds.has(integration.authConfigId) || isConnecting === integration.authConfigId) {
            return;
        }

        setIsConnecting(integration.authConfigId);
        try {
            const { redirectUrl } = await initiateConnection({
                authConfigId: integration.authConfigId
            });

            const opened = window.open(redirectUrl, "_blank");
            if (!opened) {
                window.location.assign(redirectUrl);
            }
        } catch (error: any) {
            toast.error(error?.message ?? `Failed to initiate ${integration.name} connection`);
        } finally {
            setIsConnecting(null);
        }
    };

    const handleAddIntegration = async (integration: Integration) => {
        const isAlreadyConnected = myAuthConfigIds.has(integration.authConfigId);

        try {
            if (!isAlreadyConnected) {
                // Set pending integration to add after connection
                setPendingIntegration({
                    authConfigId: integration.authConfigId,
                    name: integration.name
                });
                await handleConnectIntegration(integration);
                return;
            }

            // If already connected, add it directly to the workflow
            const connection = myConnectionsMap.get(integration.authConfigId);
            if (!connection) {
                toast.error(`Connection not found for ${integration.name}`);
                return;
            }

            await addIntegrationToWorkflow({
                workflowId: workflowId as Id<"workflows">,
                connectionId: connection._id
            });

            toast.success(`${integration.name} added to workflow`);
        } catch (error: any) {
            toast.error(error?.message ?? `Failed to add ${integration.name} to workflow`);
        }
    };

    const handleRemoveClick = (connection: Connection) => {
        setSelectedConnection(connection);
        setIsRemoveDialogOpen(true);
    };

    const handleRemoveConfirm = async () => {
        if (!selectedConnection) return;

        try {
            await removeIntegrationFromWorkflow({
                workflowId: workflowId as Id<"workflows">,
                connectionId: selectedConnection._id
            });
            toast.success("Integration removed from workflow");
        } catch (error: any) {
            toast.error(error?.message ?? "Failed to remove integration");
        } finally {
            setIsRemoveDialogOpen(false);
            setSelectedConnection(null);
        }
    };

    const handleRemoveCancel = () => {
        setIsRemoveDialogOpen(false);
        setSelectedConnection(null);
    };

    // Effect to handle pending integration after connection
    useEffect(() => {
        if (pendingIntegration && myAuthConfigIds.has(pendingIntegration.authConfigId)) {
            const connection = myConnectionsMap.get(pendingIntegration.authConfigId);
            if (connection) {
                addIntegrationToWorkflow({
                    workflowId: workflowId as Id<"workflows">,
                    connectionId: connection._id
                }).then(() => {
                    toast.success(`${pendingIntegration.name} added to workflow`);
                    setPendingIntegration(null);
                }).catch((error: any) => {
                    toast.error(error?.message ?? `Failed to add ${pendingIntegration.name} to workflow`);
                    setPendingIntegration(null);
                });
            }
        }
    }, [myAuthConfigIds, myConnectionsMap, pendingIntegration, addIntegrationToWorkflow, workflowId]);

    return (
        <div className="flex justify-start items-center gap-2">
            {/* Dropdown to add integrations */}
            <IntegrationSearchDropdown
                availableIntegrations={availableIntegrations}
                workflowAuthConfigIds={workflowAuthConfigIds}
                myAuthConfigIds={myAuthConfigIds}
                isConnecting={isConnecting}
                onAddIntegration={handleAddIntegration}
            />

            {/* List of integrations in the workflow */}
            <WorkflowIntegrationsList
                connections={((workflowConnections ?? []) as (Connection | null)[]).filter((c): c is Connection => c !== null)}
                availableIntegrations={availableIntegrations}
                onRemoveIntegration={handleRemoveClick}
            />

            {/* Confirmation dialog to remove */}
            <RemoveIntegrationDialog
                isOpen={isRemoveDialogOpen}
                onClose={handleRemoveCancel}
                onConfirm={handleRemoveConfirm}
            />
        </div>
    );
};