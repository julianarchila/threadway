import { createFileRoute } from '@tanstack/react-router'

import { Input } from "@/components/ui/input";
import {
  Blocks,
} from "lucide-react";
import { useState } from "react";

import { AddIntegrationDialog } from "@/components/integrations/add-integration-dialog";
import { TemplateIntegrationCard } from "@/components/integrations/integration-card";
import { MyIntegrationsSection } from "@/components/integrations/my-integrations-section";
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from '@threadway/backend/convex/api';
import { convexQuery } from '@convex-dev/react-query';

export const Route = createFileRoute('/_dashboard/integrations')({
  component: IntegrationsPage,
})






// Available integrations data example

function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [myIntegrations, setMyIntegrations] = useState<any[]>([]);

  const {data: availableIntegrations}= useSuspenseQuery(
    convexQuery(api.integrations.queries.listAvailableIntegrations, {})
  )

  const filteredIntegrations = availableIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Search and Add Integration */}
        <div className="flex items-center justify-between gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search integrations..."
            className="w-full"
          />

          <AddIntegrationDialog />
        </div>
      </div>

      {/* My Integrations Section */}
      <MyIntegrationsSection
        searchTerm={searchTerm}
        onIntegrationsLoad={setMyIntegrations}
      />

      {/* Available Integration Templates Section */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-muted-foreground mb-4">
          Available Integration Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map((integration) => {
            const isAlreadyAdded = myIntegrations?.some(myIntegration =>
              myIntegration.name === integration.name
            );

            return (
              <TemplateIntegrationCard
                key={integration.name}
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
