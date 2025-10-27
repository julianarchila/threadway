
import { convexClient } from "@/lib/convex";
import { api } from '@threadway/backend/convex/api';

import { fromAsyncThrowable, err, ok } from "neverthrow";

import { Id } from "@threadway/backend/convex/dataModel";

import { composio } from "@/lib/composio";

const SUPER_SECRET = process.env.AGENT_SECRET || ""

type GetCurrentUserParams = {
  userPhoneNumber: string;
}

export const getCurrentUser = async (params: GetCurrentUserParams) => {

  // check if phone number has "+" at the start, if not add it
  let phoneNumber = params.userPhoneNumber;
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = "+" + phoneNumber;
  }

  const user = await convexClient.query(api.agent.queries.getUserByPhoneNumber, {
    phoneNumber: phoneNumber,
    secret: SUPER_SECRET
  })

  return user

}



export const loadUserTools = async (userId: Id<"users">) => {
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
