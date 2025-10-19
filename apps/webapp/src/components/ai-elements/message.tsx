'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: 'user' | 'assistant';
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex gap-3 w-full',
        from === 'user' ? 'justify-end' : 'justify-start',
        className
      )}
      {...props}
    >
      {from === 'user' ? (
        <div
          className={cn(
            'relative max-w-[80%] rounded-lg px-3 py-2 ml-auto shadow-sm',
            'bg-primary text-primary-foreground'
          )}
        >
          {children}
        </div>
      ) : (
        <div className={cn('max-w-[80%]')}>{children}</div>
      )}
    </div>
  )
);
Message.displayName = 'Message';

export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('prose prose-sm max-w-none', className)}
      {...props}
    />
  )
);
MessageContent.displayName = 'MessageContent'; 