/**
 * This function runs a multistep configuration for vscode-openai
 * 	Steps:
 * 		1 - Select the authentication type
 * 		Store and activate configuration
 */

import { QuickPickItem, ExtensionContext } from 'vscode'
import {
  MultiStepInput,
  SecretStorageService,
  getGitAccessToken,
} from '@app/apis/vscode'
import { ConfigurationSettingService } from '@app/services'
import { HttpRequest, createErrorNotification } from '@app/apis/node'

/**
 * This function sets up a quick pick menu for configuring the OpenAI service provider.
 * @param context - The extension context.
 * @returns void
 */
export async function quickPickSetupVscodeOpenai(
  _context: ExtensionContext
): Promise<void> {
  interface State {
    title: string
    step: number
    totalSteps: number
    authType: QuickPickItem
  }

  async function collectInputs() {
    const state = {} as Partial<State>
    await MultiStepInput.run((input) => selectAuthentication(input, state))
    return state as State
  }

  const title = 'Configure Service Provider (vscode-openai)'

  /**
   * This function displays a quick pick menu for selecting an OpenAI model and updates the application's state accordingly.
   * @param input - The multi-step input object.
   * @param state - The current state of the application.
   */
  async function selectAuthentication(
    input: MultiStepInput,
    state: Partial<State>
  ): Promise<void> {
    const models = getAvailableRuntimes()
    // Display quick pick menu for selecting an OpenAI model and update application's state accordingly.
    // Return void since this is not used elsewhere in the code.
    state.authType = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 1,
      ignoreFocusOut: true,
      placeholder: 'Selected OpenAI Model',
      items: models,
      activeItem: state.authType,
      shouldResume: shouldResume,
    })
  }

  function getAvailableRuntimes(): QuickPickItem[] {
    const quickPickItemTypes: QuickPickItem[] = [
      {
        label: '$(github)  GitHub',
        description:
          'Use your github.com profile to sign into to vscode-openai service',
      },
      // {
      //   label: 'Microsoft',
      //   description:
      //     'Use microsoft profile to sign into to vscode-openai service',
      // },
    ]
    return quickPickItemTypes
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((_resolve, _reject) => {
      // noop
    })
  }

  async function getApiKey(): Promise<string | undefined> {
    try {
      const accessToken = await getGitAccessToken()
      const request = new HttpRequest(
        'GET',
        `Bearer ${accessToken}`,
        'https://api.arbs.io/openai/oauth2/token'
      )
      const resp = await request.send()
      return resp.token as string
    } catch (error) {
      createErrorNotification(error)
      return undefined
    }
  }

  await collectInputs()
  const accessToken = await getApiKey()
  if (!accessToken) return

  await SecretStorageService.instance.setAuthApiKey(accessToken)
  ConfigurationSettingService.serviceProvider = 'VSCode-OpenAI'
  ConfigurationSettingService.baseUrl = `https://api.arbs.io/openai/inference/v1`
  ConfigurationSettingService.defaultModel = 'gpt-4o'
  ConfigurationSettingService.azureDeployment = 'gpt-4o'
  ConfigurationSettingService.scmModel = 'gpt-4o'
  ConfigurationSettingService.scmDeployment = 'gpt-4o'
  ConfigurationSettingService.embeddingModel = 'text-embedding-ada-002'
  ConfigurationSettingService.embeddingsDeployment = 'text-embedding-ada-002'
  ConfigurationSettingService.azureApiVersion = '2024-02-01'
}
