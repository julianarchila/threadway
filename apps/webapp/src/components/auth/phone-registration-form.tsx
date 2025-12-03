"use client";

// No React hooks needed here; component renders based on queries only
import { toast } from "sonner";
import { useQuery, useAction } from "convex/react";
import { api } from "@threadway/backend/convex/api";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MessageCircle, Check, ExternalLink } from "lucide-react";


interface PhoneRegistrationFormProps {
    onSuccess?: () => void;
}

export default function PhoneRegistrationForm({ onSuccess }: PhoneRegistrationFormProps) {
    // We only use Kapso setup links on this component (no OTP / Twilio flow)

    // Query to get WhatsApp connection status
    const whatsappStatus = useQuery(api.kapso.queries.getWhatsAppConnectionStatus);

    const createSetupLink = useAction(api.kapso.actions.createWhatsAppSetupLink);

    // Loading state
    if (whatsappStatus === undefined) {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">Connect WhatsApp</DialogTitle>
                    <DialogDescription className="text-sm">
                        Loading your connection status...
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                    <Skeleton className="h-11 w-full" />
                </div>
            </div>
        );
    }

    // User already has WhatsApp connected
    if (whatsappStatus?.isConnected) {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">
                        WhatsApp Connected
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Your WhatsApp Business account is connected and ready to use
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                                    Connection Status
                                </p>
                                <p className="font-medium text-sm sm:text-base text-green-900 dark:text-green-100">
                                    {whatsappStatus.connectionType === "coexistence"
                                        ? "Connected (App + Automation)"
                                        : "Connected (Automation Only)"}
                                </p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 whitespace-nowrap">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={onSuccess}
                        className="w-full mt-6 h-10"
                        variant="outline"
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    // Choice between connecting own number or requesting new one
    return (
        <div className="w-full max-w-md mx-auto">
            <DialogHeader className="text-center space-y-3">
                <DialogTitle className="text-lg sm:text-xl">Connect WhatsApp Business</DialogTitle>
                <DialogDescription className="text-sm">
                    Choose how you want to connect your WhatsApp
                </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
                {/* Option 1: Connect existing WhatsApp Business */}
                <button
                    onClick={async () => {
                        try {
                            const result = await createSetupLink({
                                provisionPhoneNumber: false,
                                connectionTypes: ["coexistence"],
                            });

                            // Open Kapso setup link in new tab
                            window.open(result.setupUrl);
                        } catch (error) {
                            toast.error("Failed to create setup link");
                            console.error(error);
                        }
                    }}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer"
                >
                    <div className="flex items-start gap-3">
                        <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                                Connect your WhatsApp Business
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Keep using your WhatsApp app normally while we automate your messages.
                            </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                </button>

                {/* Option 2: Get dedicated number */}
                <button
                    onClick={async () => {
                        try {
                            const result = await createSetupLink({
                                provisionPhoneNumber: true,
                                connectionTypes: ["dedicated"],
                            });

                            // Open Kapso setup link in new tab
                            window.open(result.setupUrl);
                        } catch (error) {
                            toast.error("Failed to create setup link");
                            console.error(error);
                        }
                    }}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer"
                >
                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                                Get a new dedicated number
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                We'll provide a new number exclusively for automated messages.
                            </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                </button>

                {/* Setup info */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-card rounded-md border border-gray-200">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Note: You'll be redirected to complete the connection. Takes about 5 minutes.
                    </p>
                </div>
            </div>
        </div>
    );
}
