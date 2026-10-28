import { CircleType } from './CircleType'
import { StickyNoteType } from './StickyNoteType'
import { TextType } from './TextType'

export const ITEM_TYPES = {
  note: new StickyNoteType(),
  text: new TextType(),
  circle: new CircleType(),
}
