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
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-white/50">
          Carga o captura una foto para activar el AI Beauty Studio.
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
    <div className="space-y-3">
      {showStatusRow && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {segmentationMode === 'loading-model' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-300/20 bg-violet-500/[0.08] text-violet-200/80">
              <Loader2 className="w-3 h-3 animate-spin" />
              Preparando vista
            </span>
          )}
          {segmentationMode === 'segmenting' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/[0.08] text-cyan-200/80">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analizando cabello
            </span>
          )}
          {isAdvancedProcessing && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/[0.08] text-fuchsia-200/80">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aplicando tono
            </span>
          )}
          {segmentationMode === 'ready' && !usingFallback && !isAdvancedProcessing && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-200/80">
              <CheckCircle2 className="w-3 h-3" />
              Vista lista
            </span>
          )}
          {usingFallback && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-300/20 bg-amber-500/[0.08] text-amber-200/80">
              <ShieldAlert className="w-3 h-3" />
              Simulación manual
            </span>
          )}
        </div>
      )}

      {loadError && (
        <p className="text-xs text-red-300/80">{loadError}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* ── AI Beauty Studio canvas ── */}
        <div className="lg:col-span-7 min-w-0">
          <div className="studio-frame">
            {/* Studio label */}
            <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/70">AI Beauty Studio</span>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full max-h-[540px] object-contain block"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* ── Controls panel ── */}
        <div className="lg:col-span-5 min-w-0 space-y-2.5">
          {/* Tone swatches */}
          <div className="p-3 sm:p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <p className="label-kicker mb-2.5">Tono de color</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedColors.map((item) => (
                <button
                  key={item.id || item.hex}
                  type="button"
                  onClick={() => setSelectedColor(item.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === item.hex
                      ? 'border-white scale-110 ring-2 ring-white/25 ring-offset-1 ring-offset-[#0e0e1a]'
                      : 'border-white/15 hover:scale-105 hover:border-white/35'
                  }`}
                  style={{ backgroundColor: item.hex }}
                  title={item.nombre || item.hex}
                  aria-label={item.nombre || item.hex}
                />
              ))}
            </div>
            <label className="block">
              <span className="sr-only">Selector de color personalizado</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full h-9 rounded-lg bg-transparent border border-white/[0.08] p-0.5 cursor-pointer"
              />
            </label>
          </div>

          {/* Blend mode segmented control */}
          <div className="p-3 sm:p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <p className="label-kicker mb-2.5">Modo de mezcla</p>
            <div className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-0.5 gap-0.5">
              {BLEND_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBlendMode(mode)}
                  className={`min-h-[36px] min-w-0 flex-1 px-2 text-[11px] rounded-[10px] capitalize whitespace-nowrap transition-all ${
                    blendMode === mode
                      ? 'bg-white/[0.12] border border-white/[0.18] text-white shadow-sm'
                      : 'border-transparent text-white/55 hover:text-white/80 hover:bg-white/[0.04]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="p-3 sm:p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <div className="flex justify-between mb-2">
              <span className="label-kicker">Intensidad</span>
              <span className="text-xs text-white/70 font-medium tabular-nums">{intensity}%</span>
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

          {/* Manual mask (collapsible, only shown in fallback) */}
          {usingFallback && (
            <div className="rounded-xl border border-white/[0.07] overflow-hidden">
              <button
                type="button"
                onClick={() => setManualOpen((prev) => !prev)}
                className="w-full min-h-[40px] px-3 sm:px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] inline-flex items-center justify-between text-xs transition-colors text-white/65"
                aria-expanded={manualOpen}
              >
                <span>Ajuste de máscara manual</span>
                {manualOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {manualOpen && (
                <div className="p-3 sm:p-4 border-t border-white/[0.05] space-y-3">
                  {[
                    ['x', draftMask.x, 10, 90],
                    ['y', draftMask.y, 5, 55],
                    ['width', draftMask.width, 20, 90],
                    ['height', draftMask.height, 12, 60],
                  ].map(([key, value, min, max]) => (
                    <label key={key} className="block">
                      <div className="flex justify-between text-xs text-white/55 mb-1">
                        <span className="capitalize">{key}</span>
                        <span className="tabular-nums">{value}%</span>
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
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <motion.button
              type="button"
              onClick={handleApply}
              disabled={isAdvancedProcessing}
              className="col-span-3 min-h-[44px] px-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/15"
              whileHover={!isAdvancedProcessing ? { scale: 1.01 } : {}}
              whileTap={!isAdvancedProcessing ? { scale: 0.98 } : {}}
            >
              {isAdvancedProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isAdvancedProcessing ? 'Procesando…' : 'Aplicar tono'}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleReset}
              className="col-span-1 min-h-[40px] px-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-xs inline-flex items-center justify-center gap-1 transition-colors text-white/70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </motion.button>
            <motion.button
              type="button"
              onClick={handleDownload}
              className="col-span-2 min-h-[40px] px-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-xs inline-flex items-center justify-center gap-1 transition-colors text-white/70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HairTryOnLab
