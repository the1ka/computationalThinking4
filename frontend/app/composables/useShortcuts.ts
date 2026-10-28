import type { BoardItem } from '#shared/types/board'
import { ITEM_TYPES } from '~/models'

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

// Keyboard shortcuts for the selected item: copy, paste, duplicate and moving with the arrow keys.
export function useShortcuts() {
  const { items, update } = useBoard()
  const { selectedId, editingId, clipboard } = useLocalState()

  function insertCopyOf(source: BoardItem) {
    const copy = ITEM_TYPES[source.type].copied(source)
    update(copy)
    selectedId.value = copy.id
    return copy
  }

  function onKeyDown(event: KeyboardEvent) {
    if (editingId.value || (event.target as HTMLElement).closest('textarea, input')) return
    const item = items.value.find((candidate) => candidate.id === selectedId.value)
    const modifier = event.metaKey || event.ctrlKey
    const key = event.key.toLowerCase()

    if (modifier && key === 'c' && item) {
      clipboard.value = item
    } else if (modifier && key === 'v' && clipboard.value) {
      clipboard.value = insertCopyOf(clipboard.value)
    } else if (modifier && key === 'd' && item) {
      event.preventDefault()
      insertCopyOf(item)
    } else if (item && ARROWS[event.key]) {
      event.preventDefault()
      const [dx, dy] = ARROWS[event.key]!
      update(ITEM_TYPES[item.type].moved(item, item, dx * GRID_SIZE, dy * GRID_SIZE))
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}
