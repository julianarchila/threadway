import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook } from "./kapso";

import { systemPrompt } from "@/agent/prompts";
import { getCurrentUser } from "@/lib/agent/state/users";
import { kapsoChannel } from "@/lib/agent/channel";
import { getOrCreateThreadByUser, listRecentMessages, appendMessage, setMessageStatus } from "@/lib/agent/state/api";
import { toModelMessages } from "@/lib/agent/state/serializers";
import { runAgent } from "@/lib/agent/llm/run-agent";
import { GENERIC_CHAT_ERROR_MESSAGE, WELCOME_MESSAGE } from "@/lib/agent/core/constants";
import type { AgentErrorType } from "@/lib/agent/core/errors";

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


const incomingKapsoMessage = inngest.createFunction(
  { id: "incoming-kapso-message" },
  { event: "kapso/whatsapp.message.received" },
  async ({ event, step }) => {

    const isValid = verifyWebhook(event.data.raw, event.data.sig)
    if (!isValid) {
      throw new NonRetriableError("failed signature verification")
    }

    console.log("[agent] kapso webhook received");

    const normalized = kapsoChannel.normalizeInbound(event.data.raw)
    const from = normalized.from
    const body = normalized.text || ""
    console.log("[agent] normalized inbound", { from, hasText: Boolean(body), sourceId: normalized.sourceId })

    const user = await step.run("get-current-user",
      async () => getCurrentUser({ userPhoneNumber: from })
    )

    if (!user) {
      console.log("[agent] user not found, sending welcome", { from })
      await step.run("send-welcome-message", async () => {
        await kapsoChannel.sendText(from, WELCOME_MESSAGE)
      })
      return
    }

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

    const agentResult = await step.run("run-agent", async () => {
      const result = await runAgent({
        systemPrompt,
        history,
        userInput: body,
        userId: user._id,
        from,
        threadId: thread._id
      })
      return result.match(
        (value) => ({ ok: true as const, value }),
        (error) => ({ ok: false as const, error: { message: error.message, type: error.type as AgentErrorType } })
      )
    })
    if (!agentResult.ok) {
      console.error("[agent] agent error", agentResult.error);
      await step.run("send-error-response", async () => {
        await kapsoChannel.sendText(from, GENERIC_CHAT_ERROR_MESSAGE)
        await setMessageStatus({ messageId: inboundMessageId as any, status: "failed", error: agentResult.error.message })
      })
      return;
    }

    const textResponse = agentResult.value;
    console.log("[agent] agent output length", { length: (textResponse || "").length })

    await step.run("send-response", async () => {
      await kapsoChannel.sendText(from, textResponse || GENERIC_CHAT_ERROR_MESSAGE)
      await setMessageStatus({ messageId: inboundMessageId as any, status: "success" })
    })
    console.log("[agent] response sent and statuses updated")

  })

// Add the function to the exported array:
export const functions = [
  helloWorld,
  incomingKapsoMessage
];




