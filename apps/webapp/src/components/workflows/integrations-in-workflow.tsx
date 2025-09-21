import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search } from 'lucide-react';
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@threadway/backend/convex/api';
import type { Id } from '@threadway/backend/convex/dataModel';
import { useQuery, useAction, useMutation } from 'convex/react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { getIntegrationIcon } from "@/components/integrations/icon-map";

import { Route } from '@/routes/_dashboard/f/$workflowId';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";


export function IntegrationsInWorkflow() {
    const { workflowId } = Route.useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [pendingIntegration, setPendingIntegration] = useState<{ authConfigId: string, name: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Static list of available integrations via react-query
    const { data: availableFromApi } = useSuspenseQuery(
        convexQuery(api.integrations.queries.listAvailableIntegrations, {})
    );

    // Live user connections via convex subscription
    const myIntegrations = useQuery(api.integrations.queries.listUserConnections);
    const addIntegrationToWorkflow = useMutation(api.workflows.mutations.addIntegrationToWorkflow);
    const removeIntegrationFromWorkflow = useMutation(api.workflows.mutations.removeIntegrationFromWorkflow);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);

    const availableTemplates = useMemo(() => {
        const list = availableFromApi ?? [];
        return list.map((i: any) => ({
            name: i.displayName ?? i.slug,
            authConfigId: i.authConfigId,
            description: i.description,
            iconKey: i.iconKey,
            slug: i.slug,
        }));
    }, [availableFromApi]);

    // Set of authConfigIds already in this workflow
    const workflowConnections = useQuery(api.workflows.queries.getWorkflowConnections, {
        workflowId: workflowId as Id<"workflows">
    });
    const workflowAuthConfigIds = useMemo(
        () =>
            new Set(
                (workflowConnections ?? [])
                    .filter((c) => c !== null)
                    .map((c) => c!.authConfigId)
            ),
        [workflowConnections]
    );

    // Filter by visible label and exclude those already in workflow
    const filteredIntegrations = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        return availableTemplates.filter((integration: any) => {
            if (workflowAuthConfigIds.has(integration.authConfigId)) return false;
            if (!needle) return true;
            return integration.name.toLowerCase().includes(needle);
        });
    }, [availableTemplates, searchTerm, workflowAuthConfigIds]);

    // Create a map of authConfigId to connection for easy lookup
    const myConnectionsMap = useMemo(() => {
        return new Map((myIntegrations ?? []).map((connection) => [
            connection.authConfigId,
            connection
        ]));
    }, [myIntegrations]);

    const myAuthConfigIds = useMemo(() => {
        return new Set((myIntegrations ?? []).map((m) => m.authConfigId));
    }, [myIntegrations]);

    const initiateConnection = useAction(api.integrations.actions.initiateConnection);

    const handleConnect = async (integration: any) => {
        if (myAuthConfigIds.has(integration.authConfigId) || isConnecting === integration.authConfigId) return;
        setIsConnecting(integration.authConfigId);
        try {
            const { redirectUrl } = await initiateConnection({ authConfigId: integration.authConfigId });
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

    // Effect to handle adding integration to workflow once connection is established
    useEffect(() => {
        if (pendingIntegration && myAuthConfigIds.has(pendingIntegration.authConfigId)) {
            const connection = myConnectionsMap.get(pendingIntegration.authConfigId);
            if (connection) {
                try {
                    addIntegrationToWorkflow({
                        workflowId: workflowId as Id<"workflows">,
                        connectionId: connection._id
                    })
                    toast.success(`${pendingIntegration.name} added to workflow`);
                    setPendingIntegration(null);

                } catch (error: any) {
                    toast.error(error?.message ?? `Failed to add ${pendingIntegration.name} to workflow`);
                    setPendingIntegration(null);
                }
            }
        }
    }, [myAuthConfigIds, myConnectionsMap, pendingIntegration, addIntegrationToWorkflow, workflowId]);

    const handleAddIntegration = async (isAlreadyAdded: boolean, integration: any) => {
        try {
            if (!isAlreadyAdded) {
                // Set pending integration to be added after connection
                setPendingIntegration({
                    authConfigId: integration.authConfigId,
                    name: integration.name
                });
                // Initiate connection - the effect above will handle adding to workflow
                await handleConnect(integration);
                return;
            }

            // Get the connection for this integration
            const connection = myConnectionsMap.get(integration.authConfigId);
            if (!connection) {
                toast.error(`Connection not found for ${integration.name}`);
                return;
            }

            // Add the integration to the workflow using the connectionId
            await addIntegrationToWorkflow({
                workflowId: workflowId as Id<"workflows">,
                connectionId: connection._id
            });

            toast.success(`${integration.name} added to workflow`);
        } catch (error: any) {
            toast.error(error?.message ?? `Failed to add ${integration.name} to workflow`);
        }
    }

    // Handler for remove
    const handleRemove = async () => {
        if (!selectedConnection) return;
        try {
            await removeIntegrationFromWorkflow({
                workflowId: workflowId as Id<"workflows">,
                connectionId: selectedConnection._id as Id<"connections">
            });
            toast.success("Integration removed from workflow");
        } catch (error: any) {
            toast.error(error?.message ?? "Failed to remove integration");
        } finally {
            setDialogOpen(false);
            setSelectedConnection(null);
        }
    };

    return (
        <div className="flex justify-start items-center gap-2">
            <DropdownMenu onOpenChange={(open) => { if (open) setSearchTerm(""); }}>
                <DropdownMenuTrigger asChild>
                    <div>
                        <Button variant="secondary" size="sm">
                            <Plus className="h-4 w-4" />
                            Add integration
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2 max-h-[300px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} align="end">
                    <DropdownMenuLabel className="p-0">
                        <div
                            className="flex items-center gap-2 px-2 py-1.5 bg-transparent"
                        >
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                autoFocus={true}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-8 px-2 py-1 text-sm bg-transparent border-none focus-visible:outline-none focus-visible:ring-0"
                                ref={inputRef}
                            />
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {filteredIntegrations.length === 0 && (
                            <div className="px-3 py-2 text-muted-foreground text-sm">No integrations found</div>
                        )}
                        {filteredIntegrations.map((integration: any) => {
                            const isAlreadyAdded = myAuthConfigIds.has(integration.authConfigId);
                            const IconComponent = getIntegrationIcon(integration.iconKey ?? integration.slug ?? integration.name);

                            setTimeout(() => {
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }, 50);

                            return (
                                <DropdownMenuItem
                                    key={integration.authConfigId}
                                    className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer"
                                    disabled={isConnecting === integration.authConfigId}
                                    tabIndex={isAlreadyAdded ? -1 : 0}
                                    aria-disabled={isAlreadyAdded}
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        handleAddIntegration(isAlreadyAdded, integration);
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="p-1 rounded bg-muted"><IconComponent className="h-4 w-4" aria-hidden="true" /></span>
                                        {integration.name}
                                    </span>
                                    {isAlreadyAdded ? (
                                        <span className="text-xs text-muted-foreground ml-2"></span>
                                    ) : isConnecting === integration.authConfigId ? (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                            Connecting…
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-primary ml-2">
                                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                                        </span>
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <div
                className="ml-2 flex flex-wrap gap-2 items-start"
                style={{ rowGap: '0.5rem' }}
            >
                {workflowConnections?.map((connection) => {
                    if (!connection) return null;
                    // search integration.name by authConfigId
                    const integration = availableTemplates.find(
                        (i) => i.authConfigId === connection.authConfigId
                    );
                    const IconComponent = getIntegrationIcon(connection.toolkitSlug ?? connection.authConfigId);
                    return (
                        <div
                            key={connection._id}
                            className="flex items-center gap-1 px-2 py-1 border rounded-lg bg-card shadow-sm border-muted"
                        >
                            <span className="p-1 rounded bg-muted">
                                <IconComponent className="h-3 w-3" aria-hidden="true" />
                            </span>
                            <p className="text-sm font-medium">
                                {integration?.name ?? connection.toolkitSlug ?? connection.authConfigId}
                            </p>
                            <span className="h-5 border-l border-muted" />
                            <button
                                type="button"
                                className="text-muted-foreground cursor-pointer flex items-center justify-center"
                                aria-label={`Remove ${integration?.name ?? connection.toolkitSlug ?? connection.authConfigId} from workflow`}
                                onClick={() => {
                                    setSelectedConnection(connection);
                                    setDialogOpen(true);
                                }}
                            >
                                <span className="text-lg leading-none">×</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Integration</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this integration from the workflow?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove} className="bg-red-700 text-white hover:bg-red-500">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}