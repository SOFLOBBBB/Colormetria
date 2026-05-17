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
  const [segmentationError, setSegmentationError] = useState('')
  const [usingFallback, setUsingFallback] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [isAdvancedProcessing, setIsAdvancedProcessing] = useState(false)

  useEffect(() => {
    const { src, revoke } = resolveImageSource(image)
    setImageSrc(src)
    setLoadError('')
    setSegmentationError('')
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
            setSegmentationError('Modo simulación manual activado.')
            setUsingFallback(true)
            setSegmentationMode('fallback')
          }
        }
        img.onerror = () => {
          setSegmentationError('Modo simulación manual activado.')
          setUsingFallback(true)
          setSegmentationMode('fallback')
        }
        img.src = imageSrc
      } catch (err) {
        if (cancelled) return
        setSegmentationError('Modo simulación manual activado.')
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

      const maxCanvasWidth = 620
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
                // Selfie segmenter: class 1 suele ser persona.
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
      setLoadError('No se pudo cargar la imagen para el laboratorio visual.')
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
    setSegmentationError('')
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
      setSegmentationError('Modo simulación manual activado')
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
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-white/70 font-medium mb-2">Prueba visual de color de cabello</p>
        <p className="text-sm text-white/55">
          Carga o captura una imagen para activar la prueba visual de color de cabello.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.04] p-4 sm:p-5 ring-1 ring-white/[0.06]">
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-sm font-medium text-white/90">Simulación visual en pruebas</p>
        <p className="text-xs text-white/60 mt-1">
          El resultado puede variar según iluminación, cabello y fondo.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-red-300 mb-3">{loadError}</p>
      )}
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {segmentationMode === 'loading-model' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-300/25 bg-violet-500/10 text-violet-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Cargando modelo
          </span>
        )}
        {segmentationMode === 'segmenting' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-300/25 bg-cyan-500/10 text-cyan-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Segmentando imagen
          </span>
        )}
        {isAdvancedProcessing && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Procesando con simulación avanzada
          </span>
        )}
        {segmentationMode === 'ready' && !usingFallback && (
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
      {segmentationError && (
        <p className="text-xs text-amber-200/90 mb-3">
          {segmentationError}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2 overflow-hidden">
          <div className="mx-auto w-full max-w-[620px]">
            <canvas ref={canvasRef} className="w-full h-auto max-h-[500px] mx-auto block rounded-lg bg-black/30 object-contain" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2">Tono</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestedColors.map((item) => (
                <button
                  key={item.id || item.hex}
                  type="button"
                  onClick={() => setSelectedColor(item.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === item.hex ? 'border-white scale-110' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: item.hex }}
                  title={item.nombre || item.hex}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-10 rounded-lg bg-transparent border border-white/10 p-1"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2">Blend mode</p>
            <div className="inline-flex w-full rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
              {BLEND_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBlendMode(mode)}
                  className={`min-h-[40px] min-w-0 flex-1 px-2 text-xs rounded-lg border capitalize whitespace-nowrap ${
                    blendMode === mode
                      ? 'border-violet-300/50 bg-violet-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/75'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex justify-between text-xs text-white/65 mb-1">
              <span>Intensidad</span>
              <span>{intensity}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={85}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              type="button"
              onClick={() => setManualOpen((prev) => !prev)}
              className="w-full min-h-[44px] px-3 py-2.5 border-b border-white/10 bg-white/[0.04] hover:bg-white/[0.08] inline-flex items-center justify-between text-sm"
            >
              <span>Ajuste manual de máscara</span>
              {manualOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {manualOpen && (
              <div className="p-3 space-y-2.5">
                {usingFallback ? [
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
                      className="w-full"
                    />
                  </label>
                )) : (
                  <p className="text-xs text-white/55">
                    Esta sección se activa cuando el modo de simulación manual está activo.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            <motion.button
              type="button"
              onClick={handleApply}
              disabled={isAdvancedProcessing}
              className="min-h-[44px] min-w-[150px] px-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium inline-flex items-center justify-center gap-1.5 text-center whitespace-nowrap"
              whileHover={{ scale: 1.01 }}
            >
              {isAdvancedProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isAdvancedProcessing ? 'Procesando...' : 'Aplicar tono'}
            </motion.button>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] min-w-[150px] px-3 rounded-xl border border-white/15 bg-white/5 text-sm inline-flex items-center justify-center gap-1.5 text-center whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[44px] min-w-[150px] px-3 rounded-xl border border-white/15 bg-white/5 text-sm inline-flex items-center justify-center gap-1.5 text-center whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Descargar preview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HairTryOnLab
