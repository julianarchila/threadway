
import { convexClient } from "@/lib/convex";
import { api } from '@threadway/backend/convex/api';
import { fromAsyncThrowable, err, ok } from "neverthrow";
import { Id } from "@threadway/backend/convex/dataModel";
import { composio } from "@/lib/composio";
import { AgentError } from "@/lib/agent/core/errors";

const SUPER_SECRET = process.env.AGENT_SECRET || "";

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
      "Failed to load user tools from composio",
      firstError
    )
  )

}
 
