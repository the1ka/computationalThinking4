import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

// The backend does not know the variants (sticky-note, circle …), only that every object has an id.
export type BoardObject = { id: string, [key: string]: unknown }

// Repository: the only place that knows where and how the board is stored.
const FILE = join(import.meta.dirname, '..', 'data', 'board.json')

const objects: BoardObject[] = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : []

// Sync on purpose: two writes can never overlap.
function save() {
  mkdirSync(dirname(FILE), { recursive: true })
  writeFileSync(FILE, JSON.stringify(objects, null, 2))
}

export function listObjects() {
  return objects
}

// Returns false if the id is already taken.
export function addObject(object: BoardObject) {
  if (objects.some(existing => existing.id === object.id)) return false
  objects.push(object)
  save()
  return true
}

// Returns undefined if there is no object with this id.
export function updateObject(id: string, changes: Record<string, unknown>) {
  const index = objects.findIndex(object => object.id === id)
  if (index === -1) return undefined
  objects[index] = { ...objects[index], ...changes, id }
  save()
  return objects[index]
}

// Returns false if there is no object with this id.
export function removeObject(id: string) {
  const index = objects.findIndex(object => object.id === id)
  if (index === -1) return false
  objects.splice(index, 1)
  save()
  return true
}
