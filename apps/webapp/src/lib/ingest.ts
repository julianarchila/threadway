import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook } from "./kapso";

import { systemPrompt } from "@/agent/prompts";
import { getCurrentUser, loadUserTools } from "@/agent/data"; import { kapsoChannel } from "@/lib/agent/channel";
import { getOrCreateThreadByUser, listRecentMessages, appendMessage, setMessageStatus } from "@/lib/agent/state/api";
import { toModelMessages } from "@/lib/agent/state/serializers";
import { runAgent } from "@/lib/agent/llm/run-agent";

export const inngest = new Inngest({ id: "my-app" });
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

    console.log("[agent] kapso webhook received");

    const normalized = kapsoChannel.normalizeInbound(JSON.parse(event.data.raw))
    const from = normalized.from
    const body = normalized.text || ""
    console.log("[agent] normalized inbound", { from, hasText: Boolean(body), sourceId: normalized.sourceId })

    const user = await step.run("get-current-user",
      async () => getCurrentUser({ userPhoneNumber: from })
    )

    if (!user) {
      console.log("[agent] user not found, sending welcome", { from })
      await step.run("send-welcome-message", async () => {
        await kapsoChannel.sendText(from, welcomeMessage)
      })
      return
    }

    console.log("[agent] user found", { userId: user._id })

    // Load user tools

    const thread = await step.run("get-or-create-thread", async () => getOrCreateThreadByUser(user._id))
    console.log("[agent] using thread", { threadId: thread._id })

    const inboundMessageId = await step.run("persist-inbound", async () =>
      appendMessage({
        threadId: thread._id,
        userId: user._id,
        status: "pending",
        msg: {
          role: "user",
          content: body
        }
      })
    )
    console.log("[agent] inbound persisted", { inboundMessageId })

    const historyDocs = await step.run("fetch-history", async () => listRecentMessages({ threadId: thread._id, limit: 20 }))
    const history = toModelMessages(historyDocs).reverse()

    const textResponse = await step.run("run-agent", async () => {
      return runAgent({
        systemPrompt,
        history,
        userInput: body,
        userId: user._id,
        from,
        threadId: thread._id
      })
    })
    console.log("[agent] agent output length", { length: (textResponse || "").length })

    await step.run("send-response", async () => {
      await kapsoChannel.sendText(from, textResponse || genericChatErrorMessage)
      await setMessageStatus({ messageId: inboundMessageId as any, status: "success" })
      /*       await setMessageStatus({ messageId: assistantMessageId as any, status: "success" }) */
    })
    console.log("[agent] response sent and statuses updated")

  })

// Add the function to the exported array:
export const functions = [
  helloWorld,
  incommingKapsoMessage
];




