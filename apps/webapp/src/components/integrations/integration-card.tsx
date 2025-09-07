import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  FileText,
  Database,
  Hammer,
  GitBranch,
  Github,
  HardDrive,
  Figma,
  SunMoon,
  Trash2,
  ArrowUpRight,
  CheckCircle,
  SheetIcon
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@threadway/backend/convex/api";
import { toast } from "sonner";
import { Id } from "@threadway/backend/convex/dataModel";

const integrationIcons = {
  GMAIL: Mail,
  Notion: FileText,
  Airtable: Database,
  LINEAR: GitBranch,
  GitHub: Github,
  Supabase: Database,
  Figma: Figma,
  Weather: SunMoon,
  Jira: HardDrive,
  GOOGLESHEETS: SheetIcon,
};

interface MyIntegrationCardProps {
  integration: {
    _id: Id<"connections">;
    name: string;
  };
  onDelete: (id: string, name: string) => void;
}

interface TemplateIntegrationCardProps {
  integration: {
    name: string;
    authConfigId: string;
  };
  isAlreadyAdded: boolean;
}

export function MyIntegrationCard({ integration, onDelete }: MyIntegrationCardProps) {
  const IconComponent = integrationIcons[integration.name as keyof typeof integrationIcons] || Hammer;

  return (
    <Card className="group hover:shadow-md transition-shadow border-2 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 rounded-lg bg-muted">
              <IconComponent className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-medium">{integration.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{"WIP"}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            aria-label={`Remove ${integration.name}`}
            title={`Remove ${integration.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(integration._id, integration.name);
            }}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export function TemplateIntegrationCard({
  integration,
  isAlreadyAdded,
}: TemplateIntegrationCardProps) {
  const IconComponent = integrationIcons[integration.name as keyof typeof integrationIcons] || Hammer;
  const createConnectionAction = useAction(api.integrations.actions.createConnectionWithUrl)

  const handleConnect = async () => {
    try {
      const {redirectUrl}= await createConnectionAction({
        authConfigId: integration.authConfigId,
      })


      window.open(redirectUrl, '_blank');


      toast.success(`${integration.name} integration added successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${integration.name} integration`);
    }
  };

  return (
    <Card
      className={`group hover:shadow-md transition-shadow border-2 ${isAlreadyAdded
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer border-border/50 hover:border-primary/20'
        }`}
      role={!isAlreadyAdded ? 'button' : undefined}
      tabIndex={!isAlreadyAdded ? 0 : -1}
      aria-disabled={isAlreadyAdded}
      onKeyDown={(e) => {
        if (isAlreadyAdded) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleConnect();
        }
      }}
      onClick={() => !isAlreadyAdded && handleConnect()}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-muted">
              <IconComponent className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {integration.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {"No description available (WIP)"}
              </p>
            </div>
          </div>

          {isAlreadyAdded ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">Added</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center space-x-1"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleConnect();
              }}
            >
              <span>Connect</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
