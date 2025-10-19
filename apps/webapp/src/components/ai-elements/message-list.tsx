'use client'

import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import type { UIMessage } from 'ai'

type Props = {
  messages: UIMessage[]
}

export default function MessageList({ messages }: Props) {
  return (
    <>
      {messages
        .filter((m) => m.role !== 'system')
        .map((message) => (
          <div key={message.id}>
            <Message from={message.role as 'user' | 'assistant'}>
              <MessageContent className={
                message.role === 'assistant'
                  ? 'prose prose-sm text-foreground break-words'
                  : 'break-words'
              }>
                {message.parts?.map((part, i) => {
                  if (part.type === 'text') {
                    return message.role === 'assistant' ? (
                      <Response key={`${message.id}-${i}`}>{part.text}</Response>
                    ) : (
                      <div key={`${message.id}-${i}`} className="prose prose-sm max-w-none">
                        {part.text}
                      </div>
                    )
                  }
                  return null
                }) || (
                  <div className="prose prose-sm max-w-none">{JSON.stringify(message)}</div>
                )}
              </MessageContent>
            </Message>
          </div>
        ))}
    </>
  )
}
