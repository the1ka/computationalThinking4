export type Corner = 'nw' | 'ne' | 'sw' | 'se'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface BaseItem extends Rect {
  id: string
}

export type StickyNoteColor = 'yellow' | 'pink' | 'blue'
export type FontSize = 'S' | 'M' | 'L'
export type CircleColor = 'red' | 'green' | 'blue'

export interface StickyNoteData extends BaseItem {
  type: 'note'
  color: StickyNoteColor
  fontSize: FontSize
  bold: boolean
  text: string
}

export interface TextData extends BaseItem {
  type: 'text'
  fontSize: FontSize
  bold: boolean
  text: string
}

export interface CircleData extends BaseItem {
  type: 'circle'
  color: CircleColor
  border: boolean
}

export type BoardItem = StickyNoteData | TextData | CircleData

export type UpsertMessage = { kind: 'upsert'; item: BoardItem }
export type BoardMessage = { kind: 'init'; items: BoardItem[] } | UpsertMessage
