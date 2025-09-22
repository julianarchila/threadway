import React, { useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search } from 'lucide-react';
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { IntegrationDropdownItem } from './integration-dropdown-item';
import type { Integration } from './types';

interface IntegrationSearchDropdownProps {
    availableIntegrations: Integration[];
    workflowAuthConfigIds: Set<string>;
    myAuthConfigIds: Set<string>;
    isConnecting: string | null;
    onAddIntegration: (integration: Integration) => void;
}

export const IntegrationSearchDropdown: React.FC<IntegrationSearchDropdownProps> = ({
    availableIntegrations,
    workflowAuthConfigIds,
    myAuthConfigIds,
    isConnecting,
    onAddIntegration,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredIntegrations = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        return availableIntegrations.filter((integration) => {
            // Exclude integrations already added to the workflow
            if (workflowAuthConfigIds.has(integration.authConfigId)) return false;

            // If there is no search term, show all available integrations
            if (!needle) return true;

            // Filter by name
            return integration.name.toLowerCase().includes(needle);
        });
    }, [availableIntegrations, searchTerm, workflowAuthConfigIds]);

    const handleDropdownOpenChange = (open: boolean) => {
        if (open) {
            setSearchTerm("");
        }
    };

    return (
        <DropdownMenu onOpenChange={handleDropdownOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                    <Plus className="h-4 w-4" />
                    Add integration
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-72 p-2 max-h-[300px] overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                align="end"
            >
                {/* Search bar */}
                <DropdownMenuLabel className="p-0">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-transparent">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            autoFocus={true}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-8 px-2 py-1 text-sm bg-transparent border-none focus-visible:outline-none focus-visible:ring-0"
                            ref={inputRef}
                        />
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Integrations list */}
                <DropdownMenuGroup>
                    {filteredIntegrations.length === 0 ? (
                        <div className="px-3 py-2 text-muted-foreground text-sm">
                            No integrations found
                        </div>
                    ) : (
                        filteredIntegrations.map((integration) => {
                            // Focus the input
                            setTimeout(() => {
                                inputRef.current?.focus();
                            }, 10);

                            return (
                                <IntegrationDropdownItem
                                    key={integration.authConfigId}
                                    integration={integration}
                                    isAlreadyConnected={myAuthConfigIds.has(integration.authConfigId)}
                                    isConnecting={isConnecting === integration.authConfigId}
                                    onSelect={() => onAddIntegration(integration)}
                                />
                            )
                        })
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};