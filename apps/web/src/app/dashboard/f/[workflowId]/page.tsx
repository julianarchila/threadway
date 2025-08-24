"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { api } from "@whatsapp-mcp-client/backend/convex/api";
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";

export default function WorkflowPage() {
  const params = useParams();
  const workflowId = params.workflowId as Id<"workflows">;



  const workflow = useQuery(api.workflows.queries.getWorkflowById, { workflowId });


  const initialContent = blocksFromContent(workflow?.content);
  const updateWorkflowMutation = useMutation(api.workflows.mutations.update);



  if (!workflow) {
    return <div>Workflow not found</div>
  }

  async function saveContent(jsonBlocks: Block[]) {
    updateWorkflowMutation({
      workflowId,
      content: JSON.stringify(jsonBlocks),
    });
  }


  // Renders the editor instance using a React component.
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Document Title */}
      <div className="mb-8 px-14">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {workflow.title}
        </h1>
      </div>

      {/* Editor */}
      <WorkflowEditor initialContent={initialContent} onContentChange={saveContent} />
    </div>
  );
}

import type { Block, BlockSchema, PartialBlock } from "@blocknote/core";





function blocksFromContent(content: string | undefined) {
  // Gets the previously stored editor contents.
  return content ? (JSON.parse(content) as PartialBlock[])
  : undefined;
}

function WorkflowEditor({
  initialContent,
  onContentChange,
}: {
  initialContent?: PartialBlock[];
  onContentChange: (content: Block[]) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent,
  });

  return <div className="w-full">
    <BlockNoteView
      editor={editor}
      className="min-h-[600px] [&_.bn-editor]:!bg-transparent [&_.ProseMirror]:!bg-transparent"
      onChange={() => onContentChange(editor.document)}
      shadCNComponents={
        {
          // Pass modified ShadCN components from your project here.
          // Otherwise, the default ShadCN components will be used.
        }
      }
    />
  </div>

}