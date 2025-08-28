import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { FormField } from "./form-field";

interface AddIntegrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { name: string; mcpUrl: string; apiKey: string }) => Promise<void>;
}

export function AddIntegrationDialog({ isOpen, onOpenChange, onSubmit }: AddIntegrationDialogProps) {
  const mcpForm = useForm({
    defaultValues: {
      name: '',
      mcpUrl: '',
      apiKey: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name.trim(),
        mcpUrl: value.mcpUrl.trim(),
        apiKey: value.apiKey.trim() || "",
      });
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    mcpForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onClick={handleClose}
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
  );
}
