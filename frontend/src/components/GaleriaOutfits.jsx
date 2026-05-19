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
import { addClosetPrenda, addInspiracion, setProbadorPreview } from '../utils/storageCloset'

const CATEGORIA_MAP = [
  { categoria: 'superior', keys: ['blusa', 'camisa', 'top', 'playera', 'polo', 'sueter', 'sweater', 'jersey', 'hoodie', 'crop', 'body'] },
  { categoria: 'inferior', keys: ['pantalon', 'jean', 'falda', 'short', 'bermuda'] },
  { categoria: 'vestido/falda', keys: ['vestido', 'falda'] },
  { categoria: 'calzado', keys: ['sandalia', 'tenis', 'sneaker', 'zapato', 'botin', 'bota', 'stiletto', 'mocasin', 'oxford', 'derby'] },
  { categoria: 'abrigo/blazer', keys: ['blazer', 'abrigo', 'chaqueta', 'jacket', 'trench'] },
  { categoria: 'accesorio', keys: ['bolsa', 'collar', 'aretes', 'reloj', 'cinturon', 'corbata', 'lentes', 'gorra', 'clutch', 'backpack'] },
]

function guessCategoria(prendaNombre) {
  const base = prendaNombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const hit = CATEGORIA_MAP.find((item) => item.keys.some((key) => base.includes(key)))
  return hit?.categoria || 'superior'
}

function buildOutfitPreviewPayload(outfit, genero) {
  const layers = []
  outfit.prendas.forEach((nombre, idx) => {
    const categoria = guessCategoria(nombre)
    layers.push({
      id: `outfit-${outfit.id}-${idx}`,
      nombre,
      categoria,
      color: '#9aa1b0',
      ocasion: outfit.ocasion,
      origen: 'outfit-sugerido',
    })
  })

  outfit.accesorios.forEach((nombre, idx) => {
    layers.push({
      id: `outfit-${outfit.id}-acc-${idx}`,
      nombre,
      categoria: 'accesorio',
      color: '#b7b0c9',
      ocasion: outfit.ocasion,
      origen: 'outfit-sugerido',
    })
  })

  return {
    id: `preview-${outfit.id}`,
    nombre: outfit.nombre,
    genero,
    ocasion: outfit.ocasion,
    prendas: layers,
    createdAt: new Date().toISOString(),
  }
}

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

  const handleEnviarAlProbador = (outfit) => {
    const payload = buildOutfitPreviewPayload(outfit, genero)
    setProbadorPreview(payload)
    setFeedback(`"${outfit.nombre}" enviado al probador visual.`)
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

      <div className="space-y-3 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2 inline-flex items-center gap-1.5">
            <Filter className="w-3 h-3" />
            Ocasión
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ocasiones.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOcasion(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize ${
                  ocasion === item
                    ? 'bg-white/[0.14] border border-white/30 text-white shadow-sm'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/55 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.15]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Estilo
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setEstilo('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                estilo === ''
                  ? 'bg-white/[0.14] border border-white/30 text-white shadow-sm'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/55 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.15]'
              }`}
            >
              Todos
            </button>
            {estilos.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setEstilo(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize ${
                  estilo === item
                    ? 'bg-white/[0.14] border border-white/30 text-white shadow-sm'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/55 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.15]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
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

              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/40 mb-1.5">Prendas</p>
                <ul className="text-xs text-white/70 space-y-0.5">
                  {outfit.prendas.map((prenda) => (
                    <li key={prenda} className="flex items-start gap-1.5">
                      <span className="text-white/25 mt-0.5">·</span>{prenda}
                    </li>
                  ))}
                </ul>
                {outfit.accesorios?.length > 0 && (
                  <ul className="text-xs text-white/50 mt-2 space-y-0.5">
                    {outfit.accesorios.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="text-white/20 mt-0.5">+</span>{item}
                      </li>
                    ))}
                  </ul>
                )}
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
                  onClick={() => handleEnviarAlProbador(outfit)}
                  className="min-h-[44px] px-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs inline-flex items-center justify-center gap-1 text-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Enviar prendas al probador
                </button>
                <button
                  type="button"
                  onClick={() => handleAgregarPrendas(outfit)}
                  className="min-h-[44px] px-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs inline-flex items-center justify-center gap-1 sm:col-span-2 text-center"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  Agregar al clóset
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="pt-4 border-t border-white/[0.06]">
          <h4 className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Construye tu look</h4>
          <p className="text-sm text-white/60 leading-relaxed">
            Usa Clóset Inteligente para combinar tus prendas guardadas y ver composición visual en el probador.
          </p>
        </div>
        <div className="pt-4 border-t border-white/[0.06]">
          <h4 className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2 inline-flex items-center gap-1.5">
            <Ban className="w-3 h-3" />
            A evitar en tu estación
          </h4>
          <ul className="text-sm text-white/60 space-y-1">
            {base.colorGuide.evitar.map((item) => (
              <li key={item} className="flex items-start gap-1.5"><span className="text-white/25 mt-0.5">·</span>{item}</li>
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
