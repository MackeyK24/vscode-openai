import {
  Webview,
  window,
  Uri,
  ColorThemeKind,
  WebviewView,
  WebviewViewProvider,
  TextDocument,
  WebviewViewResolveContext,
  CancellationToken,
  ColorTheme,
} from 'vscode'
import { IConversation } from '../interfaces'
import { GlobalStorageService, getNonce, getUri } from '../vscodeUtilities'
import { ChatMessageViewerPanel } from '../panels'

export class ConversationsWebviewProvider implements WebviewViewProvider {
  _view?: WebviewView
  _doc?: TextDocument

  constructor(private readonly _extensionUri: Uri) {
    window.onDidChangeActiveColorTheme((theme: ColorTheme) => {
      this._refreshWebview()
    })
  }

  public resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    }

    this._refreshWebview()
  }

  private _refreshWebview() {
    if (!this._view) return
    this._view.webview.html = this._getHtmlForWebview(
      this._view.webview,
      this._extensionUri
    )

    this._setWebviewMessageListener(this._view.webview, this._extensionUri)
    this._sendWebviewLoadData()

    this._view.onDidChangeVisibility((e) => {
      if (this._view?.visible) {
        this._sendWebviewLoadData()
      }
    }, null)
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const scriptUri = getUri(webview, extensionUri, [
      'out',
      'webview-ui',
      'conversationsWebview',
      'index.js',
    ])

    const panelTheme = {
      [ColorThemeKind.Light]: 'light',
      [ColorThemeKind.Dark]: 'dark',
      [ColorThemeKind.HighContrast]: 'dark',
      [ColorThemeKind.HighContrastLight]: 'light',
    }[window.activeColorTheme.kind]

    const nonce = getNonce()

    return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * 'self' data: https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <title>Claimset</title>
          </head>
          <body style="margin:0;padding:0">
            <div id="root" theme='${panelTheme}' />
            <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
          </body>
        </html>
      `
  }

  /**
   *
   * Event Model:
   *    | source		| target		| command												| model						|
   *    |-----------|-----------|-------------------------------|-----------------|
   *    | extension	| webview		| rqstViewLoadConversations			| IConversation[]	|
   *    | webview		| extension	| rcvdViewDeleteConversation		| IConversation		|
   *
   *
   */
  private _sendWebviewLoadData() {
    const keys = GlobalStorageService.instance.keys()
    const conversations: IConversation[] = []

    keys.forEach((key) => {
      if (key.startsWith('conversation-')) {
        const conversation =
          GlobalStorageService.instance.getValue<IConversation>(key)
        if (conversation !== undefined) {
          conversations.push(conversation)
        }
      }
    })

    this._view?.webview.postMessage({
      command: 'rqstViewLoadConversations',
      text: JSON.stringify(conversations),
    })
  }

  private _setWebviewMessageListener(webview: Webview, extensionUri: Uri) {
    webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'openConversation':
          // eslint-disable-next-line no-case-declarations
          const openConversation: IConversation = JSON.parse(message.text)
          ChatMessageViewerPanel.render(extensionUri, openConversation)
          return

        case 'rcvdViewDeleteConversation':
          // eslint-disable-next-line no-case-declarations
          const rcvdViewDeleteConversation: IConversation = JSON.parse(
            message.text
          )
          GlobalStorageService.instance.deleteKey(
            `conversation-${rcvdViewDeleteConversation.conversationId}`
          )
          this._sendWebviewLoadData()
          return

        default:
          window.showErrorMessage(message.command)
          return
      }
    }, null)
  }
}