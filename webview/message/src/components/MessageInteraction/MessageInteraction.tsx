import { makeStyles, mergeClasses } from '@fluentui/react-components'
import { FC, useEffect, useRef, useState, useCallback } from 'react'
import { MessageHistory } from '../MessageHistory'
import { MessageInput } from '../MessageInput'
import { vscode } from '../../utilities/vscode'
import { IChatCompletion } from '../../interfaces'

const MessageInteraction: FC = () => {
  const bottomAnchorRef = useRef<HTMLDivElement>(null)
  const [chatHistory, setChatHistory] = useState<IChatCompletion[]>([])
  const [autoSaveThreshold, setAutoSaveThreshold] = useState<number>(0)
  const messageStyles = useMessageStyles()

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (chatHistory.length > autoSaveThreshold) {
      vscode.postMessage({
        command: 'onDidSaveMessages',
        text: JSON.stringify(chatHistory),
      })
    }
  }, [chatHistory, autoSaveThreshold])

  const handleMessageEvent = useCallback((event: MessageEvent) => {
    if (!event.origin.startsWith('vscode-webview://')) return

    const message = event.data
    switch (message.command) {
      case 'onWillRenderMessages': {
        const chatMessages: IChatCompletion[] = JSON.parse(message.text)
        setAutoSaveThreshold(chatMessages.length)
        setChatHistory(chatMessages)
        break
      }

      case 'onWillAnswerMessage': {
        const chatMessage: IChatCompletion = JSON.parse(message.text)
        setChatHistory((prevHistory) => [...prevHistory, chatMessage])
        break
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent)
    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [handleMessageEvent])

  return (
    <div className={mergeClasses(messageStyles.container)}>
      <div className={mergeClasses(messageStyles.history)}>
        {chatHistory.map((chatCompletion) => (
          <MessageHistory
            key={chatCompletion.timestamp}
            message={chatCompletion}
          />
        ))}
        <div ref={bottomAnchorRef} />
      </div>
      <div className={mergeClasses(messageStyles.input)}>
        <MessageInput
          onSubmit={(m) => {
            setChatHistory((prevHistory) => [...prevHistory, m])
          }}
        />
      </div>
    </div>
  )
}
export default MessageInteraction

const useMessageStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: 'auto',
    height: 'auto',
  },
  history: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    rowGap: '2px',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingBottom: '7rem',
    overflowY: 'auto',
  },
  input: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: '2rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '2rem',
  },
})
