'use client';

import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
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
// import { Response } from '@/components/response';
// import {
//   Source,
//   Sources,
//   SourcesContent,
//   SourcesTrigger,
// } from '@/components/sources';
// import {
//   Reasoning,
//   ReasoningContent,
//   ReasoningTrigger,
// } from '@/components/reasoning';
import { Loader } from '@/components/ai-elements/loader';

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
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
        },
      );
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
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

      <div className="p-4 border-t">
        <PromptInput onSubmit={handleSubmit} className="w-full">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Ask me anything..."
            className="min-h-[60px]"
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit 
              disabled={!input} 
              status={status === 'error' ? 'idle' : status as 'idle' | 'streaming' | 'submitted'} 
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
} 