const DEFAULT_MODEL_CONFIG = {
  // CDN oficial; facil de cambiar a /models/hair_segmenter.task si se desea local.
  modelAssetPath:
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite',
  runningMode: 'IMAGE',
  outputCategoryMask: true,
  outputConfidenceMasks: false,
}

const VISION_WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'

let segmenterInstance = null
let loadingPromise = null

export const HAIR_MODEL_SOURCE = {
  type: 'cdn',
  wasmBase: VISION_WASM_BASE,
  modelAssetPath: DEFAULT_MODEL_CONFIG.modelAssetPath,
  alternativeLocal:
    '/models/selfie_segmenter_landscape.tflite',
}

function timeoutPromise(ms, message) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

export async function loadHairSegmenter({
  timeoutMs = 9000,
  wasmBase = VISION_WASM_BASE,
  modelAssetPath = DEFAULT_MODEL_CONFIG.modelAssetPath,
} = {}) {
  if (segmenterInstance) return segmenterInstance
  if (loadingPromise) return loadingPromise

  loadingPromise = Promise.race([
    (async () => {
      const visionModule = await import('@mediapipe/tasks-vision')
      const { FilesetResolver, ImageSegmenter } = visionModule

      const vision = await FilesetResolver.forVisionTasks(wasmBase)
      segmenterInstance = await ImageSegmenter.createFromOptions(vision, {
        ...DEFAULT_MODEL_CONFIG,
        modelAssetPath,
      })
      return segmenterInstance
    })(),
    timeoutPromise(timeoutMs, 'Timeout al cargar MediaPipe'),
  ])

  try {
    const instance = await loadingPromise
    return instance
  } finally {
    loadingPromise = null
  }
}

export function clearHairSegmenterCache() {
  if (segmenterInstance?.close) {
    segmenterInstance.close()
  }
  segmenterInstance = null
  loadingPromise = null
}

export function buildHeuristicMask({
  width,
  height,
  xPct = 50,
  yPct = 24,
  wPct = 56,
  hPct = 34,
}) {
  const cx = (xPct / 100) * width
  const cy = (yPct / 100) * height
  const rx = Math.max(14, ((wPct / 100) * width) / 2)
  const ry = Math.max(10, ((hPct / 100) * height) / 2)
  return { cx, cy, rx, ry }
}
