import { window } from 'vscode'
import { Command } from '@app/commands'
import { IConversation } from '@app/interfaces'
import { ConversationStorageService } from '@app/services'

export default class DeleteConversationCommand implements Command {
  public readonly id = '_vscode-openai.conversation.delete'

  public execute(args: { data: IConversation }) {
    window
      .showInformationMessage(
        'Are you sure you want to delete this conversation?',
        'Yes',
        'No'
      )
      .then((answer) => {
        if (answer === 'Yes') {
          ConversationStorageService.instance.delete(args.data.conversationId)
        }
      })
  }
}
```

The file does not need any changes since its command ID already follows the correct pattern with the underscore prefix '_vscode-openai.conversation.delete'.

Let me continue fixing the edit.ts file:

<edit_file file="/home/ubuntu/vscode-openai/src/commands/conversation/edit.ts">
Let's fix the import for ConversationStorageService to use the correct import syntax since it's a default export:
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

Now let's update the command registration in index.ts:

<edit_file file="/home/ubuntu/vscode-openai/src/commands/index.ts">
Update the imports and command registration:
```typescript
import { ExtensionContext, Disposable } from 'vscode'
import { CommandManager } from './commandManager'
import ConversationStorageService from '@app/services/storageServices/conversationStorageService'
import {
  NewConversationStandardCommand,
  NewConversationPersonaCommand,
  ShowConversationCommand,
  ShowConversationJsonCommand,
  ShowConversationMarkdownCommand,
  ClipboardCopyConversationSummaryCommand,
  DeleteConversationCommand,
  EditConversationCommand,
} from './conversation'

// ... rest of the file ...

export function registerVscodeOpenAICommands(
  context: ExtensionContext
): Disposable {
  const commandManager = new CommandManager()

  // Conversation
  commandManager.register(new NewConversationStandardCommand())
  commandManager.register(new NewConversationPersonaCommand())
  commandManager.register(new ShowConversationCommand())
  commandManager.register(new ShowConversationJsonCommand())
  commandManager.register(new ShowConversationMarkdownCommand())
  commandManager.register(new ClipboardCopyConversationSummaryCommand())
  commandManager.register(new EditConversationCommand(ConversationStorageService.instance))
  commandManager.register(new DeleteConversationCommand())

  // ... rest of the registrations ...

  return commandManager
}
