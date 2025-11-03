import type { Value } from "convex/values";
import type { ModelMessage } from "ai";

type ConvexMessageDoc = {
  message?: Value; // matches vMessage shape
  text?: string;
};

function normalizeContent(content: any): any {
  if (!content) return content;
  // If content is an array of parts, map possible mimeType -> mediaType
  if (Array.isArray(content)) {
    return content.map((part) => normalizePart(part));
  }
  return content;
}

function normalizePart(part: any): any {
  if (!part || typeof part !== "object") return part;

  // Top-level media/file parts
  if (part.type === "image" || part.type === "file") {
    if (part.mimeType && !part.mediaType) {
      return { ...part, mediaType: part.mimeType, mimeType: undefined };
    }
    return part;
  }

  // Tool result content may contain nested image entries
  if (part.type === "tool-result" && part.output && part.output.type === "content" && Array.isArray(part.output.value)) {
    const value = part.output.value.map((entry: any) => {
      if (entry && typeof entry === "object" && entry.type === "media") {
        if (entry.mimeType && !entry.mediaType) {
          return { ...entry, mediaType: entry.mimeType, mimeType: undefined };
        }
      }
      // legacy experimental image content
      if (entry && typeof entry === "object" && entry.type === "image") {
        if (entry.mimeType && !entry.mediaType) {
          return { ...entry, mediaType: entry.mimeType, mimeType: undefined };
        }
      }
      return entry;
    });
    return { ...part, output: { ...part.output, value } };
  }

  return part;
}

export function toModelMessages(docs: ConvexMessageDoc[]): ModelMessage[] {
  return docs
    .map((doc) => {
      if (doc.message && typeof doc.message === "object" && (doc.message as any).role) {
        const m = doc.message as any;
        return { role: m.role, content: normalizeContent(m.content) } as ModelMessage;
      }
      if (doc.text) {
        return { role: "user", content: doc.text } as ModelMessage;
      }
      return null;
    })
    .filter((m): m is ModelMessage => m !== null);
}


