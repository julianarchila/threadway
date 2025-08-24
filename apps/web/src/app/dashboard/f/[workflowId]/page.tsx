"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

export default function WorkflowPage() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();

  // Renders the editor instance using a React component.
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Document Title */}
      <div className="mb-8 px-14">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Untitled Workflow
        </h1>
      </div>

      {/* Editor */}
      <div className="w-full">
        <BlockNoteView
          editor={editor}
          className="min-h-[600px] [&_.bn-editor]:!bg-transparent [&_.ProseMirror]:!bg-transparent"
          shadCNComponents={
            {
              // Pass modified ShadCN components from your project here.
              // Otherwise, the default ShadCN components will be used.
            }
          }
        />
      </div>
    </div>
  );
}
