import { v, type Infer, type Validator, type Value } from "convex/values";


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

/* ModelMessage Validators */


/* ModelMessage Parts */
export const vTextPart = v.object({
  type: v.literal("text"),
  text: v.string(),
});

export const vImagePart = v.object({
  type: v.literal("image"),
  image: v.union(v.string(), v.bytes()),
  mediaType: v.optional(v.string()),
});

export const vFilePart = v.object({
  type: v.literal("file"),
  data: v.union(v.string(), v.bytes()),
  filename: v.optional(v.string()),
  mediaType: v.string(),
});

export const vToolCallPart = v.object({
  type: v.literal("tool-call"),
  toolCallId: v.string(),
  toolName: v.string(),
  args: v.any(),
});


export const vLanguageModelV2ToolResultOutput = v.union(
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
          /**
         Base-64 encoded media data.
           */
          data: v.string(),
          /**
          IANA media type.
          @see https://www.iana.org/assignments/media-types/media-types.xhtml
          */
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
  output: v.optional(vLanguageModelV2ToolResultOutput),

  // ProviderOptions
});

export const vUserContent = v.union(
  v.string(),
  v.array(v.union(vTextPart, vImagePart, vFilePart)),
);

export const vReasoningPart = v.object({
  type: v.literal("reasoning"),
  text: v.string(),
  signature: v.optional(v.string()),
});

export const vRedactedReasoningPart = v.object({
  type: v.literal("redacted-reasoning"),
  data: v.string(),
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
  }),
  v.object({
    type: v.literal("source"),
    sourceType: v.literal("document"),
    id: v.string(),
    mediaType: v.string(),
    title: v.string(),
    filename: v.optional(v.string()),
  }),
);
export type SourcePart = Infer<typeof vSourcePart>;


const vToolResultContent = v.array(
  v.union(
    v.object({ type: v.literal("text"), text: v.string() }),
    v.object({
      type: v.literal("image"),
      data: v.string(),
      mediaType: v.optional(v.string()),
    }),
  ),
);


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
});

export const vAssistantModelMessage = v.object({
  role: v.literal("assistant"),
  content: vAssistantContent,
});

export const vToolMessage = v.object({
  role: v.literal("tool"),
  content: vToolContent,
});

export const vSystemMessage = v.object({
  role: v.literal("system"),
  content: v.string(),
});

export const vMessage = v.union(
  vUserMessage,
  vAssistantModelMessage,
  vToolMessage,
  vSystemMessage,
);
export type Message = Infer<typeof vMessage>;
