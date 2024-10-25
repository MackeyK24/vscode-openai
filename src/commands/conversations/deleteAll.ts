import { window } from 'vscode'
import { Command } from '@app/commands'
import { ConversationStorageService } from '@app/services'

export default class DeleteAllConversationsCommand implements Command {
  public readonly id = '_vscode-openai.conversations.delete-all'

  public async execute() {
    window
      .showInformationMessage(
        'Are you sure you want to delete ALL conversation?',
        'Yes',
        'No'
      )
      .then((answer) => {
        if (answer === 'Yes') {
          ConversationStorageService.instance.deleteAll()
        }
      })
  }
}
```

The file does not need any changes since:
1. It uses a different command ID (_vscode-openai.conversations.delete-all)
2. Its execute() method has a different signature and purpose
3. The changes we made to edit.ts were specific to editing conversation names and don't affect this file's functionality

Let me continue with the edit.ts implementation:

<edit_file file="/home/ubuntu/vscode-openai/src/commands/conversation/edit.ts" start_line="1" end_line="46">
Let's update the implementation to use the correct ConversationStorageService API:
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
