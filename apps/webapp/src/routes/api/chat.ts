import { createServerFileRoute } from '@tanstack/react-start/server'
import { systemPrompt } from '@/lib/prompts';
import { streamText, convertToModelMessages, tool } from 'ai';
import type { UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {

  const {
    messages,
    model,
  }: { messages: UIMessage[]; model: string; } = await request.json();

  // Use OpenAI models directly
  const selectedModel = openai(model) || openai('gpt-3.5-turbo');

  const result = streamText({
    model: selectedModel,
    messages: convertToModelMessages(messages),
    system: systemPrompt,
 
    tools: {
 
      readWorkflowContent: tool({
        description: 'Return the current workflow content. Use when you need to read the workflow content.',
        inputSchema: z.object({}),


      }),
      editWorkflowContent: tool({
        description: 'Edit the current workflow content. Use when you need to modify the workflow content.',
        inputSchema: z.object({ content: z.string().min(1) }),

      }),
    },
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: false,
    sendReasoning: false,
  });

  },
})