'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';

export interface PromptInputProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const PromptInput = React.forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    />
  )
);
PromptInput.displayName = 'PromptInput';

export interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      className={cn('resize-none', className)}
      {...props}
    />
  )
);
PromptInputTextarea.displayName = 'PromptInputTextarea';

export interface PromptInputToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PromptInputToolbar = React.forwardRef<HTMLDivElement, PromptInputToolbarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between', className)}
      {...props}
    />
  )
);
PromptInputToolbar.displayName = 'PromptInputToolbar';

export interface PromptInputToolsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PromptInputTools = React.forwardRef<HTMLDivElement, PromptInputToolsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
);
PromptInputTools.displayName = 'PromptInputTools';

export interface PromptInputButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
}

export const PromptInputButton = React.forwardRef<HTMLButtonElement, PromptInputButtonProps>(
  ({ className, variant = 'ghost', ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size="sm"
      className={cn(className)}
      {...props}
    />
  )
);
PromptInputButton.displayName = 'PromptInputButton';

export interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: 'idle' | 'streaming' | 'submitted';
}

export const PromptInputSubmit = React.forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, status = 'idle', disabled, ...props }, ref) => (
    <Button
      ref={ref}
      type="submit"
      size="sm"
      disabled={disabled || status === 'streaming' || status === 'submitted'}
      className={cn(className)}
      {...props}
    >
      {status === 'streaming' || status === 'submitted' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  )
);
PromptInputSubmit.displayName = 'PromptInputSubmit';

// Model Select Components
export const PromptInputModelSelect = Select;
export const PromptInputModelSelectTrigger = SelectTrigger;
export const PromptInputModelSelectValue = SelectValue;
export const PromptInputModelSelectContent = SelectContent;
export const PromptInputModelSelectItem = SelectItem; 