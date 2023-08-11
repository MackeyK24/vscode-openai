import { commands, ExtensionContext, Uri } from 'vscode'
import { IChatCompletion, IConversation } from '@app/types'
import { getSystemPersonas } from '@app/models'

import {
  PromptFactory,
  BountyPromptFactory,
  // CommentPromptFactory,
  ExplainPromptFactory,
  OptimizePromptFactory,
  PatternPromptFactory,
  createChatCompletion,
  ResponseFormat,
} from '@app/apis/openai'
import { compareFileToClipboard } from '@app/apis/vscode'
import { VSCODE_OPENAI_PROMPT } from '@app/constants'
import { ConversationStorageService } from '@app/services'
import { createErrorNotification } from '@app/apis/node'

// Define a command registry that uses the factory pattern
class CommandRegistry {
  private factories: Map<string, PromptFactory>

  constructor() {
    this.factories = new Map([
      // [
      //   VSCODE_OPENAI_PROMPT.PROMPT_COMMENTS_COMMAND_ID,
      //   new CommentPromptFactory(),
      // ],
      [
        VSCODE_OPENAI_PROMPT.PROMPT_EXPLAIN_COMMAND_ID,
        new ExplainPromptFactory(),
      ],
      [
        VSCODE_OPENAI_PROMPT.PROMPT_BOUNTY_COMMAND_ID,
        new BountyPromptFactory(),
      ],
      [
        VSCODE_OPENAI_PROMPT.PROMPT_OPTIMIZE_COMMAND_ID,
        new OptimizePromptFactory(),
      ],
      [
        VSCODE_OPENAI_PROMPT.PROMPT_PATTERNS_COMMAND_ID,
        new PatternPromptFactory(),
      ],
    ])
  }

  registerCommands(context: ExtensionContext) {
    for (const [commandId, factory] of this.factories.entries()) {
      const commandHandler = async (_uri: Uri) => {
        try {
          const persona = getSystemPersonas().find(
            (a) => a.roleName === 'Developer/Programmer'
          )
          if (persona) {
            const conversation: IConversation =
              await ConversationStorageService.instance.create(persona)
            const prompt = await factory.createPrompt()()

            const chatCompletion: IChatCompletion = {
              content: prompt,
              author: 'vscode-openai-editor',
              timestamp: new Date().toLocaleString(),
              mine: false,
              completionTokens: 0,
              promptTokens: 0,
              totalTokens: 0,
            }
            conversation.chatMessages.push(chatCompletion)
            const result = await createChatCompletion(
              conversation,
              ResponseFormat.SourceCode
            )
            compareFileToClipboard(result?.content ? result?.content : '')
          }
        } catch (e) {
          createErrorNotification(e)
        }
      }
      context.subscriptions.push(
        commands.registerCommand(commandId, commandHandler)
      )
    }
  }
}

// Register the commands using the registry
export function registerOpenaiEditor(context: ExtensionContext) {
  try {
    const registry = new CommandRegistry()
    registry.registerCommands(context)
  } catch (error) {
    createErrorNotification(error)
  }
}
