"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@whatsapp-mcp-client/backend/convex/api";
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditableTitleProps {
  title: string;
  workflowId: Id<"workflows">;
  className?: string;
}

export function EditableTitle({ title, workflowId, className }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTitleMutation = useMutation(api.workflows.mutations.updateTitle);

  // Update editedTitle when title prop changes
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedTitle.trim() === title) {
      setIsEditing(false);
      return;
    }

    if (editedTitle.trim().length === 0) {
      toast.error("Title cannot be empty");
      setEditedTitle(title); // Reset to original
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateTitleMutation({
        workflowId,
        title: editedTitle.trim(),
      });
      setIsEditing(false);
      toast.success("Title updated");
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error("Failed to update title");
      setEditedTitle(title); // Reset to original
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          maxLength={200}
          className={cn(
            "text-3xl font-bold bg-transparent border-b-2 border-blue-500 outline-none",
            "text-gray-900 dark:text-gray-100 min-w-0 flex-1",
            isSaving && "opacity-50 cursor-not-allowed",
            className
          )}
          placeholder="Enter workflow title..."
        />
        {isSaving && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Saving...
          </div>
        )}
      </div>
    );
  }

  return (
    <h1
      onClick={handleStartEdit}
      className={cn(
        "text-3xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer",
        "hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 -my-1",
        "transition-colors duration-200",
        className
      )}
      title="Click to edit title"
    >
      {title}
    </h1>
  );
}
