/**
 * Componente Cargando
 * Pantalla de carga mientras se procesa la imagen
 */

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

function Cargando() {
  // Mensajes que se muestran durante la carga
  const mensajes = [
    'Analizando tu rostro...',
    'Detectando colores de piel...',
    'Identificando color de ojos...',
    'Analizando tu cabello...',
    'Calculando tu estación de color...',
    'Preparando recomendaciones...'
  ]
  
  return (
    <div className="section-container py-12">
      <motion.div 
        className="max-w-md mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animación de carga */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          {/* Círculos animados */}
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: ['#FF7F50', '#9C27B0', '#E65100', '#1565C0'][index],
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2 - index * 0.3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
          
          {/* Centro con icono */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border border-white/15"
              style={{
                background: 'linear-gradient(145deg, rgba(196,165,132,0.55) 0%, rgba(157,127,184,0.65) 100%)',
              }}
            >
              <Sparkles className="w-10 h-10 text-white" aria-hidden />
            </div>
          </motion.div>
        </div>
        
        {/* Texto animado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4 text-white/95">
            Analizando tu colorimetría
          </h2>
          
          {/* Mensajes que cambian */}
          <div className="h-8 overflow-hidden">
            <motion.div
              animate={{ y: ['0%', '-500%', '-500%', '0%'] }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                times: [0, 0.8, 0.9, 1]
              }}
            >
              {mensajes.map((mensaje, index) => (
                <motion.p
                  key={index}
                  className="text-white/58 font-body text-sm sm:text-base h-8 flex items-center justify-center"
                >
                  {mensaje}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Barra de progreso */}
        <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-700/90 via-rose-900/70 to-violet-900/80"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
        </div>
        
        {/* Paleta de colores animada */}
        <motion.div 
          className="flex justify-center gap-2 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {['#FF7F50', '#FFB6C1', '#9C27B0', '#E65100', '#228B22', '#1565C0'].map((color, index) => (
            <motion.div
              key={color}
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: color }}
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: index * 0.15
              }}
            />
          ))}
        </motion.div>
        
        <p className="text-white/40 text-sm mt-8">
          Esto puede tomar unos segundos...
          {import.meta.env.VITE_API_URL && (
            <span className="block mt-2 text-white/30 text-xs">
              La primera peticion puede tardar hasta 2 minutos si el servidor esta iniciando.
            </span>
          )}
        </p>
      </motion.div>
    </div>
  )
}

export default Cargando

