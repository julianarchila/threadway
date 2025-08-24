"use client"

import { useParams } from "next/navigation";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

export default function EditorPage() {
  const params = useParams();
  const workflowId = params.workflowId as string;

  return (
    <div className="p-4"> {/* Reducir padding */}
      <div className="mb-4"> {/* Reducir margen */}
        <h1 className="text-xl font-bold mb-1"> {/* Título más pequeño */}
          Editor de Workflow
        </h1>
        <p className="text-sm text-muted-foreground"> {/* Texto más pequeño */}
          ID del Workflow: {workflowId}
        </p>
      </div>

      {/* Editor Tiptap con borde más sutil */}
      <div className="border rounded-md max-w-4xl"> {/* Borde más sutil y ancho máximo */}
        <SimpleEditor />
      </div>
    </div>
  );
} 