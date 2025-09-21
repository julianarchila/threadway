import React from 'react';
import { getIntegrationIcon } from "@/components/integrations/icon-map";
import type { Integration, Connection } from './types';

interface WorkflowIntegrationChipProps {
    connection: Connection;
    integration?: Integration;
    onRemove: () => void;
}

export const WorkflowIntegrationChip: React.FC<WorkflowIntegrationChipProps> = ({
    connection,
    integration,
    onRemove,
}) => {
    const IconComponent = getIntegrationIcon(
        connection.toolkitSlug ?? connection.authConfigId
    );

    const displayName = integration?.name ??
        connection.toolkitSlug ??
        connection.authConfigId;

    return (
        <div className="flex items-center gap-1 px-2 py-1 border rounded-lg bg-card shadow-sm border-muted">
            <span className="p-1 rounded bg-muted">
                <IconComponent className="h-3 w-3" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium">{displayName}</p>
            <span className="h-5 border-l border-muted" />
            <button
                type="button"
                className="text-muted-foreground cursor-pointer flex items-center justify-center hover:text-foreground transition-colors"
                aria-label={`Remove ${displayName} from workflow`}
                onClick={onRemove}
            >
                <span className="text-lg leading-none">×</span>
            </button>
        </div>
    );
};