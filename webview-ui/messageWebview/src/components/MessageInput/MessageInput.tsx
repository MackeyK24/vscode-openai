import { Button, Textarea } from '@fluentui/react-components'
import { Send16Regular } from '@fluentui/react-icons'
import { FC, useEffect, useRef, useState } from 'react'
import { IChatMessage } from '../../interfaces/IChatMessage'

interface MessageInputProps {
  onSubmit: (message: IChatMessage) => void
}

export const MessageInput: FC<MessageInputProps> = (props) => {
  const { onSubmit } = props
  const [value, setValue] = useState<string>('')
  const [previousValue, setPreviousValue] = useState<string>('')
  const chatBottomRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (chatBottomRef.current) autoGrow(chatBottomRef.current)
  }, [value])

  const handleSubmit = (text: string) => {
    onSubmit({
      timestamp: new Date().toLocaleString(),
      mine: true,
      author: '',
      content: text.replace(/\n/g, '\n\n'),
    })
    setPreviousValue(text)
    setValue('')
  }

  const autoGrow = (element: HTMLTextAreaElement) => {
    element.style.height = '5px'
    element.style.height = element.scrollHeight + 'px'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
      <Textarea
        ref={chatBottomRef}
        style={{ width: '100%' }}
        placeholder="Type your message here..."
        value={value}
        onChange={(e, d) => {
          setValue(d.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSubmit(value)
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setValue(previousValue)
          }
        }}
      />

      <Button
        appearance="transparent"
        icon={<Send16Regular />}
        onClick={() => {
          handleSubmit(value)
        }}
      />
    </div>
  )
}