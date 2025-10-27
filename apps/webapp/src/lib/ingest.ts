import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook, whatsappClient, KAPSO_PHONE_NUMBER_ID } from "./kapso";

import { generateText } from "ai"
import { openai } from '@ai-sdk/openai';

import { systemPrompt } from "@/agent/prompts"
import { getCurrentUser, loadUserTools } from "@/agent/data";

export const inngest = new Inngest({ id: "my-app" });
const SUPER_SECRET = process.env.AGENT_SECRET || ""
const landingPageUrl = "https://threadway.app"
const welcomeMessage = `Welcome to Threadway! I'm your personal assistant here to help you manage tasks, answer questions, and automate your notes-to-self pad. To join the waitlist visist: ${landingPageUrl}`


const genericChatErrorMessage = `Sorry, I encountered an error while processing your request. Please try again later.`
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

    const user = await step.run("get-current-user",
      async () => getCurrentUser({ userPhoneNumber: from })
    )

    if (!user) {
      await step.run("send-welcome-message", async () => {
        whatsappClient.messages.sendText({
          phoneNumberId: KAPSO_PHONE_NUMBER_ID,
          to: from,
          body: welcomeMessage,
        })
      })
      return
    }


    // Load user tools
    const connectedToolkits = await step.run("fetch-connected_toolkits", async () => {
      const toolsRes = await loadUserTools(user._id)
      if (toolsRes.isErr()) {
        // send generic error message
        await whatsappClient.messages.sendText({
          phoneNumberId: KAPSO_PHONE_NUMBER_ID,
          to: from,
          body: genericChatErrorMessage,
        })
        throw new NonRetriableError("failed to load user tools", toolsRes.error)
      }

      return toolsRes.value

    })

    const textResponse = await step.run("run-agent", async () => {
      const result = await generateText({
        model: openai("gpt-4.1"),
        messages: [
          { role: "user", content: body }
        ],
        system: systemPrompt
      })
      return result.text
    })





    await step.run("echo-message-back", async () => {

      await whatsappClient.messages.sendText({
        phoneNumberId: KAPSO_PHONE_NUMBER_ID,
        to: from,
        body: textResponse || genericChatErrorMessage,
      })
    })

  })

// Add the function to the exported array:
export const functions = [
  helloWorld,
  incommingKapsoMessage
];




