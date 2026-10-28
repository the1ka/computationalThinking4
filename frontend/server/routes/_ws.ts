import type { BoardItem, BoardMessage, UpsertMessage } from '#shared/types/board'

// The shared board lives here, in memory. Every client gets it on connect and receives all changes.
const items = new Map<string, BoardItem>([
  ['hello', { id: 'hello', type: 'note', x: 120, y: 120, width: 192, height: 192, color: 'yellow', fontSize: 'S', bold: false, text: 'Hello, board!' }],
])

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe('board')
    const init: BoardMessage = { kind: 'init', items: [...items.values()] }
    peer.send(JSON.stringify(init))
  },
  message(peer, message) {
    const { item } = message.json<UpsertMessage>()
    items.set(item.id, item)
    peer.publish('board', message.text())
  },
})
