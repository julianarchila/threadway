"use client";

import { useState } from "react";
// import { useForm } from "@tanstack/react-form"; // COMMENTED: Only used for OTP flow
import { toast } from "sonner";
// import z from "zod"; // COMMENTED: Only used for OTP flow
import { useQuery, useAction } from "convex/react";
import { api } from "@threadway/backend/convex/api";
// import { authClient } from "@/lib/auth-client"; // COMMENTED: Only used for OTP flow
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label"; // COMMENTED: Only used for OTP flow
// import { PhoneInput } from "@/components/ui/phone-input"; // COMMENTED: Only used for OTP flow
// import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"; // COMMENTED: Only used for OTP flow
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MessageCircle, Check, ExternalLink } from "lucide-react";

// type RegistrationStep = "choice" | "phone" | "otp" | "kapso"; // COMMENTED: Using only Kapso now
type RegistrationStep = "choice"; // Only showing choice screen for Kapso

interface PhoneRegistrationFormProps {
    onSuccess?: () => void;
}

export default function PhoneRegistrationForm({ onSuccess }: PhoneRegistrationFormProps) {
    const [step, setStep] = useState<RegistrationStep>("choice");
    // COMMENTED: These are only for OTP flow
    // const [phoneNumber, setPhoneNumber] = useState("");
    // const [isVerifying, setIsVerifying] = useState(false);
    // const [isPhoneValid, setIsPhoneValid] = useState(false);

    // Query to get WhatsApp connection status
    const whatsappStatus = useQuery(api.kapso.queries.getWhatsAppConnectionStatus);

    // Action to create Kapso setup link
    const createSetupLink = useAction(api.kapso.actions.createWhatsAppSetupLink);

    /* COMMENTED: OTP/Twilio flow - We only use Kapso now
    const phoneForm = useForm({
        defaultValues: {
            phoneNumber: "",
        },
        onSubmit: async ({ value }) => {
            setPhoneNumber(value.phoneNumber);
            await authClient.phoneNumber.sendOtp(
                {
                    phoneNumber: value.phoneNumber,
                },
                {
                    onSuccess: () => {
                        setStep("otp");
                        toast.success("OTP sent to your phone");
                    },
                    onError: (error: any) => {
                        toast.error(error.error.message || "Failed to send OTP");
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                phoneNumber: z.string().min(10, "Please enter a valid phone number"),
            }),
        },
    });

    const otpForm = useForm({
        defaultValues: {
            otp: "",
        },
        onSubmit: async ({ value }) => {
            setIsVerifying(true);
            await authClient.phoneNumber.verify(
                {
                    phoneNumber: phoneNumber,
                    code: value.otp,
                    disableSession: true,
                    updatePhoneNumber: true
                },
                {
                    onSuccess: () => {
                        toast.success("Phone number registered successfully!");
                        onSuccess?.();
                    },
                    onError: () => {
                        setIsVerifying(false);
                        toast.error("Invalid OTP");
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                otp: z.string().length(6, "OTP must be 6 digits"),
            }),
        },
    });
    */

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
                                        ? "Coexistence Mode (App + API)"
                                        : "Dedicated Mode (API Only)"}
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
    if (step === "choice") {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">Connect WhatsApp Business</DialogTitle>
                    <DialogDescription className="text-sm">
                        Choose how you want to connect your WhatsApp
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {/* Option 1: Connect existing WhatsApp Business - Only coexistence mode */}
                    <button
                        onClick={async () => {
                            try {
                                const result = await createSetupLink({
                                    provisionPhoneNumber: false,
                                    connectionTypes: ["coexistence"], // Solo coexistence - mantiene la app activa
                                });

                                // Open Kapso setup link in new tab
                                window.open(result.setupUrl, '_blank');
                            } catch (error) {
                                toast.error("Failed to create setup link");
                                console.error(error);
                            }
                        }}
                        className="p-5 bg-transparent rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all text-left group cursor-pointer"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                                <MessageCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1">
                                    Connect Your WhatsApp Business
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Link your existing WhatsApp Business account and keep using your app.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span>Start Setup</span>
                                    <ExternalLink className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Option 2: Request a new phone number - Only dedicated mode */}
                    <button
                        onClick={async () => {
                            try {
                                const result = await createSetupLink({
                                    provisionPhoneNumber: true,
                                    connectionTypes: ["dedicated"], // Solo dedicated - API only
                                });

                                // Open Kapso setup link in new tab
                                window.open(result.setupUrl, '_blank');
                            } catch (error) {
                                toast.error("Failed to create setup link");
                                console.error(error);
                            }
                        }}
                        className="p-5 bg-transparent rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all text-left group cursor-pointer"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                                <Phone className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1">
                                    Get a New WhatsApp Number
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    We'll provision a new US phone number for your WhatsApp Business API.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-medium">
                                    <span>Start Setup</span>
                                    <ExternalLink className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-card rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-muted-foreground">
                        <strong>Note:</strong> You'll be redirected to complete the WhatsApp setup securely.
                        The process takes about 5 minutes.
                    </p>
                </div>
            </div>
        );
    }

    /* COMMENTED: OTP/Twilio fallback registration - We only use Kapso now
    // User doesn't have WhatsApp connected - show choice or phone registration
    if (step === "phone") {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">Register Phone Number</DialogTitle>
                    <DialogDescription className="text-sm">
                        Add your phone number (fallback registration method)
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        phoneForm.handleSubmit();
                    }}
                    className="space-y-4 mt-6"
                >
                    <div>
                        <phoneForm.Field name="phoneNumber">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-sm font-medium">
                                        Phone Number
                                    </Label>
                                    <PhoneInput
                                        id={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(value) => field.handleChange(value)}
                                        onValidationChange={setIsPhoneValid}
                                        defaultCountry="US"
                                        placeholder="Enter your phone number"
                                        className="h-11"
                                    />
                                    {field.state.meta.errors.map((error) => (
                                        <p key={error?.message} className="text-red-500 text-xs">
                                            {error?.message}
                                        </p>
                                    ))}
                                    <p className="text-xs text-muted-foreground">
                                        This number will be used to connect with Threadway via WhatsApp
                                    </p>
                                </div>
                            )}
                        </phoneForm.Field>
                    </div>

                    <phoneForm.Subscribe>
                        {(state) => (
                            <Button
                                type="submit"
                                className="w-full h-11 mt-6"
                                disabled={!state.canSubmit || state.isSubmitting || !isPhoneValid}
                            >
                                {state.isSubmitting ? "Sending verification..." : "Send Verification Code"}
                            </Button>
                        )}
                    </phoneForm.Subscribe>
                </form>
            </div>
        );
    }

    // OTP verification step
    return (
        <div className="w-full max-w-md mx-auto">
            <DialogHeader className="text-center space-y-3">
                <DialogTitle className="text-lg sm:text-xl">Verify Phone Number</DialogTitle>
                <DialogDescription className="text-sm">
                    Enter the 6-digit code sent to
                    <span className="font-mono font-medium text-foreground ml-1">
                        {phoneNumber}
                    </span>
                </DialogDescription>
            </DialogHeader>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    otpForm.handleSubmit();
                }}
                className="space-y-6 mt-6"
            >
                <div>
                    <otpForm.Field name="otp">
                        {(field) => (
                            <div className="space-y-4">
                                <Label htmlFor={field.name} className="text-sm font-medium text-center block">
                                    Verification Code
                                </Label>
                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={field.state.value}
                                        onChange={(value) => field.handleChange(value)}
                                        onBlur={field.handleBlur}
                                    >
                                        <InputOTPGroup className="gap-2">
                                            <InputOTPSlot index={0} className="h-12 w-10 sm:h-14 sm:w-12" />
                                            <InputOTPSlot index={1} className="h-12 w-10 sm:h-14 sm:w-12" />
                                            <InputOTPSlot index={2} className="h-12 w-10 sm:h-14 sm:w-12" />
                                            <InputOTPSlot index={3} className="h-12 w-10 sm:h-14 sm:w-12" />
                                            <InputOTPSlot index={4} className="h-12 w-10 sm:h-14 sm:w-12" />
                                            <InputOTPSlot index={5} className="h-12 w-10 sm:h-14 sm:w-12" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500 text-xs text-center">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </otpForm.Field>
                </div>

                <otpForm.Subscribe>
                    {(state) => (
                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={!state.canSubmit || state.isSubmitting || isVerifying}
                        >
                            {state.isSubmitting || isVerifying ? "Verifying..." : "Verify & Register"}
                        </Button>
                    )}
                </otpForm.Subscribe>
            </form>

            <div className="mt-6 space-y-3">
                <Button
                    variant="ghost"
                    onClick={() => setStep("phone")}
                    className="w-full text-muted-foreground hover:text-foreground"
                    size="sm"
                >
                    ← Back to phone number
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => {
                        setPhoneNumber("");
                        phoneForm.reset();
                        toast.info("Resending verification code...");
                        phoneForm.handleSubmit();
                    }}
                    className="w-full text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    size="sm"
                >
                    Didn't receive the code? Resend
                </Button>
            </div>
        </div>
    );
    */

    // Default: return null since all flows are now handled above
    return null;
}
