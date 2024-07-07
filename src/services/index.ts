import { ExtensionContext } from 'vscode'

import { createDebugNotification } from '@app/apis/node'
import { validateApiKey } from '@app/apis/openai'

import {
  ConversationStorageService,
  EmbeddingStorageService,
} from './storageServices'

import { registerConfigurationMonitorService } from './configurationMonitorServices'
import {
  ConversationConfig as ccs,
  ConversationColorConfig as cccs,
  ConfigurationEmbeddingService,
  ConfigurationSettingService,
} from './configurationServices'
import { GlobalStorageService, SecretStorageService } from '@app/apis/vscode'
import { enableServiceFeature } from './featureFlagServices'

export {
  ConfigurationSettingService,
  ConversationConfig,
  ConfigurationEmbeddingService,
} from './configurationServices'

export {
  ConversationStorageService,
  EmbeddingStorageService,
} from './storageServices'

export {
  enableServiceFeature,
  featureVerifyApiKey,
} from './featureFlagServices'

export function registerVscodeOpenAIServices(context: ExtensionContext) {
  //register storage (Singletons)
  createDebugNotification('initialise vscode services')
  SecretStorageService.init(context)
  GlobalStorageService.init(context)

  createDebugNotification('starting storage services')
  registerConfigurationMonitorService(context)
  ConversationStorageService.init(context)
  EmbeddingStorageService.init(context)

  //load configuration
  createDebugNotification('log configuration service')
  ConfigurationSettingService.LogConfigValue()
  ccs.log()
  cccs.log()
  ConfigurationEmbeddingService.LogConfigValue()

  createDebugNotification('verifying service authentication')
  validateApiKey() //On activation check if the api key is valid

  createDebugNotification('verifying enabled features')
  enableServiceFeature()
}
