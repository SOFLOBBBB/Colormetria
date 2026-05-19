import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Layers,
  Sparkles,
  Shirt,
  Footprints,
  Shield,
  Gem,
  BadgeHelp,
  Hand,
  X,
} from 'lucide-react'
import { getClosetPrendas, getProbadorPreview } from '../utils/storageCloset'
import { getPrendasDemo } from '../data/prendasDemo'
import { mergeCatalogWithDemo } from '../data/svgWardrobe'
import { useWardrobe } from '../hooks/useWardrobe'
import ClothingLayer from './probador/ClothingLayer'

const CATEGORY_META = {
  superior: { label: 'Superior', Icon: Shirt },
  inferior: { label: 'Inferior', Icon: Layers },
  'vestido/falda': { label: 'Vestido / Falda', Icon: Shield },
  calzado: { label: 'Calzado', Icon: Footprints },
  accesorio: { label: 'Accesorio', Icon: Gem },
  'abrigo/blazer': { label: 'Abrigo / Blazer', Icon: Hand },
}

const RENDER_ORDER = ['inferior', 'vestido/falda', 'superior', 'calzado', 'accesorio', 'abrigo/blazer']

function getSiluetaClass(genero) {
  if (genero === 'femenino') return 'silueta-femenina'
  if (genero === 'masculino') return 'silueta-masculina'
  return 'silueta-neutral'
}

