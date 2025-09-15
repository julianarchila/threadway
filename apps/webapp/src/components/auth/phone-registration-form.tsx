"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { useQuery } from "convex/react";
import { api } from "@threadway/backend/convex/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MessageCircle } from "lucide-react";

// WhatsApp URL with predefined message
const WA_URL = `https://wa.me/message/RZEXMJPBWCZRG1?text=${encodeURIComponent("Hello! I would like to get started with Threadway.")}`;

interface PhoneRegistrationFormProps {
    onSuccess?: () => void;
}

export default function PhoneRegistrationForm({ onSuccess }: PhoneRegistrationFormProps) {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(false);

    // Query to get the current user's phone number
    const userPhoneNumber = useQuery(api.user.queries.phoneNumber);

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

    // Loading state
    if (userPhoneNumber === undefined) {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">Register Phone Number</DialogTitle>
                    <DialogDescription className="text-sm">
                        Loading your phone number information...
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

    // User already has a registered phone number
    if (userPhoneNumber) {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">
                        Phone Number Registered
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Your phone number is registered and ready to use
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    {/* Show the registered phone number */}
                    <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                                    Registered Number
                                </p>
                                <p className="font-mono text-sm sm:text-base font-medium text-green-900 dark:text-green-100 truncate">
                                    {userPhoneNumber}
                                </p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 whitespace-nowrap">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mt-0.5">
                                <MessageCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                                    Try Threadway via WhatsApp
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Send a message to get started
                                </p>
                            </div>
                        </div>

                        {/* Mobile-optimized phone number display */}
                        <div className="space-y-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <p className="font-mono text-center text-blue-900 dark:text-blue-100 text-sm sm:text-base font-medium">
                                    +57 3027842717
                                </p>
                            </div>

                            {/* Mobile-optimized buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText("+573027842717");
                                        toast.success("Phone number copied!");
                                    }}
                                    className="flex-1 h-11 text-sm font-medium"
                                >
                                    📋 Copy Number
                                </Button>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="flex-1 h-11 text-sm font-medium bg-green-50 hover:bg-green-100 dark:bg-green-950/20 border-green-200 hover:border-green-300 dark:border-green-800"
                                >
                                    <a
                                        href={WA_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span className="text-green-600">💬</span>
                                        Open WhatsApp
                                    </a>
                                </Button>
                            </div>
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

    // User doesn't have a registered phone number - show registration form
    if (step === "phone") {
        return (
            <div className="w-full max-w-md mx-auto">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">Register Phone Number</DialogTitle>
                    <DialogDescription className="text-sm">
                        Add your phone number to start using Threadway via WhatsApp
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
}
