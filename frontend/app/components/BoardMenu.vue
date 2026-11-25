<script setup lang="ts">
import { ChevronDown, Pencil, Plus, Trash2 } from '@lucide/vue'

const { boards, boardId, select, create, rename, remove } = useBoards()

const current = computed(() => boards.value.find(board => board.id === boardId.value))

// The backend explains why it refused (e.g. a name that is already taken), so show its message.
async function tryTo(action: () => Promise<unknown>) {
  try {
    await action()
  }
  catch (error) {
    const { data, message } = error as { data?: { error?: string }; message: string }
    alert(data?.error ?? message)
  }
}

function onCreate() {
  const name = prompt('Name of the new board')
  if (name !== null) tryTo(() => create(name))
}

function onRename() {
  const name = prompt('New name of the board', current.value!.name)
  if (name !== null) tryTo(() => rename(current.value!.id, name))
}

// Deleting a board also deletes all of its objects, so ask first.
function onDelete() {
  if (confirm(`Delete "${current.value!.name}" and everything on it?`)) tryTo(() => remove(current.value!.id))
}
</script>

<template>
  <div class="fixed top-4 left-4">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="bg-white shadow-md">
          {{ current?.name }}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-56">
        <DropdownMenuRadioGroup :model-value="boardId ?? undefined" @update:model-value="id => select(String(id))">
          <DropdownMenuRadioItem v-for="board in boards" :key="board.id" :value="board.id">
            {{ board.name }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="onCreate">
          <Plus /> New board
        </DropdownMenuItem>
        <DropdownMenuItem @select="onRename">
          <Pencil /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" :disabled="boards.length <= 1" @select="onDelete">
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
