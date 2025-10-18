'use client';

import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import MessageList from '@/components/ai-elements/message-list';
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
// import { Loader } from '@/components/ai-elements/loader';
import { useParams } from '@tanstack/react-router';
import {
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import type { UIMessage } from 'ai';
import { api } from '@threadway/backend/convex/api';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { useCreateBlockNote } from '@blocknote/react';
import { Id } from '@threadway/backend/convex/dataModel';

import { useChatTools } from '@/hooks/use-chat-tools';

// Model selection removed; always use server default

// moved to lib/blocknote-utils

export default function Chatbot() {
  const [input, setInput] = useState('');
  // Model state removed
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const editor = useCreateBlockNote({});

  // Obtener el workflowId de los parámetros de la ruta
  const { workflowId } = useParams({ from: '/_dashboard/f/$workflowId' });

  // mutations handled inside useChatTools


  const { data: workflow } = useSuspenseQuery(convexQuery(api.workflows.queries.getWorkflowById, { workflowId: workflowId as Id<"workflows"> }));


  // TanStack Query cache persistence (session-only, global)
  const queryClient = useQueryClient()
  // Scope chat cache by workflow to avoid sharing messages across workflows
  const getChatCacheKey = (
    wid?: string | Id<'workflows'>
  ) => (wid ? (['chat:messages', wid] as const) : null)

  const cacheKey = getChatCacheKey(workflowId as string | undefined)
  const cachedMessages = (cacheKey
    ? (queryClient.getQueryData(cacheKey) as UIMessage[] | undefined)
    : undefined)

  const { onToolCall } = useChatTools(editor, workflow?.content, workflowId as Id<'workflows'>)

  const chatOptions: any = {
    initialMessages: cachedMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall,
  }

  const { messages, sendMessage, status } = useChat(chatOptions);

  // Save messages to Query cache whenever they change
  useEffect(() => {
    // Only cache when we have a workflowId to scope the cache
    if (!workflowId) return
    const key = ['chat:messages', workflowId] as const
    queryClient.setQueryData<UIMessage[] | undefined>(key, messages as UIMessage[])
  }, [queryClient, messages, workflowId])

  // Auto-scroll to bottom only when streaming is complete or new message starts
  useEffect(() => {
    // Only scroll when not actively streaming
    if (status !== 'streaming') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, status]);





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    sendMessage(
      { text: trimmed },
      {
        body: {
          workflowId,
        },
      },
    );
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-background max-w-full overflow-x-hidden">
      {/* Área de mensajes con scroll optimizado */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Conversation className="h-full text-sm">
          <ConversationContent className="overflow-y-auto scrollbar-hide">
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </ConversationContent>
        </Conversation>
      </div>

      {/* Área de input compacta con botón dentro del cuadro */}
      <div className="p-2 border-t bg-background/95 backdrop-blur-sm">
        <PromptInput onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              value={input}
              placeholder="Escribe tu mensaje..."
              className="min-h-[72px] md:min-h-[96px] max-h-[160px] pr-9 resize-none text-sm rounded-lg border focus-visible:ring-2"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
            />
            <PromptInputSubmit
              disabled={!input}
              status={status === 'error' ? 'idle' : (status as 'idle' | 'streaming' | 'submitted')}
              className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full shadow-sm"
            />
          </div>
        </PromptInput>
      </div>
    </div>
  );
} 
