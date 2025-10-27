import { Inngest, NonRetriableError } from "inngest";
import { verifyWebhook, whatsappClient, KAPSO_PHONE_NUMBER_ID } from "./kapso";

import { api } from '@threadway/backend/convex/api';
import { convexClient } from "./convex";
import { Id } from "@threadway/backend/convex/dataModel";
import { composio } from "./composio";
import { generateText } from "ai"

import { openai } from '@ai-sdk/openai';

import { fromAsyncThrowable, err, ok } from "neverthrow";

export const inngest = new Inngest({ id: "my-app" });
const SUPER_SECRET = process.env.AGENT_SECRET || ""
const landingPageUrl = "https://threadway.app"
const welcomeMessage = `Welcome to Threadway! I'm your personal assistant here to help you manage tasks, answer questions, and automate your notes-to-self pad. To join the waitlist visist: ${landingPageUrl}`

const systemPrompt = `You are Threadway, a helpful personal assistant that lives in whatsapp. Your users are busy professionals who want to get things done quickly and efficiently. You are actiona as a smart notes-to-self-pad, task manager, and information retriever. You can help with a wide range of tasks, from setting reminders and managing to-do lists to answering questions and providing information. Always be concise and to the point. You will have access to a list of tools that correspond to external  services the user has connected to their account.`


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

    const user = await step.run("get-current-user", async () => {
      const user = await convexClient.query(api.agent.queries.getUserByPhoneNumber, {
        phoneNumber: "+" + from,
        secret: SUPER_SECRET
      })

      return user
    })

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




const loadUserTools = async (userId: Id<"users">) => {
  // const userToolKits = await internal.integrations.queries.getUserConnectedToolkits({userId: args.userId})
  const userToolKits = await convexClient.query(api.agent.queries.getUserConnectedToolkits, {
    userId: userId,
    secret: SUPER_SECRET
  })

  console.debug("[loadUserTools]: User toolkits: ", userToolKits)

  if (userToolKits.length === 0) {
    return ok({});
  }

  // Fetch top 10 tools per toolkit in parallel
  const perToolkitFetches = userToolKits.map((toolkit) =>
    fromAsyncThrowable(() =>
      composio.tools.get(userId, { toolkits: [toolkit], limit: 20 })
    )()
  );

  const perToolkitResults = await Promise.all(perToolkitFetches);

  // Collect successes and merge ToolSets
  const successfulToolSets = perToolkitResults
    .filter((r) => r.isOk())
    .map((r) => r.value);

  const mergedToolSet = successfulToolSets.reduce(
    (acc, set) => ({ ...acc, ...set }),
    {}
  );

  if (Object.keys(mergedToolSet).length > 0) {
    return ok(mergedToolSet);
  }

  // If all requests failed, bubble up the first error
  const firstError = perToolkitResults.find((r) => r.isErr())?.error;
  return err(
    new AgentError(
      "FAILED_TO_LOAD_TOOLS",
      "Failed too load user tools from composio",
      firstError
    )
  )

}

type AgentErrorType = "FAILED_TO_LOAD_TOOLS" | "FAILED_TO_CREATE_AGENT" | "FAILED_TO_CONTINUE_THREAD" | "FAILED_TO_GENERATE_TEXT";

export class AgentError extends Error {
  readonly name = 'IntegrationsError';
  constructor(public readonly type: AgentErrorType, message: string, public readonly cause?: unknown) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentError)
    }
  }
}
