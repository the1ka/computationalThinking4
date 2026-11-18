import type { BoardObject, ObjectTemplate, Rect, StyleChanges, TextObject } from '~/types/canvas-object'

const API = 'http://localhost:3001/objects'
const RECT_THROTTLE_MS = 300

const TEXT_DEFAULTS = { text: '', fontSize: FONT_SIZES.M, bold: false }

// Starting attributes of a new object, per variant. Only variants with text get text attributes.
const DEFAULTS: Record<BoardObject['type'], Rect & Partial<TextObject>> = {
  'sticky-note': { x: 0, y: 0, width: GRID_SIZE * 8, height: GRID_SIZE * 8, ...TEXT_DEFAULTS },
  'text': { x: 0, y: 0, width: GRID_SIZE * 10, height: GRID_SIZE * 3, ...TEXT_DEFAULTS },
  'circle': { x: 0, y: 0, width: GRID_SIZE * 6, height: GRID_SIZE * 6 },
}

// Per object being dragged or resized: whether another change came in during the current pause.
const rectThrottles = new Map<string, { pending: boolean }>()

// The board state is the single source of truth for which objects exist and what they look like.
// Components only read it; every change goes through one of the functions below.
export function useBoard() {
  const objects = useState<BoardObject[]>('objects', () => [])

  callOnce('board', async () => {
    objects.value = await $fetch<BoardObject[]>(API)
  })

  // Every function changes the local state first and then tells the backend, without waiting for it.
  function create(object: BoardObject) {
    objects.value = [...objects.value, object]
    $fetch(API, { method: 'POST', body: object })
  }

  function patch(id: string, changes: object) {
    $fetch(`${API}/${id}`, { method: 'PATCH', body: changes })
  }

  // Sends the current rect at once, then pauses. Changes during the pause are sent together when it ends.
  function patchRect(id: string) {
    const throttle = rectThrottles.get(id)
    if (throttle) {
      throttle.pending = true
      return
    }
    const object = objects.value.find(object => object.id === id)
    if (!object) return
    const { x, y, width, height } = object
    patch(id, { x, y, width, height })
    const pause = { pending: false }
    rectThrottles.set(id, pause)
    setTimeout(() => {
      rectThrottles.delete(id)
      if (pause.pending) patchRect(id)
    }, RECT_THROTTLE_MS)
  }

  function addObject(template: ObjectTemplate, centerX: number, centerY: number) {
    const defaults = DEFAULTS[template.type]
    const id = crypto.randomUUID()
    const x = snapToGrid(centerX - defaults.width / 2)
    const y = snapToGrid(centerY - defaults.height / 2)
    create({ ...defaults, ...template, id, x, y } as BoardObject)
    return id
  }

  // Works for every variant: the copy keeps all attributes except the id.
  function addCopy(source: BoardObject) {
    const id = crypto.randomUUID()
    create({ ...source, id })
    return id
  }

  function removeObject(id: string) {
    objects.value = objects.value.filter(object => object.id !== id)
    $fetch(`${API}/${id}`, { method: 'DELETE' })
  }

  function updateObject(id: string, changes: Partial<Rect> & StyleChanges & { text?: string }) {
    objects.value = objects.value.map(object => (object.id === id ? ({ ...object, ...changes } as BoardObject) : object))
  }

  function moveObject(id: string, x: number, y: number) {
    updateObject(id, { x, y })
    patchRect(id)
  }

  function resizeObject(id: string, rect: Rect) {
    updateObject(id, rect)
    patchRect(id)
  }

  function updateText(id: string, text: string) {
    updateObject(id, { text })
    patch(id, { text })
  }

  function updateStyle(id: string, changes: StyleChanges) {
    updateObject(id, changes)
    patch(id, changes)
  }

  return { objects: readonly(objects), addObject, addCopy, removeObject, moveObject, resizeObject, updateText, updateStyle }
}
