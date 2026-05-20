/**
 * Componente CapturadorImagen
 * Permite capturar imagen desde webcam o subir un archivo
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Webcam from 'react-webcam'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, RefreshCw, Check, ArrowLeft, AlertCircle, Lightbulb } from 'lucide-react'
import { warmupBackend, isRemoteBackend } from '../config/api'

const easePremium = [0.22, 1, 0.36, 1]

function CapturadorImagen({ onCaptura, onVolver, error, onReintentar }) {
  // Pre-warm del backend cuando el usuario entra al paso de captura para
  // reducir el cold start de Render (free tier duerme tras ~15 min).
  useEffect(() => {
    if (isRemoteBackend()) {
      warmupBackend()
    }
  }, [])

  const [modo, setModo] = useState('seleccion') // 'seleccion', 'camara', 'archivo'
  const [imagenPrevia, setImagenPrevia] = useState(null)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const webcamRef = useRef(null)

  // Configuración de la webcam
  const anchoVideo = typeof window !== 'undefined' && window.innerWidth < 640 ? 480 : 720
  const videoConstraints = {
    width: anchoVideo,
    height: anchoVideo,
    facingMode: 'user'
  }

  /**
   * Captura imagen de la webcam
   */
  const capturarFoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setImagenPrevia(imageSrc)
    }
  }, [webcamRef])

  /**
   * Maneja el drop de archivos
   */
  const onDrop = useCallback((archivosAceptados) => {
    if (archivosAceptados.length > 0) {
      const archivo = archivosAceptados[0]
      const reader = new FileReader()

      reader.onload = () => {
        setImagenPrevia(reader.result)
      }

      reader.readAsDataURL(archivo)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  /**
   * Confirma la imagen y la envía para procesar
   */
  const confirmarImagen = () => {
    if (imagenPrevia) {
      onCaptura(imagenPrevia)
    }
  }

  /**
   * Reinicia para tomar otra foto
   */
  const reiniciarCaptura = () => {
    setImagenPrevia(null)
  }

  /**
   * Vuelve a la selección de modo
   */
  const volverASeleccion = () => {
    setModo('seleccion')
    setImagenPrevia(null)
    setCamaraActiva(false)
  }

  return (
    <div className="section-container py-8 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easePremium }}
        className="max-w-2xl mx-auto"
      >
        {/* Encabezado editorial */}
        <header className="text-center mb-8 sm:mb-10 max-w-xl mx-auto px-1">
          <p className="font-body text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            Paso 2 · Referencia visual
          </p>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl mb-3">
            Captura tu imagen
          </h2>
          <p className="font-body text-white/62 text-sm sm:text-base leading-relaxed">
            Toma una foto clara de tu rostro para el análisis de colorimetría. Buena luz natural y rostro centrado.
          </p>
        </header>

        {/* Mensaje de error */}
        {error && (
          <motion.div
            className="mb-6 sm:mb-8 rounded-[var(--radius-lg)] border border-red-400/35 bg-red-500/[0.12] ring-1 ring-red-500/25 backdrop-blur-sm px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-start gap-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easePremium }}
            role="alert"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-red-200">No se pudo completar el análisis</p>
                <p className="text-sm text-red-100/85 leading-relaxed mt-1">{error}</p>
              </div>
            </div>
            {onReintentar && (
              <motion.button
                type="button"
                onClick={onReintentar}
                className="shrink-0 min-h-[var(--min-touch,40px)] px-4 rounded-xl border border-red-300/30 bg-red-400/[0.12] hover:bg-red-400/[0.22] text-red-100 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors self-stretch sm:self-start"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" aria-hidden />
                Reintentar
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Tarjeta principal */}
        <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] rounded-[var(--radius-xl)] p-5 sm:p-6 md:p-8">
          {/* Selección de modo */}
          {modo === 'seleccion' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
            >
              <motion.button
                type="button"
                onClick={() => {
                  setModo('camara')
                  setCamaraActiva(true)
                }}
                className="min-h-[var(--min-touch,44px)] rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.04] p-6 sm:p-7 text-center transition-all hover:bg-white/[0.08] hover:border-white/22 focus-visible:outline-offset-2 group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500/90 to-pink-500/85 flex items-center justify-center mx-auto mb-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/15 group-hover:scale-[1.03] transition-transform">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white/95 mb-2">Usar cámara</h3>
                <p className="font-body text-white/58 text-sm leading-relaxed">
                  Fotografía en vivo con tu webcam
                </p>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setModo('archivo')}
                className="min-h-[var(--min-touch,44px)] rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.04] p-6 sm:p-7 text-center transition-all hover:bg-white/[0.08] hover:border-white/22 focus-visible:outline-offset-2 group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-sky-500/90 to-cyan-500/85 flex items-center justify-center mx-auto mb-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/15 group-hover:scale-[1.03] transition-transform">
                  <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white/95 mb-2">Subir foto</h3>
                <p className="font-body text-white/58 text-sm leading-relaxed">
                  Archivo desde tu galería o explorador
                </p>
              </motion.button>
            </motion.div>
          )}

          {/* Modo cámara */}
          {modo === 'camara' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 sm:space-y-7"
            >
              <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 ring-1 ring-white/15 shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
                  {imagenPrevia ? (
                    <img
                      src={imagenPrevia}
                      alt="Vista previa de la captura"
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-transparent to-black/20"
                        aria-hidden
                      />
                      <div className="absolute inset-0 pointer-events-none flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-4">
                          <div className="w-[52%] max-w-[220px] aspect-[3/4] border-2 border-white/35 rounded-[999px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
                        </div>
                        <p className="pb-4 px-3 text-center font-body text-xs sm:text-sm text-white/85 drop-shadow-md">
                          Centra tu rostro en el óvalo
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-1">
                {!imagenPrevia ? (
                  <>
                    <button
                      type="button"
                      onClick={volverASeleccion}
                      className="btn-ghost min-h-[var(--min-touch,44px)] px-5 sm:px-6 py-3 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium"
                    >
                      <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden />
                      Volver
                    </button>
                    <motion.button
                      type="button"
                      onClick={capturarFoto}
                      className="btn-primary inline-flex items-center gap-2 text-base sm:text-lg min-h-[var(--min-touch,44px)] px-6 sm:px-8 rounded-[var(--radius-md)] font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Camera className="w-5 h-5 shrink-0" aria-hidden />
                      Capturar
                    </motion.button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={reiniciarCaptura}
                      className="btn-ghost min-h-[var(--min-touch,44px)] px-5 sm:px-6 py-3 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium"
                    >
                      <RefreshCw className="w-5 h-5 shrink-0" aria-hidden />
                      Otra foto
                    </button>
                    <motion.button
                      type="button"
                      onClick={confirmarImagen}
                      className="btn-primary inline-flex items-center gap-2 text-base sm:text-lg min-h-[var(--min-touch,44px)] px-6 sm:px-8 rounded-[var(--radius-md)] font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="w-5 h-5 shrink-0" aria-hidden />
                      Analizar
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Modo subir archivo */}
          {modo === 'archivo' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 sm:space-y-7"
            >
              {!imagenPrevia ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center rounded-[var(--radius-xl)] ring-1 ${
                    isDragActive
                      ? 'border-purple-400/70 bg-purple-500/15 ring-purple-400/25 scale-[1.01]'
                      : 'border-white/22 bg-white/[0.03] hover:border-white/35 hover:bg-white/[0.05] ring-white/[0.06]'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
                  }}
                  aria-label="Arrastra una imagen o haz clic para seleccionar"
                >
                  <input {...getInputProps()} aria-describedby="consejos-captura" />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-5">
                    <Upload className="w-8 h-8 sm:w-9 sm:h-9 text-white/55" aria-hidden />
                  </div>
                  {isDragActive ? (
                    <p className="font-display text-lg text-white/95">Suelta la imagen aquí</p>
                  ) : (
                    <>
                      <p className="font-display text-lg sm:text-xl text-white/95 mb-2">
                        Arrastra una imagen o haz clic para elegir
                      </p>
                      <p className="font-body text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
                        JPG, PNG o WebP · una sola imagen
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/60 ring-1 ring-white/15 shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
                    <img
                      src={imagenPrevia}
                      alt="Imagen seleccionada para el análisis"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-1">
                {!imagenPrevia ? (
                  <button
                    type="button"
                    onClick={volverASeleccion}
                    className="btn-ghost min-h-[var(--min-touch,44px)] px-5 sm:px-6 py-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden />
                    Volver
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={reiniciarCaptura}
                      className="btn-ghost min-h-[var(--min-touch,44px)] px-5 sm:px-6 py-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] font-medium"
                    >
                      <RefreshCw className="w-5 h-5 shrink-0" aria-hidden />
                      Otra imagen
                    </button>
                    <motion.button
                      type="button"
                      onClick={confirmarImagen}
                      className="btn-primary inline-flex items-center gap-2 text-base sm:text-lg min-h-[var(--min-touch,44px)] px-6 sm:px-8 rounded-[var(--radius-md)] font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="w-5 h-5 shrink-0" aria-hidden />
                      Analizar
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Consejos */}
        <motion.div
          className="mt-6 sm:mt-8 glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] rounded-[var(--radius-lg)] p-5 sm:p-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: easePremium }}
        >
          <h4
            className="font-display text-base sm:text-lg font-semibold text-white/95 mb-4 flex items-center gap-2.5"
            id="consejos-captura"
          >
            <span className="inline-flex p-2 rounded-lg bg-amber-400/15 border border-amber-400/25">
              <Lightbulb className="w-4 h-4 text-amber-200/90 shrink-0" aria-hidden />
            </span>
            Consejos para mejores resultados
          </h4>
          <ul className="font-body text-sm text-white/72 space-y-2.5 leading-relaxed">
            <li className="flex gap-2.5">
              <span className="text-white/35 shrink-0 mt-0.5" aria-hidden>
                ·
              </span>
              <span>Iluminación natural suave; evita focos muy cálidos o muy fríos encima del rostro.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-white/35 shrink-0 mt-0.5" aria-hidden>
                ·
              </span>
              <span>Mira de frente a la cámara, sin filtros que alteren el tono de piel.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-white/35 shrink-0 mt-0.5" aria-hidden>
                ·
              </span>
              <span>Maquillaje muy cargado puede sesgar el análisis; un look natural es ideal.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-white/35 shrink-0 mt-0.5" aria-hidden>
                ·
              </span>
              <span>Que se vea el cabello natural y el contorno del rostro sin recortes extremos.</span>
            </li>
          </ul>
        </motion.div>

        {/* Volver al inicio */}
        <div className="text-center mt-8 sm:mt-10">
          <button
            type="button"
            onClick={onVolver}
            className="btn-ghost min-h-[var(--min-touch,44px)] inline-flex items-center justify-center gap-2 px-4 text-sm text-white/65 hover:text-white/90 mx-auto rounded-[var(--radius-md)]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default CapturadorImagen
