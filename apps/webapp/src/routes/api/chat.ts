import { createServerFileRoute } from '@tanstack/react-start/server'
import { systemPrompt } from '@/lib/prompts';
import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { chatTools } from './chat-tools';

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {

  const {
    messages,
  }: { messages: UIMessage[]; workflowId?: string } = await request.json();

  // Use OpenAI GPT-5 Mini by default
  const selectedModel = openai('gpt-5-mini');

  const result = streamText({
    model: selectedModel,
    messages: convertToModelMessages(messages),
    system: systemPrompt,
 
    tools: chatTools,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: false,
    sendReasoning: false,
  });

  },
})