import React from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface RemoveIntegrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const RemoveIntegrationDialog: React.FC<RemoveIntegrationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Integration</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove this integration from the workflow?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-700 text-white hover:bg-red-500"
                    >
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};