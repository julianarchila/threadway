'use client';

import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Loader } from '@/components/ai-elements/loader';
import { WorkflowInfo } from '@/components/ai-elements/workflow-info';
import { useParams } from '@tanstack/react-router';

const models = [
  {
    name: 'GPT-4o',
    value: 'gpt-4o',
  },
  {
    name: 'GPT-4o Mini',
    value: 'gpt-4o-mini',
  },
  {
    name: 'GPT-4 Turbo',
    value: 'gpt-4-turbo',
  },
  {
    name: 'GPT-3.5 Turbo',
    value: 'gpt-3.5-turbo',
  },
];

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  
  // Obtener el workflowId de los parámetros de la ruta
  const { workflowId } = useParams({ from: '/_dashboard/f/$workflowId' });

  const { messages, sendMessage, status } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    sendMessage(
      { text: trimmed },
      {
        body: {
          model,
          workflowId,
        },
      },
    );
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Área de mensajes con scroll optimizado */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Conversation className="h-full">
        <ConversationContent>
            {messages.filter(message => message.role !== 'system').map((message) => (
              <div key={message.id}>
                <Message from={message.role as 'user' | 'assistant'} key={message.id}>
                  <MessageContent>
                    {message.parts?.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          <div key={`${message.id}-${i}`} className="prose prose-sm max-w-none">
                            {part.text}
                          </div>
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

      {/* Área de input optimizada para espacios pequeños */}
      <div className="p-3 border-t bg-background/95 backdrop-blur-sm">
        <PromptInput onSubmit={handleSubmit} className="w-full">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Pregunta algo sobre el workflow..."
            className="min-h-[50px] max-h-[120px] resize-none text-sm"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          />
          <PromptInputToolbar className="mt-2">
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger className="h-8 text-xs">
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value} className="text-xs">
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit 
              disabled={!input} 
              status={status === 'error' ? 'idle' : status as 'idle' | 'streaming' | 'submitted'}
              className="h-8 w-8"
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
} 