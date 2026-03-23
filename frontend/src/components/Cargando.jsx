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
        className="max-w-lg mx-auto text-center glass-card glass-card--elevated px-6 py-10 sm:px-10 sm:py-12 rounded-[1.75rem] border border-white/10 shadow-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animación de carga */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <div
            className="absolute -inset-6 rounded-full bg-gradient-to-br from-amber-200/10 via-violet-500/15 to-rose-400/10 blur-2xl opacity-80"
            aria-hidden
          />
          {/* Círculos animados */}
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-full border-[3px] border-transparent"
              style={{
                borderTopColor: ['#FF7F50', '#9C27B0', '#E65100', '#1565C0'][index],
                boxShadow: '0 0 20px rgba(255,255,255,0.06)',
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
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]"
              style={{
                background: 'linear-gradient(155deg, rgba(196,165,132,0.6) 0%, rgba(157,127,184,0.72) 100%)',
              }}
            >
              <Sparkles className="w-10 h-10 text-white drop-shadow-md" aria-hidden />
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
        <div className="mt-8 h-2 bg-white/[0.08] rounded-full overflow-hidden ring-1 ring-white/10 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600/95 via-rose-500/85 to-violet-700/90 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: "easeInOut" }}
            style={{ boxShadow: '0 0 24px rgba(196,165,132,0.35)' }}
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
              className="w-8 h-8 rounded-lg ring-1 ring-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: color }}
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.55, 1, 0.55]
              }}
              transition={{ 
                duration: 1.6, 
                repeat: Infinity,
                delay: index * 0.15,
                ease: 'easeInOut'
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

