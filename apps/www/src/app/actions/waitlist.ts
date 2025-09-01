"use server"

import { z } from "zod"
import { LoopsClient, APIError } from "loops"
import { env } from "@env"

const EmailSchema = z.string().email()

export type WaitlistState = {
  success?: boolean
  message?: string
  email?: string
  alreadyExists?: boolean
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

  try {
    const loops = new LoopsClient(env.LOOPS_API_KEY)
    
    // First, check if the contact already exists
    const existingContacts = await loops.findContact({ email: parsed.data })
    
    if (existingContacts.length > 0) {
      // Contact already exists
      return { 
        success: true, 
        alreadyExists: true,
        message: "You're already on our waitlist! We'll email you when it's ready.", 
        email: parsed.data 
      }
    }

    // Create new contact if they don't exist
    await loops.createContact({ 
      email: parsed.data,
      properties: {
        source: "Website Waitlist"
      }
    })

    return { 
      success: true, 
      message: "You're on the list! We'll email you when it's ready.", 
      email: parsed.data 
    }
  } catch (error) {
    console.error("Loops API error:", error)
    
    if (error instanceof APIError) {
      // Handle specific API errors
      const errorMessage = typeof error.json === 'object' && error.json && 'message' in error.json 
        ? String(error.json.message) 
        : "Something went wrong. Please try again."
      
      if (error.statusCode === 400 && errorMessage.includes("already exists")) {
        return { 
          success: true, 
          alreadyExists: true,
          message: "You're already on our waitlist! We'll email you when it's ready.", 
          email: parsed.data 
        }
      }
      return { 
        success: false, 
        message: errorMessage
      }
    }
    
    return { 
      success: false, 
      message: "Something went wrong. Please try again." 
    }
  }
}
