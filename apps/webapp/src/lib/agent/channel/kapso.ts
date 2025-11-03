import { whatsappClient, KAPSO_PHONE_NUMBER_ID } from "@/lib/kapso";
import type { ChannelAdapter, NormalizedInbound } from "./types";

function normalizeInbound(raw: any): NormalizedInbound {
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const from = data?.conversation?.phone_number ?? data?.from ?? "";
    const to = data?.conversation?.phone_number_id ?? KAPSO_PHONE_NUMBER_ID;
    const text = data?.message?.content ?? data?.message?.text ?? data?.text ?? undefined;
    const sourceId = data?.message?.id ?? data?.id ?? undefined;
    return { from, to, text, sourceId };
  } catch (_e) {
    return { from: "", to: KAPSO_PHONE_NUMBER_ID, text: undefined };
  }
}

async function sendText(to: string, body: string): Promise<void> {
  await whatsappClient.messages.sendText({
    phoneNumberId: KAPSO_PHONE_NUMBER_ID,
    to,
    body,
  });
}

export const kapsoChannel: ChannelAdapter = {
  kind: "whatsapp",
  normalizeInbound,
  sendText,
};


