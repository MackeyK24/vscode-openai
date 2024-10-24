import { FC, useState, KeyboardEvent, ChangeEvent } from 'react'
import {
  TableCell,
  TableCellLayout,
  Input,
  makeStyles,
} from '@fluentui/react-components'
import { IConversation } from '../../interfaces'
import { vscode } from '@common/vscode'

const useStyles = makeStyles({
  editableCell: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground1Hover)',
    },
  },
  input: {
    width: '100%',
  },
})

interface EditableTableCellProps {
  conversation: IConversation
  onOpenConversation: (conversation: IConversation) => void
}

export const EditableTableCell: FC<EditableTableCellProps> = ({
  conversation,
  onOpenConversation,
}) => {
  const styles = useStyles()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editValue, setEditValue] = useState<string>(conversation.summary)

  const handleDoubleClick = (): void => {
    setIsEditing(true)
  }

  const handleSave = (): void => {
    if (editValue.trim() === '') return

    vscode.postMessage({
      command: 'onDidUpdateConversationName',
      text: JSON.stringify({
        conversationId: conversation.conversationId,
        newName: editValue.trim(),
      }),
    })
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setEditValue(conversation.summary)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditValue(e.target.value)
  }

  if (isEditing) {
    return (
      <TableCell>
        <Input
          className={styles.input}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
        />
      </TableCell>
    )
  }

  return (
    <TableCell tabIndex={0} className={styles.editableCell}>
      <TableCellLayout
        description={conversation.summary}
        onClick={() => onOpenConversation(conversation)}
        onDoubleClick={handleDoubleClick}
      />
    </TableCell>
  )
}
