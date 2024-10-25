import * as vscode from 'vscode'
import { Command } from '../commandManager'
import ConversationStorageService from '@app/services/storageServices/conversationStorageService'

export default class EditConversationCommand implements Command {
  public readonly id = '_vscode-openai.conversation.edit'

  constructor(
    private readonly conversationStorageService: ConversationStorageService
  ) {}

  public async execute(conversationId: string): Promise<void> {
    try {
      const conversations = await this.conversationStorageService.getAll()
      const conversation = conversations.find(c => c.conversationId === conversationId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const newName = await vscode.window.showInputBox({
        prompt: 'Enter new conversation name',
        value: conversation.summary,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Conversation name cannot be empty'
          }
          return null
        }
      })

      if (newName === undefined) {
        return // User cancelled
      }

      conversation.summary = newName.trim()
      await this.conversationStorageService.update(conversation)

      // Notify webview of the update
      this.conversationStorageService.refresh()
    } catch (error) {
      let errorMessage = 'Failed to edit conversation'
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`
      }
      vscode.window.showErrorMessage(errorMessage)
    }
  }
}
