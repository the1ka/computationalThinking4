import type { BoardItem, BoardMessage, UpsertMessage } from '#shared/types/board'

let socket: WebSocket | undefined

// Shared board state: every change is applied locally and sent to all other clients.
export function useBoard() {
  const items = useState<BoardItem[]>('board-items', () => [])

  function apply(item: BoardItem) {
    const index = items.value.findIndex((existing) => existing.id === item.id)
    if (index === -1) items.value.push(item)
    else items.value[index] = item
  }

  function connect() {
    if (socket) return
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    socket = new WebSocket(`${protocol}://${location.host}/_ws`)
    socket.onmessage = (event) => {
      const message: BoardMessage = JSON.parse(event.data)
      if (message.kind === 'init') items.value = message.items
      else apply(message.item)
    }
  }

  function update(item: BoardItem) {
    apply(item)
    const message: UpsertMessage = { kind: 'upsert', item }
    socket?.send(JSON.stringify(message))
  }

  return { items, connect, update }
}
