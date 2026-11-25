import type { Board } from '~/types/board'

// The last chosen board is remembered in the browser, so a reload opens it again.
const STORAGE_KEY = 'boardId'

// The list of boards and which one is open. Opening a board loads its objects through useBoard.
// There is always at least one board; the backend refuses to delete the last one.
export function useBoards() {
  const api = $fetch.create({ baseURL: useRuntimeConfig().public.apiBase })
  const boards = useState<Board[]>('boards', () => [])
  const { boardId, load: loadObjects } = useBoard()

  async function select(id: string) {
    localStorage.setItem(STORAGE_KEY, id)
    await loadObjects(id)
  }

  async function load() {
    boards.value = await api<Board[]>('/boards')
    const remembered = localStorage.getItem(STORAGE_KEY)
    const known = boards.value.some(board => board.id === remembered)
    await select(known ? remembered! : boards.value[0]!.id)
  }

  async function create(name: string) {
    const created = await api<Board>('/boards', { method: 'POST', body: { name } })
    boards.value = [...boards.value, created]
    await select(created.id)
  }

  async function rename(id: string, name: string) {
    const renamed = await api<Board>(`/boards/${id}`, { method: 'PATCH', body: { name } })
    boards.value = boards.value.map(board => (board.id === id ? renamed : board))
  }

  async function remove(id: string) {
    await api(`/boards/${id}`, { method: 'DELETE' })
    boards.value = boards.value.filter(board => board.id !== id)
    if (boardId.value === id) await select(boards.value[0]!.id)
  }

  return { boards: readonly(boards), boardId, load, select, create, rename, remove }
}
