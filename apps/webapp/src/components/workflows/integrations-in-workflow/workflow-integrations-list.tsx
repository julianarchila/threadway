import React from 'react';
import { WorkflowIntegrationChip } from './workflow-integration-chip';
import type { Integration, Connection } from './types';

interface WorkflowIntegrationsListProps {
    connections: Connection[];
    availableIntegrations: Integration[];
    onRemoveIntegration: (connection: Connection) => void;
}

export const WorkflowIntegrationsList: React.FC<WorkflowIntegrationsListProps> = ({
    connections,
    availableIntegrations,
    onRemoveIntegration,
}) => {
    if (connections.length === 0) {
        return null;
    }

    return (
        <div className="ml-2 flex flex-wrap gap-2 items-start" style={{ rowGap: '0.5rem' }}>
            {connections.map((connection) => {
                // Find the corresponding integration by authConfigId
                const integration = availableIntegrations.find(
                    (i) => i.authConfigId === connection.authConfigId
                );

                return (
                    <WorkflowIntegrationChip
                        key={connection._id}
                        connection={connection}
                        integration={integration}
                        onRemove={() => onRemoveIntegration(connection)}
                    />
                );
            })}
        </div>
    );
};