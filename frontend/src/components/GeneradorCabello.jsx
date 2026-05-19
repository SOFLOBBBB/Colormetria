/**
 * Componente GeneradorCabello — Hair Studio IA
 * Contenedor premium que une captura, prueba visual (HairTryOnLab),
 * recomendaciones editoriales de estilos y paleta cromática por estación.
 *
 * Restricciones respetadas:
 *   - No toca backend ni algoritmo de segmentación
 *   - No introduce dependencias nuevas
 *   - Mantiene el contrato público: { imagen, estacion, genero }
 */

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scissors,
  Palette,
  Camera,
  X,
  Check,
  Lightbulb,
  RotateCcw,
  ImageIcon,
} from 'lucide-react'
import Webcam from 'react-webcam'
import HairTryOnLab from './HairTryOnLab'

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

function GeneradorCabello({ imagen, estacion, genero: _genero }) {
  void _genero
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)
  const [colorSeleccionado, setColorSeleccionado] = useState(null)
  const [imagenCapturada, setImagenCapturada] = useState(imagen || null)
  const [mostrarCamara, setMostrarCamara] = useState(false)
  const [imagenPrevia, setImagenPrevia] = useState(null)
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
  }

  const reiniciarCaptura = () => setImagenPrevia(null)

  const cerrarCamara = () => {
    setMostrarCamara(false)
    setImagenPrevia(null)
  }

  const abrirCamara = () => {
    setMostrarCamara(true)
    setImagenPrevia(null)
  }

  return (
    <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] max-w-6xl mx-auto p-5 sm:p-6 lg:p-7 transition-shadow duration-300 hover:border-white/[0.16]">
      {/* Header — jerarquía del Hair Studio */}
      <header className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-7">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${datos.gradiente} flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/10`}>
          <Scissors className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1">Hair Studio</p>
          <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight">
            Simulación avanzada de cabello
          </h3>
          <p className="text-white/60 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Genera una vista previa de color y peinado con resultado visual realista.
          </p>
        </div>
        {imagenCapturada && !mostrarCamara && (
          <motion.button
            type="button"
            onClick={abrirCamara}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 transition-colors self-start whitespace-nowrap"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Camera className="w-3.5 h-3.5" />
            Nueva foto
          </motion.button>
        )}
      </header>

      {/* Cuerpo principal — modo cámara / empty / try-on */}
      {mostrarCamara ? (
        <CameraSection
          webcamRef={webcamRef}
          imagenPrevia={imagenPrevia}
          onCapture={capturarFoto}
          onConfirm={confirmarCaptura}
          onRetry={reiniciarCaptura}
          onClose={cerrarCamara}
        />
      ) : !imagenCapturada ? (
        <EmptyState onOpenCamera={abrirCamara} />
      ) : (
        <HairTryOnLab
          image={imagenCapturada}
          suggestedColors={datos.colores || []}
          suggestedStyles={datos.estilos || []}
          estacion={estacion}
          genero={_genero}
        />
      )}

      {/* CTA "Nueva foto" en móvil */}
      {imagenCapturada && !mostrarCamara && (
        <motion.button
          type="button"
          onClick={abrirCamara}
          className="mt-3 sm:hidden w-full inline-flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <Camera className="w-4 h-4" />
          Nueva foto
        </motion.button>
      )}

      {/* Sección — Estilos sugeridos para tu estación */}
      <section className="mt-8 sm:mt-10">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1">Estilos sugeridos</p>
            <h4 className="font-display text-lg sm:text-xl font-semibold leading-tight">
              Cortes para tu estación
            </h4>
          </div>
          <span className="hidden sm:inline-flex flex-shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/40">
            {datos.estilos.length} ideas
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {datos.estilos.map((estilo) => {
            const activo = estiloSeleccionado?.id === estilo.id
            return (
              <motion.button
                key={estilo.id}
                type="button"
                onClick={() => setEstiloSeleccionado(activo ? null : estilo)}
                className={`text-left p-3.5 rounded-2xl transition-all min-w-0 ring-1 ${
                  activo
                    ? 'bg-violet-500/15 border border-violet-400/60 ring-violet-300/25 shadow-lg shadow-violet-500/15'
                    : 'bg-white/[0.03] border border-white/[0.08] ring-white/[0.04] hover:bg-white/[0.06] hover:border-white/15'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={activo}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Scissors className={`w-4 h-4 flex-shrink-0 ${activo ? 'text-violet-200' : 'text-violet-300/80'}`} aria-hidden />
                  <p className="font-medium text-sm truncate">{estilo.nombre}</p>
                </div>
                <p className="text-white/55 text-xs leading-snug line-clamp-2">{estilo.descripcion}</p>
                <span className={`mt-2 inline-flex text-[10px] px-2 py-0.5 rounded-full border ${
                  activo
                    ? 'border-violet-300/40 bg-violet-500/20 text-violet-50'
                    : 'border-white/10 bg-white/5 text-white/55'
                }`}>
                  {activo ? 'Seleccionado' : 'Ver detalle'}
                </span>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {estiloSeleccionado && (
            <motion.div
              key="por-que-favorece"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-violet-400/25 bg-violet-500/10 ring-1 ring-violet-300/10 p-4">
                <p className="font-body text-[11px] uppercase tracking-[0.18em] text-violet-200/80 mb-1.5">
                  Por qué favorece
                </p>
                <p className="text-sm text-white/85 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-fuchsia-300 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>
                    <span className="text-white font-medium">{estiloSeleccionado.nombre}: </span>
                    {estiloSeleccionado.consejo}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Sección — Colores sugeridos + consejo experto */}
      <section className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
            <h4 className="font-semibold text-white/90">Colores sugeridos para tu estación</h4>
          </div>
          <p className="text-xs text-white/55 mb-3">
            Toca un tono para conocer su carácter cromático.
          </p>
          <div className="flex flex-wrap gap-3">
            {datos.colores.map((color) => {
              const activo = colorSeleccionado?.id === color.id
              return (
                <motion.button
                  key={color.id}
                  type="button"
                  onClick={() => setColorSeleccionado(activo ? null : color)}
                  className="group relative flex flex-col items-center gap-1"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={activo}
                  title={`${color.nombre} — ${color.descripcion}`}
                >
                  <div
                    className={`w-11 h-11 rounded-full shadow-lg border-2 transition-all ${
                      activo
                        ? 'border-white ring-2 ring-white/30 ring-offset-2 ring-offset-[#0e0e1a]'
                        : 'border-white/20 group-hover:border-white/40'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`text-[10px] max-w-[60px] text-center leading-tight transition-opacity ${
                    activo ? 'text-white/85 opacity-100' : 'text-white/55 opacity-0 group-hover:opacity-100'
                  }`}>
                    {color.nombre}
                  </span>
                </motion.button>
              )
            })}
          </div>
          <AnimatePresence>
            {colorSeleccionado && (
              <motion.div
                key="color-info"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex items-start gap-2.5 text-sm text-white/75 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border border-white/20"
                  style={{ backgroundColor: colorSeleccionado.hex }}
                />
                <span>
                  <strong className="text-white font-medium">{colorSeleccionado.nombre}: </strong>
                  {colorSeleccionado.descripcion}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-violet-500/12 to-fuchsia-500/8 border border-violet-500/20 ring-1 ring-violet-300/10 p-4 sm:p-5 min-w-0">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-fuchsia-200/80 mb-2">
            Consejo experto
          </p>
          <p className="text-white/80 text-sm leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-fuchsia-300 mt-0.5 flex-shrink-0" aria-hidden />
            <span>{datos.consejo_general}</span>
          </p>
        </div>
      </section>
    </div>
  )
}

function EmptyState({ onOpenCamera }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] ring-1 ring-white/[0.04] p-8 sm:p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <ImageIcon className="w-7 h-7 text-white/55" aria-hidden />
      </div>
      <h4 className="font-display text-lg font-semibold mb-2">Sube o captura tu foto</h4>
      <p className="text-sm text-white/55 max-w-md mx-auto mb-5 leading-relaxed">
        Para probar visualmente los colores y cortes recomendados, necesitamos una foto clara de tu rostro y cabello.
      </p>
      <motion.button
        type="button"
        onClick={onOpenCamera}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold shadow-lg shadow-violet-500/20"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Camera className="w-4 h-4" />
        Abrir cámara
      </motion.button>
    </div>
  )
}

function CameraSection({ webcamRef, imagenPrevia, onCapture, onConfirm, onRetry, onClose }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
      <div className="lg:col-span-7 min-w-0">
        <div className="aspect-[4/5] sm:aspect-square lg:aspect-[5/6] w-full max-h-[520px] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.08] ring-1 ring-white/[0.04] relative">
          <AnimatePresence mode="wait">
            {imagenPrevia ? (
              <motion.img
                key="previa"
                src={imagenPrevia}
                alt="Vista previa"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : (
              <motion.div
                key="cam"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                  screenshotQuality={0.95}
                  mirrored
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative">
                    <div className="w-52 h-64 border-2 border-white/40 rounded-full" />
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
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:col-span-5 min-w-0 flex flex-col gap-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.04] p-4">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1.5">Captura</p>
          <p className="text-sm text-white/65 leading-relaxed">
            Centra tu rostro y cabello en el óvalo. Busca buena iluminación frontal y un fondo sencillo.
          </p>
        </div>

        {!imagenPrevia ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <motion.button
              type="button"
              onClick={onCapture}
              className="min-h-[44px] rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Camera className="w-4 h-4" />
              Capturar
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm inline-flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <X className="w-4 h-4" />
              Cancelar
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <motion.button
              type="button"
              onClick={onConfirm}
              className="min-h-[44px] rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Check className="w-4 h-4" />
              Usar esta foto
            </motion.button>
            <motion.button
              type="button"
              onClick={onRetry}
              className="min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm inline-flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw className="w-4 h-4" />
              Repetir
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeneradorCabello
