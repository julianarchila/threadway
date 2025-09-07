import { createFileRoute } from '@tanstack/react-router'

import { Input } from "@/components/ui/input";
import { Blocks } from "lucide-react";
import { useMemo, useState } from "react";

import { TemplateIntegrationCard } from "@/components/integrations/integration-card";
import { MyIntegrationsSection } from "@/components/integrations/my-integrations-section";
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from 'convex/react';
import { api } from '@threadway/backend/convex/api';
import type { Id } from "@threadway/backend/convex/dataModel";

export const Route = createFileRoute('/_dashboard/integrations')({
  component: IntegrationsPage,
})

type AvailableIntegration = {
  name: string
  authConfigId: string
}

type MyIntegration = {
  _id: Id<"connections">
  connectionId: string
  authConfigId: string
  toolkitSlug?: string
  name: string
  status: "INITIATED" | "ACTIVE"
}

function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Static list of available integrations via react-query
  const { data: availableIntegrations } = useSuspenseQuery(
    convexQuery(api.integrations.queries.listAvailableIntegrations, {})
  );

  // Live user connections via convex subscription
  const myIntegrations = useQuery(api.integrations.queries.listUserConnections) as MyIntegration[] | undefined;

  const filteredIntegrations = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return availableIntegrations as AvailableIntegration[];
    return (availableIntegrations as AvailableIntegration[]).filter((integration) =>
      integration.name.toLowerCase().includes(needle)
    );
  }, [availableIntegrations, searchTerm]);

  // Set for quick lookup based on authConfigId (reliable identifier)
  const myAuthConfigIds = useMemo(() => {
    return new Set((myIntegrations ?? []).map((m) => m.authConfigId));
  }, [myIntegrations]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Blocks className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Integrations</h1>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search integrations..."
            className="w-full"
          />
        </div>
      </div>

      {/* My Integrations Section */}
      <MyIntegrationsSection
        searchTerm={searchTerm}
        integrations={myIntegrations ?? []}
      />

      {/* Available Integration Templates Section */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-muted-foreground mb-4">
          Available Integration Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map((integration) => {
            const isAlreadyAdded = myAuthConfigIds.has(integration.authConfigId);

            return (
              <TemplateIntegrationCard
                key={integration.authConfigId}
                integration={integration}
                isAlreadyAdded={isAlreadyAdded}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
