import type { BoardItem } from '#shared/types/board'

// Per-browser UI state: never sent to other clients.
export function useLocalState() {
  return {
    selectedId: useState<string | null>('selected-id', () => null),
    editingId: useState<string | null>('editing-id', () => null),
    offset: useState('view-offset', () => ({ x: 0, y: 0 })),
    scale: useState('view-scale', () => 1),
    clipboard: useState<BoardItem | null>('clipboard', () => null),
  }
}
