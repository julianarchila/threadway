"use client"

import { useParams } from "next/navigation";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

export default function EditorPage() {
  const params = useParams();
  const workflowId = params.workflowId as string;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Editor de Workflow
        </h1>
        <p className="text-muted-foreground">
          ID del Workflow: {workflowId}
        </p>
      </div>

      {/* Editor Tiptap */}
      <div className="border rounded-lg">
        <SimpleEditor />
      </div>
    </div>
  );
} 