/**
 * Componente GaleriaOutfits
 * Muestra outfits recomendados según la colorimetría del usuario
 * Con imágenes de moodboard por estación y consejos de estilo
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shirt,
  Sparkles,
  BookmarkPlus,
  Lightbulb,
  Filter,
  PlusSquare,
  CheckCircle2,
  Ban,
} from 'lucide-react'
import {
  getBaseRecomendaciones,
  getOpcionesFiltros,
  getOutfitsPorContexto,
  getSugerenciasFallback,
} from '../data/recomendacionesEstilo'
import { addClosetPrenda, addInspiracion } from '../utils/storageCloset'

function GaleriaOutfits({ estacion, genero }) {
  const { ocasiones, estilos } = getOpcionesFiltros()
  const [ocasion, setOcasion] = useState('casual')
  const [estilo, setEstilo] = useState('')
  const [feedback, setFeedback] = useState('')

  const base = useMemo(() => getBaseRecomendaciones(estacion, genero), [estacion, genero])
  const outfitsFiltrados = useMemo(() => {
    const filtrados = getOutfitsPorContexto({ estacion, genero, ocasion, estilo: estilo || null })
    return filtrados.length ? filtrados : getSugerenciasFallback(estacion, genero)
  }, [estacion, genero, ocasion, estilo])

  const handleAgregarPrendas = (outfit) => {
    outfit.prendas.forEach((nombre) => {
      addClosetPrenda({
        nombre,
        categoria: 'superior',
        color: '#9aa1b0',
        ocasion: outfit.ocasion,
        nota: `Sugerida desde Outfit Studio: ${outfit.nombre}`,
        genero,
        origen: 'outfit-sugerido',
      })
    })
    setFeedback(`Prendas sugeridas de "${outfit.nombre}" agregadas al clóset local.`)
  }

  const handleInspiracion = (outfit) => {
    addInspiracion({
      nombre: outfit.nombre,
      ocasion: outfit.ocasion,
      estilo: outfit.estilo,
      notaEstilo: outfit.notaEstilo,
      estacion,
      genero,
    })
    setFeedback(`"${outfit.nombre}" guardado como inspiración.`)
  }

  return (
    <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] max-w-5xl mx-auto transition-shadow duration-300 hover:border-white/[0.16]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/40 to-indigo-500/35 flex items-center justify-center">
          <Shirt className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.16em] text-white/45 mb-1">Outfit Studio</p>
          <h3 className="font-display text-xl font-semibold">Looks personalizados por colorimetría</h3>
          <p className="text-white/60 text-sm">
            Estación: <span className="capitalize">{base.estacion}</span> · Perfil:{' '}
            <span className="capitalize">{base.genero}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <label className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <span className="text-xs text-white/45 inline-flex items-center gap-2 mb-1">
            <Filter className="w-3.5 h-3.5" />
            Ocasión
          </span>
          <select
            value={ocasion}
            onChange={(e) => setOcasion(e.target.value)}
            className="w-full bg-[#171826] rounded-lg border border-white/10 px-2 py-2 text-sm capitalize"
          >
            {ocasiones.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <span className="text-xs text-white/45 inline-flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Estilo
          </span>
          <select
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
            className="w-full bg-[#171826] rounded-lg border border-white/10 px-2 py-2 text-sm capitalize"
          >
            <option value="">Todos</option>
            {estilos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
        {outfitsFiltrados.map((outfit, index) => (
          <motion.div
            key={outfit.id}
            className="rounded-xl overflow-hidden border ring-1 transition-all border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/8 ring-white/[0.04]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 capitalize text-white/60">
                  {outfit.ocasion}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 capitalize text-white/60">
                  {outfit.estilo}
                </span>
              </div>
              <h4 className="font-semibold">{outfit.nombre}</h4>
              <p className="text-white/60 text-sm mt-1">{outfit.notaEstilo}</p>

              <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-white/50 mb-1">Prendas específicas</p>
                <ul className="text-xs text-white/75 space-y-1">
                  {outfit.prendas.map((prenda) => (
                    <li key={prenda}>- {prenda}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-white/50 mb-1">Accesorios</p>
                <ul className="text-xs text-white/75 space-y-1">
                  {outfit.accesorios.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-white/75 inline-flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-fuchsia-300" />
                <span>{outfit.porQueFunciona}</span>
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInspiracion(outfit)}
                  className="min-h-[44px] px-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs inline-flex items-center justify-center gap-1 text-center"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Usar inspiración
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback(`Puedes ver "${outfit.nombre}" en el Probador Visual desde Suite Premium.`)}
                  className="min-h-[44px] px-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs inline-flex items-center justify-center gap-1 text-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ver en probador
                </button>
                <button
                  type="button"
                  onClick={() => handleAgregarPrendas(outfit)}
                  className="min-h-[44px] px-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs inline-flex items-center justify-center gap-1 sm:col-span-2 text-center"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  Agregar prendas sugeridas
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <h4 className="font-semibold mb-3 text-sm">Construye tu look</h4>
          <p className="text-sm text-white/65">
            Usa Clóset Inteligente para combinar tus prendas guardadas y ver composición visual en el probador.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/10">
          <h4 className="font-semibold mb-3 text-sm inline-flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Qué evitar en tu estación
          </h4>
          <ul className="text-sm text-white/75 space-y-1">
            {base.colorGuide.evitar.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {feedback && (
        <p className="mt-4 text-sm text-emerald-300 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {feedback}
        </p>
      )}
      <p className="mt-2 text-xs text-white/45">
        Inspiraciones guardadas en este dispositivo.
      </p>

      {base.genero === 'masculino' && (
        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
          <h4 className="font-semibold mb-2 text-sm">Grooming masculino recomendado</h4>
          <ul className="text-sm text-white/75 space-y-1">
            {base.grooming.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      )}

      {base.genero === 'femenino' && (
        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
          <h4 className="font-semibold mb-2 text-sm">Maquillaje sugerido</h4>
          <ul className="text-sm text-white/75 space-y-1">
            {base.maquillaje.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default GaleriaOutfits
