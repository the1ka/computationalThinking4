<script setup lang="ts">
import type { BoardItem } from '#shared/types/board'
import { ITEM_TYPES } from '~/models'

interface Variant {
  label: string
  preview: string
  symbol?: string
  create: () => BoardItem
}

const GROUPS: Variant[][] = [
  (['yellow', 'pink', 'blue'] as const).map((color) => ({
    label: `Post-it (${color})`,
    preview: `size-8 shadow-sm ${STICKY_COLOR_CLASSES[color]}`,
    create: () => ITEM_TYPES.note.create(color),
  })),
  (['S', 'M', 'L'] as const).map((size) => ({
    label: `Text (${size})`,
    preview: `font-medium leading-none ${FONT_SIZE_CLASSES[size]}`,
    symbol: 'T',
    create: () => ITEM_TYPES.text.create(size),
  })),
  (['red', 'green', 'blue'] as const).map((color) => ({
    label: `Kreis (${color})`,
    preview: `size-8 rounded-full shadow-sm ${CIRCLE_COLOR_CLASSES[color]}`,
    create: () => ITEM_TYPES.circle.create(color),
  })),
]

defineEmits<{ add: [item: BoardItem] }>()
</script>

<template>
  <div class="fixed bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-xl border bg-background p-2 shadow-lg">
    <template v-for="(group, index) in GROUPS" :key="index">
      <div v-if="index > 0" class="mx-1 w-px bg-border" />
      <button
        v-for="variant in group"
        :key="variant.label"
        type="button"
        class="grid size-12 place-items-center rounded-md hover:bg-muted"
        :title="variant.label"
        @click="$emit('add', variant.create())"
      >
        <span :class="variant.preview">{{ variant.symbol }}</span>
      </button>
    </template>
  </div>
</template>
