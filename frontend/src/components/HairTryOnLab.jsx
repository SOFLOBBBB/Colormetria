import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wand2,
  Download,
  Loader2,
  CheckCircle2,
  Sparkles,
  Scissors,
  Palette,
} from 'lucide-react'
import { apiUrl } from '../config/api'

function resolveImageSource(image) {
  if (!image) return { src: null, revoke: null }
  if (typeof image === 'string') return { src: image, revoke: null }
  if (image instanceof File || image instanceof Blob) {
    const url = URL.createObjectURL(image)
    return { src: url, revoke: () => URL.revokeObjectURL(url) }
  }
  return { src: null, revoke: null }
}

const MODES = [
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'style', label: 'Peinado', icon: Scissors },
  { id: 'color_style', label: 'Color + Peinado', icon: Sparkles },
]
const GENERATIVE_HAIR_ENABLED = ['1', 'true', 'yes', 'on'].includes(
  String(import.meta.env.VITE_ENABLE_GENERATIVE_HAIR_EDIT || '').toLowerCase(),
)

function HairTryOnLab({
  image,
  suggestedColors = [],
  suggestedStyles = [],
  estacion,
  genero,
}) {
  const [imageSrc, setImageSrc] = useState(null)
  const [previewSrc, setPreviewSrc] = useState(null)
  const [selectedMode, setSelectedMode] = useState('color')
  const [selectedColor, setSelectedColor] = useState(suggestedColors[0]?.hex || '#8B4513')
  const [selectedColorName, setSelectedColorName] = useState(suggestedColors[0]?.nombre || '')
  const [selectedStyle, setSelectedStyle] = useState(suggestedStyles[0]?.nombre || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [advancedUnavailable, setAdvancedUnavailable] = useState(false)
  const [lastModeUsed, setLastModeUsed] = useState(null)

  useEffect(() => {
    const { src, revoke } = resolveImageSource(image)
    setImageSrc(src)
    setPreviewSrc(null)
    setStatusText('')
    setAdvancedUnavailable(false)
    setLastModeUsed(null)

    return () => {
      if (revoke) revoke()
    }
  }, [image])

  useEffect(() => {
    if (!suggestedColors.length) return
    const selectedColorExists = suggestedColors.some((item) => item.hex === selectedColor)
    if (!selectedColorExists) {
      const first = suggestedColors[0]
      setSelectedColor(first.hex)
      setSelectedColorName(first.nombre || '')
    }
  }, [suggestedColors, selectedColor])

  useEffect(() => {
    if (!suggestedStyles.length) return
    const selectedStyleExists = suggestedStyles.some((item) => item.nombre === selectedStyle)
    if (!selectedStyleExists) {
      setSelectedStyle(suggestedStyles[0].nombre || '')
    }
  }, [suggestedStyles, selectedStyle])

  const canUseColor = useMemo(
    () => selectedMode === 'color' || selectedMode === 'color_style',
    [selectedMode],
  )
  const canUseStyle = useMemo(
    () => selectedMode === 'style' || selectedMode === 'color_style',
    [selectedMode],
  )

  const resolveImageFile = async () => {
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

  const handleGenerate = async () => {
    if (!imageSrc) return
    setIsGenerating(true)
    setStatusText('Generando vista previa de cabello')
    setLastModeUsed(null)

    try {
      if (!GENERATIVE_HAIR_ENABLED) {
        setAdvancedUnavailable(true)
        await handleLocalSimulation({
          statusMessage: 'Simulación avanzada no disponible. Se generó una vista previa local.',
        })
        return
      }

      const imageFile = await resolveImageFile()
      if (!imageFile) {
        throw new Error('No hay imagen disponible.')
      }
      const formData = new FormData()
      formData.append('archivo', imageFile)
      formData.append('modo', selectedMode)
      if (canUseColor) {
        formData.append('color_hex', selectedColor)
        if (selectedColorName) formData.append('color_nombre', selectedColorName)
      }
      if (canUseStyle && selectedStyle) {
        formData.append('estilo_peinado', selectedStyle)
      }
      if (estacion) formData.append('estacion', estacion)
      if (genero) formData.append('genero', genero)
      formData.append('intensidad', '40')

      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 120000)
      let response
      try {
        response = await fetch(apiUrl('/hair-edit'), {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })
      } finally {
        window.clearTimeout(timeoutId)
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(`Servicio no disponible (${response.status})`)
      }

      if (data?.advanced_available === false && data?.fallback_available) {
        setAdvancedUnavailable(true)
        await handleLocalSimulation({
          statusMessage: 'Simulación avanzada no disponible. Se generó una vista previa local.',
        })
        return
      }

      if (!data?.exito || !data?.preview_data_url) {
        throw new Error('Respuesta inválida')
      }

      setAdvancedUnavailable(false)
      setPreviewSrc(data.preview_data_url)
      setStatusText('Resultado generado')
      setLastModeUsed('advanced')
    } catch (_err) {
      setAdvancedUnavailable(true)
      await handleLocalSimulation({
        statusMessage: 'Simulación avanzada no disponible. Se generó una vista previa local.',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLocalSimulation = async (options = {}) => {
    const { statusMessage = 'Resultado generado' } = options
    if (!imageSrc) return
    if (!isGenerating) {
      setIsGenerating(true)
      setStatusText('Generando vista previa de cabello')
    }

    try {
      const imageFile = await resolveImageFile()
      if (!imageFile) throw new Error('No hay imagen disponible.')

      const formData = new FormData()
      formData.append('archivo', imageFile)
      formData.append('color_hex', selectedColor)
      formData.append('intensidad', '40')

      const response = await fetch(apiUrl('/hair-tryon'), {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('No disponible')
      const data = await response.json()
      if (!data?.exito || !data?.preview_data_url) throw new Error('Respuesta inválida')

      setPreviewSrc(data.preview_data_url)
      setStatusText(statusMessage)
      setLastModeUsed('local')
    } catch (_err) {
      setStatusText('')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!previewSrc) return
    const link = document.createElement('a')
    link.href = previewSrc
    link.download = `hair-preview-${Date.now()}.png`
    link.click()
  }

  if (!imageSrc) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-white/50">
          Carga o captura una foto para activar la simulación avanzada de cabello.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-8 min-w-0">
          <div className="studio-frame">
            <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/70">Simulación avanzada de cabello</span>
            </div>
            <img
              src={previewSrc || imageSrc}
              alt={previewSrc ? 'Resultado generado' : 'Foto original'}
              className="w-full max-h-[580px] object-contain block"
            />
          </div>
        </div>

        <div className="lg:col-span-4 min-w-0 space-y-3">
          <div className="p-3 sm:p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
            <p className="label-kicker mb-2.5">Modo</p>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMode(item.id)}
                  className={`min-h-[40px] rounded-xl text-xs border transition-colors inline-flex items-center justify-center gap-1.5 ${
                    selectedMode === item.id
                      ? 'bg-white/[0.14] border-white/[0.22] text-white'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {canUseColor && (
            <div className="p-3 sm:p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
              <p className="label-kicker mb-2.5">Seleccionar tono</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedColors.map((item) => (
                  <button
                    key={item.id || item.hex}
                    type="button"
                    onClick={() => {
                      setSelectedColor(item.hex)
                      setSelectedColorName(item.nombre || '')
                    }}
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
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value)
                  setSelectedColorName('')
                }}
                className="w-full h-9 rounded-lg bg-transparent border border-white/[0.08] p-0.5 cursor-pointer"
                aria-label="Color personalizado"
              />
            </div>
          )}

          {canUseStyle && (
            <div className="p-3 sm:p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
              <p className="label-kicker mb-2.5">Seleccionar peinado</p>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 text-sm text-white"
              >
                {suggestedStyles.map((item) => (
                  <option key={item.id || item.nombre} value={item.nombre} className="text-black">
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full min-h-[44px] px-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/15"
            whileHover={!isGenerating ? { scale: 1.01 } : {}}
            whileTap={!isGenerating ? { scale: 0.98 } : {}}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generar vista previa
          </motion.button>

          <motion.button
            type="button"
            onClick={handleDownload}
            disabled={!previewSrc}
            className="w-full min-h-[40px] px-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-xs inline-flex items-center justify-center gap-1 transition-colors text-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={previewSrc ? { scale: 1.02 } : {}}
            whileTap={previewSrc ? { scale: 0.97 } : {}}
          >
            <Download className="w-3.5 h-3.5" />
            Descargar preview
          </motion.button>
        </div>
      </div>

      {(isGenerating || statusText) && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/[0.08] text-fuchsia-200/80">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generando vista previa de cabello
            </span>
          )}
          {!isGenerating && statusText === 'Resultado generado' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-200/80">
              <CheckCircle2 className="w-3 h-3" />
              Resultado generado
            </span>
          )}
          {!isGenerating &&
            statusText === 'Simulación avanzada no disponible. Se generó una vista previa local.' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/[0.08] text-cyan-200/90">
                <CheckCircle2 className="w-3 h-3" />
                Simulación avanzada no disponible. Se generó una vista previa local.
              </span>
            )}
        </div>
      )}

      {advancedUnavailable && lastModeUsed !== 'local' && (
        <div className="rounded-xl border border-amber-300/20 bg-amber-500/[0.08] p-4 space-y-2">
          <p className="text-sm text-amber-100/90 font-medium">
            La simulación avanzada no está disponible en este momento.
          </p>
          <p className="text-xs text-amber-100/70">
            Modo simulación local disponible.
          </p>
          <button
            type="button"
            onClick={handleLocalSimulation}
            disabled={isGenerating}
            className="min-h-[38px] px-3 rounded-lg border border-amber-200/30 bg-amber-400/10 text-amber-100 text-xs hover:bg-amber-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Generar con simulación local
          </button>
        </div>
      )}

      <p className="text-xs text-white/55">
        La simulación puede variar según iluminación y encuadre.
      </p>
    </div>
  )
}

export default HairTryOnLab
