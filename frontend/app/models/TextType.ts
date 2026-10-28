import type { FontSize, TextData } from '#shared/types/board'
import { ItemType } from './ItemType'

export class TextType extends ItemType {
  create(fontSize: FontSize): TextData {
    return { ...this.base(240, 72), type: 'text', fontSize, bold: false, text: 'Text' }
  }
}
