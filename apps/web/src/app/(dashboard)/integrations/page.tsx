"use client"

import { api } from "@whatsapp-mcp-client/backend/convex/api"
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel"
import { Input } from "@/components/ui/input";
import {
  Blocks,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";

// Import our components
import { AddIntegrationDialog } from "@/components/integrations/add-integration-dialog";
import { MyIntegrationCard, TemplateIntegrationCard } from "@/components/integrations/integration-card";
import { DeleteConfirmationDialog } from "@/components/integrations/delete-confirmation-dialog";

// Available integrations data example
const availableIntegrations = [
  {
    name: "Weather",
    mcpUrl: "https://mcp-server-wether.vercel.app/mcp/",
    description: "Get weather information and forecasts"
  },
  {
    name: "Notion",
    mcpUrl: "https://www.notion.so/mcp/",
    description: "Connect to your Notion workspace"
  },
  {
    name: "Airtable",
    mcpUrl: "https://www.airtable.com/mcp/",
    description: "Access your Airtable databases"
  },
  {
    name: "Linear",
    mcpUrl: "https://linear.app/mcp/",
    description: "Manage Linear issues and projects"
  },
  {
    name: "GitHub",
    mcpUrl: "https://github.com/mcp/",
    description: "Access GitHub repositories"
  },
  {
    name: "Supabase",
    mcpUrl: "https://supabase.com/mcp/",
    description: "Connect to Supabase database"
  },
  {
    name: "Figma",
    mcpUrl: "https://www.figma.com/mcp/",
    description: "Access Figma designs"
  },
  {
    name: "Jira",
    mcpUrl: "https://www.atlassian.com/software/jira/mcp",
    description: "Manage Jira tickets and projects"
  },
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"integrations">, name: string } | null>(null);

  // Queries and mutations - No need for auth checks since layout handles it
  const myIntegrations = useQuery(api.integrations.queries.getMyIntegrations);
  const createIntegrationMutation = useMutation(api.integrations.mutations.create);
  const deleteIntegrationMutation = useMutation(api.integrations.mutations.deleteIntegration);

  const searchIntegrations = useQuery(
    api.integrations.queries.searchMyIntegrations,
    searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  );

  // Use search results if searching, otherwise use all integrations
  const displayedIntegrations = searchTerm.trim() ? (searchIntegrations || []) : (myIntegrations || []);

  const handleAddIntegration = async (values: { name: string; mcpUrl: string; apiKey: string }) => {
    try {
      await createIntegrationMutation(values);
      toast.success("Integration added successfully!");
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add integration");
    }
  };

  const handleConnectFromTemplate = async (integration: typeof availableIntegrations[0]) => {
    try {
      await createIntegrationMutation({
        name: integration.name,
        mcpUrl: integration.mcpUrl,
        apiKey: "",
      });
      toast.success(`${integration.name} integration added successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${integration.name} integration`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteIntegrationMutation({ integrationId: deleteTarget.id });
      toast.success("Integration deleted successfully!");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete integration");
    }
  };

  const filteredIntegrations = availableIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only show loading for data, not auth (layout handles auth loading)
  if (myIntegrations === undefined) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading integrations...</span>
        </div>
      </div>
    );
  }

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

          <AddIntegrationDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleAddIntegration}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        integrationName={deleteTarget?.name || ""}
        onConfirm={handleConfirmDelete}
      />

      {/* My Integrations Section */}
      {displayedIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-muted-foreground mb-4">My Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedIntegrations.map((integration) => (
              <MyIntegrationCard
                key={integration._id}
                integration={integration}
                onDelete={(id, name) => setDeleteTarget({ id: id as Id<"integrations">, name })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Integration Templates Section */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-muted-foreground mb-4">
          Available Integration Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map((integration) => {
            const isAlreadyAdded = myIntegrations?.some(myIntegration =>
              myIntegration.name === integration.name && myIntegration.mcpUrl === integration.mcpUrl
            );

            return (
              <TemplateIntegrationCard
                key={integration.name}
                integration={integration}
                isAlreadyAdded={isAlreadyAdded}
                onConnect={() => handleConnectFromTemplate(integration)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
