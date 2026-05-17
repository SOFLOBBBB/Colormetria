import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Sparkles, Shirt, Footprints, Shield, Gem, BadgeHelp, Hand } from 'lucide-react'
import { getClosetPrendas } from '../utils/storageCloset'
import { getPrendasDemo } from '../data/prendasDemo'

function agruparPorCategoria(prendas, genero) {
  const base = {
    superior: null,
    inferior: null,
    calzado: null,
    accesorio: null,
    'abrigo/blazer': null,
    'vestido/falda': null,
  }
  prendas.forEach((prenda) => {
    if (!(prenda.categoria in base)) return
    if (!base[prenda.categoria]) base[prenda.categoria] = prenda
  })
  if (genero !== 'femenino') {
    delete base['vestido/falda']
  }
  return base
}

const CATEGORY_META = {
  superior: { label: 'Superior', Icon: Shirt },
  inferior: { label: 'Inferior', Icon: Layers },
  'vestido/falda': { label: 'Vestido / Falda', Icon: Shield },
  calzado: { label: 'Calzado', Icon: Footprints },
  accesorio: { label: 'Accesorio', Icon: Gem },
  'abrigo/blazer': { label: 'Abrigo / Blazer', Icon: Hand },
}

function getSiluetaClass(genero) {
  if (genero === 'femenino') return 'silueta-femenina'
  if (genero === 'masculino') return 'silueta-masculina'
  return 'silueta-neutral'
}

