import type { BaseItem, Corner, Rect } from '#shared/types/board'
import { GRID_SIZE, snapToGrid } from '~/utils/grid'

export const MIN_SIZE = GRID_SIZE * 3

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

// Stateless behavior shared by all item types: takes item data and returns new item data.
export abstract class ItemType {
  protected base(width: number, height: number): BaseItem {
    return { id: newId(), x: 0, y: 0, width, height }
  }

  // A copy with a new id, offset by one grid cell so it doesn't hide the original.
  copied<I extends BaseItem>(item: I): I {
    return { ...item, id: newId(), x: item.x + GRID_SIZE, y: item.y + GRID_SIZE }
  }

  moved<I extends Rect>(item: I, start: Rect, dx: number, dy: number): I {
    return { ...item, x: snapToGrid(start.x + dx), y: snapToGrid(start.y + dy) }
  }

  // Resizing from a north or west corner moves the item so the opposite corner stays put.
  resized<I extends Rect>(item: I, corner: Corner, start: Rect, dx: number, dy: number): I {
    const width = Math.max(MIN_SIZE, snapToGrid(start.width + (corner.endsWith('e') ? dx : -dx)))
    const height = Math.max(MIN_SIZE, snapToGrid(start.height + (corner.startsWith('s') ? dy : -dy)))
    return {
      ...item,
      width,
      height,
      x: corner.endsWith('w') ? start.x + start.width - width : start.x,
      y: corner.startsWith('n') ? start.y + start.height - height : start.y,
    }
  }
}
