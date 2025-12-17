/**
 * Componente GeneradorCabello
 * Permite probar virtualmente diferentes estilos y colores de cabello
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Palette, Wand2, Loader2, ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react'

function GeneradorCabello({ imagen, estacion, genero }) {
  const [estilos, setEstilos] = useState([])
  const [colores, setColores] = useState([])
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)
  const [colorSeleccionado, setColorSeleccionado] = useState(null)
  const [imagenGenerada, setImagenGenerada] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoEstilos, setCargandoEstilos] = useState(true)
  const [error, setError] = useState(null)
  const [previsualizaciones, setPrevisualizaciones] = useState([])
  const [indicePreview, setIndicePreview] = useState(0)
  
  // Cargar estilos y colores al montar
  useEffect(() => {
    cargarEstilosYColores()
  }, [estacion, genero])
  
  const cargarEstilosYColores = async () => {
    setCargandoEstilos(true)
    try {
      // Cargar estilos
      const resEstilos = await fetch(
        `http://localhost:8000/cabello/estilos?genero=${genero}&estacion=${estacion}`
      )
      const dataEstilos = await resEstilos.json()
      setEstilos(dataEstilos.estilos || [])
      
      // Cargar colores
      const resColores = await fetch(
        `http://localhost:8000/cabello/colores?estacion=${estacion}`
      )
      const dataColores = await resColores.json()
      setColores(dataColores.colores || [])
      
    } catch (err) {
      console.error('Error cargando estilos:', err)
      setError('No se pudieron cargar los estilos')
    } finally {
      setCargandoEstilos(false)
    }
  }
  
  const generarCabello = async () => {
    if (!estiloSeleccionado) return
    
    setCargando(true)
    setError(null)
    
    try {
      const formData = new FormData()
      
      // Convertir imagen base64 a blob si es necesario
      if (typeof imagen === 'string' && imagen.startsWith('data:')) {
        const res = await fetch(imagen)
        const blob = await res.blob()
        formData.append('archivo', blob, 'foto.jpg')
      } else {
        formData.append('archivo', imagen)
      }
      
      formData.append('estilo', estiloSeleccionado.id)
      if (colorSeleccionado) {
        formData.append('color', colorSeleccionado.id)
      }
      
      const response = await fetch('http://localhost:8000/cabello/generar', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Error al generar el cabello')
      }
      
      const data = await response.json()
      setImagenGenerada(data.imagen_generada)
      
    } catch (err) {
      console.error('Error generando cabello:', err)
      setError('No se pudo generar la imagen. Esto puede tardar la primera vez.')
    } finally {
      setCargando(false)
    }
  }
  
  const descargarImagen = () => {
    if (!imagenGenerada) return
    
    const link = document.createElement('a')
    link.href = imagenGenerada
    link.download = `cabello_${estiloSeleccionado?.id || 'nuevo'}.png`
    link.click()
  }
  
  if (cargandoEstilos) {
    return (
      <div className="glass-card max-w-4xl mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-white/60">Cargando estilos de cabello...</p>
      </div>
    )
  }
  
  return (
    <div className="glass-card max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Prueba Virtual de Cabello</h3>
          <p className="text-white/60 text-sm">Visualiza cómo te verían diferentes estilos</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Selección */}
        <div>
          {/* Estilos de corte */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-violet-400" />
              Selecciona un Estilo
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {estilos.slice(0, 6).map((estilo) => (
                <motion.button
                  key={estilo.id}
                  onClick={() => setEstiloSeleccionado(estilo)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    estiloSeleccionado?.id === estilo.id
                      ? 'bg-violet-500/30 border-2 border-violet-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-medium text-sm">{estilo.nombre}</p>
                  <p className="text-white/50 text-xs mt-1">{estilo.descripcion}</p>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Colores de cabello */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-fuchsia-400" />
              Selecciona un Color (opcional)
            </h4>
            <div className="flex flex-wrap gap-2">
              {colores.map((color) => (
                <motion.button
                  key={color.id}
                  onClick={() => setColorSeleccionado(
                    colorSeleccionado?.id === color.id ? null : color
                  )}
                  className={`relative group ${
                    colorSeleccionado?.id === color.id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]'
                      : ''
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={color.nombre}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-lg border-2 border-white/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    <div className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                      {color.nombre}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Colores recomendados del estilo */}
          {estiloSeleccionado?.colores_recomendados?.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
              <p className="text-sm text-violet-300 mb-2">
                Colores recomendados para {estiloSeleccionado.nombre}:
              </p>
              <div className="flex gap-2">
                {estiloSeleccionado.colores_recomendados.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setColorSeleccionado(color)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">{color.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Botón generar */}
          <motion.button
            onClick={generarCabello}
            disabled={!estiloSeleccionado || cargando}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              estiloSeleccionado && !cargando
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            whileHover={estiloSeleccionado && !cargando ? { scale: 1.02 } : {}}
            whileTap={estiloSeleccionado && !cargando ? { scale: 0.98 } : {}}
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando... (puede tardar)
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generar Previsualización
              </>
            )}
          </motion.button>
          
          {/* Advertencia primera vez */}
          <p className="text-white/40 text-xs text-center mt-3">
            ⚠️ La primera vez puede tardar varios minutos en descargar los modelos de IA
          </p>
        </div>
        
        {/* Panel derecho - Resultado */}
        <div>
          <h4 className="font-semibold mb-3">Previsualización</h4>
          
          <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
            <AnimatePresence mode="wait">
              {imagenGenerada ? (
                <motion.img
                  key="generada"
                  src={imagenGenerada}
                  alt="Cabello generado"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : imagen ? (
                <motion.img
                  key="original"
                  src={imagen}
                  alt="Tu foto original"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <p>Sube una foto para comenzar</p>
                </div>
              )}
            </AnimatePresence>
            
            {/* Overlay de carga */}
            {cargando && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-violet-400" />
                  <p className="text-white">Generando nuevo estilo...</p>
                  <p className="text-white/50 text-sm mt-1">Esto puede tomar un momento</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Controles de imagen generada */}
          {imagenGenerada && (
            <div className="flex gap-3 mt-4">
              <motion.button
                onClick={descargarImagen}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                Descargar
              </motion.button>
              <motion.button
                onClick={generarCabello}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                Regenerar
              </motion.button>
            </div>
          )}
          
          {/* Info del estilo seleccionado */}
          {estiloSeleccionado && (
            <div className="mt-4 p-4 rounded-xl bg-white/5">
              <p className="font-medium">{estiloSeleccionado.nombre}</p>
              <p className="text-white/60 text-sm">{estiloSeleccionado.descripcion}</p>
              {colorSeleccionado && (
                <p className="text-white/40 text-sm mt-2">
                  Color: {colorSeleccionado.nombre}
                </p>
              )}
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeneradorCabello

