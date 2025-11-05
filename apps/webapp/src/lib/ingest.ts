import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook } from "./kapso";

import { getCurrentUser } from "@/lib/agent/state/users";
import { kapsoChannel } from "@/lib/agent/channel";
import { getOrCreateThreadByUser, listRecentMessages, appendMessage, setMessageStatus } from "@/lib/agent/state/api";
import { toModelMessages } from "@/lib/agent/state/serializers";
import { WELCOME_MESSAGE } from "@/lib/agent/core/constants";
import { routeWorkflow } from "@/lib/agent/workflows/router";

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

    const routing = await step.run("route-workflow", async () => {
      const result = await routeWorkflow({
        userId: user._id,
        userInput: body,
        context: history.slice(-4),
      })
      return result.match(
        (value) => ({ ok: true as const, value }),
        (error) => ({ ok: false as const, error: { message: error.message } })
      )
    })

    if (!routing.ok) {
      console.error("[router] error", routing.error);
    } else {
      const { decision, workflowsConsidered, selected } = routing.value;
      console.log("[router] decision", { decision, workflowsConsidered, selectedId: selected?._id, selectedTitle: selected?.title });
    }

    await step.run("send-router-ack", async () => {
      await kapsoChannel.sendText(from, "Ok")
      await setMessageStatus({ messageId: inboundMessageId as any, status: "success" })
    })
    return;

  })

// Add the function to the exported array:
export const functions = [
  helloWorld,
  incomingKapsoMessage
];




