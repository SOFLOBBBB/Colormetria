const KEYS = {
  prendas: 'colormetria_closet_prendas_v1',
  outfits: 'colormetria_closet_outfits_v1',
  inspiraciones: 'colormetria_outfit_inspiraciones_v1',
}

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function readArray(key) {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(key), [])
}

function writeArray(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('closet-updated'))
}

export function getClosetPrendas() {
  return readArray(KEYS.prendas)
}

export function addClosetPrenda(prenda) {
  const actual = getClosetPrendas()
  const nueva = {
    ...prenda,
    id: prenda.id || `prenda_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: prenda.createdAt || new Date().toISOString(),
  }
  const next = [nueva, ...actual]
  writeArray(KEYS.prendas, next)
  return next
}

export function getClosetOutfits() {
  return readArray(KEYS.outfits)
}

export function addClosetOutfit(outfit) {
  const actual = getClosetOutfits()
  const nuevo = {
    ...outfit,
    id: outfit.id || `outfit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: outfit.createdAt || new Date().toISOString(),
  }
  const next = [nuevo, ...actual]
  writeArray(KEYS.outfits, next)
  return next
}

export function getInspiraciones() {
  return readArray(KEYS.inspiraciones)
}

export function addInspiracion(outfit) {
  const actual = getInspiraciones()
  const nueva = {
    ...outfit,
    id: outfit.id || `insp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: outfit.createdAt || new Date().toISOString(),
  }
  const next = [nueva, ...actual]
  writeArray(KEYS.inspiraciones, next)
  return next
}
