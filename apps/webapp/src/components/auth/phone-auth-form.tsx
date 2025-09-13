"use client"

import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PhoneAuthFormProps {
  onSuccess?: () => void;
}

export default function PhoneAuthForm({ onSuccess }: PhoneAuthFormProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

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

  if (step === "phone") {
    return (
      <div className="w-full">
        <DialogHeader>
          <DialogTitle>Register Phone Number</DialogTitle>
          <DialogDescription>
            Add your phone number for enhanced security and notifications
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            phoneForm.handleSubmit();
          }}
          className="space-y-4 mt-4"
        >
          <div>
            <phoneForm.Field name="phoneNumber">
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
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-sm">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </phoneForm.Field>
          </div>

          <phoneForm.Subscribe>
            {(state) => (
              <Button
                type="submit"
                className="w-full"
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

  return (
    <div className="w-full">
      <DialogHeader>
        <DialogTitle>Verify Phone Number</DialogTitle>
        <DialogDescription>
          Enter the 6-digit code sent to {phoneNumber}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          otpForm.handleSubmit();
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <otpForm.Field name="otp">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
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
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting || isVerifying}
            >
              {state.isSubmitting || isVerifying ? "Verifying..." : "Verify & Register"}
            </Button>
          )}
        </otpForm.Subscribe>
      </form>

      <div className="mt-4 space-y-2">
        <Button
          variant="link"
          onClick={() => setStep("phone")}
          className="w-full text-gray-600 hover:text-gray-800"
        >
          ← Back to phone number
        </Button>

        <Button
          variant="link"
          onClick={() => {
            setPhoneNumber("");
            phoneForm.reset();
            toast.info("Resending verification code...");
            phoneForm.handleSubmit();
          }}
          className="w-full text-indigo-600 hover:text-indigo-800 text-sm"
        >
          Didn't receive code? Resend
        </Button>
      </div>
    </div>
  );
}
