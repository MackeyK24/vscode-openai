import { EmbeddingTreeDataProvider } from '@app/providers'
import { Command } from '@app/commands'

export default class RefreshCommand implements Command {
  public readonly id = '_vscode-openai.embeddings.refresh'
  public constructor(private _instance: EmbeddingTreeDataProvider) {}

  public async execute() {
    this._instance.refresh()
  }
}

I don't need to make any changes to refresh.ts as its command ID is already correctly formatted with the underscore prefix and matches the pattern used in package.json.

Let me continue fixing edit.ts with the correct import syntax for the default export:

<edit_file file="/home/ubuntu/vscode-openai/src/commands/conversation/edit.ts" start_line="1" end_line="46">
Fix the ConversationStorageService import to use default import syntax:
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
```
</edit_file>

Now let's update index.ts to register the command correctly:

<edit_file file="/home/ubuntu/vscode-openai/src/commands/index.ts" start_line="42" end_line="55">
Update the command registration to use ConversationStorageService.instance:
```typescript
  // Conversation
  commandManager.register(new NewConversationStandardCommand())
  commandManager.register(new NewConversationPersonaCommand())
  commandManager.register(new ShowConversationJsonCommand())
  commandManager.register(new ShowConversationMarkdownCommand())
  commandManager.register(new ClipboardCopyConversationSummaryCommand())
  commandManager.register(new EditConversationCommand(ConversationStorageService.instance))
  commandManager.register(new DeleteConversationCommand())

  // Conversations
  commandManager.register(new RefreshConversationsCommand())
