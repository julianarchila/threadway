"use server"

import { z } from "zod"

const EmailSchema = z.string().email()

export type WaitlistState = {
  success?: boolean
  message?: string
  email?: string
}

export async function joinWaitlist(
  _prevState: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const raw = formData.get("email")
  const email = typeof raw === "string" ? raw.trim() : ""
  const parsed = EmailSchema.safeParse(email)
  if (!parsed.success) {
    return { success: false, message: "Enter a valid email" }
  }

  // TODO: Persist to Convex or external service
  console.log("Waitlist signup:", parsed.data)

  return { success: true, message: "You’re on the list!", email: parsed.data }
}