function ProbadorVisual({ genero, estacion = 'verano' }) {
  const [prendas, setPrendas] = useState(() => getClosetPrendas())
  const [seleccionDemo, setSeleccionDemo] = useState({})
  useEffect(() => {
    const refresh = () => setPrendas(getClosetPrendas())
    window.addEventListener('closet-updated', refresh)
    return () => window.removeEventListener('closet-updated', refresh)
  }, [])

  const demo = useMemo(() => getPrendasDemo(estacion, genero), [estacion, genero])
  const demoAgrupada = useMemo(() => {
    const byCat = {}
    demo.forEach((item) => {
      if (!byCat[item.categoria]) byCat[item.categoria] = []
      byCat[item.categoria].push(item)
    })
    return byCat
  }, [demo])

  const composicion = useMemo(() => {
    if (prendas.length) return agruparPorCategoria(prendas, genero)
    const fallback = agruparPorCategoria([], genero)
    Object.keys(fallback).forEach((cat) => {
      const pool = demoAgrupada[cat] || []
      const selectedId = seleccionDemo[cat]
      fallback[cat] = pool.find((x) => x.id === selectedId) || pool[0] || null
    })
    return fallback
  }, [prendas, genero, demoAgrupada, seleccionDemo])
  const entries = Object.entries(composicion)
  const siluetaClass = getSiluetaClass(genero)

  return (
    <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] p-5 sm:p-6">
      <style>{`
        .studio-fondo {
          background: radial-gradient(120% 90% at 50% 20%, rgba(87, 84, 160, 0.22), rgba(18, 20, 32, 0.85) 50%, rgba(11, 12, 20, 0.95));
        }
        .maniqui-shell {
          position: relative;
          width: 210px;
          height: 460px;
          margin: 0 auto;
        }
        .maniqui-cabeza {
          width: 70px;
          height: 78px;
          border-radius: 45% 45% 50% 50%;
          margin: 0 auto;
          background: linear-gradient(145deg, #faf7ef 0%, #ebe4d6 58%, #ddd3c3 100%);
          box-shadow: inset -6px -8px 16px rgba(126, 113, 93, 0.24), 0 12px 24px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 249, 237, 0.65);
        }
        .maniqui-cuello {
          width: 32px;
          height: 20px;
          border-radius: 0 0 16px 16px;
          margin: -2px auto 0;
          background: linear-gradient(145deg, #f3ecde 0%, #ddd3c3 100%);
          border: 1px solid rgba(255, 249, 237, 0.58);
        }
        .maniqui-torso {
          position: absolute;
          top: 94px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(155deg, #f8f4ea 0%, #e9e2d4 55%, #d8cebe 100%);
          border: 1px solid rgba(255, 249, 237, 0.6);
          box-shadow: inset -8px -16px 20px rgba(112, 99, 81, 0.22), inset 8px 12px 20px rgba(255, 251, 241, 0.25), 0 18px 34px rgba(0, 0, 0, 0.28);
        }
        .silueta-femenina .maniqui-torso {
          width: 164px;
          height: 260px;
          border-radius: 34% 34% 31% 31% / 22% 22% 45% 45%;
          clip-path: polygon(6% 8%, 17% 2%, 33% 0%, 44% 7%, 50% 14%, 56% 7%, 67% 0%, 83% 2%, 94% 8%, 91% 20%, 82% 38%, 75% 49%, 72% 66%, 80% 86%, 67% 99%, 33% 99%, 20% 86%, 28% 66%, 25% 49%, 18% 38%, 9% 20%);
        }
        .silueta-masculina .maniqui-torso {
          width: 176px;
          height: 264px;
          border-radius: 20% 20% 25% 25% / 13% 13% 34% 34%;
          clip-path: polygon(3% 9%, 15% 3%, 34% 0%, 50% 8%, 66% 0%, 85% 3%, 97% 9%, 95% 24%, 86% 43%, 80% 62%, 79% 84%, 69% 99%, 31% 99%, 21% 84%, 20% 62%, 14% 43%, 5% 24%);
        }
        .silueta-neutral .maniqui-torso {
          width: 170px;
          height: 262px;
          border-radius: 25% 25% 28% 28% / 16% 16% 38% 38%;
          clip-path: polygon(5% 10%, 17% 3%, 34% 0%, 50% 8%, 66% 0%, 83% 3%, 95% 10%, 93% 24%, 84% 42%, 78% 58%, 76% 82%, 68% 99%, 32% 99%, 24% 82%, 22% 58%, 16% 42%, 7% 24%);
        }
        .maniqui-base {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 28px;
          width: 130px;
          height: 18px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(255, 245, 220, 0.65), rgba(173, 164, 147, 0.24) 72%, transparent 75%);
        }
      `}</style>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/30 to-fuchsia-400/20 border border-violet-300/25 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white/90" />
        </div>
        <div>
          <h3 className="font-display text-lg sm:text-xl">Probador visual 2.5D</h3>
          <p className="text-sm text-white/60">Vista de composición del look (sin 3D real).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-white/10 studio-fondo p-4 min-h-[460px] relative overflow-hidden">
          <div className={`maniqui-shell ${siluetaClass}`}>
            <div className="maniqui-cabeza" />
            <div className="maniqui-cuello" />
            <div className="maniqui-torso" />
            <div className="maniqui-base" />
            {entries.map(([categoria, prenda], idx) => (
              <motion.div
                key={categoria}
                className="absolute right-0 translate-x-[36%] w-[148px] rounded-lg border border-white/15 px-2 py-1 text-[11px] text-white/85 shadow-[0_12px_20px_rgba(0,0,0,0.3)]"
                style={{
                  top: `${108 + idx * 46}px`,
                  background: prenda ? `${prenda.color}66` : 'rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <span className="block text-[10px] uppercase tracking-[0.12em] text-white/65">
                  {CATEGORY_META[categoria]?.label || categoria}
                </span>
                <span className="block mt-0.5 line-clamp-1">
                  {prenda ? prenda.nombre : 'Sin asignar'}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-white/50 mt-3">
            Vista de composición para construir el look por capas.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-3">Panel de capas</p>
          <div className="space-y-2">
            {entries.map(([categoria, prenda]) => {
              const Icon = CATEGORY_META[categoria]?.Icon || BadgeHelp
              return (
              <div key={categoria} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] text-white/50 uppercase inline-flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {CATEGORY_META[categoria]?.label || categoria}
                </p>
                <p className="text-sm text-white/90 mt-0.5">
                  {prenda ? prenda.nombre : 'Sin asignar'}
                </p>
                {prenda?.color && (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-white/65">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/25"
                      style={{ backgroundColor: prenda.color }}
                    />
                    {prenda.color}
                  </div>
                )}
              </div>
            )})}
          </div>
          {!prendas.length && (
            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/90 mb-2">Selector demo por categoría</p>
              <div className="space-y-2">
                {entries.map(([categoria]) => (
                  <label key={categoria} className="block">
                    <span className="text-[11px] text-white/60 capitalize mb-1 block">{CATEGORY_META[categoria]?.label || categoria}</span>
                    <select
                      value={seleccionDemo[categoria] || ''}
                      onChange={(e) => setSeleccionDemo((prev) => ({ ...prev, [categoria]: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-[#171826] px-2 py-2 text-xs"
                    >
                      <option value="">Primera sugerida</option>
                      {(demoAgrupada[categoria] || []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} ({item.ocasion})
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 text-sm text-white/75 inline-flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 text-violet-200" />
            Ajusta colores y categorías desde Clóset Inteligente para mejorar esta composición.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProbadorVisual
