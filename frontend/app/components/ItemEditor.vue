<script setup lang="ts">
import type { BoardItem, FontSize } from '#shared/types/board'

const COLOR_CLASSES = { note: STICKY_COLOR_CLASSES, circle: CIRCLE_COLOR_CLASSES }
const FONT_SIZES: FontSize[] = ['S', 'M', 'L']
const BUTTON = 'h-7 min-w-7 rounded-md px-1.5 text-sm hover:bg-muted'

const props = defineProps<{ item: BoardItem }>()

const { scale } = useLocalState()
const { update } = useBoard()

function patch(changes: object) {
  update({ ...props.item, ...changes } as BoardItem)
}
</script>

<template>
  <!-- Anchored at the item's top left corner; counter-scaled so it keeps its size when zooming. -->
  <div class="absolute" :style="{ left: `${item.x}px`, top: `${item.y}px` }" @pointerdown.stop>
    <div
      class="absolute left-0 flex origin-bottom-left items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
      :style="{ bottom: `${8 / scale}px`, transform: `scale(${1 / scale})` }"
    >
      <template v-if="item.type !== 'text'">
        <button
          v-for="(classes, color) in COLOR_CLASSES[item.type]"
          :key="color"
          type="button"
          class="m-0.5 size-6 rounded-full border"
          :class="[classes, item.color === color ? 'ring-2 ring-blue-500' : '']"
          :title="color"
          @click="patch({ color })"
        />
      </template>

      <template v-if="item.type !== 'circle'">
        <div v-if="item.type === 'note'" class="mx-1 h-6 w-px bg-border" />
        <button
          v-for="size in FONT_SIZES"
          :key="size"
          type="button"
          :class="[BUTTON, item.fontSize === size ? 'bg-muted font-semibold' : '']"
          :title="`Schriftgröße ${size}`"
          @click="patch({ fontSize: size })"
        >
          {{ size }}
        </button>
        <button
          type="button"
          class="font-bold"
          :class="[BUTTON, item.bold ? 'bg-muted' : '']"
          title="Fett"
          @click="patch({ bold: !item.bold })"
        >
          B
        </button>
      </template>

      <template v-if="item.type === 'circle'">
        <div class="mx-1 h-6 w-px bg-border" />
        <button
          type="button"
          :class="[BUTTON, item.border ? 'bg-muted font-semibold' : '']"
          title="Rand an/aus"
          @click="patch({ border: !item.border })"
        >
          Rand
        </button>
      </template>
    </div>
  </div>
</template>
