'use client';

import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Loader } from '@/components/ai-elements/loader';
import { useParams } from '@tanstack/react-router';
import {
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { api } from '@threadway/backend/convex/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { useCreateBlockNote } from '@blocknote/react';
import { Id } from '@threadway/backend/convex/dataModel';
import { PartialBlock } from '@blocknote/core';

import { useMutation } from "convex/react";

// Model selection removed; always use server default

function blocksFromContent(content: string | undefined) {
  // Gets the previously stored editor contents.
  return content ? (JSON.parse(content) as PartialBlock[]) : undefined;
}

export default function Chatbot() {
  const [input, setInput] = useState('');
  // Model state removed

  const editor = useCreateBlockNote({});

  // Obtener el workflowId de los parámetros de la ruta
  const { workflowId } = useParams({ from: '/_dashboard/f/$workflowId' });

  const updateWorkflowMutation = useMutation(api.workflows.mutations.update);


  const { data: workflow } = useSuspenseQuery(convexQuery(api.workflows.queries.getWorkflowById, { workflowId: workflowId as Id<"workflows"> }));


  const { messages, sendMessage, status, addToolResult } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls, async onToolCall({ toolCall }) {
      console.log('Tool call:', toolCall);
      if (toolCall.dynamic) {
        return;
      }


      if (toolCall.toolName === 'readWorkflowContent') {

        const blocks = blocksFromContent(workflow?.content)

        const content = await editor.blocksToMarkdownLossy(blocks);
        addToolResult({
          tool: 'readWorkflowContent',
          toolCallId: toolCall.toolCallId,
          output: content ?? '',
        })
      }

      if (toolCall.toolName === "editWorkflowContent") {
        console.log('Editing workflow content with:', toolCall.input);
        try {
          const markdown: string = (toolCall as unknown as { input: { content: string } }).input.content;
          const parsedBlocks = await editor.tryParseMarkdownToBlocks(markdown);
          const serialized = JSON.stringify(parsedBlocks ?? []);
          await updateWorkflowMutation({
            workflowId: workflowId as Id<'workflows'>,
            content: serialized,
          });
          addToolResult({
            tool: 'editWorkflowContent',
            toolCallId: toolCall.toolCallId,
            output: 'ok',
          });
        } catch (err) {
          console.error('editWorkflowContent failed', err);
          addToolResult({
            tool: 'editWorkflowContent',
            toolCallId: toolCall.toolCallId,
            output: 'error',
          });
        }
      }

    }
  });





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
          <ConversationContent>
            {messages.filter(message => message.role !== 'system').map((message) => (
              <div key={message.id}>
                <Message from={message.role as 'user' | 'assistant'} key={message.id}>
                  <MessageContent className={message.role === 'assistant' ? 'prose prose-sm text-foreground break-words' : 'break-words'}>
                    {message.parts?.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          message.role === 'assistant' ? (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          ) : (
                            <div key={`${message.id}-${i}`} className="prose prose-sm max-w-none">
                              {part.text}
                            </div>
                          )
                        );
                      }
                      return null;
                    }) || (
                      <div className="prose prose-sm max-w-none">
                        {JSON.stringify(message)}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
        </Conversation>
      </div>

      {/* Área de input compacta con botón dentro del cuadro */}
      <div className="p-2 border-t bg-background/95 backdrop-blur-sm">
        <PromptInput onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
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
