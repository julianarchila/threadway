"use client"

import { useParams } from "next/navigation";

export default function EditorPage() {
  const params = useParams();
  const workflowId = params.workflowId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Editor de Workflow
      </h1>
      <p className="text-muted-foreground">
        ID del Workflow: {workflowId}
      </p>
    </div>
  );
} 