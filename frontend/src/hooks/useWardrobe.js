import { useCallback, useEffect, useState } from 'react'
import { getProbadorPreview } from '../utils/storageCloset'
import { resolveSvgWardrobeItem } from '../data/svgWardrobe'

const STORAGE_KEY = 'colormetria-active-outfit'

export const WARDROBE_LAYERS = [
  'inferior',
  'vestido/falda',
  'superior',
  'calzado',
  'accesorio',
  'abrigo/blazer',
]

const EMPTY_EQUIPPED = {
  superior: null,
  inferior: null,
  'vestido/falda': null,
  calzado: null,
  accesorio: null,
  'abrigo/blazer': null,
}

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function normalizeEquipped(raw, genero) {
  const next = { ...EMPTY_EQUIPPED }
  if (!raw || typeof raw !== 'object') return next
  WARDROBE_LAYERS.forEach((layer) => {
    const item = raw[layer]
    if (!item) return
    if (genero !== 'femenino' && layer === 'vestido/falda') return
    next[layer] = item.draw ? item : resolveSvgWardrobeItem(item, genero)
  })
  return next
}

function readStoredOutfit(genero) {
  if (typeof window === 'undefined') return EMPTY_EQUIPPED
  return normalizeEquipped(safeParse(window.localStorage.getItem(STORAGE_KEY), null), genero)
}

function writeStoredOutfit(equipped) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(equipped))
}

export function useWardrobe({ genero = 'femenino' } = {}) {
  const [equipped, setEquipped] = useState(() => readStoredOutfit(genero))
  const [activeLayer, setActiveLayer] = useState(null)

  const persist = useCallback((next) => {
    setEquipped(next)
    writeStoredOutfit(next)
  }, [])

  const equipItem = useCallback((layer, item) => {
    if (!layer || !item) return
    const resolved = item.draw ? item : resolveSvgWardrobeItem(item, genero)
    if (!resolved) return

    setEquipped((prev) => {
      const next = { ...prev, [layer]: resolved }
      if (layer === 'vestido/falda') {
        next.superior = null
        next.inferior = null
      }
      if (layer === 'superior' || layer === 'inferior') {
        next['vestido/falda'] = null
      }
      writeStoredOutfit(next)
      return next
    })
  }, [genero])

  const removeItem = useCallback((layer) => {
    setEquipped((prev) => {
      const next = { ...prev, [layer]: null }
      writeStoredOutfit(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    const next = { ...EMPTY_EQUIPPED }
    persist(next)
  }, [persist])

  const equipDefaults = useCallback((catalog, layers) => {
    const next = { ...EMPTY_EQUIPPED }
    const vestidoCandidate = layers.includes('vestido/falda') ? catalog['vestido/falda']?.[0] : null
    const vestidoResolved = vestidoCandidate
      ? (vestidoCandidate.draw ? vestidoCandidate : resolveSvgWardrobeItem(vestidoCandidate, genero))
      : null

    if (vestidoResolved) {
      next['vestido/falda'] = vestidoResolved
    }

    layers.forEach((layer) => {
      if (layer === 'vestido/falda') return
      if (vestidoResolved && (layer === 'superior' || layer === 'inferior')) return
      const candidate = catalog[layer]?.[0]
      if (!candidate) return
      const resolved = candidate.draw ? candidate : resolveSvgWardrobeItem(candidate, genero)
      if (!resolved) return
      next[layer] = resolved
    })
    persist(next)
  }, [genero, persist])

  const loadFromPreview = useCallback((preview) => {
    if (!preview?.prendas?.length) return
    const next = { ...EMPTY_EQUIPPED }
    preview.prendas.forEach((prenda) => {
      const cat = prenda.categoria
      if (!(cat in next)) return
      if (genero !== 'femenino' && cat === 'vestido/falda') return
      const resolved = resolveSvgWardrobeItem(prenda, genero)
      if (!resolved) return
      next[cat] = resolved
      if (cat === 'vestido/falda') {
        next.superior = null
        next.inferior = null
      }
    })
    persist(next)
  }, [genero, persist])

  useEffect(() => {
    setEquipped(readStoredOutfit(genero))
  }, [genero])

  useEffect(() => {
    const onUpdate = () => {
      const preview = getProbadorPreview()
      if (preview?.prendas?.length) {
        loadFromPreview(preview)
        return
      }
      setEquipped(readStoredOutfit(genero))
    }
    window.addEventListener('closet-updated', onUpdate)
    return () => window.removeEventListener('closet-updated', onUpdate)
  }, [genero, loadFromPreview])

  useEffect(() => {
    const preview = getProbadorPreview()
    if (preview?.prendas?.length) loadFromPreview(preview)
  }, [loadFromPreview])

  return {
    equipped,
    activeLayer,
    setActiveLayer,
    equipItem,
    removeItem,
    clearAll,
    loadFromPreview,
    equipDefaults,
  }
}
