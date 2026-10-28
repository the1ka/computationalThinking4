<script setup lang="ts">
import type { Component } from 'vue'
import { CircleShape, StickyNote, TextBox } from '#components'
import type { BoardItem } from '#shared/types/board'

const COMPONENTS: Record<BoardItem['type'], Component> = { note: StickyNote, text: TextBox, circle: CircleShape }

const { items, connect, update } = useBoard()
const { selectedId, offset, scale } = useLocalState()

const selectedItem = computed(() => items.value.find((item) => item.id === selectedId.value))

onMounted(connect)
useShortcuts()

// Places a new item in the center of the visible area.
function addItem(item: BoardItem) {
  const centerX = (window.innerWidth / 2 - offset.value.x) / scale.value
  const centerY = (window.innerHeight / 2 - offset.value.y) / scale.value
  update({ ...item, x: snapToGrid(centerX - item.width / 2), y: snapToGrid(centerY - item.height / 2) })
  selectedId.value = item.id
}
</script>

<template>
  <InfiniteCanvas @pointerdown="selectedId = null">
    <component :is="COMPONENTS[item.type]" v-for="item in items" :key="item.id" :item />
    <ItemEditor v-if="selectedItem" :item="selectedItem" />
  </InfiniteCanvas>
  <ItemToolbar @add="addItem" />
</template>
