/**
 * Componente principal de la aplicación ColorMetría
 * Maneja el flujo principal y la navegación entre vistas
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Importar componentes
import Header from './components/Header'
import PantallaInicio from './components/PantallaInicio'
import CapturadorImagen from './components/CapturadorImagen'
import ResultadosAnalisis from './components/ResultadosAnalisis'
import PanelRecomendaciones from './components/PanelRecomendaciones'
import GeneradorCabello from './components/GeneradorCabello'
import GaleriaOutfits from './components/GaleriaOutfits'
import Cargando from './components/Cargando'
import { apiUrl, TIMEOUT_ANALIZAR_MS } from './config/api.js'

// Estados de la aplicación
const ESTADOS = {
  INICIO: 'inicio',
  CAPTURA: 'captura',
  CARGANDO: 'cargando',
  RESULTADOS: 'resultados'
}

const easePremium = [0.22, 1, 0.36, 1]
const transicionVista = {
  duration: 0.48,
  ease: easePremium
}
const transicionSalida = {
  duration: 0.32,
  ease: easePremium
}

function App() {
  // Estado de la aplicación
  const [estadoActual, setEstadoActual] = useState(ESTADOS.INICIO)
  const [imagenCapturada, setImagenCapturada] = useState(null)
  const [resultados, setResultados] = useState(null)
  const [genero, setGenero] = useState('femenino')
  const [error, setError] = useState(null)
  
  /**
   * Inicia el proceso de análisis
   * @param {string} generoSeleccionado - Género seleccionado por el usuario
   */
  const iniciarAnalisis = (generoSeleccionado) => {
    setGenero(generoSeleccionado)
    setEstadoActual(ESTADOS.CAPTURA)
    setError(null)
  }
  
  /**
   * Procesa la imagen capturada o subida
   * @param {File|Blob|string} imagen - Imagen a procesar
   */
  const procesarImagen = async (imagen) => {
    setImagenCapturada(imagen)
    setEstadoActual(ESTADOS.CARGANDO)
    setError(null)
    
    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData()
      
      // Si la imagen es un string base64 (de webcam), convertir a blob
      if (typeof imagen === 'string' && imagen.startsWith('data:')) {
        const respuesta = await fetch(imagen)
        const blob = await respuesta.blob()
        formData.append('archivo', blob, 'captura.jpg')
      } else if (imagen instanceof File) {
        formData.append('archivo', imagen)
      } else if (imagen instanceof Blob) {
        formData.append('archivo', imagen, 'imagen.jpg')
      }
      
      // Añadir género
      formData.append('genero', genero)

      const controlador = new AbortController()
      const idTimeout = setTimeout(() => controlador.abort(), TIMEOUT_ANALIZAR_MS)

      const respuestaAPI = await fetch(apiUrl('/analizar'), {
        method: 'POST',
        body: formData,
        signal: controlador.signal
      })
      clearTimeout(idTimeout)

      if (!respuestaAPI.ok) {
        let mensajeError = 'Error al analizar la imagen'
        try {
          const errorData = await respuestaAPI.json()
          mensajeError = errorData.detail || mensajeError
        } catch {
          mensajeError = `Error ${respuestaAPI.status}: ${respuestaAPI.statusText}`
        }
        throw new Error(mensajeError)
      }

      const datos = await respuestaAPI.json()
      
      if (datos.exito) {
        setResultados(datos)
        setEstadoActual(ESTADOS.RESULTADOS)
      } else {
        throw new Error('No se pudo analizar la imagen')
      }
      
    } catch (err) {
      let mensaje = err.message || 'Error al procesar la imagen. Por favor, intenta de nuevo.'
      if (err.name === 'AbortError') {
        mensaje = 'El servidor tarda mas de lo esperado. En la primera peticion, Render puede tardar hasta 2 minutos en activarse. Intente de nuevo.'
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        mensaje = 'No se pudo conectar con el servidor. Verifique su conexion o intente mas tarde.'
      }
      setError(mensaje)
      setEstadoActual(ESTADOS.CAPTURA)
    }
  }
  
  /**
   * Reinicia el análisis para hacer uno nuevo
   */
  const reiniciarAnalisis = () => {
    setEstadoActual(ESTADOS.INICIO)
    setImagenCapturada(null)
    setResultados(null)
    setError(null)
  }
  
  /**
   * Vuelve a la pantalla de captura
   */
  const volverACaptura = () => {
    setEstadoActual(ESTADOS.CAPTURA)
    setImagenCapturada(null)
  }
  
  return (
    <div className="app-shell">
      <a href="#contenido-principal" className="salto-contenido">
        Ir al contenido principal
      </a>
      <div className="particles-bg" aria-hidden />
      <div className="ambient-orbs" aria-hidden>
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
      </div>
      <Header onReiniciar={reiniciarAnalisis} mostrarBotonReiniciar={estadoActual !== ESTADOS.INICIO} />
      <main
        id="contenido-principal"
        className="relative z-10 pt-16 sm:pt-20 pb-12 min-h-[calc(100vh-theme(spacing.20))] font-body"
        tabIndex={-1}
      >
        <AnimatePresence mode="wait">
          {/* Pantalla de inicio */}
          {estadoActual === ESTADOS.INICIO && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, transition: transicionSalida }}
              transition={transicionVista}
            >
              <PantallaInicio onIniciar={iniciarAnalisis} />
            </motion.div>
          )}
          
          {/* Pantalla de captura */}
          {estadoActual === ESTADOS.CAPTURA && (
            <motion.div
              key="captura"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, transition: transicionSalida }}
              transition={transicionVista}
            >
              <CapturadorImagen 
                onCaptura={procesarImagen} 
                onVolver={reiniciarAnalisis}
                error={error}
              />
            </motion.div>
          )}
          
          {/* Pantalla de carga */}
          {estadoActual === ESTADOS.CARGANDO && (
            <motion.div
              key="cargando"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.28, ease: easePremium } }}
              transition={{ duration: 0.42, ease: easePremium }}
            >
              <Cargando />
            </motion.div>
          )}
          
          {/* Pantalla de resultados */}
          {estadoActual === ESTADOS.RESULTADOS && resultados && (
            <motion.div
              key="resultados"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: transicionSalida }}
              transition={transicionVista}
            >
              <ResultadosAnalisis 
                resultados={resultados}
                imagen={imagenCapturada}
              />
              <PanelRecomendaciones 
                resultados={resultados}
                genero={genero}
              />
              
              {/* Sección: Prueba Virtual de Cabello */}
              <div className="section-container mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.5, ease: easePremium }}
                >
                  <GeneradorCabello
                    imagen={imagenCapturada}
                    estacion={resultados.estacion.id}
                    genero={genero}
                  />
                </motion.div>
              </div>
              
              {/* Sección: Galería de Outfits */}
              <div className="section-container mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.5, ease: easePremium }}
                >
                  <GaleriaOutfits
                    estacion={resultados.estacion.id}
                    genero={genero}
                  />
                </motion.div>
              </div>
              
              {/* Botón para nuevo análisis */}
              <div className="section-container mt-12 text-center">
                <button
                  type="button"
                  onClick={reiniciarAnalisis}
                  className="btn-primary text-base sm:text-lg min-h-[var(--min-touch,44px)] px-8"
                >
                  Hacer nuevo análisis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 app-footer-glass py-8 sm:py-10 text-center text-white/50 text-sm px-4 font-body">
        <p className="max-w-md mx-auto leading-relaxed">
          ColorMetría | Descubre tu paleta personal
        </p>
      </footer>
    </div>
  )
}

export default App

