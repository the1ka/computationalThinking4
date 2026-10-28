import type { CircleColor, CircleData } from '#shared/types/board'
import { ItemType } from './ItemType'

export class CircleType extends ItemType {
  create(color: CircleColor): CircleData {
    return { ...this.base(144, 144), type: 'circle', color, border: false }
  }
}
