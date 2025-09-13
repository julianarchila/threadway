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
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
// removed toasts per request
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
  const processedToolIdsRef = useRef<Set<string>>(new Set());
  const [, setHiddenToolMessageIds] = useState<string[]>([]);

  // --- Simple client-side utilities (no backend) ---
  function normalize(text: string) {
    return text.trim();
  }

  function findTitleInput(): HTMLInputElement | null {
    const lookup = () => document.querySelector('input[placeholder="Enter workflow title..."]') as HTMLInputElement | null;
    const input = lookup();
    if (input) return input;
    const h1 = document.querySelector('h1[title="Click to edit title"]') as HTMLElement | null;
    h1?.click();
    // if not immediately available, wait a tick
    return lookup();
  }

  function setInputValue(inputEl: HTMLInputElement, value: string) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(inputEl, value);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function focusProseMirror(): HTMLElement | null {
    const prose = document.querySelector('.ProseMirror') as HTMLElement | null;
    prose?.focus();
    return prose;
  }

  function setCaretToEnd(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function insertText(text: string) {
    // Works with ProseMirror contenteditable
    document.execCommand('insertText', false, text);
  }

  async function tryHandleLocalCommand(raw: string): Promise<boolean> {
    const text = normalize(raw);

    // Cambiar título
    const titleRegexes = [
      /^edita\s+el\s+t[ií]tulo\s+(?:a|por|:)\s+(.+)$/i,
      /^cambia\s+el\s+t[ií]tulo\s+(?:a|por|:)\s+(.+)$/i,
      /^pon(?:e|)\s+el\s+t[ií]tulo\s+(?:a|por|:)\s+(.+)$/i,
      /^pon(?:e|)\s+el\s+t[ií]tulo\s+(.+)$/i,
    ];
    for (const rx of titleRegexes) {
      const m = text.match(rx);
      if (m?.[1]) {
        const newTitle = m[1].trim();
        // wait up to ~500ms for the input to appear
        let inputEl: HTMLInputElement | null = null;
        for (let i = 0; i < 5; i++) {
          inputEl = findTitleInput();
          if (inputEl) break;
          await new Promise(r => setTimeout(r, 100));
        }
        if (!inputEl) { return true; }
        setInputValue(inputEl, newTitle);
        inputEl.blur();
        // title updated
        return true;
      }
    }

    // Reemplazar contenido completo
    const replaceRegexes = [
      /^reemplaza\s+el\s+contenido\s+(?:por|con|:)\s+([\s\S]+)$/i,
      /^reemplazar\s+el\s+contenido\s+(?:por|con|:)\s+([\s\S]+)$/i,
    ];
    for (const rx of replaceRegexes) {
      const m = text.match(rx);
      if (m?.[1]) {
        // wait up to ~500ms for editor
        let prose = focusProseMirror();
        for (let i = 0; !prose && i < 5; i++) {
          await new Promise(r => setTimeout(r, 100));
          prose = focusProseMirror();
        }
        if (!prose) { return true; }
        document.execCommand('selectAll', false);
        insertText(m[1].trim());
        // content replaced
        return true;
      }
    }

    // Agregar texto al final
    const addRegexes = [
      /^agrega(?:r|)\s+texto\s+([\s\S]+)$/i,
      /^agrega(?:r|)\s+([\s\S]+)$/i,
    ];
    for (const rx of addRegexes) {
      const m = text.match(rx);
      if (m?.[1]) {
        let prose = focusProseMirror();
        for (let i = 0; !prose && i < 5; i++) {
          await new Promise(r => setTimeout(r, 100));
          prose = focusProseMirror();
        }
        if (!prose) { return true; }
        setCaretToEnd(prose);
        insertText('\n' + m[1].trim());
        // text appended
        return true;
      }
    }

    return false;
  }

  // Detect and execute tool tags emitted by the assistant
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;
      if (processedToolIdsRef.current.has(msg.id)) continue;
      const fullText = (msg.parts || [])
        .map((p: any) => (p?.type === 'text' ? p.text : ''))
        .join('\n');
      const m = fullText.match(/<tool\s+name=\"(set_title|replace_content|append_text)\">([\s\S]*?)<\/tool>/i);
      if (!m) continue;
      const action = m[1] as 'set_title' | 'replace_content' | 'append_text';
      const payload = m[2]?.trim() ?? '';

      (async () => {
        try {
          if (action === 'set_title') {
            // wait for title input
            let inputEl: HTMLInputElement | null = null;
            for (let i = 0; i < 5; i++) {
              inputEl = findTitleInput();
              if (inputEl) break;
              await new Promise(r => setTimeout(r, 100));
            }
            if (inputEl) {
              setInputValue(inputEl, payload);
              inputEl.blur();
            }
          } else if (action === 'replace_content') {
            let prose = focusProseMirror();
            for (let i = 0; !prose && i < 5; i++) {
              await new Promise(r => setTimeout(r, 100));
              prose = focusProseMirror();
            }
            if (prose) {
              document.execCommand('selectAll', false);
              insertText(payload);
            }
          } else if (action === 'append_text') {
            let prose = focusProseMirror();
            for (let i = 0; !prose && i < 5; i++) {
              await new Promise(r => setTimeout(r, 100));
              prose = focusProseMirror();
            }
            if (prose) {
              setCaretToEnd(prose);
              insertText('\n' + payload);
            }
          }
        } finally {
          processedToolIdsRef.current.add(msg.id);
          setHiddenToolMessageIds(prev => (prev.includes(msg.id) ? prev : [...prev, msg.id]));
        }
      })();
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Try local client-side command (no backend)
    const handled = await tryHandleLocalCommand(trimmed);
    if (handled) {
      setInput('');
      return;
    }

    // Fallback: send to model with tooling instructions
    const toolPreamble = [
      '[TOOLING]',
      'You may decide to perform ONE client-side tool by outputting EXACTLY one line with one of:',
      '<tool name="set_title">NEW TITLE</tool>',
      '<tool name="replace_content">NEW CONTENT</tool>',
      '<tool name="append_text">TEXT TO APPEND</tool>',
      'If no tool is needed, reply normally. Do not add any extra text when emitting a tool tag.',
      '[/TOOLING]',
      '',
    ].join('\n');

    sendMessage(
      { text: toolPreamble + trimmed },
      {
        body: {
          model: model,
        },
      },
    );
    setInput('');
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