"use client"

import { api } from "@whatsapp-mcp-client/backend/convex/api"
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Mail,
  FileText,
  Database,
  Hammer,
  GitBranch,
  Github,
  HardDrive,
  Blocks,
  ArrowUpRight,
  Figma,
  SunMoon,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define icons for each integration
const integrationIcons = {
  Gmail: Mail,
  Notion: FileText,
  Airtable: Database,
  Linear: GitBranch,
  GitHub: Github,
  Supabase: Database,
  Figma: Figma,
  Weather: SunMoon,
  Jira: HardDrive,
};

// Available integrations
const availableIntegrations = [
  {
    name: "Weather",
    mcpUrl: "https://mcp-server-wether.vercel.app/mcp/",
    description: "Get weather information and forecasts"
  },
  {
    name: "Notion",
    mcpUrl: "https://www.notion.so/",
    description: "Connect to your Notion workspace"
  },
  {
    name: "Airtable",
    mcpUrl: "https://www.airtable.com/",
    description: "Access your Airtable databases"
  },
  {
    name: "Linear",
    mcpUrl: "https://linear.app/",
    description: "Manage Linear issues and projects"
  },
  {
    name: "GitHub",
    mcpUrl: "https://github.com/",
    description: "Access GitHub repositories"
  },
  {
    name: "Supabase",
    mcpUrl: "https://supabase.com/",
    description: "Connect to Supabase database"
  },
  {
    name: "Figma",
    mcpUrl: "https://www.figma.com/",
    description: "Access Figma designs"
  },
  {
    name: "Jira",
    mcpUrl: "https://www.atlassian.com/software/jira",
    description: "Manage Jira tickets and projects"
  },
];

// Form field component for better reusability
function FormField({ field, label, placeholder, type = "text" }: {
  field: any;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={field.name} className="text-right">
        {label}
      </Label>
      <div className="col-span-3">
        <Input
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          placeholder={placeholder}
        />
        {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
          <p className="text-sm text-red-500 mt-1">
            {field.state.meta.errors[0]}
          </p>
        )}
        {field.state.meta.isValidating && (
          <p className="text-sm text-muted-foreground mt-1">Validating...</p>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"integrations">, name: string } | null>(null);

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const myIntegrations = useQuery(
    api.integrations.queries.getMyIntegrations,
    isAuthenticated ? undefined : "skip"
  );
  const createIntegrationMutation = useMutation(api.integrations.mutations.create);
  const deleteIntegrationMutation = useMutation(api.integrations.mutations.deleteIntegration);

  const searchIntegrations = useQuery(
    api.integrations.queries.searchMyIntegrations,
    isAuthenticated && searchTerm.trim() ? { searchTerm } : "skip"
  );

  // TanStack Form for adding new MCP server
  const mcpForm = useForm({
    defaultValues: {
      name: '',
      mcpUrl: '',
      apiKey: '',
    },
    onSubmit: async ({ value }) => {
      await createIntegrationMutation(
        {
          name: value.name.trim(),
          mcpUrl: value.mcpUrl.trim(),
          apiKey: value.apiKey.trim() || "",
        },
        {
          onSuccess: () => {
            toast.success("Integration added successfully!");
            mcpForm.reset();
            setIsAddDialogOpen(false);
          },
          onError: (error: any) => {
            if (error.message?.includes("not authenticated")) {
              toast.error("Please sign in to add integrations");
            } else {
              toast.error(error.message || "Failed to add integration");
            }
          },
        }
      );
    },
  });

  // Use search results if searching, otherwise use all integrations
  const displayedIntegrations = searchTerm.trim() ? (searchIntegrations || []) : (myIntegrations || []);

  const handleConnectFromIntegration = async (integration: typeof availableIntegrations[0]) => {
    await createIntegrationMutation(
      {
        name: integration.name,
        mcpUrl: integration.mcpUrl,
        apiKey: "",
      },
      {
        onSuccess: () => {
          toast.success(`${integration.name} integration added successfully!`);
        },
        onError: (error: any) => {
          if (error.message?.includes("not authenticated")) {
            toast.error("Please sign in to add integrations");
          } else {
            toast.error(error.message || `Failed to add ${integration.name} integration`);
          }
        },
      }
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    await deleteIntegrationMutation(
      { integrationId: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success("Integration deleted successfully!");
          setDeleteTarget(null);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to delete integration");
        },
      }
    );
  };

  const filteredIntegrations = availableIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground text-center mb-6">
            You need to sign in to access your integrations.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Data loading state
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

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search integrations..."
            className="w-full"
          />

          <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Integration</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-700 text-white hover:bg-red-500">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  Enter the server details to add a new MCP server integration:
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  mcpForm.handleSubmit();
                }}
              >
                <div className="grid gap-4 py-4">
                  <mcpForm.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) =>
                        !value.trim() ? 'Integration name is required' : undefined,
                    }}
                    children={(field) => (
                      <FormField
                        field={field}
                        label="Name"
                        placeholder="Integration name..."
                      />
                    )}
                  />

                  <mcpForm.Field
                    name="mcpUrl"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.trim()) return 'MCP URL is required';
                        
                        try {
                          new URL(value.trim());
                          return undefined;
                        } catch {
                          return 'Please enter a valid URL';
                        }
                      },
                    }}
                    children={(field) => (
                      <FormField
                        field={field}
                        label="URL"
                        placeholder="https://..."
                      />
                    )}
                  />

                  <mcpForm.Field
                    name="apiKey"
                    children={(field) => (
                      <FormField
                        field={field}
                        label="API Key"
                        placeholder="Optional..."
                        type="password"
                      />
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      mcpForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <mcpForm.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Adding...
                          </>
                        ) : (
                          'Add'
                        )}
                      </Button>
                    )}
                  />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* My Integrations */}
      {displayedIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-muted-foreground mb-4">My Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedIntegrations.map((integration) => {
              const IconComponent = integrationIcons[integration.name as keyof typeof integrationIcons] || Hammer;
              return (
                <Card key={integration._id} className="group hover:shadow-md transition-shadow border-2 border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground truncate">{integration.mcpUrl}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget({ id: integration._id, name: integration.name })}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integration Templates */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-muted-foreground mb-4">
          Available Integration Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map((integration) => {
            const IconComponent = integrationIcons[integration.name as keyof typeof integrationIcons] || Hammer;
            const isAlreadyAdded = myIntegrations?.some(myIntegration =>
              myIntegration.name === integration.name && myIntegration.mcpUrl === integration.mcpUrl
            );

            return (
              <Card
                key={integration.name}
                className={`group hover:shadow-md transition-shadow cursor-pointer border-2 ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'border-border/50 hover:border-primary/20'
                  }`}
                onClick={() => !isAlreadyAdded && handleConnectFromIntegration(integration)}
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
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>

                    {isAlreadyAdded ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Added</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectFromIntegration(integration);
                        }}
                      >
                        <span>Connect</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