function MiniSvgPreview({ item, className = '' }) {
  if (!item?.draw) {
    return <motion.div className={`rounded-lg bg-white/5 border border-white/10 ${className}`} />
  }
  const color = item.hex || item.color || '#9aa1b0'
  return (
    <motion.div
      className={`rounded-lg border border-white/10 bg-black/20 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 280 480"
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: item.draw(color, item.genero) }}
      />
    </motion.div>
  )
}

function ProbadorVisual({ genero, estacion = 'verano' }) {
  const [prendas, setPrendas] = useState(() => getClosetPrendas())
  const [preview, setPreview] = useState(() => getProbadorPreview())

  const {
    equipped,
    activeLayer,
    setActiveLayer,
    equipItem,
    removeItem,
    equipDefaults,
  } = useWardrobe({ genero })

  useEffect(() => {
    const refresh = () => {
      setPrendas(getClosetPrendas())
      setPreview(getProbadorPreview())
    }
    window.addEventListener('closet-updated', refresh)
    return () => window.removeEventListener('closet-updated', refresh)
  }, [])

  const demo = useMemo(() => getPrendasDemo(estacion, genero), [estacion, genero])
  const catalog = useMemo(
    () => mergeCatalogWithDemo(demo, genero, estacion),
    [demo, genero, estacion],
  )

  const visibleLayers = useMemo(() => {
    if (genero === 'masculino') {
      return RENDER_ORDER.filter((l) => l !== 'vestido/falda')
    }
    return RENDER_ORDER
  }, [genero])

  const hasDress = genero === 'femenino' && !!equipped['vestido/falda']

  useEffect(() => {
    const hasAny = visibleLayers.some((layer) => equipped[layer])
    if (hasAny || preview?.prendas?.length) return
    equipDefaults(catalog, visibleLayers)
  }, [catalog, equipped, equipDefaults, preview, visibleLayers])

  const sourceTag = preview?.prendas?.length
    ? 'Look enviado desde Outfit Studio'
    : prendas.length
      ? 'Prendas del clóset local'
      : 'Catálogo demo visual'

  const activeCatalog = activeLayer ? catalog[activeLayer] || [] : []
  const siluetaClass = getSiluetaClass(genero)

  return (
    <motion.div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] p-5 sm:p-6">
      <style>{`
        .studio-fondo {
          background: radial-gradient(120% 90% at 50% 20%, rgba(87, 84, 160, 0.22), rgba(18, 20, 32, 0.85) 50%, rgba(11, 12, 20, 0.95));
        }
        .avatar-stage {
          position: relative;
          width: min(100%, 280px);
          aspect-ratio: 280 / 480;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 1rem;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 24px 48px rgba(0, 0, 0, 0.45),
            0 0 60px rgba(139, 92, 246, 0.12);
        }
        .maniqui-shell {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .maniqui-cabeza {
          position: absolute;
          top: 4%;
          left: 50%;
          transform: translateX(-50%);
          width: 25%;
          height: 16%;
          border-radius: 45% 45% 50% 50%;
          background: linear-gradient(145deg, #faf7ef 0%, #ebe4d6 58%, #ddd3c3 100%);
          box-shadow: inset -6px -8px 16px rgba(126, 113, 93, 0.24), 0 12px 24px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 249, 237, 0.65);
          z-index: 1;
        }
        .maniqui-cuello {
          position: absolute;
          top: 18%;
          left: 50%;
          transform: translateX(-50%);
          width: 11%;
          height: 4%;
          border-radius: 0 0 16px 16px;
          background: linear-gradient(145deg, #f3ecde 0%, #ddd3c3 100%);
          border: 1px solid rgba(255, 249, 237, 0.58);
          z-index: 2;
        }
        .maniqui-torso {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(155deg, #f8f4ea 0%, #e9e2d4 55%, #d8cebe 100%);
          border: 1px solid rgba(255, 249, 237, 0.6);
          box-shadow: inset -8px -16px 20px rgba(112, 99, 81, 0.22), inset 8px 12px 20px rgba(255, 251, 241, 0.25), 0 18px 34px rgba(0, 0, 0, 0.28);
          z-index: 3;
        }
        .silueta-femenina .maniqui-torso {
          width: 58%;
          height: 54%;
          border-radius: 34% 34% 31% 31% / 22% 22% 45% 45%;
          clip-path: polygon(6% 8%, 17% 2%, 33% 0%, 44% 7%, 50% 14%, 56% 7%, 67% 0%, 83% 2%, 94% 8%, 91% 20%, 82% 38%, 75% 49%, 72% 66%, 80% 86%, 67% 99%, 33% 99%, 20% 86%, 28% 66%, 25% 49%, 18% 38%, 9% 20%);
        }
        .silueta-masculina .maniqui-torso {
          width: 62%;
          height: 55%;
          border-radius: 20% 20% 25% 25% / 13% 13% 34% 34%;
          clip-path: polygon(3% 9%, 15% 3%, 34% 0%, 50% 8%, 66% 0%, 85% 3%, 97% 9%, 95% 24%, 86% 43%, 80% 62%, 79% 84%, 69% 99%, 31% 99%, 21% 84%, 20% 62%, 14% 43%, 5% 24%);
        }
        .silueta-neutral .maniqui-torso {
          width: 60%;
          height: 55%;
          border-radius: 25% 25% 28% 28% / 16% 16% 38% 38%;
          clip-path: polygon(5% 10%, 17% 3%, 34% 0%, 50% 8%, 66% 0%, 83% 3%, 95% 10%, 93% 24%, 84% 42%, 78% 58%, 76% 82%, 68% 99%, 32% 99%, 24% 82%, 22% 58%, 16% 42%, 7% 24%);
        }
        .maniqui-base {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 6%;
          width: 46%;
          height: 4%;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(255, 245, 220, 0.65), rgba(173, 164, 147, 0.24) 72%, transparent 75%);
          z-index: 4;
        }
        .clothing-stack {
          position: absolute;
          inset: 0;
          z-index: 10;
        }
      `}</style>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/30 to-fuchsia-400/20 border border-violet-300/25 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white/90" />
        </div>
        <motion.div>
          <h3 className="font-display text-lg sm:text-xl">Probador visual 2.5D</h3>
          <p className="text-sm text-white/60">Composición por capas SVG sobre el maniquí.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 min-w-0">
        <div className="rounded-2xl border border-white/10 studio-fondo p-4 min-h-[460px] relative overflow-hidden min-w-0">
          <motion.div className="avatar-stage" layout>
            <div className={`maniqui-shell ${siluetaClass}`}>
              <div className="maniqui-cabeza" />
              <div className="maniqui-cuello" />
              <div className="maniqui-torso" />
              <div className="maniqui-base" />
            </div>
            <motion.div className="clothing-stack">
              {!hasDress && (
                <ClothingLayer layer="inferior" item={equipped.inferior} />
              )}
              {hasDress && (
                <ClothingLayer layer="vestido/falda" item={equipped['vestido/falda']} />
              )}
              {!hasDress && (
                <ClothingLayer layer="superior" item={equipped.superior} />
              )}
              <ClothingLayer layer="calzado" item={equipped.calzado} />
              <ClothingLayer layer="accesorio" item={equipped.accesorio} />
              <ClothingLayer layer="abrigo/blazer" item={equipped['abrigo/blazer']} />
            </motion.div>
          </motion.div>
          <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/25 px-3 py-1 max-w-[calc(100%-1.5rem)]">
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/65 truncate block">
              {sourceTag}
            </span>
          </div>
          <p className="text-center text-xs text-white/50 mt-3 px-2">
            Selecciona una capa en el panel para vestir el maniquí visualmente.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-3">Panel de capas</p>
          <div className="space-y-2">
            {visibleLayers.map((layer) => {
              const item = equipped[layer]
              const Icon = CATEGORY_META[layer]?.Icon || BadgeHelp
              const isActive = activeLayer === layer
              return (
                <button
                  key={layer}
                  type="button"
                  onClick={() => setActiveLayer(isActive ? null : layer)}
                  className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
                    isActive
                      ? 'border-violet-400/40 bg-violet-500/15 ring-1 ring-violet-300/25'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <MiniSvgPreview item={item} className="w-14 h-20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/50 uppercase inline-flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {CATEGORY_META[layer]?.label || layer}
                      </p>
                      <p className="text-sm text-white/90 mt-0.5 truncate">
                        {item ? item.nombre : 'Sin asignar'}
                      </p>
                      {item && (
                        <motion.div className="mt-2 inline-flex items-center gap-2 text-xs text-white/65 max-w-full">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                            style={{ backgroundColor: item.hex || item.color }}
                          />
                          <span className="truncate">{item.hex || item.color}</span>
                        </motion.div>
                      )}
                    </div>
                    {item && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(layer)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            removeItem(layer)
                          }
                        }}
                        className="shrink-0 w-8 h-8 rounded-lg border border-white/15 bg-white/5 hover:bg-red-500/20 hover:border-red-400/30 inline-flex items-center justify-center text-white/70 cursor-pointer"
                        aria-label={`Quitar ${item.nombre}`}
                      >
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {activeLayer && (
            <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/90 mb-3">
                Catálogo · {CATEGORY_META[activeLayer]?.label || activeLayer}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {activeCatalog.map((item) => {
                  const selected = equipped[activeLayer]?.id === item.id
                    || equipped[activeLayer]?.sourceId === item.sourceId
                  return (
                    <button
                      key={item.sourceId || item.id}
                      type="button"
                      onClick={() => equipItem(activeLayer, item)}
                      className={`text-left rounded-xl border p-2.5 transition-all cursor-pointer hover:-translate-y-0.5 ${
                        selected
                          ? 'border-violet-400/50 bg-violet-500/20 ring-2 ring-violet-300/30 shadow-[0_0_24px_rgba(167,139,250,0.25)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <MiniSvgPreview item={item} className="h-24 w-full mb-2" />
                      <p className="text-xs font-medium text-white/90 line-clamp-2">{item.nombre}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.hex }}
                        />
                        <span className="text-[10px] text-white/55 capitalize truncate">{item.ocasion}</span>
                      </div>
                      <span className="text-[10px] text-white/45 capitalize block mt-0.5 truncate">
                        {item.estilo}
                      </span>
                    </button>
                  )
                })}
              </div>
              {!activeCatalog.length && (
                <p className="text-xs text-white/55">No hay prendas en esta categoría.</p>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 text-sm text-white/75 inline-flex items-start gap-2 min-w-0">
            <Sparkles className="w-4 h-4 mt-0.5 text-violet-200 shrink-0" />
            <span className="min-w-0">
              Outfit Studio y Clóset Inteligente envían prendas al probador. Haz clic en una capa para abrir su catálogo visual.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProbadorVisual
