/**
 * Componente GeneradorCabello
 * Muestra recomendaciones de estilos y colores de cabello por estación
 * Permite explorar estilos sin webcam overlay (que causaba problemas de detección)
 * Usa datos locales para no depender de endpoints de cabello del backend
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Palette, Sparkles, Camera, X, Check, Download, RefreshCw, Lightbulb } from 'lucide-react'
import Webcam from 'react-webcam'
import { apiUrl } from '../config/api.js'

// Datos locales de cabello por estación
const CABELLO_POR_ESTACION = {
  primavera: {
    gradiente: 'from-orange-400 to-amber-400',
    estilos: [
      { id: 'ondas_naturales', nombre: 'Ondas Naturales', descripcion: 'Ondas sueltas con efecto beachy, perfectas para tu luminosidad cálida', consejo: 'Usa sal marina spray para realzar las ondas naturales' },
      { id: 'liso_brillante', nombre: 'Liso Brillante', descripcion: 'Cabello liso con mucho brillo, resaltar el tono dorado', consejo: 'El brillo refleja la luz y realza tus tonos dorados' },
      { id: 'capas_suaves', nombre: 'Capas Suaves', descripcion: 'Corte en capas que enmarca el rostro con suavidad', consejo: 'Las capas largas dan movimiento y ligereza' },
      { id: 'bob_calido', nombre: 'Bob Cálido', descripcion: 'Bob a la altura del mentón con volumen suave', consejo: 'El bob estructurado con puntas hacia afuera es muy favorecedor' },
      { id: 'media_melena', nombre: 'Media Melena', descripcion: 'Melena a los hombros con capas y movimiento', consejo: 'La longitud media es muy versátil para tu tipo facial' },
      { id: 'bucles_dorados', nombre: 'Bucles Dorados', descripcion: 'Rizos definidos con tonos dorado-cobrizos', consejo: 'Define los rizos con aceite de argán para mayor brillo' },
    ],
    colores: [
      { id: 'miel_dorado', nombre: 'Miel Dorado', hex: '#D4A017', descripcion: 'Tu color estrella — cálido y luminoso' },
      { id: 'caramelo', nombre: 'Caramelo', hex: '#C68642', descripcion: 'Perfecto para un balayage natural' },
      { id: 'cobrizo', nombre: 'Cobrizo', hex: '#CB6D51', descripcion: 'Intenso y vibrante para tu estación' },
      { id: 'fresa_rubia', nombre: 'Fresa Rubia', hex: '#E06C75', descripcion: 'Tonos rosados-dorados únicos y favorecedores' },
      { id: 'rubio_calido', nombre: 'Rubio Cálido', hex: '#C8A951', descripcion: 'Dorado con reflejos luminosos' },
      { id: 'aurora', nombre: 'Auburn Cálido', hex: '#A52A2A', descripcion: 'Rojo-castaño con brillo cobrizo' },
    ],
    consejo_general: 'Para primavera: mantén los tonos cálidos y dorados. Evita las cenizas o rubios fríos que pueden opacar tu luminosidad natural. El balayage en tonos miel-caramelo es tu mejor opción para un look moderno.'
  },
  verano: {
    gradiente: 'from-purple-400 to-pink-400',
    estilos: [
      { id: 'liso_suave', nombre: 'Liso Suave', descripcion: 'Cabello alisado con un acabado sedoso y mate', consejo: 'Evita el exceso de brillo; un finish satinado es más armónico' },
      { id: 'ondas_romanticas', nombre: 'Ondas Románticas', descripcion: 'Ondas suaves de cepillo tipo vintage', consejo: 'Las ondas relajadas con volumen en las raíces proyectan elegancia' },
      { id: 'semi_recogido', nombre: 'Semi Recogido', descripcion: 'Mitad recogido con mechones sueltos delicados', consejo: 'Deja algunos mechones escapar para un look delicado' },
      { id: 'bob_frances', nombre: 'Bob Francés', descripcion: 'Bob clásico a la barbilla con parting lateral', consejo: 'El parting lateral suave es más favorecedor para rostros de verano' },
      { id: 'pixie_suave', nombre: 'Pixie Suave', descripcion: 'Corte corto con textura suave y difuminada', consejo: 'Los costados difuminados y suaves son ideales para tu paleta fría' },
      { id: 'coleta_alta', nombre: 'Cola Alta Pulida', descripcion: 'Cola de caballo alta y brillante con textura lisa', consejo: 'Una cola elegante muestra la belleza de tu cuello y rostro' },
    ],
    colores: [
      { id: 'ceniza_suave', nombre: 'Ceniza Suave', hex: '#A9A9A9', descripcion: 'Tu color de cabello más armónico' },
      { id: 'chocolate_frio', nombre: 'Chocolate Frío', hex: '#5C3317', descripcion: 'Castaño oscuro con matices fríos' },
      { id: 'platino_suave', nombre: 'Platino Suave', hex: '#E8E4D9', descripcion: 'Rubio muy claro con matiz frío' },
      { id: 'lavanda', nombre: 'Lavanda', hex: '#B57EDC', descripcion: 'Reflejos violáceos delicados y únicos' },
      { id: 'ceniza_oscuro', nombre: 'Ceniza Oscuro', hex: '#7B7B7B', descripcion: 'Tono neutro-frío que resalta tu palidez' },
      { id: 'mauve_tone', nombre: 'Mauve Toned', hex: '#C9A0A0', descripcion: 'Tono rosado frío y difuminado' },
    ],
    consejo_general: 'Para verano: los tonos fríos y cenizas son los más favorecedores. Evita el rubio dorado o el castaño con reflejos calientes. Los matices lavanda, ceniza o platino se integran perfectamente con tu subtono rosado frío.'
  },
  otono: {
    gradiente: 'from-orange-600 to-amber-600',
    estilos: [
      { id: 'volumen_rico', nombre: 'Volumen Rico', descripcion: 'Mucho volumen natural con efecto lived-in', consejo: 'El cabello con volumen grande y rico complementa la profundidad otoñal' },
      { id: 'ondas_texturizadas', nombre: 'Ondas Texturizadas', descripcion: 'Ondas imperfectas con textura definida y calida', consejo: 'Usar productos de textura para un acabado natural y mate' },
      { id: 'largo_liso', nombre: 'Largo y Liso', descripcion: 'Cabello largo liso con brillo cobrizo profundo', consejo: 'El largo resalta los tonos ricos y complejos del otoño' },
      { id: 'shag_moderno', nombre: 'Shag Moderno', descripcion: 'Corte shag con capas y flequillo texturizado', consejo: 'El shag es el corte ícono del otoño por su textura rica' },
      { id: 'trenzas_bohemias', nombre: 'Trenzas Bohemias', descripcion: 'Trenzas sueltas de tipo boho con mechones escapados', consejo: 'Las trenzas realzan los tonos cálidos del cabello otoñal' },
      { id: 'curls_definidos', nombre: 'Rizos Definidos', descripcion: 'Rizos bien definidos con aceites de nuez o coco', consejo: 'Los rizos ricos y profundos son magnéticos para el otoño' },
    ],
    colores: [
      { id: 'auburn_profundo', nombre: 'Auburn Profundo', hex: '#8B0000', descripcion: 'Rojo-castaño intenso perfecto para otoño' },
      { id: 'chocolate_calido', nombre: 'Chocolate Cálido', hex: '#7B3F00', descripcion: 'Tu color neutro base más armónico' },
      { id: 'cobrizo_oscuro', nombre: 'Cobrizo Oscuro', hex: '#8B4513', descripcion: 'Cobrizo intenso y terroso' },
      { id: 'caoba', nombre: 'Caoba', hex: '#9C2A10', descripcion: 'Rojo-marrón profundo y luminoso' },
      { id: 'marron_dorado', nombre: 'Marrón Dorado', hex: '#A0522D', descripcion: 'Castaño con brillo dorado cálido' },
      { id: 'negro_calido', nombre: 'Negro Cálido', hex: '#2C1810', descripcion: 'Negro con subtono marrón muy favorecedor' },
    ],
    consejo_general: 'Para otoño: los tonos tierra, cobrizos y marrones cálidos son tu paleta ideal. Evita los grises fríos o el negro puro. El auburn, mahogany y castaño cobrizo son absolutamente naturales y favorecedores para tu colorimetría.'
  },
  invierno: {
    gradiente: 'from-blue-600 to-indigo-600',
    estilos: [
      { id: 'liso_dramatico', nombre: 'Liso Dramático', descripcion: 'Liso perfectamente pulido con máximo brillo', consejo: 'El liso espejo proyecta la intensidad natural del invierno' },
      { id: 'corto_geometrico', nombre: 'Corto Geométrico', descripcion: 'Corte geométrico con líneas limpias y precisas', consejo: 'Los cortes geométricos y estructurados son icónicos del invierno' },
      { id: 'bob_blunt', nombre: 'Bob Blunt', descripcion: 'Bob con punta perfectamente recta sin gradación', consejo: 'El corte a línea recta proyecta confianza y elegancia' },
      { id: 'ondas_intensas', nombre: 'Ondas Intensas', descripcion: 'Ondas profundas y dramáticas con volumen lateral', consejo: 'Las Old Hollywood waves son especialmente favorecedoras' },
      { id: 'pixie_afilado', nombre: 'Pixie Afilado', descripcion: 'Pixie con costados rasurados y parte alta larga', consejo: 'El pixie dramático realza el alto contraste del invierno' },
      { id: 'lob_recto', nombre: 'LOB Recto', descripcion: 'Long bob perfectamente recto a los hombros', consejo: 'El LOB recto es clásico y versatilísimo para tu paleta' },
    ],
    colores: [
      { id: 'negro_azulado', nombre: 'Negro Azulado', hex: '#0D0D1A', descripcion: 'Tu color más poderoso y natural' },
      { id: 'platino', nombre: 'Platino', hex: '#E8E4DA', descripcion: 'Rubio muy claro con matiz frío puro' },
      { id: 'ceniza_oscura', nombre: 'Ceniza Oscura', hex: '#4A4A4A', descripcion: 'Gris oscuro moderno y sofisticado' },
      { id: 'rojo_intenso', nombre: 'Rojo Intenso', hex: '#8B0000', descripcion: 'Rojo vibrante, uno de tus colores estrella' },
      { id: 'platino_helado', nombre: 'Platino Helado', hex: '#F0EDE8', descripcion: 'Casi blanco con matiz frío-plateado' },
      { id: 'azul_medianoche', nombre: 'Azul Medianoche', hex: '#191970', descripcion: 'Azul muy oscuro con brillo iridiscente' },
    ],
    consejo_general: 'Para invierno: el negro, los tonos muy oscuros o el platino helado son tus mejores opciones. Los colores intensos y claros en blanco-negro o el rojo vibrante son absolutamente icónicos de tu paleta. Evita los tonos warm-bronce o dorados.'
  }
}

const videoConstraints = {
  width: 480,
  height: 480,
  facingMode: 'user',
  aspectRatio: 1
}

function GeneradorCabello({ imagen, estacion, genero }) {
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)
  const [colorSeleccionado, setColorSeleccionado] = useState(null)
  const [imagenCapturada, setImagenCapturada] = useState(imagen || null)
  const [mostrarCamara, setMostrarCamara] = useState(false)
  const [imagenPrevia, setImagenPrevia] = useState(null)
  const [imagenGenerada, setImagenGenerada] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const webcamRef = useRef(null)

  const datos = CABELLO_POR_ESTACION[estacion] || CABELLO_POR_ESTACION.verano

  const capturarFoto = useCallback(() => {
    if (!webcamRef.current) return
    const screenshotSrc = webcamRef.current.getScreenshot()
    if (screenshotSrc) {
      setImagenPrevia(screenshotSrc)
    }
  }, [webcamRef])

  const confirmarCaptura = () => {
    setImagenCapturada(imagenPrevia)
    setMostrarCamara(false)
    setImagenPrevia(null)
    setImagenGenerada(null)
  }

  const reiniciarCaptura = () => {
    setImagenPrevia(null)
  }

  const generarCabello = async () => {
    if (!estiloSeleccionado || !imagenCapturada) return

    setCargando(true)
    setError(null)

    try {
      const formData = new FormData()

      if (typeof imagenCapturada === 'string' && imagenCapturada.startsWith('data:')) {
        const res = await fetch(imagenCapturada)
        const blob = await res.blob()
        formData.append('archivo', blob, 'foto.jpg')
      } else if (imagenCapturada instanceof File) {
        formData.append('archivo', imagenCapturada)
      } else if (imagenCapturada instanceof Blob) {
        formData.append('archivo', imagenCapturada, 'foto.jpg')
      } else {
        throw new Error('Formato de imagen no soportado')
      }

      formData.append('estilo', estiloSeleccionado.id)
      if (colorSeleccionado) {
        formData.append('color', colorSeleccionado.id)
      }

      const response = await fetch(apiUrl('/cabello/generar'), {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || 'Error al generar el cabello')
      }

      const data = await response.json()
      if (data.imagen_generada) {
        setImagenGenerada(data.imagen_generada)
      } else {
        throw new Error('No se recibió imagen del servidor')
      }
    } catch (err) {
      setError(err.message || 'No se pudo generar la imagen. El servidor de IA puede no estar disponible.')
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

  // Obtener URL de la imagen a mostrar
  const getImagenSrc = () => {
    if (imagenGenerada) return imagenGenerada
    if (!imagenCapturada) return null
    if (typeof imagenCapturada === 'string') return imagenCapturada
    return URL.createObjectURL(imagenCapturada)
  }

  return (
    <div className="glass-card glass-card--elevated max-w-5xl mx-auto transition-shadow duration-300 hover:border-white/[0.16]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${datos.gradiente} flex items-center justify-center`}>
          <Scissors className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Recomendaciones de Cabello</h3>
          <p className="text-white/60 text-sm">Estilos y colores ideales para tu colorimetría</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo */}
        <div>
          {/* Estilos recomendados */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white/90">
              <Scissors className="w-4 h-4 text-violet-400" />
              Estilos Recomendados
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {datos.estilos.map((estilo) => (
                <motion.button
                  key={estilo.id}
                  onClick={() => setEstiloSeleccionado(estiloSeleccionado?.id === estilo.id ? null : estilo)}
                  className={`p-3 rounded-xl text-left transition-all ${estiloSeleccionado?.id === estilo.id
                      ? 'bg-violet-500/30 border-2 border-violet-400 shadow-lg shadow-violet-500/20'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="w-4 h-4 flex-shrink-0 text-violet-300" aria-hidden />
                    <p className="font-medium text-sm">{estilo.nombre}</p>
                  </div>
                  <p className="text-white/50 text-xs leading-snug">{estilo.descripcion}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tip del estilo seleccionado */}
          <AnimatePresence>
            {estiloSeleccionado && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30"
              >
                <p className="text-violet-300 text-sm flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden />
                  <span><span className="font-semibold">Tip: </span>{estiloSeleccionado.consejo}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Colores recomendados */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white/90">
              <Palette className="w-4 h-4 text-fuchsia-400" />
              Colores para tu Estación
            </h4>
            <div className="flex flex-wrap gap-3">
              {datos.colores.map((color) => (
                <motion.button
                  key={color.id}
                  onClick={() => setColorSeleccionado(colorSeleccionado?.id === color.id ? null : color)}
                  className={`relative group flex flex-col items-center gap-1 ${colorSeleccionado?.id === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] rounded-full' : ''
                    }`}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  title={`${color.nombre} — ${color.descripcion}`}
                >
                  <div
                    className="w-11 h-11 rounded-full shadow-lg border-2 border-white/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-white/50 max-w-[44px] text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                    {color.nombre}
                  </span>
                </motion.button>
              ))}
            </div>
            {colorSeleccionado && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 text-sm text-white/70"
              >
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: colorSeleccionado.hex }} />
                <span><strong className="text-white">{colorSeleccionado.nombre}:</strong> {colorSeleccionado.descripcion}</span>
              </motion.div>
            )}
          </div>

          {/* Consejo general */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
            <p className="text-white/70 text-sm leading-relaxed">
              <span className="text-fuchsia-300 font-semibold">✦ Consejo experto: </span>
              {datos.consejo_general}
            </p>
          </div>
        </div>

        {/* Panel derecho — Foto y generador */}
        <div>
          <h4 className="font-semibold mb-3">Tu Foto / Previsualización</h4>

          {/* Vista principal de imagen */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative mb-4">
            <AnimatePresence mode="wait">
              {mostrarCamara && !imagenPrevia ? (
                <motion.div key="camara" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                    screenshotQuality={0.95}
                    mirrored={true}
                  />
                  {/* Guía de encuadre mejorada */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative">
                      {/* Óvalo guía principal */}
                      <div className="w-52 h-64 border-2 border-white/40 rounded-full" />
                      {/* Esquinas decorativas */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-violet-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-violet-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-violet-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-violet-400 rounded-br" />
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="bg-black/60 text-white/90 text-xs px-3 py-1 rounded-full">
                        Centra tu rostro y cabello en el óvalo
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : mostrarCamara && imagenPrevia ? (
                <motion.img key="previa" src={imagenPrevia} alt="Vista previa" className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              ) : getImagenSrc() ? (
                <motion.div key="resultado" className="w-full h-full relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <img src={getImagenSrc()} alt="Tu foto" className="w-full h-full object-cover" />
                  {imagenGenerada && (
                    <motion.div
                      className="absolute top-2 right-2 bg-violet-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Sparkles className="w-3 h-3" aria-hidden /> Generado
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div key="empty" className="w-full h-full flex flex-col items-center justify-center text-white/40 p-6 text-center">
                  <Scissors className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Usa la cámara o tu foto de análisis para explorar estilos</p>
                </div>
              )}
            </AnimatePresence>

            {/* Overlay de carga */}
            {cargando && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white font-medium">Aplicando estilo...</p>
                  <p className="text-white/50 text-sm mt-1">Esto puede tomar un momento</p>
                </div>
              </div>
            )}
          </div>

          {/* Controles de cámara */}
          {!mostrarCamara ? (
            <div className="flex gap-2 mb-4">
              <motion.button
                onClick={() => { setMostrarCamara(true); setImagenPrevia(null) }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 text-sm transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Camera className="w-4 h-4" />
                Nueva Foto con Cámara
              </motion.button>
              {imagenGenerada && (
                <>
                  <motion.button
                    onClick={descargarImagen}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setImagenGenerada(null)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Ver original"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              {!imagenPrevia ? (
                <>
                  <button
                    onClick={() => { setMostrarCamara(false); setImagenPrevia(null) }}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <motion.button
                    onClick={capturarFoto}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center gap-2 text-sm font-semibold"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Camera className="w-4 h-4" />
                    Capturar
                  </motion.button>
                </>
              ) : (
                <>
                  <button
                    onClick={reiniciarCaptura}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Repetir
                  </button>
                  <motion.button
                    onClick={confirmarCaptura}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center gap-2 text-sm font-semibold"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Check className="w-4 h-4" />
                    Usar esta Foto
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* Botón generar con IA */}
          <motion.button
            onClick={generarCabello}
            disabled={!estiloSeleccionado || !imagenCapturada || cargando}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${estiloSeleccionado && imagenCapturada && !cargando
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            whileHover={estiloSeleccionado && imagenCapturada && !cargando ? { scale: 1.02 } : {}}
            whileTap={estiloSeleccionado && imagenCapturada && !cargando ? { scale: 0.98 } : {}}
          >
            <Sparkles className="w-5 h-5" />
            {!estiloSeleccionado
              ? 'Selecciona un estilo primero'
              : !imagenCapturada
                ? 'Necesitas una imagen'
                : cargando
                  ? 'Generando...'
                  : 'Generar con IA'}
          </motion.button>

          {!estiloSeleccionado && (
            <p className="text-white/30 text-xs text-center mt-2">← Selecciona un estilo de la lista</p>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
              >
                <strong>Error:</strong> {error}
                <p className="text-red-400/60 text-xs mt-1">El servicio requiere el backend activo</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default GeneradorCabello
