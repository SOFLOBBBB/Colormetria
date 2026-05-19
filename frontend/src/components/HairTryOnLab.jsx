import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RotateCcw,
  Wand2,
  Download,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { buildHeuristicMask, loadHairSegmenter } from '../utils/hairSegmentation'
import { apiUrl } from '../config/api'

const BLEND_MODES = ['multiply', 'overlay', 'soft-light']

const DEFAULT_MASK = {
  x: 50,
  y: 24,
  width: 56,
  height: 34,
  intensity: 38,
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3
    ? value.split('').map((char) => `${char}${char}`).join('')
    : value
  const int = parseInt(normalized, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function resolveImageSource(image) {
  if (!image) return { src: null, revoke: null }
  if (typeof image === 'string') return { src: image, revoke: null }
  if (image instanceof File || image instanceof Blob) {
    const url = URL.createObjectURL(image)
    return { src: url, revoke: () => URL.revokeObjectURL(url) }
  }
  return { src: null, revoke: null }
}

function HairTryOnLab({ image, suggestedColors = [] }) {
  const canvasRef = useRef(null)
  const currentImageRef = useRef(null)
  const currentMaskDataRef = useRef(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [backendPreviewSrc, setBackendPreviewSrc] = useState(null)
  const [loadError, setLoadError] = useState('')

  const colorFallback = suggestedColors[0]?.hex || '#8B4513'
  const [selectedColor, setSelectedColor] = useState(colorFallback)
  const [blendMode, setBlendMode] = useState('multiply')
  const [draftMask, setDraftMask] = useState(DEFAULT_MASK)
  const [intensity, setIntensity] = useState(38)
  const [appliedConfig, setAppliedConfig] = useState(null)
  const [segmentationMode, setSegmentationMode] = useState('idle')
  const [usingFallback, setUsingFallback] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [isAdvancedProcessing, setIsAdvancedProcessing] = useState(false)

  useEffect(() => {
    const { src, revoke } = resolveImageSource(image)
    setImageSrc(src)
    setLoadError('')
    setSegmentationMode(src ? 'loading-model' : 'idle')
    setUsingFallback(false)
    setBackendPreviewSrc(null)
    setIsAdvancedProcessing(false)
    currentMaskDataRef.current = null

    return () => {
      if (revoke) revoke()
    }
  }, [image])

  useEffect(() => {
    if (!suggestedColors.length) return
    if (!selectedColor) {
      setSelectedColor(suggestedColors[0].hex)
    }
  }, [suggestedColors, selectedColor])

  useEffect(() => {
    if (!imageSrc) return
    let cancelled = false

    const runSegmentation = async () => {
      try {
        setSegmentationMode('loading-model')
        const segmenter = await loadHairSegmenter({ timeoutMs: 9000 })
        if (cancelled) return

        setSegmentationMode('segmenting')
        const img = new Image()
        img.onload = async () => {
          if (cancelled) return
          currentImageRef.current = img
          try {
            const result = await segmenter.segment(img)
            if (cancelled) return

            const categoryMask = result?.categoryMask
            if (!categoryMask) {
              throw new Error('No se obtuvo máscara de categoría.')
            }

            let buffer
            if (typeof categoryMask.getAsUint8Array === 'function') {
              buffer = categoryMask.getAsUint8Array()
            } else if (typeof categoryMask.getAsFloat32Array === 'function') {
              const floatData = categoryMask.getAsFloat32Array()
              buffer = Uint8Array.from(floatData, (v) => Math.round(v))
            } else if (categoryMask.data) {
              buffer = categoryMask.data
            }

            if (!buffer || !buffer.length) {
              throw new Error('Máscara vacía de MediaPipe.')
            }

            currentMaskDataRef.current = {
              width: categoryMask.width,
              height: categoryMask.height,
              buffer,
            }
            setUsingFallback(false)
            setSegmentationMode('ready')
          } catch (err) {
            setUsingFallback(true)
            setSegmentationMode('fallback')
          }
        }
        img.onerror = () => {
          setUsingFallback(true)
          setSegmentationMode('fallback')
        }
        img.src = imageSrc
      } catch (err) {
        if (cancelled) return
        setUsingFallback(true)
        setSegmentationMode('fallback')
      }
    }

    runSegmentation()
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return

    const renderSrc = backendPreviewSrc || imageSrc
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const maxCanvasWidth = 720
      const scale = Math.min(1, maxCanvasWidth / img.width)
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))

      canvas.width = width
      canvas.height = height

      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      if (appliedConfig && !backendPreviewSrc) {
        const intensityNorm = clamp(appliedConfig.intensity / 100, 0, 1)
        const { r, g, b } = hexToRgb(appliedConfig.color)

        if (!usingFallback && currentMaskDataRef.current) {
          const maskData = currentMaskDataRef.current
          const offscreen = document.createElement('canvas')
          offscreen.width = width
          offscreen.height = height
          const offCtx = offscreen.getContext('2d')
          if (offCtx) {
            const imgData = offCtx.createImageData(width, height)
            const data = imgData.data

            for (let y = 0; y < height; y += 1) {
              for (let x = 0; x < width; x += 1) {
                const targetIndex = (y * width + x) * 4
                const mx = Math.floor((x / width) * maskData.width)
                const my = Math.floor((y / height) * maskData.height)
                const maskIndex = my * maskData.width + mx
                const classId = maskData.buffer[maskIndex]
                const alpha = classId === 1 ? Math.round(255 * intensityNorm) : 0
                data[targetIndex] = r
                data[targetIndex + 1] = g
                data[targetIndex + 2] = b
                data[targetIndex + 3] = alpha
              }
            }
            offCtx.putImageData(imgData, 0, 0)
            ctx.save()
            ctx.globalCompositeOperation = appliedConfig.blendMode
            ctx.drawImage(offscreen, 0, 0)
            ctx.restore()
          }
        } else {
          const { cx, cy, rx, ry } = buildHeuristicMask({
            width,
            height,
            xPct: appliedConfig.mask.x,
            yPct: appliedConfig.mask.y,
            wPct: appliedConfig.mask.width,
            hPct: appliedConfig.mask.height,
          })

          const gradient = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.2, cx, cy, Math.max(rx, ry))
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(0.95, intensityNorm * 0.95)})`)
          gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${Math.min(0.75, intensityNorm * 0.65)})`)
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

          ctx.save()
          ctx.globalCompositeOperation = appliedConfig.blendMode
          ctx.beginPath()
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          ctx.clip()
          ctx.fillStyle = gradient
          ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2)
          ctx.restore()

          ctx.save()
          ctx.globalCompositeOperation = 'source-over'
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'
          ctx.lineWidth = 1.4
          ctx.setLineDash([5, 4])
          ctx.beginPath()
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }
      }
    }

    img.onerror = () => {
      setLoadError('No se pudo cargar la imagen para la prueba visual.')
    }

    img.src = renderSrc
  }, [imageSrc, backendPreviewSrc, appliedConfig, usingFallback])

  const resolveImageBlob = async () => {
    if (!image) return null
    if (image instanceof File) return image
    if (image instanceof Blob) return new File([image], 'hair-input.png', { type: image.type || 'image/png' })
    if (typeof image === 'string') {
      const response = await fetch(image)
      const blob = await response.blob()
      return new File([blob], 'hair-input.png', { type: blob.type || 'image/png' })
    }
    return null
  }

  const handleApply = async () => {
    const nextConfig = {
      color: selectedColor,
      blendMode,
      intensity,
      mask: { ...draftMask },
    }
    setAppliedConfig(nextConfig)
    setLoadError('')
    setIsAdvancedProcessing(true)

    try {
      const imageFile = await resolveImageBlob()
      if (!imageFile) {
        throw new Error('No hay imagen disponible para simulación avanzada.')
      }
      const formData = new FormData()
      formData.append('archivo', imageFile)
      formData.append('color_hex', selectedColor)
      formData.append('intensidad', String(intensity))
      formData.append('blend_mode', blendMode)

      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 25000)
      let response
      try {
        response = await fetch(apiUrl('/hair-tryon'), {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })
      } finally {
        window.clearTimeout(timeoutId)
      }

      if (!response.ok) {
        throw new Error(`Simulación avanzada no disponible (${response.status})`)
      }
      const data = await response.json()
      if (!data?.exito || !data?.preview_data_url) {
        throw new Error('Respuesta inválida de /hair-tryon')
      }

      setBackendPreviewSrc(data.preview_data_url)
      setUsingFallback(false)
      if (segmentationMode === 'fallback') {
        setSegmentationMode('ready')
      }
    } catch (err) {
      setBackendPreviewSrc(null)
      setUsingFallback(true)
      setSegmentationMode('fallback')
    } finally {
      setIsAdvancedProcessing(false)
    }
  }

  const handleReset = () => {
    setDraftMask(DEFAULT_MASK)
    setIntensity(DEFAULT_MASK.intensity)
    setAppliedConfig(null)
    setBackendPreviewSrc(null)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `hair-tryon-preview-${Date.now()}.png`
    link.click()
  }

  const handleMaskChange = (key, value) => {
    setDraftMask((prev) => ({ ...prev, [key]: Number(value) }))
  }

  if (!imageSrc) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] p-6 sm:p-8 text-center">
        <p className="text-sm text-white/65">
          Carga o captura una foto para activar la prueba visual.
        </p>
      </div>
    )
  }

  const showStatusRow =
    usingFallback ||
    isAdvancedProcessing ||
    segmentationMode === 'loading-model' ||
    segmentationMode === 'segmenting' ||
    segmentationMode === 'ready'

  return (
    <div className="space-y-4">
      {showStatusRow && (
        <div className="flex flex-wrap gap-2 text-xs">
          {segmentationMode === 'loading-model' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-300/25 bg-violet-500/10 text-violet-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Preparando vista
            </span>
          )}
          {segmentationMode === 'segmenting' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-300/25 bg-cyan-500/10 text-cyan-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analizando cabello
            </span>
          )}
          {isAdvancedProcessing && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Aplicando tono
            </span>
          )}
          {segmentationMode === 'ready' && !usingFallback && !isAdvancedProcessing && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-300/25 bg-emerald-500/10 text-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Vista lista
            </span>
          )}
          {usingFallback && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-300/25 bg-amber-500/10 text-amber-100">
              <ShieldAlert className="w-3.5 h-3.5" />
              Modo simulación manual activado
            </span>
          )}
        </div>
      )}

      {loadError && (
        <p className="text-sm text-red-300">{loadError}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-7 min-w-0">
          <div className="rounded-2xl border border-white/[0.08] bg-black/30 ring-1 ring-white/[0.04] p-2 sm:p-3 overflow-hidden">
            <div className="flex items-center justify-center w-full">
              <canvas
                ref={canvasRef}
                className="w-full max-h-[520px] rounded-xl object-contain block bg-black/30"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 min-w-0 space-y-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] p-3 sm:p-4">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2">Tono</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedColors.map((item) => (
                <button
                  key={item.id || item.hex}
                  type="button"
                  onClick={() => setSelectedColor(item.hex)}
                  className={`w-9 h-9 rounded-full border-2 shadow-sm transition-transform ${
                    selectedColor === item.hex
                      ? 'border-white scale-110 ring-2 ring-white/30 ring-offset-2 ring-offset-[#0e0e1a]'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.hex }}
                  title={item.nombre || item.hex}
                  aria-label={item.nombre || item.hex}
                />
              ))}
            </div>
            <label className="block">
              <span className="sr-only">Selector de color</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full h-10 rounded-lg bg-transparent border border-white/10 p-1 cursor-pointer"
              />
            </label>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] p-3 sm:p-4">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2">Blend mode</p>
            <div className="flex w-full rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
              {BLEND_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBlendMode(mode)}
                  className={`min-h-[40px] min-w-0 flex-1 px-2 text-xs rounded-lg border capitalize whitespace-nowrap transition-colors ${
                    blendMode === mode
                      ? 'border-violet-300/50 bg-violet-500/20 text-white'
                      : 'border-transparent bg-transparent text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] p-3 sm:p-4">
            <div className="flex justify-between text-xs text-white/65 mb-2">
              <span className="uppercase tracking-[0.18em] text-white/45">Intensidad</span>
              <span className="text-white/80 font-medium">{intensity}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={85}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-violet-400"
            />
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] overflow-hidden">
            <button
              type="button"
              onClick={() => setManualOpen((prev) => !prev)}
              className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] inline-flex items-center justify-between text-sm transition-colors"
              aria-expanded={manualOpen}
            >
              <span className="text-white/85">Ajuste manual de máscara</span>
              {manualOpen ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
            </button>
            {manualOpen && (
              <div className="p-3 sm:p-4 border-t border-white/[0.06] space-y-3">
                {usingFallback ? (
                  [
                    ['x', draftMask.x, 10, 90],
                    ['y', draftMask.y, 5, 55],
                    ['width', draftMask.width, 20, 90],
                    ['height', draftMask.height, 12, 60],
                  ].map(([key, value, min, max]) => (
                    <label key={key} className="block">
                      <div className="flex justify-between text-xs text-white/65 mb-1">
                        <span className="capitalize">{key}</span>
                        <span>{value}%</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={(e) => handleMaskChange(key, e.target.value)}
                        className="w-full accent-violet-400"
                      />
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-white/55 leading-relaxed">
                    Esta sección se activa cuando el modo de simulación manual está activo.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <motion.button
              type="button"
              onClick={handleApply}
              disabled={isAdvancedProcessing}
              className="min-h-[44px] min-w-0 px-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium inline-flex items-center justify-center gap-1.5 text-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              whileHover={!isAdvancedProcessing ? { scale: 1.02 } : {}}
              whileTap={!isAdvancedProcessing ? { scale: 0.97 } : {}}
            >
              {isAdvancedProcessing ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <Wand2 className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{isAdvancedProcessing ? 'Procesando' : 'Aplicar tono'}</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] min-w-0 px-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm inline-flex items-center justify-center gap-1.5 text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Restablecer</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={handleDownload}
              className="min-h-[44px] min-w-0 px-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm inline-flex items-center justify-center gap-1.5 text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Descargar</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HairTryOnLab
