/**
 * Componente GaleriaOutfits
 * Muestra outfits recomendados según la colorimetría del usuario
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shirt, Sparkles, Heart, ExternalLink, 
  Filter, Grid, List, ChevronDown, Upload,
  Image as ImageIcon, Plus
} from 'lucide-react'

const OCASIONES = [
  { id: 'casual', nombre: 'Casual', emoji: '👕' },
  { id: 'formal', nombre: 'Formal', emoji: '👔' },
  { id: 'deportivo', nombre: 'Deportivo', emoji: '🏃' },
  { id: 'fiesta', nombre: 'Fiesta', emoji: '🎉' }
]

function GaleriaOutfits({ estacion, genero }) {
  const [outfits, setOutfits] = useState([])
  const [paleta, setPaleta] = useState([])
  const [consejos, setConsejos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [ocasionFiltro, setOcasionFiltro] = useState(null)
  const [vistaGrid, setVistaGrid] = useState(true)
  const [outfitExpandido, setOutfitExpandido] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  // Cargar outfits al montar
  useEffect(() => {
    cargarOutfits()
  }, [estacion, genero])
  
  const cargarOutfits = async () => {
    setCargando(true)
    try {
      // Cargar recomendaciones completas
      const res = await fetch(
        `http://localhost:8000/outfits/recomendaciones?estacion=${estacion}&genero=${genero}`
      )
      const data = await res.json()
      
      // Combinar outfits de todas las ocasiones
      const todosOutfits = [
        ...(data.outfits_casual || []),
        ...(data.outfits_formal || [])
      ]
      
      setOutfits(todosOutfits)
      setConsejos(data.consejos_estilo || [])
      
      // Cargar paleta
      const resPaleta = await fetch(
        `http://localhost:8000/outfits/paleta/${estacion}`
      )
      const dataPaleta = await resPaleta.json()
      setPaleta(dataPaleta.colores || [])
      
    } catch (err) {
      console.error('Error cargando outfits:', err)
    } finally {
      setCargando(false)
    }
  }
  
  const toggleFavorito = (outfitId) => {
    setFavoritos(prev => 
      prev.includes(outfitId)
        ? prev.filter(id => id !== outfitId)
        : [...prev, outfitId]
    )
  }
  
  const outfitsFiltrados = ocasionFiltro
    ? outfits.filter(o => o.ocasion === ocasionFiltro)
    : outfits
  
  // Nombres de estación en español
  const nombresEstacion = {
    primavera: 'Primavera',
    verano: 'Verano',
    otono: 'Otoño',
    invierno: 'Invierno'
  }
  
  return (
    <div className="glass-card max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Shirt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Galería de Outfits</h3>
            <p className="text-white/60 text-sm">
              Inspiración para tu estación {nombresEstacion[estacion]}
            </p>
          </div>
        </div>
        
        {/* Controles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVistaGrid(!vistaGrid)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {vistaGrid ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="p-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 transition-colors"
            title="Agregar outfit"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Paleta de colores de la estación */}
      <div className="mb-6 p-4 rounded-xl bg-white/5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Tu Paleta de Colores
        </h4>
        <div className="flex flex-wrap gap-2">
          {paleta.map((color, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className="w-12 h-12 rounded-lg shadow-lg border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color.hex }}
                title={color.nombre}
              />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <div className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                  {color.nombre}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Filtros por ocasión */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setOcasionFiltro(null)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            !ocasionFiltro
              ? 'bg-pink-500 text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Todos
        </button>
        {OCASIONES.map((ocasion) => (
          <button
            key={ocasion.id}
            onClick={() => setOcasionFiltro(ocasion.id)}
            className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
              ocasionFiltro === ocasion.id
                ? 'bg-pink-500 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span>{ocasion.emoji}</span>
            {ocasion.nombre}
          </button>
        ))}
      </div>
      
      {/* Grid de outfits */}
      {cargando ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Cargando outfits...</p>
        </div>
      ) : outfitsFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <p className="text-white/60">No hay outfits disponibles para este filtro</p>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="mt-4 px-6 py-2 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300"
          >
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${vistaGrid ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {outfitsFiltrados.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              className={`rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer ${
                outfitExpandido === outfit.id ? 'ring-2 ring-pink-500' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setOutfitExpandido(outfitExpandido === outfit.id ? null : outfit.id)}
              layout
            >
              <div className="flex">
                {/* Imagen o placeholder */}
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex-shrink-0 flex items-center justify-center">
                  {outfit.imagen_url ? (
                    <img
                      src={`http://localhost:8000${outfit.imagen_url}`}
                      alt={outfit.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Shirt className="w-12 h-12 text-white/30" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{outfit.nombre}</h4>
                      <p className="text-white/60 text-sm">{outfit.descripcion}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorito(outfit.id)
                      }}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favoritos.includes(outfit.id)
                            ? 'fill-pink-500 text-pink-500'
                            : 'text-white/40'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Colores */}
                  <div className="flex gap-1 mt-3">
                    {outfit.colores?.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  
                  {/* Tag de ocasión */}
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-white/10 capitalize">
                    {outfit.ocasion}
                  </span>
                </div>
              </div>
              
              {/* Expandido */}
              <AnimatePresence>
                {outfitExpandido === outfit.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-white/10">
                      <h5 className="font-medium mb-2">Prendas:</h5>
                      <ul className="grid grid-cols-2 gap-2">
                        {outfit.prendas?.map((prenda, i) => (
                          <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                            <span className="text-pink-400">•</span>
                            {prenda}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Consejos */}
      {consejos.length > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            💡 Consejos de Estilo para {nombresEstacion[estacion]}
          </h4>
          <ul className="space-y-2">
            {consejos.map((consejo, index) => (
              <motion.li
                key={index}
                className="text-white/70 text-sm flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="text-pink-400 mt-1">•</span>
                {consejo}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Modal para agregar outfit */}
      <AnimatePresence>
        {mostrarFormulario && (
          <FormularioOutfit
            estacion={estacion}
            onClose={() => setMostrarFormulario(false)}
            onSuccess={() => {
              setMostrarFormulario(false)
              cargarOutfits()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente para agregar outfits
function FormularioOutfit({ estacion, onClose, onSuccess }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ocasion, setOcasion] = useState('casual')
  const [prendas, setPrendas] = useState('')
  const [colores, setColores] = useState('')
  const [imagen, setImagen] = useState(null)
  const [enviando, setEnviando] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    
    try {
      const formData = new FormData()
      formData.append('estacion', estacion)
      formData.append('nombre', nombre)
      formData.append('descripcion', descripcion)
      formData.append('ocasion', ocasion)
      formData.append('prendas', prendas)
      formData.append('colores', colores)
      
      if (imagen) {
        formData.append('imagen', imagen)
      }
      
      const res = await fetch('http://localhost:8000/outfits/agregar', {
        method: 'POST',
        body: formData
      })
      
      if (res.ok) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error agregando outfit:', err)
    } finally {
      setEnviando(false)
    }
  }
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Agregar Nuevo Outfit</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-500 outline-none"
              placeholder="Ej: Look Casual de Verano"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-500 outline-none resize-none"
              rows={2}
              placeholder="Describe el outfit..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-1">Ocasión</label>
            <select
              value={ocasion}
              onChange={(e) => setOcasion(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-500 outline-none"
            >
              {OCASIONES.map((o) => (
                <option key={o.id} value={o.id} className="bg-[#1a1a2e]">
                  {o.emoji} {o.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-1">Prendas (separadas por coma)</label>
            <input
              type="text"
              value={prendas}
              onChange={(e) => setPrendas(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-500 outline-none"
              placeholder="Blusa blanca, pantalón negro, tacones"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-1">Colores hex (separados por coma)</label>
            <input
              type="text"
              value={colores}
              onChange={(e) => setColores(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-500 outline-none"
              placeholder="#FFFFFF, #000000, #FF0000"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-1">Imagen (opcional)</label>
            <label className="flex items-center justify-center gap-2 w-full py-4 rounded-lg bg-white/5 border-2 border-dashed border-white/20 hover:border-pink-500/50 cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              <span>{imagen ? imagen.name : 'Seleccionar imagen'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-colors disabled:opacity-50"
            >
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default GaleriaOutfits

