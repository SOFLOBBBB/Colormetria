import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Shirt, Save, CheckCircle2, Sparkles } from 'lucide-react'
import { addClosetPrenda, addClosetOutfit, getClosetPrendas } from '../utils/storageCloset'
import { getPrendasDemo } from '../data/prendasDemo'

const CATEGORIAS_BASE = [
  'superior',
  'inferior',
  'calzado',
  'accesorio',
  'abrigo/blazer',
]

const CATEGORIAS_FEMENINO = ['vestido/falda']
const OCASIONES = ['casual', 'formal', 'oficina', 'evento', 'cita', 'fin de semana']

function ClosetInteligente({ genero, estacion = 'verano' }) {
  const [prendas, setPrendas] = useState(() => getClosetPrendas())
  const [seleccionadas, setSeleccionadas] = useState([])
  const [outfitNombre, setOutfitNombre] = useState('')
  const [feedback, setFeedback] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    categoria: 'superior',
    color: '#c9a0a0',
    ocasion: 'casual',
    nota: '',
  })

  const categorias = useMemo(() => {
    return genero === 'femenino'
      ? [...CATEGORIAS_BASE, ...CATEGORIAS_FEMENINO]
      : CATEGORIAS_BASE
  }, [genero])
  const prendasDemo = useMemo(() => getPrendasDemo(estacion, genero), [estacion, genero])

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleAgregarPrenda = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    const next = addClosetPrenda({
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      color: form.color,
      ocasion: form.ocasion,
      nota: form.nota.trim(),
      genero,
    })
    setPrendas(next)
    setForm({
      nombre: '',
      categoria: categorias[0] || 'superior',
      color: '#c9a0a0',
      ocasion: 'casual',
      nota: '',
    })
    setFeedback('Prenda agregada a tu clóset.')
  }

  const handleGuardarOutfit = () => {
    if (!seleccionadas.length) return
    const prendasOutfit = prendas.filter((p) => seleccionadas.includes(p.id))
    const nombre = outfitNombre.trim() || `Outfit ${new Date().toLocaleDateString()}`
    addClosetOutfit({
      nombre,
      prendas: prendasOutfit,
      genero,
    })
    setFeedback('Outfit guardado en localStorage.')
    setOutfitNombre('')
  }

  const handleAgregarDemo = (prenda) => {
    const next = addClosetPrenda({
      nombre: prenda.nombre,
      categoria: prenda.categoria,
      color: prenda.hex,
      ocasion: prenda.ocasion,
      nota: `Demo: ${prenda.descripcion}`,
      genero,
      estilo: prenda.estilo,
      origen: 'demo',
    })
    setPrendas(next)
    setFeedback(`"${prenda.nombre}" agregada al clóset.`)
  }

  return (
    <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/35 to-cyan-400/20 border border-emerald-300/25 flex items-center justify-center">
          <Shirt className="w-5 h-5 text-white/90" />
        </div>
        <div>
          <h3 className="font-display text-lg sm:text-xl">Clóset Inteligente MVP</h3>
          <p className="text-sm text-white/60">Gestión local de prendas y outfits guardados.</p>
        </div>
      </div>

      <form onSubmit={handleAgregarPrenda} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <input
          value={form.nombre}
          onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
          placeholder="Nombre de la prenda"
          className="min-h-[44px] rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm"
        />
        <select
          value={form.categoria}
          onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
          className="min-h-[44px] rounded-xl bg-[#171826] border border-white/10 px-3 py-2.5 text-sm"
        >
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        <select
          value={form.ocasion}
          onChange={(e) => setForm((p) => ({ ...p, ocasion: e.target.value }))}
          className="min-h-[44px] rounded-xl bg-[#171826] border border-white/10 px-3 py-2.5 text-sm"
        >
          {OCASIONES.map((ocasion) => (
            <option key={ocasion} value={ocasion}>
              {ocasion}
            </option>
          ))}
        </select>
        <div className="min-h-[44px] flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3">
          <span className="text-xs text-white/55">Color</span>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
            className="w-full h-10 bg-transparent border-0 p-0"
          />
        </div>
        <textarea
          value={form.nota}
          onChange={(e) => setForm((p) => ({ ...p, nota: e.target.value }))}
          placeholder="Nota opcional"
          rows={2}
          className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm resize-none"
        />
        <button
          type="submit"
          className="md:col-span-2 w-full min-h-[44px] rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-sm font-medium inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar prenda
        </button>
      </form>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2">Tu cuadrícula</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {prendas.map((prenda) => (
            <motion.button
              type="button"
              key={prenda.id}
              onClick={() => toggleSeleccion(prenda.id)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                seleccionadas.includes(prenda.id)
                  ? 'bg-emerald-500/15 border-emerald-400/35'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              whileHover={{ y: -1 }}
            >
              <div className="w-6 h-6 rounded-full border border-white/20 mb-2" style={{ backgroundColor: prenda.color }} />
              <p className="text-sm font-medium line-clamp-1">{prenda.nombre}</p>
              <p className="text-[11px] text-white/55 mt-1 capitalize">{prenda.categoria}</p>
            </motion.button>
          ))}
          {!prendas.length && (
            <p className="text-sm text-white/50 col-span-full">Aun no tienes prendas guardadas.</p>
          )}
        </div>
      </div>

      {!prendas.length && (
        <div className="mb-4 rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
          <h4 className="text-sm font-semibold text-violet-100 inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" />
            Prendas sugeridas para tu estación
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {prendasDemo.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="text-left rounded-lg border border-white/15 bg-white/5 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/25" style={{ backgroundColor: item.hex }} />
                  <p className="text-sm text-white/90 line-clamp-1">{item.nombre}</p>
                </div>
                <p className="text-[11px] text-white/55 capitalize">{item.categoria} · {item.ocasion}</p>
                <button
                  type="button"
                  onClick={() => handleAgregarDemo(item)}
                  className="mt-2 w-full min-h-[38px] rounded-lg border border-emerald-400/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs"
                >
                  Agregar al clóset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <input
          value={outfitNombre}
          onChange={(e) => setOutfitNombre(e.target.value)}
          placeholder="Nombre del outfit (opcional)"
          className="w-full min-h-[44px] rounded-lg bg-transparent border border-white/10 px-3 py-2 text-sm mb-3"
        />
        <button
          type="button"
          onClick={handleGuardarOutfit}
          disabled={!seleccionadas.length}
          className={`w-full min-h-[44px] rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 ${
            seleccionadas.length
              ? 'bg-white/10 hover:bg-white/20 border border-white/15'
              : 'bg-white/5 text-white/35 border border-white/10 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          Guardar outfit seleccionado
        </button>
      </div>

      {feedback && (
        <p className="mt-3 text-sm text-emerald-300 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {feedback}
        </p>
      )}
    </div>
  )
}

export default ClosetInteligente
