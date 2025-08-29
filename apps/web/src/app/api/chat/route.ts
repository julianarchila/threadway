import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
  }: { messages: UIMessage[]; model: string } =
    await req.json();

  // Use OpenAI models directly
  const selectedModel = openai(model) || openai('gpt-3.5-turbo');

  const result = streamText({
    model: selectedModel,
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
} 