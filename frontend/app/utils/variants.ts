import type { CircleColor, FontSize, StickyNoteColor } from '#shared/types/board'

export const STICKY_COLOR_CLASSES: Record<StickyNoteColor, string> = {
  yellow: 'bg-yellow-200',
  pink: 'bg-pink-200',
  blue: 'bg-sky-200',
}

export const CIRCLE_COLOR_CLASSES: Record<CircleColor, string> = {
  red: 'bg-red-300',
  green: 'bg-green-300',
  blue: 'bg-sky-300',
}

export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  S: 'text-base',
  M: 'text-2xl',
  L: 'text-4xl',
}
