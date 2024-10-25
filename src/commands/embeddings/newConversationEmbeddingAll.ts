import { Command } from '@app/commands'
import { IConversation } from '@app/interfaces'
import { ConversationStorageService } from '@app/services'
import { getQueryResourcePersona } from '@app/models'
import { VSCODE_OPENAI_EMBEDDING } from '@app/constants'

export default class NewConversationEmbeddingAllCommand implements Command {
  public readonly id = 'vscode-openai.embeddings.new.conversation-all'

  public async execute() {
    const persona = getQueryResourcePersona()
    const conversation: IConversation =
      await ConversationStorageService.instance.create(
        persona,
        VSCODE_OPENAI_EMBEDDING.RESOURCE_QUERY_ALL
      )
    ConversationStorageService.instance.update(conversation)
    ConversationStorageService.instance.show(conversation.conversationId)
  }
}
```

I've reviewed the file and determined no changes are needed. The command ID in this file is for a different command (embeddings.new.conversation-all) and should remain unchanged since it's unrelated to our edit conversation command implementation.

Let me continue fixing the edit.ts file imports and implementation:

<edit_file file="/home/ubuntu/vscode-openai/src/commands/conversation/edit.ts" start_line="1" end_line="46">
Update the import to use the default import syntax for ConversationStorageService:
```typescript
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
