import React from 'react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Loader2, ArrowUpRight } from 'lucide-react';
import { getIntegrationIcon } from "@/components/integrations/icon-map";
import type { Integration } from './types';

interface IntegrationDropdownItemProps {
    integration: Integration;
    isAlreadyConnected: boolean;
    isConnecting: boolean;
    onSelect: () => void;
}

export const IntegrationDropdownItem: React.FC<IntegrationDropdownItemProps> = ({
    integration,
    isAlreadyConnected,
    isConnecting,
    onSelect,
}) => {
    const IconComponent = getIntegrationIcon(
        integration.iconKey ?? integration.slug ?? integration.name
    );

    const renderStatusIcon = () => {
        if (isConnecting) {
            return (
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Connecting…
                </span>
            );
        }

        if (!isAlreadyConnected) {
            return (
                <span className="flex items-center gap-1 text-xs text-primary ml-2">
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </span>
            );
        }

        return <span className="text-xs text-muted-foreground ml-2"></span>;
    };

    return (
        <DropdownMenuItem
            className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer"
            disabled={isConnecting}
            tabIndex={isAlreadyConnected ? -1 : 0}
            aria-disabled={isAlreadyConnected}
            onSelect={(event) => {
                event.preventDefault();
                onSelect();
            }}
        >
            <span className="flex items-center gap-2">
                <span className="p-1 rounded bg-muted">
                    <IconComponent className="h-4 w-4" aria-hidden="true" />
                </span>
                {integration.name}
            </span>
            {renderStatusIcon()}
        </DropdownMenuItem>
    );
};