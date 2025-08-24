"use client"

import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@whatsapp-mcp-client/backend/convex/api";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Button } from "@/components/ui/button";
import { Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EditorPage() {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const [isSaving, setIsSaving] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Obtener el usuario actual
  const currentUser = useQuery(api.auth.getCurrentUser);
  
  // Obtener el workflow existente si existe
  const existingWorkflow = useQuery(api.workflows.queries.getWorkflowById, { workflowId });
  
  const createWorkflowMutation = useMutation(api.workflows.mutations.createWorkflow);
  const updateWorkflowMutation = useMutation(api.workflows.mutations.updateWorkflow);

  const handleSave = async () => {
    if (!editorContent.trim() || !currentUser) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const userId = currentUser.metadata.userId;
      
      if (existingWorkflow) {
        // Si el workflow existe, actualizarlo
        await updateWorkflowMutation({
          workflowId,
          content: editorContent,
          userId: userId as any, // Para verificación de autorización
        });
        toast.success("Workflow actualizado exitosamente");
      } else {
        // Si no existe, crear uno nuevo
        await createWorkflowMutation({
          workflowId,
          content: editorContent,
          userId: userId as any,
        });
        toast.success("Workflow creado exitosamente");
      }
    } catch (error: any) {
      console.error("Error al guardar workflow:", error);
      
      // Manejar errores específicos de Convex
      let errorMessage = "Error desconocido al guardar el workflow";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Función para obtener el contenido del editor desde el DOM
  const getEditorContent = () => {
    const editorElement = document.querySelector('.tiptap.ProseMirror');
    if (editorElement) {
      return editorElement.innerHTML;
    }
    return "";
  };

  // Mostrar loading mientras se obtiene el usuario
  if (!currentUser) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1">
          Editor de Workflow
        </h1>
        <p className="text-sm text-muted-foreground">
          ID del Workflow: {workflowId}
          {existingWorkflow && (
            <span className="ml-2 text-green-600">(Existente)</span>
          )}
        </p>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Editor Tiptap con borde más sutil */}
      <div className="border rounded-md max-w-4xl">
        <SimpleEditor />
      </div>

      {/* Botón Enviar fuera de la card */}
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={async () => {
            const content = getEditorContent();
            setEditorContent(content);
            await handleSave();
          }}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : existingWorkflow ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </div>
  );
} 