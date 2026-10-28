<script setup lang="ts">
import type { BoardItem, Corner, Rect } from '#shared/types/board'
import { ITEM_TYPES } from '~/models'

type Mode = 'move' | Corner

const HANDLE_CLASSES: Record<Corner, string> = {
  nw: 'left-0 top-0 cursor-nwse-resize',
  ne: 'left-full top-0 cursor-nesw-resize',
  sw: 'left-0 top-full cursor-nesw-resize',
  se: 'left-full top-full cursor-nwse-resize',
}

const props = defineProps<{ item: BoardItem }>()

const { selectedId, editingId, scale } = useLocalState()
const { update } = useBoard()
const selected = computed(() => selectedId.value === props.item.id)
const locked = computed(() => editingId.value === props.item.id)

// Start point of the current drag gesture, not part of any state.
let interaction: { mode: Mode; startX: number; startY: number; start: Rect } | null = null

function startInteraction(event: PointerEvent, mode: Mode) {
  event.stopPropagation()
  selectedId.value = props.item.id
  if (locked.value) return
  const { x, y, width, height } = props.item
  interaction = { mode, startX: event.clientX, startY: event.clientY, start: { x, y, width, height } }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!interaction) return
  const dx = (event.clientX - interaction.startX) / scale.value
  const dy = (event.clientY - interaction.startY) / scale.value
  const type = ITEM_TYPES[props.item.type]
  update(
    interaction.mode === 'move'
      ? type.moved(props.item, interaction.start, dx, dy)
      : type.resized(props.item, interaction.mode, interaction.start, dx, dy),
  )
}

function onPointerUp() {
  interaction = null
}

// Handled here because pointer capture sends the double click to the frame, not to its content.
function onDoubleClick() {
  if ('text' in props.item) editingId.value = props.item.id
}
</script>

<template>
  <div
    class="absolute touch-none"
    :class="[selected ? 'ring-2 ring-blue-300' : '', locked ? 'cursor-text' : 'cursor-move']"
    :style="{ left: `${item.x}px`, top: `${item.y}px`, width: `${item.width}px`, height: `${item.height}px` }"
    @pointerdown="startInteraction($event, 'move')"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @dblclick="onDoubleClick"
  >
    <slot />

    <template v-if="selected && !locked">
      <div
        v-for="(classes, corner) in HANDLE_CLASSES"
        :key="corner"
        class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-500 bg-background"
        :class="classes"
        @pointerdown="startInteraction($event, corner)"
      />
    </template>
  </div>
</template>
