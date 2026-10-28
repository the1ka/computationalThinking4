import type { StickyNoteColor, StickyNoteData } from '#shared/types/board'
import { ItemType } from './ItemType'

export class StickyNoteType extends ItemType {
  create(color: StickyNoteColor): StickyNoteData {
    return { ...this.base(192, 192), type: 'note', color, fontSize: 'S', bold: false, text: '' }
  }
}
