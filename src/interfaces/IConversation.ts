import { IPersonaOpenAI, IChatCompletion } from '@app/interfaces'

export interface IConversation {
  timestamp: number
  conversationId: string
  persona: IPersonaOpenAI
  summary: string
  embeddingId?: Array<string>
  chatMessages: IChatCompletion[]
}
