import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { addObject, listObjects, removeObject, updateObject } from './storage.ts'

const PORT = 3001

// Only translates HTTP into storage calls and storage results into status codes.
const app = new Hono()

app.use(cors({ origin: 'http://localhost:3000' }))

app.get('/objects', c => c.json(listObjects()))

app.post('/objects', async (c) => {
  const object = await c.req.json()
  if (typeof object.id !== 'string' || object.id === '') return c.json({ error: 'id missing' }, 400)
  if (!addObject(object)) return c.json({ error: 'id already exists' }, 409)
  return c.json(object, 201)
})

app.patch('/objects/:id', async (c) => {
  const updated = updateObject(c.req.param('id'), await c.req.json())
  if (!updated) return c.json({ error: 'not found' }, 404)
  return c.json(updated)
})

app.delete('/objects/:id', (c) => {
  if (!removeObject(c.req.param('id'))) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})

serve({ fetch: app.fetch, port: PORT })
console.log(`Backend running on http://localhost:${PORT}`)
