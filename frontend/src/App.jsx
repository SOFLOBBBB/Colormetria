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

// Estados de la aplicación
const ESTADOS = {
  INICIO: 'inicio',
  CAPTURA: 'captura',
  CARGANDO: 'cargando',
  RESULTADOS: 'resultados'
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
      
      // Enviar al backend
      const respuestaAPI = await fetch('http://localhost:8000/analizar', {
        method: 'POST',
        body: formData
      })
      
      if (!respuestaAPI.ok) {
        const errorData = await respuestaAPI.json()
        throw new Error(errorData.detail || 'Error al analizar la imagen')
      }
      
      const datos = await respuestaAPI.json()
      
      if (datos.exito) {
        setResultados(datos)
        setEstadoActual(ESTADOS.RESULTADOS)
      } else {
        throw new Error('No se pudo analizar la imagen')
      }
      
    } catch (err) {
      console.error('Error al procesar imagen:', err)
      setError(err.message || 'Error al procesar la imagen. Por favor, intenta de nuevo.')
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
    <div className="min-h-screen relative">
      {/* Fondo con partículas */}
      <div className="particles-bg" />
      
      {/* Header */}
      <Header onReiniciar={reiniciarAnalisis} mostrarBotonReiniciar={estadoActual !== ESTADOS.INICIO} />
      
      {/* Contenido principal */}
      <main className="pt-20 pb-12">
        <AnimatePresence mode="wait">
          {/* Pantalla de inicio */}
          {estadoActual === ESTADOS.INICIO && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PantallaInicio onIniciar={iniciarAnalisis} />
            </motion.div>
          )}
          
          {/* Pantalla de captura */}
          {estadoActual === ESTADOS.CAPTURA && (
            <motion.div
              key="captura"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Cargando />
            </motion.div>
          )}
          
          {/* Pantalla de resultados */}
          {estadoActual === ESTADOS.RESULTADOS && resultados && (
            <motion.div
              key="resultados"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
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
                  transition={{ delay: 0.3 }}
                >
                  <GeneradorCabello
                    imagen={imagenCapturada}
                    estacion={resultados.analisis.estacion.id}
                    genero={genero}
                  />
                </motion.div>
              </div>
              
              {/* Sección: Galería de Outfits */}
              <div className="section-container mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GaleriaOutfits
                    estacion={resultados.analisis.estacion.id}
                    genero={genero}
                  />
                </motion.div>
              </div>
              
              {/* Botón para nuevo análisis */}
              <div className="section-container mt-12 text-center">
                <button
                  onClick={reiniciarAnalisis}
                  className="btn-primary text-lg"
                >
                  ✨ Hacer Nuevo Análisis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-white/50 text-sm">
        <p>ColorMetría © 2024 - Descubre tu paleta personal</p>
        <p className="mt-1">Desarrollado con 💜 para resaltar tu belleza natural</p>
      </footer>
    </div>
  )
}

export default App

