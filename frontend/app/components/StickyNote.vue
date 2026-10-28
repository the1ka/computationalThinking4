<script setup lang="ts">
import type { StickyNoteData } from '#shared/types/board'

defineProps<{ item: StickyNoteData }>()
</script>

<template>
  <BoardItemFrame :item class="shadow-md" :class="STICKY_COLOR_CLASSES[item.color]">
    <EditableText :item class="p-4" />
  </BoardItemFrame>
</template>
