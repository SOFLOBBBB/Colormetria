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
  Lock,
  Zap,
} from 'lucide-react'
import { apiUrl } from '../config/api'

/* ── Hair Studio AI — Coming Soon banner ─────────────────────────────── */
function HairStudioAIBanner({ onTryLocal, isGenerating }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-violet-400/[0.18] bg-white/[0.025]"
    >
      <style>{`
        @keyframes hs-shimmer {
          0%   { background-position: 220% 0; }
          100% { background-position: -220% 0; }
        }
        .hs-shimmer {
          background: linear-gradient(
            90deg,
            rgba(167,139,250,0.04) 0%,
            rgba(167,139,250,0.13) 45%,
            rgba(255,255,255,0.07) 55%,
            rgba(167,139,250,0.04) 100%
          );
          background-size: 220% 100%;
          animation: hs-shimmer 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Glow blobs */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-violet-600/[0.09] blur-2xl pointer-events-none" aria-hidden />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-fuchsia-700/[0.06] blur-2xl pointer-events-none" aria-hidden />

      <div className="relative p-3.5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-8 h-8 rounded-lg border border-violet-400/25 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 0 16px rgba(139,92,246,0.22)' }}
          >
            <Scissors className="w-4 h-4 text-violet-200" aria-hidden />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display text-sm text-white/95 font-medium">Hair Studio AI</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.14em] border border-amber-400/30 bg-amber-500/[0.1] text-amber-200/90">
              <Sparkles className="w-2.5 h-2.5 shrink-0" aria-hidden />
              Coming Soon
            </span>
          </div>
        </div>

        {/* Copy */}
        <p className="text-[11px] text-white/55 leading-relaxed mb-1.5">
          La simulación avanzada de peinados estará disponible próximamente.
        </p>
        <p className="text-[11px] text-white/38 leading-relaxed mb-3">
          Estamos preparando una experiencia de transformación capilar más avanzada con
          simulación visual mejorada y recomendaciones inteligentes.
        </p>

        {/* Shimmer bars */}
        <div className="space-y-1.5 mb-3">
          <div className="h-1 rounded-full hs-shimmer w-4/5" />
          <div className="h-1 rounded-full hs-shimmer w-3/5" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled
            className="w-full min-h-[36px] px-3 rounded-lg border border-white/[0.09] bg-white/[0.03] text-white/28 text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
            aria-label="Simulación avanzada próximamente disponible"
          >
            <Lock className="w-3 h-3 shrink-0" aria-hidden />
            Próximamente
          </button>
          <motion.button
            type="button"
            onClick={onTryLocal}
            disabled={isGenerating}
            className="w-full min-h-[36px] px-3 rounded-lg border border-violet-400/25 bg-violet-500/[0.1] hover:bg-violet-500/[0.18] text-violet-100 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isGenerating ? { scale: 1.01 } : {}}
            whileTap={!isGenerating ? { scale: 0.98 } : {}}
          >
            {isGenerating
              ? <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden />
              : <Zap className="w-3 h-3 shrink-0" aria-hidden />
            }
            Probar simulación básica
          </motion.button>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(217,70,239,0.15), transparent)' }}
        aria-hidden
      />
    </motion.div>
  )
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
          statusMessage: 'Vista previa local generada',
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
          statusMessage: 'Vista previa local generada',
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
        statusMessage: 'Vista previa local generada',
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
      <div className="rounded-2xl border border-violet-400/[0.12] bg-white/[0.02] p-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-violet-300/70 mb-1">
          <Scissors className="w-4 h-4" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.14em]">Hair Studio</span>
        </div>
        <p className="text-sm text-white/50">
          Carga o captura una foto para generar tu simulación de cabello.
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
          {/* Coming Soon banner — shown when generative is off or unavailable */}
          {(!GENERATIVE_HAIR_ENABLED || advancedUnavailable) && (
            <HairStudioAIBanner
              onTryLocal={() => handleLocalSimulation({ statusMessage: 'Vista previa local generada' })}
              isGenerating={isGenerating}
            />
          )}

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

          {/* Primary CTA — dynamic based on generative availability */}
          {GENERATIVE_HAIR_ENABLED && !advancedUnavailable ? (
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
          ) : (
            <motion.button
              type="button"
              onClick={() => handleLocalSimulation({ statusMessage: 'Vista previa local generada' })}
              disabled={isGenerating}
              className="w-full min-h-[44px] px-3 rounded-xl bg-gradient-to-r from-violet-600/70 to-fuchsia-600/60 border border-violet-400/20 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={!isGenerating ? { scale: 1.01 } : {}}
              whileTap={!isGenerating ? { scale: 0.98 } : {}}
            >
              {isGenerating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Zap className="w-4 h-4" />
              }
              Probar simulación básica
            </motion.button>
          )}

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
          {!isGenerating && statusText === 'Vista previa local generada' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-300/20 bg-violet-500/[0.08] text-violet-200/90">
              <CheckCircle2 className="w-3 h-3" />
              Vista previa lista
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-white/38">
        La simulación puede variar según iluminación y encuadre.
      </p>
    </div>
  )
}

export default HairTryOnLab
