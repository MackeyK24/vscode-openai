import { ExtensionContext } from 'vscode'
import { validateApiKey } from '@app/utilities/openai'
import {
  StatusBarServiceProvider,
  GlobalStorageService,
  TelemetryService,
  SecretStorageService,
  setFeatureFlag,
} from '@app/utilities/vscode'
import {
  registerChangeConfiguration,
  registerOpenaiEditor,
  registerOpenaiServiceCommand,
  registerOpenaiSCMCommand,
  registerOpenSettings,
  registerConversationCommand,
  registerEmbeddingView,
  registerConversationsWebviewView,
  registerEmbeddingCommand,
} from '@app/contexts'
import {
  VSCODE_OPENAI_EXTENSION,
  VSCODE_OPENAI_SCM,
  VSCODE_OPENAI_EMBEDDING,
} from '@app/constants'
import {
  ConfigurationSettingService,
  ConfigurationConversationService,
  ConversationStorageService,
  enableServiceFeature,
  ConfigurationEmbeddingService,
  EmbeddingStorageService,
} from '@app/services'
import {
  createDebugNotification,
  createErrorNotification,
  createInfoNotification,
} from '@app/utilities/node'

export function activate(context: ExtensionContext) {
  try {
    // Disable functionality until we validate auth
    setFeatureFlag(VSCODE_OPENAI_EXTENSION.ENABLED_COMMAND_ID, false)
    setFeatureFlag(VSCODE_OPENAI_SCM.ENABLED_COMMAND_ID, false)
    setFeatureFlag(VSCODE_OPENAI_EMBEDDING.ENABLED_COMMAND_ID, false)

    // Enable logging and telemetry
    TelemetryService.init(context)
    createInfoNotification('activate vscode-openai')

    //register storage (Singletons)
    createDebugNotification('initialise storage services')
    SecretStorageService.init(context)
    GlobalStorageService.init(context)

    //load configuration
    createDebugNotification('initialise configuration service')
    ConfigurationSettingService.LogConfigurationService()
    ConfigurationConversationService.LogConfigurationService()
    ConfigurationEmbeddingService.LogConfigurationService()

    createDebugNotification('initialise components')
    StatusBarServiceProvider.init(context)
    StatusBarServiceProvider.instance.showStatusBarInformation(
      'vscode-openai',
      ''
    )

    // registerCommands
    createDebugNotification('register commands')
    registerOpenaiEditor(context)
    registerChangeConfiguration(context)
    registerOpenaiServiceCommand(context)
    registerOpenaiSCMCommand(context)
    registerOpenSettings(context)
    registerEmbeddingCommand(context)
    registerConversationCommand(context)
    // views
    registerEmbeddingView(context)
    registerConversationsWebviewView(context)

    createDebugNotification('starting conversation service')
    ConversationStorageService.init(context)
    EmbeddingStorageService.init(context)

    createDebugNotification('verifying authentication openai service')
    validateApiKey() //On activation check if the api key is valid

    createDebugNotification('verifying enabled features')
    enableServiceFeature()

    createInfoNotification('vscode-openai ready')
  } catch (error: unknown) {
    createErrorNotification(error)
  }
}
