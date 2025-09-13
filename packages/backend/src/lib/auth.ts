import { type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { authComponent } from "../convex/auth";
import { phoneNumber } from "better-auth/plugins";
import { internal } from "../convex/_generated/api";
import { DataModel } from "../convex/_generated/dataModel";

const getSiteUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};


export const createAuth = (ctx: GenericCtx<DataModel>) =>
  // Configure your Better Auth instance here
  betterAuth({
    // All auth requests will be proxied through your next.js server
    baseURL: getSiteUrl(),
    database: authComponent.adapter(ctx),

    // Simple non-verified email/password to get started
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [
      // The Convex plugin is required
      convex(),
      phoneNumber({
        sendOTP: async ({ phoneNumber, code }) => {
          if ('scheduler' in ctx) {
            await ctx.scheduler.runAfter(0, internal.twilio.actions.sendOTPAction, { phoneNumber, code });
          } else {
            throw new Error('Scheduler not available in this context');
          }
        },
        signUpOnVerification: {
          getTempEmail: (phoneNumber) => `${phoneNumber}@temp.local`,
          getTempName: (phoneNumber) => phoneNumber,
        },
        // Configure OTP settings
        otpLength: 6,
        expiresIn: 300, // 5 minutes
      }),
    ],
  });
