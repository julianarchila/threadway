import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook, whatsappClient, KAPSO_PHONE_NUMBER_ID } from "./kapso";

import { api } from '@threadway/backend/convex/api';
import { convexClient } from "./convex";

export const inngest = new Inngest({ id: "my-app" });
const SUPER_SECRET = "temp-secret"

// Your new function:
const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    console.log("WIP")
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);


const incommingKapsoMessage = inngest.createFunction(
  { id: "incoming-kapso-message" },
  { event: "kapso/whatsapp.message.received" },
  async ({ event, step }) => {

    const isValid = verifyWebhook(event.data.raw, event.data.sig)
    if (!isValid) {
      throw new NonRetriableError("failed signature verificatioon")
    }

    const data = JSON.parse(event.data.raw)

    const from = data.conversation.phone_number
    const body = data.message.content

    const user = await step.run("get-current-user", async () => {
      const user = await convexClient.query(api.agent.queries.getUserByPhoneNumber, {
        phoneNumber: from,
        secret: SUPER_SECRET
      })

      if (!user) {
        throw new NonRetriableError("User not found")
      }
      return user

    })

    console.log("Current user:", user)


    await whatsappClient.messages.sendText({
      phoneNumberId: KAPSO_PHONE_NUMBER_ID,
      to: from,
      body: `You said: ${body}`,
    })

  })

// Add the function to the exported array:
export const functions = [
  helloWorld,
  incommingKapsoMessage
];
