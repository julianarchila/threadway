"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { api } from "@whatsapp-mcp-client/backend/convex/api";
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel";
import { useMutation } from "convex/react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import type { Block, PartialBlock } from "@blocknote/core";
import { EditableTitle } from "./editable-title";
import { RightSidebarStandalone } from "@/components/right-sidebar-standalone";

interface WorkflowEditorProps {
  preloadedWorkflow: Preloaded<typeof api.workflows.queries.getWorkflowById>;
  workflowId: Id<"workflows">;
}

export function WorkflowEditor({ preloadedWorkflow, workflowId }: WorkflowEditorProps) {
  // Use the preloaded query data
  const workflow = usePreloadedQuery(preloadedWorkflow);
  const updateWorkflowMutation = useMutation(api.workflows.mutations.update);

  const initialContent = blocksFromContent(workflow?.content);

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  async function saveContent(jsonBlocks: Block[]) {
    updateWorkflowMutation({
      workflowId,
      content: JSON.stringify(jsonBlocks),
    });
  }

  // Renders the editor instance using a React component.
  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        {/* Document Title */}
        <div className="mb-8 px-14">
          <EditableTitle 
            title={workflow.title} 
            workflowId={workflowId}
            className="mb-2"
          />
        </div>

        {/* Editor */}
        <BlockNoteEditor initialContent={initialContent} onContentChange={saveContent} />
      </div>
      <RightSidebarStandalone />
    </>
  );
}

function blocksFromContent(content: string | undefined) {
  // Gets the previously stored editor contents.
  return content ? (JSON.parse(content) as PartialBlock[]) : undefined;
}

function BlockNoteEditor({
  initialContent,
  onContentChange,
}: {
  initialContent?: PartialBlock[];
  onContentChange: (content: Block[]) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent,
  });

  return (
    <div className="w-full">
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
  );
}
