import { Hono } from 'hono'
import { deleteBoard, findObject, insertBoard, insertObject, listBoards, listObjects, updateBoard } from './storage.js'

// REST routes for the boards and for the objects on one board.
export const boards = new Hono()

// A board name must not be empty and must not be used by another board.
async function checkName(name: unknown, ownId?: string) {
  if (typeof name !== 'string' || name.trim() === '') return { error: 'Board needs a name', status: 400 as const }
  if ((await listBoards()).some(board => board.name === name.trim() && board.id !== ownId)) {
    return { error: 'A board with this name already exists', status: 409 as const }
  }
}

async function boardExists(id: string) {
  return (await listBoards()).some(board => board.id === id)
}

boards.get('/', async c => c.json(await listBoards()))

boards.post('/', async (c) => {
  const { name } = await c.req.json()
  const problem = await checkName(name)
  if (problem) return c.json({ error: problem.error }, problem.status)
  return c.json(await insertBoard(name.trim()), 201)
})

boards.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const { name } = await c.req.json()
  if (!(await boardExists(id))) return c.json({ error: 'Board not found' }, 404)
  const problem = await checkName(name, id)
  if (problem) return c.json({ error: problem.error }, problem.status)
  return c.json(await updateBoard(id, name.trim()))
})

// There must always be at least one board.
boards.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const all = await listBoards()
  if (!all.some(board => board.id === id)) return c.json({ error: 'Board not found' }, 404)
  if (all.length === 1) return c.json({ error: 'The last board cannot be deleted' }, 409)
  await deleteBoard(id)
  return c.body(null, 204)
})

boards.get('/:boardId/objects', async (c) => {
  const boardId = c.req.param('boardId')
  if (!(await boardExists(boardId))) return c.json({ error: 'Board not found' }, 404)
  return c.json(await listObjects(boardId))
})

boards.post('/:boardId/objects', async (c) => {
  const boardId = c.req.param('boardId')
  const object = await c.req.json()
  if (!(await boardExists(boardId))) return c.json({ error: 'Board not found' }, 404)
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  if (await findObject(object.id)) return c.json({ error: 'An object with this id already exists' }, 409)
  return c.json(await insertObject(boardId, object), 201)
})
