import { window } from 'vscode'
import { Command } from '@app/commands'
import { IConversation } from '@app/interfaces'
import { ConversationStorageService } from '@app/services'

export default class EditConversationCommand implements Command {
  public readonly id = '_vscode-openai.conversation.edit'

  public execute(args: { data: IConversation }) {
    window
      .showInputBox({
        prompt: 'Enter new conversation name',
        value: args.data.summary,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Name cannot be empty'
          }
          return null
        },
      })
      .then((newName) => {
        if (newName) {
          const conversation = args.data
          conversation.summary = newName.trim()
          ConversationStorageService.instance.update(conversation)
        }
      })
  }
}
