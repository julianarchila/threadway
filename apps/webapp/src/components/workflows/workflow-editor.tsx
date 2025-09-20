import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { api } from "@threadway/backend/convex/api";
import type { Id } from "@threadway/backend/convex/dataModel";
import { useMutation } from "convex/react";
import type { Block, PartialBlock } from "@blocknote/core";
import { useEffect, useRef, useState } from "react";
import { EditableTitle } from "./editable-title";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import { IntegrationsInWorkflow } from "./integrations-in-workflow";

interface WorkflowEditorProps {
  workflowId: Id<"workflows">;
}

export function WorkflowEditor({ workflowId }: WorkflowEditorProps) {
  // Use the preloaded query data
  const { data: workflow } = useSuspenseQuery(convexQuery(api.workflows.queries.getWorkflowById, { workflowId }));
  const updateWorkflowMutation = useMutation(api.workflows.mutations.update);

  console.log("Rendering WorkflowEditor with workflowId:", workflowId, "and workflow:", workflow);
  console.log("Workflow content:", workflow?.content);

  const initialContent = blocksFromContent(workflow?.content);

  // Tracks when server-side changes (not produced by this editor) arrive
  const [contentVersion, setContentVersion] = useState(0);
  const lastSavedContentRef = useRef<string | undefined>(undefined);

  // When Convex pushes an updated workflow content that doesn't match the last
  // content we saved locally, bump the version to remount the editor with new content.
  useEffect(() => {
    const serverContent = workflow?.content;
    if (serverContent == null) return;
    if (lastSavedContentRef.current === serverContent) return;
    setContentVersion((v) => v + 1);
  }, [workflow?.content]);

  async function saveContent(jsonBlocks: Block[]) {
    const serialized = JSON.stringify(jsonBlocks);
    // Avoid feedback loops and redundant writes
    if (serialized === workflow?.content || serialized === lastSavedContentRef.current) {
      return;
    }
    lastSavedContentRef.current = serialized;
    updateWorkflowMutation({
      workflowId,
      content: serialized,
    });
  }

  // Renders the editor instance using a React component.
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">


      {/* Header */}
      <div className="mb-8 px-14">
        {/* Document Title */}
        <div className="mb-4">
          <EditableTitle
            title={workflow?.title || "Untitled Workflow"}
            workflowId={workflowId}
            className="mb-2"
          />
        </div>

        {/* Integrations workflow */}
        <IntegrationsInWorkflow />

      </div>

      {/* Editor */}
      <BlockNoteEditor key={`${workflowId}:${contentVersion}`} initialContent={initialContent} onContentChange={saveContent} />
    </div>
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
        className="min-h-[600px] [&_.bn-editor]:!bg-transparent [&_.ProseMirror]:!bg-transparent [&_.ProseMirror]:!text-foreground [&_.bn-editor]:!text-foreground"
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
