export type NormalizedInbound = {
  from: string;
  to: string;
  text?: string;
  sourceId?: string;
};

export interface ChannelAdapter {
  kind: "whatsapp" | "slack" | "telegram";
  normalizeInbound(raw: any): NormalizedInbound;
  sendText(to: string, body: string): Promise<void>;
}


