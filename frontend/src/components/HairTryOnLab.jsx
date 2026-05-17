import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  RotateCcw,
  Wand2,
  Download,
  SlidersHorizontal,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import { buildHeuristicMask, HAIR_MODEL_SOURCE, loadHairSegmenter } from '../utils/hairSegmentation'

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

  useEffect(() => {
    const { src, revoke } = resolveImageSource(image)
    setImageSrc(src)
    setLoadError('')
    setSegmentationError('')
    setSegmentationMode(src ? 'loading-model' : 'idle')
    setUsingFallback(false)
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
            setSegmentationError(err.message || 'No se pudo segmentar con MediaPipe.')
            setUsingFallback(true)
            setSegmentationMode('fallback')
          }
        }
        img.onerror = () => {
          setSegmentationError('No se pudo preparar la imagen para segmentación.')
          setUsingFallback(true)
          setSegmentationMode('fallback')
        }
        img.src = imageSrc
      } catch (err) {
        if (cancelled) return
        setSegmentationError(err.message || 'Falló la carga de MediaPipe.')
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

      if (appliedConfig) {
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

    img.src = imageSrc
  }, [imageSrc, appliedConfig, usingFallback])

  const handleApply = () => {
    setAppliedConfig({
      color: selectedColor,
      blendMode,
      intensity,
      mask: { ...draftMask },
    })
  }

  const handleReset = () => {
    setDraftMask(DEFAULT_MASK)
    setIntensity(DEFAULT_MASK.intensity)
    setAppliedConfig(null)
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
        <p className="text-sm text-white/70 font-medium mb-2">Hair Try-On Lab</p>
        <p className="text-sm text-white/55">
          Carga o captura una imagen para activar la prueba visual de color de cabello.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.04] p-4 sm:p-5 ring-1 ring-white/[0.06]">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-400/20 flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-violet-200" />
        </div>
        <div>
          <h4 className="font-semibold text-white/95">Hair Try-On Lab (beta)</h4>
          <p className="text-xs text-amber-200/90 mt-1 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulación experimental. El resultado puede variar según iluminación, cabello y fondo.
          </p>
          <p className="text-[11px] text-white/45 mt-1">
            Modelo actual: CDN oficial ({HAIR_MODEL_SOURCE.type}). Ruta configurable en `hairSegmentation.js`.
          </p>
        </div>
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
        {segmentationMode === 'ready' && !usingFallback && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-300/25 bg-emerald-500/10 text-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Vista lista
          </span>
        )}
        {usingFallback && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-300/25 bg-amber-500/10 text-amber-100">
            <ShieldAlert className="w-3.5 h-3.5" />
            Fallback activado
          </span>
        )}
      </div>
      {segmentationError && (
        <p className="text-xs text-amber-200/90 mb-3">
          {segmentationError}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2 overflow-auto">
          <canvas ref={canvasRef} className="w-full h-auto rounded-lg bg-black/30" />
        </div>

        <div className="space-y-4">
          <div>
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

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2">Blend mode</p>
            <div className="grid grid-cols-3 gap-2">
              {BLEND_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBlendMode(mode)}
                  className={`min-h-[40px] text-xs rounded-lg border capitalize ${
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

          <div>
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

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2.5">
            {usingFallback && [
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
            ))}
            {!usingFallback && (
              <p className="text-xs text-white/55">
                Ajustes manuales de máscara se habilitan solo cuando fallback está activo.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <motion.button
              type="button"
              onClick={handleApply}
              className="min-h-[44px] rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium inline-flex items-center justify-center gap-1.5"
              whileHover={{ scale: 1.01 }}
            >
              <Wand2 className="w-4 h-4" />
              Aplicar tono
            </motion.button>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 text-sm inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 text-sm inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HairTryOnLab
