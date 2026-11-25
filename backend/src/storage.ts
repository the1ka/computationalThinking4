// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>
export type Board = { id: string; name: string }

// Boards and objects live in the Supabase tables `boards` and `objects`, reached through its REST API.
// This module is the only place that knows about the database.
process.loadEnvFile(new URL('../.env', import.meta.url).pathname)
const API = `${process.env.SUPABASE_URL}/rest/v1`
const HEADERS = {
  'apikey': process.env.SUPABASE_SECRET_KEY!,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

// The frontend uses camelCase, the database snake_case.
function toRow({ fontSize, ...rest }: Record<string, unknown>) {
  return fontSize === undefined ? rest : { ...rest, font_size: fontSize }
}

function toObject({ font_size, created_at, board_id, ...rest }: BoardObject): BoardObject {
  return { ...rest, fontSize: font_size }
}

async function request<Row>(table: string, query: string, init: RequestInit = {}) {
  const response = await fetch(`${API}/${table}?${query}`, { ...init, headers: HEADERS })
  if (!response.ok) throw new Error(`Supabase: ${response.status} ${await response.text()}`)
  const rows: Row[] = await response.json()
  return rows
}

export async function listBoards() {
  return request<Board>('boards', 'select=id,name&order=created_at')
}

export async function insertBoard(name: string) {
  const [inserted] = await request<Board>('boards', 'select=id,name', { method: 'POST', body: JSON.stringify({ name }) })
  return inserted
}

export async function updateBoard(id: string, name: string) {
  const [updated] = await request<Board>('boards', `id=eq.${encodeURIComponent(id)}&select=id,name`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  return updated
}

export async function deleteBoard(id: string) {
  const deleted = await request<Board>('boards', `id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
  return deleted.length > 0
}

export async function listObjects(boardId: string) {
  const rows = await request<BoardObject>('objects', `board_id=eq.${encodeURIComponent(boardId)}&select=*&order=created_at`)
  return rows.map(toObject)
}

export async function findObject(id: string) {
  const [row] = await request<BoardObject>('objects', `id=eq.${encodeURIComponent(id)}&select=*`)
  return row && toObject(row)
}

export async function insertObject(boardId: string, object: BoardObject) {
  const [inserted] = await request<BoardObject>('objects', '', {
    method: 'POST',
    body: JSON.stringify({ ...toRow(object), board_id: boardId }),
  })
  return toObject(inserted)
}

// Objects cannot move between boards, so a board_id in the changes is ignored.
export async function updateObject(id: string, changes: Record<string, unknown>) {
  const { id: _, board_id: __, ...rest } = changes
  const [updated] = await request<BoardObject>('objects', `id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toRow(rest)),
  })
  return updated && toObject(updated)
}

export async function deleteObject(id: string) {
  const deleted = await request<BoardObject>('objects', `id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
  return deleted.length > 0
}
