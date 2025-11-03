import type { Value } from "convex/values";

type ConvexMessageDoc = {
  message?: Value; // matches vMessage shape
  text?: string;
};

type ModelMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: any;
};

export function toModelMessages(docs: ConvexMessageDoc[]): ModelMessage[] {
  return docs
    .map((doc) => {
      if (doc.message && typeof doc.message === "object" && (doc.message as any).role) {
        const m = doc.message as any;
        return { role: m.role, content: m.content } as ModelMessage;
      }
      if (doc.text) {
        return { role: "user", content: doc.text } as ModelMessage;
      }
      return null;
    })
    .filter((m): m is ModelMessage => m !== null);
}


