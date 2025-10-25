import { v, type Infer, type Validator, type Value } from "convex/values";


export const vProviderOptions = v.record(
  v.string(),
  v.record(v.string(), v.any()),
);
const providerOptions = v.optional(vProviderOptions);
export type ProviderOptions = Infer<typeof providerOptions>;

export const vProviderMetadata = vProviderOptions;
const providerMetadata = providerOptions;
export type ProviderMetadata = Infer<typeof providerMetadata>;

export const vThreadStatus = v.union(
  v.literal("active"),
  v.literal("archived"), // unused
);
export const vMessageStatus = v.union(
  v.literal("pending"),
  v.literal("success"),
  v.literal("failed"),
)
export type MessageStatus = Infer<typeof vMessageStatus>;


export const vRole = v.union(
  v.literal("system"),
  v.literal("user"),
  v.literal("assistant"),
  v.literal("tool"),
);

export const vTextPart = v.object({
  type: v.literal("text"),
  text: v.string(),
  providerOptions,
  providerMetadata,
});

export const vImagePart = v.object({
  type: v.literal("image"),
  image: v.union(v.string(), v.bytes()),
  mimeType: v.optional(v.string()),
  providerOptions,
});

export const vFilePart = v.object({
  type: v.literal("file"),
  data: v.union(v.string(), v.bytes()),
  filename: v.optional(v.string()),
  mimeType: v.string(),
  providerOptions,
  providerMetadata,
});

export const vUserContent = v.union(
  v.string(),
  v.array(v.union(vTextPart, vImagePart, vFilePart)),
);

export const vReasoningPart = v.object({
  type: v.literal("reasoning"),
  text: v.string(),
  signature: v.optional(v.string()),
  providerOptions,
  providerMetadata,
});

export const vRedactedReasoningPart = v.object({
  type: v.literal("redacted-reasoning"),
  data: v.string(),
  providerOptions,
  providerMetadata,
});

export const vReasoningDetails = v.array(
  v.union(
    vReasoningPart,
    v.object({
      type: v.literal("text"),
      text: v.string(),
      signature: v.optional(v.string()),
    }),
    v.object({ type: v.literal("redacted"), data: v.string() }),
  ),
);

export const vSourcePart = v.union(
  v.object({
    type: v.literal("source"),
    sourceType: v.literal("url"),
    id: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
    providerOptions,
    providerMetadata,
  }),
  v.object({
    type: v.literal("source"),
    sourceType: v.literal("document"),
    id: v.string(),
    mediaType: v.string(),
    title: v.string(),
    filename: v.optional(v.string()),
    providerOptions,
    providerMetadata,
  }),
);
export type SourcePart = Infer<typeof vSourcePart>;

export const vToolCallPart = v.object({
  type: v.literal("tool-call"),
  toolCallId: v.string(),
  toolName: v.string(),
  args: v.any(),
  providerExecuted: v.optional(v.boolean()),
  providerOptions,
  providerMetadata,
});

const vToolResultContent = v.array(
  v.union(
    v.object({ type: v.literal("text"), text: v.string() }),
    v.object({
      type: v.literal("image"),
      data: v.string(),
      mimeType: v.optional(v.string()),
    }),
  ),
);

export const vToolResultOutput = v.union(
  v.object({ type: v.literal("text"), value: v.string() }),
  v.object({ type: v.literal("json"), value: v.any() }),
  v.object({ type: v.literal("error-text"), value: v.string() }),
  v.object({ type: v.literal("error-json"), value: v.any() }),
  v.object({
    type: v.literal("content"),
    value: v.array(
      v.union(
        v.object({ type: v.literal("text"), text: v.string() }),
        v.object({
          type: v.literal("media"),
          data: v.string(),
          mediaType: v.string(),
        }),
      ),
    ),
  }),
);

export const vToolResultPart = v.object({
  type: v.literal("tool-result"),
  toolCallId: v.string(),
  toolName: v.string(),
  output: v.optional(vToolResultOutput),

  providerOptions,
  providerMetadata,
  providerExecuted: v.optional(v.boolean()),

  // Deprecated in ai v5
  result: v.optional(v.any()), // either this or output will be present
  isError: v.optional(v.boolean()),
  // This is only here b/c steps include it in toolResults
  // Normal ModelMessage doesn't have this
  args: v.optional(v.any()),
  experimental_content: v.optional(vToolResultContent),
});
export const vToolContent = v.array(vToolResultPart);

export const vAssistantContent = v.union(
  v.string(),
  v.array(
    v.union(
      vTextPart,
      vFilePart,
      vReasoningPart,
      vRedactedReasoningPart,
      vToolCallPart,
      vToolResultPart,
      vSourcePart,
    ),
  ),
);

export const vContent = v.union(vUserContent, vAssistantContent, vToolContent);
export type Content = Infer<typeof vContent>;

export const vUserMessage = v.object({
  role: v.literal("user"),
  content: vUserContent,
  providerOptions,
});

export const vAssistantMessage = v.object({
  role: v.literal("assistant"),
  content: vAssistantContent,
  providerOptions,
});

export const vToolMessage = v.object({
  role: v.literal("tool"),
  content: vToolContent,
  providerOptions,
});

export const vSystemMessage = v.object({
  role: v.literal("system"),
  content: v.string(),
  providerOptions,
});

export const vMessage = v.union(
  vUserMessage,
  vAssistantMessage,
  vToolMessage,
  vSystemMessage,
);
export type Message = Infer<typeof vMessage>;
