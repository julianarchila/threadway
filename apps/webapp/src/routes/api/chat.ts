import { createServerFileRoute } from '@tanstack/react-start/server'

import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {

  const {
    messages,
    model,
  }: { messages: UIMessage[]; model: string } = await request.json();

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

  },
})