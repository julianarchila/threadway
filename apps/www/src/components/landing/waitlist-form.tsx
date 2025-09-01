"use client"

import * as React from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WaitlistState } from "@/app/actions/waitlist"
import { joinWaitlist } from "@/app/actions/waitlist"

type WaitlistFormProps = {
  className?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_12px_28px_-12px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01]"
    >
      {pending ? "Joining…" : "Join the Waitlist"}
    </Button>
  )
}

export default function WaitlistForm({ className }: WaitlistFormProps) {
  const [state, action] = useActionState<WaitlistState, FormData>(joinWaitlist, {})
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#waitlist") {
      inputRef.current?.focus()
    }
  }, [])

  return (
    <div className={cn("w-full", className)}>
      {state?.success ? (
        <div className={cn(
          "rounded-md border px-4 py-3 text-sm",
          state.alreadyExists
            ? "border-blue-200/60 bg-blue-50/70 text-blue-900 dark:border-blue-700/40 dark:bg-blue-900/20 dark:text-blue-100"
            : "border-emerald-200/60 bg-emerald-50/70 text-emerald-900 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-100"
        )}>
          {state.message}
        </div>
      ) : (
        <form action={action} noValidate className="w-full">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="email"
                name="email"
                inputMode="email"
                placeholder="you@example.com"
                aria-label="Email address"
                aria-invalid={Boolean(state?.message && !state?.success)}
                aria-describedby="email-error"
              />
              {state?.message && !state?.success ? (
                <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {state.message}
                </p>
              ) : null}
            </div>
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  )
}
