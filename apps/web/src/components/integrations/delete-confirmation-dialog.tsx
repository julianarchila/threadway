import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, forwardRef, useImperativeHandle } from "react";
import { useMutation } from "convex/react";
import { api } from "@whatsapp-mcp-client/backend/convex/api";
import { toast } from "sonner";
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  integrationId?: Id<"integrations">;
  integrationName?: string;
}

export interface DeleteConfirmationDialogRef {
  openDialog: (id: Id<"integrations">, name: string) => void;
}

export const DeleteConfirmationDialog = forwardRef<DeleteConfirmationDialogRef, DeleteConfirmationDialogProps>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentIntegration, setCurrentIntegration] = useState<{ id: Id<"integrations">; name: string } | null>(null);
    const deleteIntegrationMutation = useMutation(api.integrations.mutations.deleteIntegration);

    useImperativeHandle(ref, () => ({
      openDialog: (id: Id<"integrations">, name: string) => {
        setCurrentIntegration({ id, name });
        setIsOpen(true);
      }
    }));

    const handleConfirm = async () => {
      if (!currentIntegration) return;

      setIsDeleting(true);
      try {
        await deleteIntegrationMutation({ integrationId: currentIntegration.id });
        toast.success("Integration deleted successfully!");
        setIsOpen(false);
        setCurrentIntegration(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete integration");
      } finally {
        setIsDeleting(false);
      }
    };

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        setCurrentIntegration(null);
      }
    };

    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{currentIntegration?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-700 text-white hover:bg-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

DeleteConfirmationDialog.displayName = "DeleteConfirmationDialog";