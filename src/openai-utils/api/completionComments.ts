import { window, workspace } from 'vscode'
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai'
import {
  ExtensionStatusBarItem,
  SecretStorageService,
} from '../../vscode-utils'

export async function completionComments(prompt: string): Promise<string> {
  try {
    ExtensionStatusBarItem.instance.setText('sync~spin', 'openai: send-request')
    const apiKey = await SecretStorageService.instance.getAuthApiKey()

    const ws = workspace.getConfiguration('vscode-openai')
    const baseurl = ws.get('baseurl') as string
    const model = ws.get('default-model') as string

    const configuration = new Configuration({
      apiKey: apiKey,
      basePath: baseurl,
    })
    const openai = new OpenAIApi(configuration)

    const completion = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    const answer = completion.data.choices[0].message?.content
    console.log(answer)

    ExtensionStatusBarItem.instance.setText('key', 'openai: ready')
    return answer ? answer : ''
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status)
      console.log(error.response.data)
      throw error
    } else {
      console.log(error.message)
      throw error
    }
  }
}
