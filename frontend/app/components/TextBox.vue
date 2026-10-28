<script setup lang="ts">
import type { TextData } from '#shared/types/board'

defineProps<{ item: TextData }>()
</script>

<template>
  <BoardItemFrame :item>
    <EditableText :item class="p-2" />
  </BoardItemFrame>
</template>
