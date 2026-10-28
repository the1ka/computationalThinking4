<script setup lang="ts">
import type { CircleData } from '#shared/types/board'

defineProps<{ item: CircleData }>()
</script>

<template>
  <BoardItemFrame
    :item
    class="rounded-full shadow-md"
    :class="[CIRCLE_COLOR_CLASSES[item.color], item.border ? 'border-4 border-foreground/70' : '']"
  />
</template>
