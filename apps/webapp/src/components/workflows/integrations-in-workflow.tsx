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
import { useQuery, useAction } from 'convex/react';
import { useMemo, useState } from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { getIntegrationIcon } from "@/components/integrations/icon-map";

export function IntegrationsInWorkflow() {
    const [searchTerm, setSearchTerm] = useState("");
    // Static list of available integrations via react-query
    const { data: availableFromApi } = useSuspenseQuery(
        convexQuery(api.integrations.queries.listAvailableIntegrations, {})
    );

    // Live user connections via convex subscription
    const myIntegrations = useQuery(api.integrations.queries.listUserConnections);

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

    // Filter by visible label
    const filteredIntegrations = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        if (!needle) return availableTemplates;
        return availableTemplates.filter((integration: any) =>
            integration.name.toLowerCase().includes(needle)
        );
    }, [availableTemplates, searchTerm]);

    const myAuthConfigIds = useMemo(() => {
        return new Set((myIntegrations ?? []).map((m) => m.authConfigId));
    }, [myIntegrations]);

    const [isConnecting, setIsConnecting] = useState<string | null>(null);
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

    return (
        <div className="flex justify-start">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div>
                        <Button variant="secondary" size="sm" onClick={() => { /* TODO: open integrations modal */ }}>
                            <Plus className="h-4 w-4" />
                            Add integration
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2" align="end">
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
                            return (
                                <DropdownMenuItem
                                    autoFocus={false}
                                    key={integration.authConfigId}
                                    className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer"
                                    disabled={isConnecting === integration.authConfigId}
                                    tabIndex={isAlreadyAdded ? -1 : 0}
                                    aria-disabled={isAlreadyAdded}
                                    onClick={() => {
                                        if (!isAlreadyAdded) handleConnect(integration);
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
        </div>
    );
}