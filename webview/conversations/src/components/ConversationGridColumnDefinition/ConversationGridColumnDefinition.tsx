import {
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  TableCell,
} from '@fluentui/react-components'
import { IConversation } from '@app/interfaces'
import { vscode } from '@app/utilities'
import useConversationAvatar from './useConversationAvatar'
import { EditableTableCell } from '../EditableTableCell'

const handleOpenConversation = (conversation: IConversation) => {
  vscode.postMessage({
    command: 'onDidOpenConversationWebview',
    text: JSON.stringify(conversation),
  })
}

const ConversationGridColumnDefinition: TableColumnDefinition<IConversation>[] = [
  createTableColumn<IConversation>({
    columnId: 'persona',
    compare: (a: IConversation, b: IConversation) => {
      return a.timestamp - b.timestamp
    },
    renderHeaderCell: () => {
      return ''
    },
    renderCell: (item: IConversation) => {
      const avatarComponent = useConversationAvatar(item) // Call the getStatus function to get the Avatar component
      return (
        <div id="personadiv">
          <TableCell tabIndex={0}>
            <TableCellLayout media={avatarComponent} />
          </TableCell>
        </div>
      )
    },
  }),
  createTableColumn<IConversation>({
    columnId: 'summary',
    compare: (a: IConversation, b: IConversation) => {
      return a.timestamp - b.timestamp
    },
    renderHeaderCell: () => {
      return 'Summary'
    },
    renderCell: (conversation: IConversation) => {
      return (
        <EditableTableCell
          conversation={conversation}
          onOpenConversation={handleOpenConversation}
        />
      )
    },
  }),
]

export default ConversationGridColumnDefinition
