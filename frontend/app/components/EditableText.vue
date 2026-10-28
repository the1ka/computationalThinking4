<script setup lang="ts">
import type { StickyNoteData, TextData } from '#shared/types/board'
import { MIN_SIZE } from '~/models/ItemType'

const props = defineProps<{ item: StickyNoteData | TextData }>()

const { editingId } = useLocalState()
const { update } = useBoard()
const editing = computed(() => editingId.value === props.item.id)
const textClasses = computed(() => [FONT_SIZE_CLASSES[props.item.fontSize], props.item.bold ? 'font-bold' : ''])

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const content = useTemplateRef<HTMLElement>('content')

async function focusTextarea() {
  await nextTick()
  textarea.value?.focus()
  textarea.value?.select()
}

function stopEditing() {
  editingId.value = null
}

function updateText(event: Event) {
  update({ ...props.item, text: (event.target as HTMLTextAreaElement).value })
}

// Grows the item to the next grid line when its text no longer fits.
async function fitToContent() {
  await nextTick()
  const element = textarea.value ?? content.value
  if (!element) return
  const needed = Math.max(MIN_SIZE, Math.ceil(element.scrollHeight / GRID_SIZE) * GRID_SIZE)
  if (needed > props.item.height) update({ ...props.item, height: needed })
}

watch(editing, (isEditing) => isEditing && focusTextarea())
watch(() => [props.item.text, props.item.height, props.item.fontSize, editing.value], fitToContent)
onMounted(fitToContent)
</script>

<template>
  <textarea
    v-if="editing"
    ref="textarea"
    class="size-full bg-transparent resize-none outline-none"
    :class="textClasses"
    :value="item.text"
    @input="updateText"
    @blur="stopEditing"
    @keydown.escape="stopEditing"
  />
  <div
    v-else
    ref="content"
    class="size-full overflow-hidden whitespace-pre-wrap break-words select-none"
    :class="textClasses"
  >
    {{ item.text }}
  </div>
</template>
