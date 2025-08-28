'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex flex-col h-full', className)}
      {...props}
    />
  )
);
Conversation.displayName = 'Conversation';

export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ConversationContent = React.forwardRef<HTMLDivElement, ConversationContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto p-4 space-y-4', className)}
      {...props}
    />
  )
);
ConversationContent.displayName = 'ConversationContent';

export interface ConversationScrollButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ConversationScrollButton = React.forwardRef<HTMLButtonElement, ConversationScrollButtonProps>(
  ({ className, onClick, ...props }, ref) => {
    const handleScrollToBottom = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Buscar el contenedor scrollable más cercano
      const scrollContainer = (e.target as HTMLElement).closest('[data-scroll-container]') || 
                            (e.target as HTMLElement).closest('.overflow-auto') ||
                            (e.target as HTMLElement).closest('.overflow-y-auto');
      
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      // Llamar el onClick original si existe
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        size="icon"
        className={cn(
          'absolute bottom-4 right-4 rounded-full shadow-lg',
          className
        )}
        onClick={handleScrollToBottom}
        {...props}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    );
  }
);
ConversationScrollButton.displayName = 'ConversationScrollButton'; 