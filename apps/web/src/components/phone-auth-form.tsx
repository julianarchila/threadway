"use client"

import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PhoneInput } from "./ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhoneAuthForm() {
  const router = useRouter();
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
            router.push("/dashboard");
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
      <div className="mx-auto w-full mt-10 max-w-md p-6">
        <h1 className="mb-6 text-center text-3xl font-bold">Welcome</h1>
        <p className="mb-6 text-center text-gray-600">
          Enter your phone number to sign in or create an account
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            phoneForm.handleSubmit();
          }}
          className="space-y-4"
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
                {state.isSubmitting ? "Sending OTP..." : "Continue"}
              </Button>
            )}
          </phoneForm.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          We'll send you a verification code to authenticate your account.
          <br />
          New users will automatically get an account created.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Verify Code</h1>
      <p className="mb-6 text-center text-gray-600">
        Enter the 6-digit code sent to {phoneNumber}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          otpForm.handleSubmit();
        }}
        className="space-y-4"
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
              {state.isSubmitting || isVerifying ? "Verifying..." : "Verify & Continue"}
            </Button>
          )}
        </otpForm.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={() => setStep("phone")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to phone number
        </Button>
      </div>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={() => {
            setPhoneNumber("");
            phoneForm.reset();
            toast.info("Resending OTP...");
            phoneForm.handleSubmit();
          }}
          className="text-indigo-600 hover:text-indigo-800 text-sm"
        >
          Didn't receive code? Resend
        </Button>
      </div>
    </div>
  );
}
