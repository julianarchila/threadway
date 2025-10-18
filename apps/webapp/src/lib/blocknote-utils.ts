import { PartialBlock } from '@blocknote/core'

// Safely deserialize stored BlockNote content
export function blocksFromContent(content: string | undefined) {
  return content ? (JSON.parse(content) as PartialBlock[]) : undefined
}
