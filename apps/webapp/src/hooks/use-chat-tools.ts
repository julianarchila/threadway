import { useCallback } from 'react'
// ToolCallHandler types are not exported; use a lightweight signature
import { blocksFromContent } from '@/lib/blocknote-utils'
import { Id } from '@threadway/backend/convex/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@threadway/backend/convex/api'

type EditorLike = {
  // BlockNote's blocksToMarkdownLossy accepts PartialBlock[] | undefined
  // Use any to keep the hook decoupled from BlockNote types
  blocksToMarkdownLossy: (blocks?: any) => Promise<string | undefined>
  tryParseMarkdownToBlocks: (markdown: string) => Promise<any>
}

export function useChatTools(
  editor: EditorLike,
  workflowContent: string | undefined,
  workflowId: Id<'workflows'>
) {
  const updateWorkflowMutation = useMutation(api.workflows.mutations.update)

  const onToolCall = useCallback(
    async ({ toolCall, addToolResult }: { toolCall: any; addToolResult: (r: { tool: string; toolCallId: string; output: string }) => void }) => {
      if (toolCall.dynamic) return

      if (toolCall.toolName === 'readWorkflowContent') {
        const blocks = blocksFromContent(workflowContent)
        const content = await editor.blocksToMarkdownLossy(blocks)
        addToolResult({
          tool: 'readWorkflowContent',
          toolCallId: toolCall.toolCallId,
          output: content ?? '',
        })
        return
      }

      if (toolCall.toolName === 'editWorkflowContent') {
        try {
          const markdown: string = (toolCall as unknown as { input: { content: string } }).input.content
          const parsedBlocks = await editor.tryParseMarkdownToBlocks(markdown)
          const serialized = JSON.stringify(parsedBlocks ?? [])
          await updateWorkflowMutation({ workflowId, content: serialized })
          addToolResult({ tool: 'editWorkflowContent', toolCallId: toolCall.toolCallId, output: 'ok' })
        } catch (err) {
          console.error('editWorkflowContent failed', err)
          addToolResult({ tool: 'editWorkflowContent', toolCallId: toolCall.toolCallId, output: 'error' })
        }
      }
    },
    [editor, updateWorkflowMutation, workflowContent, workflowId]
  )

  return { onToolCall }
}
