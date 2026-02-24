/**
 * Componente CapturadorImagen
 * Permite capturar imagen desde webcam o subir un archivo
 */

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Webcam from 'react-webcam'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, RefreshCw, Check, ArrowLeft, AlertCircle, Lightbulb } from 'lucide-react'

function CapturadorImagen({ onCaptura, onVolver, error }) {
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
    <div className="section-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="section-title">Captura tu Imagen</h2>
          <p className="text-white/60">
            Toma una foto clara de tu rostro para el análisis de colorimetría
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <motion.div
            className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Error en el análisis</p>
              <p className="text-sm text-red-300/80">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Contenedor principal */}
        <div className="glass-card">
          {/* Selección de modo */}
          {modo === 'seleccion' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Opción cámara */}
              <motion.button
                type="button"
                onClick={() => {
                  setModo('camara')
                  setCamaraActiva(true)
                }}
                className="min-h-[var(--min-touch,44px)] p-6 sm:p-8 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-400 transition-all text-center group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Usar Cámara</h3>
                <p className="text-white/60 text-sm">
                  Toma una foto con tu webcam
                </p>
              </motion.button>

              {/* Opción subir archivo */}
              <motion.button
                type="button"
                onClick={() => setModo('archivo')}
                className="min-h-[var(--min-touch,44px)] p-6 sm:p-8 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-blue-400 transition-all text-center group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Subir Foto</h3>
                <p className="text-white/60 text-sm">
                  Sube una imagen desde tu dispositivo
                </p>
              </motion.button>
            </motion.div>
          )}

          {/* Modo cámara */}
          {modo === 'camara' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Vista previa de imagen capturada o webcam */}
              <div className="relative aspect-square w-full max-w-sm sm:max-w-md mx-auto rounded-2xl overflow-hidden bg-black/50 mb-4 sm:mb-6">
                {imagenPrevia ? (
                  <img
                    src={imagenPrevia}
                    alt="Captura"
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
                    {/* Guía de encuadre */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/30 rounded-full" />
                      <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
                        Centra tu rostro en el óvalo
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Controles */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {!imagenPrevia ? (
                  <>
                    <button
                      type="button"
                      onClick={volverASeleccion}
                      className="min-h-[var(--min-touch,44px)] px-4 sm:px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Volver
                    </button>
                    <motion.button
                      type="button"
                      onClick={capturarFoto}
                      className="btn-primary flex items-center gap-2 text-base sm:text-lg min-h-[var(--min-touch,44px)]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Camera className="w-5 h-5" />
                      Capturar
                    </motion.button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={reiniciarCaptura}
                      className="min-h-[var(--min-touch,44px)] px-4 sm:px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" aria-hidden />
                      Otra foto
                    </button>
                    <motion.button
                      type="button"
                      onClick={confirmarImagen}
                      className="btn-primary flex items-center gap-2 text-base sm:text-lg min-h-[var(--min-touch,44px)]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check className="w-5 h-5" />
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
            >
              {!imagenPrevia ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all min-h-[160px] flex flex-col items-center justify-center ${isDragActive
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-white/30 hover:border-white/50'
                    }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click() }}
                  aria-label="Arrastra una imagen o haz clic para seleccionar"
                >
                  <input {...getInputProps()} aria-describedby="consejos-captura" />
                  <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-lg">Suelta la imagen aquí...</p>
                  ) : (
                    <>
                      <p className="text-lg mb-2">
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </p>
                      <p className="text-white/50 text-sm">
                        Formatos aceptados: JPG, PNG, WebP
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-black/50 mb-6">
                  <img
                    src={imagenPrevia}
                    alt="Imagen subida"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Controles */}
              <div className="flex justify-center gap-4 mt-6">
                {!imagenPrevia ? (
                  <button
                    onClick={volverASeleccion}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                  </button>
                ) : (
                  <>
                    <button
                      onClick={reiniciarCaptura}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Otra Imagen
                    </button>
                    <motion.button
                      onClick={confirmarImagen}
                      className="btn-primary flex items-center gap-2 text-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check className="w-5 h-5" />
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
          className="mt-6 sm:mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base" id="consejos-captura">
            <Lightbulb className="w-4 h-4 flex-shrink-0" aria-hidden />
            Consejos para mejores resultados
          </h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Usa buena iluminación natural (evita luz artificial muy amarilla)</li>
            <li>• Mira directamente a la cámara</li>
            <li>• Evita usar filtros o mucho maquillaje</li>
            <li>• Asegúrate de que se vea tu cabello natural</li>
          </ul>
        </motion.div>

        {/* Botón volver al inicio */}
        <div className="text-center mt-6">
          <button
            onClick={onVolver}
            className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default CapturadorImagen

