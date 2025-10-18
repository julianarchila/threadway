import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook } from "./kapso";

export const inngest = new Inngest({ id: "my-app" });

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

    console.log(`Received message from ${from}: ${body}`)
  })

// Add the function to the exported array:
export const functions = [
  helloWorld,
  incommingKapsoMessage
];
