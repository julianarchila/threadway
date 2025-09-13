"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@threadway/backend/convex/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, CheckCircle2, MessageCircle } from "lucide-react";
import { parsePhoneNumberWithError } from "libphonenumber-js";

// WhatsApp URL with predefined message
const WA_URL = `https://wa.me/message/RZEXMJPBWCZRG1?text=${encodeURIComponent("Alo")}`;

interface PhoneRegistrationFormProps {
    onSuccess?: () => void;
}

export default function PhoneRegistrationForm({ onSuccess }: PhoneRegistrationFormProps) {
    const [isPhoneValid, setIsPhoneValid] = useState(false);

    // Only query authorized phones - this determines everything
    const authorizedPhones = useQuery(api.phoneAuthorization.queries.getUserAuthorizedPhones, {});

    // Mutation to register phone number
    const registerPhone = useMutation(api.phoneAuthorization.mutations.createAuthorizedPhone);

    const form = useForm({
        defaultValues: {
            phoneNumber: "",
        },
        onSubmit: async ({ value }) => {
            try {
                // Parse the phone number to extract country code and national number
                const parsed = parsePhoneNumberWithError(value.phoneNumber);

                const phoneCountryCode = `+${parsed.countryCallingCode}`;
                const phoneNumber = value.phoneNumber; // Keep the full international format

                await registerPhone({
                    phoneNumber: phoneNumber,
                    phoneCountryCode: phoneCountryCode,
                    alias: "My Phone",
                    accessType: "ALL",
                });
                toast.success("Phone number registered successfully!");
                onSuccess?.();
            } catch (error: any) {
                toast.error(error.message || "Failed to register phone number");
            }
        },
        validators: {
            onSubmit: z.object({
                phoneNumber: z.string().min(10, "Please enter a valid phone number"),
            }),
        },
    });

    // Loading state
    if (authorizedPhones === undefined) {
        return (
            <div className="w-full space-y-4">
                <DialogHeader>
                    <DialogTitle>Register Phone Number</DialogTitle>
                    <DialogDescription>
                        Loading your phone number information...
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    // User already has authorized phone numbers
    if (authorizedPhones && authorizedPhones.length > 0) {
        return (
            <div className="w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Phone Numbers Authorized
                    </DialogTitle>
                    <DialogDescription>
                        Your phone number is registered and ready to use
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    {/* Show authorized phones */}
                    <div className="space-y-2">
                        {authorizedPhones.map((phone) => (
                            <div key={phone._id} className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <Phone className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-green-900 dark:text-green-100 font-mono">
                                        {phone.phoneNumber}
                                    </p>
                                    {phone.alias && (
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            {phone.alias}
                                        </p>
                                    )}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${phone.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                    : phone.status === 'INVITED'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                    }`}>
                                    {phone.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Try Threadway via WhatsApp
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                            You can now test Threadway by sending a message:
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-blue-900 dark:text-blue-100 font-mono text-sm">
                                +57 3027842717
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText("+573027842717");
                                    toast.success("Phone number copied to clipboard!");
                                }}
                                className="text-xs"
                            >
                                Copy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="text-xs"
                            >
                                <a
                                    href={WA_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1"
                                >
                                    <MessageCircle className="h-3 w-3" />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>

                    <Button
                        onClick={onSuccess}
                        className="w-full"
                        variant="outline"
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    // User doesn't have any authorized phones - show registration form
    return (
        <div className="w-full">
            <DialogHeader>
                <DialogTitle>Register Phone Number</DialogTitle>
                <DialogDescription>
                    Add your phone number to start using Threadway via WhatsApp
                </DialogDescription>
            </DialogHeader>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4 mt-4"
            >
                <div>
                    <form.Field name="phoneNumber">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Phone Number</Label>
                                <PhoneInput
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(value) => field.handleChange(value)}
                                    onValidationChange={setIsPhoneValid}
                                    defaultCountry="US"
                                    placeholder="Enter your phone number"
                                />
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500 text-sm">
                                        {error?.message}
                                    </p>
                                ))}
                                <p className="text-xs text-muted-foreground">
                                    This number will be used to connect with Threadway via WhatsApp
                                </p>
                            </div>
                        )}
                    </form.Field>
                </div>

                <form.Subscribe>
                    {(state) => (
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!state.canSubmit || state.isSubmitting || !isPhoneValid}
                        >
                            {state.isSubmitting ? "Registering..." : "Register Phone Number"}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </div>
    );
}
