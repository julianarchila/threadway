"use client"

import { api } from "@whatsapp-mcp-client/backend/convex/api"
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel"

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Mail,
  Calendar,
  FileText,
  Database,
  Hammer,
  GitBranch,
  Grid3X3,
  FileSpreadsheet,
  Github,
  HardDrive,
  Blocks,
  ArrowUpRight,
  Figma
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

// Define icons for each integration
const integrationIcons = {
  Gmail: Mail,
  "Google Calendar": Calendar,
  Notion: FileText,
  Airtable: Database,
  Linear: GitBranch,
  "Google Sheets": FileSpreadsheet,
  "Google Docs": FileText,
  GitHub: Github,
  Supabase: Database,
  "Google Drive": HardDrive,
  "Figma": Figma,
};

// Available integrations data
const availableIntegrations = [
  { name: "Notion" },
  { name: "Airtable" },
  { name: "Linear" },
  { name: "GitHub" },
  { name: "Supabase" },
  { name: "Figma" }
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mcpName, setMcpName] = useState("");
  const [mcpUrl, setMcpUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Add queries and mutations for integrations here
  // const integrations = useQuery(api.integrations.listIntegrations);
  // const addIntegrationMutation = useMutation(api.integrations.addIntegration);

  // Using mock data for now
  const integrations = availableIntegrations;

  const handleAddMCPServer = () => {
    // Logic to add a custom MCP server
    console.log("MCP Server added:", { name: mcpName, url: mcpUrl });

    // Reset form fields
    setMcpName("");
    setMcpUrl("");

    // Close dialog
    setIsDialogOpen(false);
  };

  const handleConnectIntegration = (integrationName: string) => {
    // Logic to connect an integration
    console.log(`Connecting to ${integrationName}`);
  };

  const filteredIntegrations = integrations.filter(integration =>
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

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full"
          />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add MCP Server</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add MCP Server</DialogTitle>
                <DialogDescription>
                  Enter the server name and URL to add a new MCP server integration:
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={mcpName}
                    onChange={(e) => setMcpName(e.target.value)}
                    placeholder="Integration name..."
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    value={mcpUrl}
                    onChange={(e) => setMcpUrl(e.target.value)}
                    placeholder="https://..."
                    className="col-span-3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMCPServer}
                  disabled={!mcpName.trim() || !mcpUrl.trim()}
                >
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Available Integrations Section */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-muted-foreground mb-4">
          Available Integrations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map((integration) => {
            const IconComponent = integrationIcons[integration.name as keyof typeof integrationIcons] || Hammer;

            return (
              <Card
                key={integration.name}
                className="group hover:shadow-md transition-shadow cursor-pointer border-2 border-border/50"
                onClick={() => handleConnectIntegration(integration.name)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {integration.name}
                        </CardTitle>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectIntegration(integration.name);
                      }}
                    >
                      <span>Connect</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No integrations found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}