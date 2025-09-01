'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-center p-4', className)}
      {...props}
    >
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2 text-sm text-muted-foreground">Thinking...</span>
    </div>
  )
);
Loader.displayName = 'Loader'; 