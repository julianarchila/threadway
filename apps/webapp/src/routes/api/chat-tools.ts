import { tool } from 'ai'
import { z } from 'zod'

export const chatTools = {
  readWorkflowContent: tool({
    description: 'Return the current workflow content. Use when you need to read the workflow content.',
    inputSchema: z.object({}),
  }),
  editWorkflowContent: tool({
    description: 'Edit the current workflow content. Use when you need to modify the workflow content.',
    inputSchema: z.object({ content: z.string().min(1) }),
  }),
}

export type ChatToolNames = keyof typeof chatTools
