'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface WorkflowInfoProps {
  workflowId: string;
  message?: string;
}

export function WorkflowInfo({ workflowId, message }: WorkflowInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(workflowId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy workflow ID:', err);
    }
  };

  return (
    <Card className="w-full border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                Workflow ID
              </Badge>
            </div>
            <div className="font-mono text-sm break-all bg-muted/50 p-2 rounded border">
              {workflowId}
            </div>
            {message && (
              <p className="text-sm text-muted-foreground mt-2 break-words">
                {message}
              </p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Copiar ID del workflow"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
