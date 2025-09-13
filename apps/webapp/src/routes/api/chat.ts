import { createServerFileRoute } from '@tanstack/react-start/server'

import { streamText, convertToModelMessages, tool } from 'ai';
import type { UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {

  const {
    messages,
    model,
    workflowId,
  }: { messages: UIMessage[]; model: string; workflowId?: string } = await request.json();

  // Use OpenAI models directly
  const selectedModel = openai(model) || openai('gpt-3.5-turbo');

  const result = streamText({
    model: selectedModel,
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks. You can access the current workflow ID when needed.',
    tools: {
      getWorkflowId: tool({
        description: 'Get the current workflow ID',
        inputSchema: z.object({}),
        execute: async () => {
          return {
            workflowId: workflowId || 'No workflow selected',
            message: `ID del workflow: ${workflowId || 'No hay un workflow seleccionado'}`,
          };
        },
      }),
    },
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });

  },
})