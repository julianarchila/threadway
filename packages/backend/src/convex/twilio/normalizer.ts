import type { TwilioIncomingMessage } from './validation';

export type MessageKind = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';

export interface MediaAttachment {
  url: string;
  contentType: string;
}

export interface LocationAttachment {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DomainMessage {
  kind: MessageKind;
  from: string;
  to: string;
  text?: string;
  media?: MediaAttachment[];
  location?: LocationAttachment;
  raw: unknown;
}

const detectKind = (twilio: TwilioIncomingMessage): MessageKind => {
  if (twilio.Latitude && twilio.Longitude) return 'location';

  const numMedia = parseInt(twilio.NumMedia || '0', 10);
  if (numMedia > 0) {
    const contentType = (twilio as any)[`MediaContentType0`] as string | undefined;
    if (contentType?.startsWith('image/')) return 'image';
    if (contentType?.startsWith('audio/')) return 'audio';
    if (contentType?.startsWith('video/')) return 'video';
    return 'document';
  }

  return 'text';
};

const extractMedia = (twilio: TwilioIncomingMessage): MediaAttachment[] | undefined => {
  const attachments: MediaAttachment[] = [];
  const numMedia = parseInt(twilio.NumMedia || '0', 10);
  if (numMedia <= 0) return undefined;

  for (let i = 0; i < numMedia; i++) {
    const url = (twilio as any)[`MediaUrl${i}`] as string | undefined;
    const contentType = (twilio as any)[`MediaContentType${i}`] as string | undefined;
    if (url) attachments.push({ url, contentType: contentType || 'application/octet-stream' });
  }
  return attachments.length ? attachments : undefined;
};

const extractLocation = (twilio: TwilioIncomingMessage): LocationAttachment | undefined => {
  if (!twilio.Latitude || !twilio.Longitude) return undefined;
  const latitude = parseFloat(twilio.Latitude);
  const longitude = parseFloat(twilio.Longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return undefined;
  return {
    latitude,
    longitude,
    address: twilio.Address || undefined,
  };
};

export const normalizeTwilioMessage = (twilio: TwilioIncomingMessage): DomainMessage => {
  const kind = detectKind(twilio);
  return {
    kind,
    from: twilio.From,
    to: twilio.To,
    text: twilio.Body || undefined,
    media: extractMedia(twilio),
    location: extractLocation(twilio),
    raw: twilio,
  };
};
