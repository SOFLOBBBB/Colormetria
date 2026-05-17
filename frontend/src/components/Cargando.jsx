/**
 * Componente Cargando
 * Pantalla de carga mientras se procesa la imagen
 */

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { isRemoteBackend } from '../config/api.js'

function SurfaceCard({ children, className = '' }) {
  return <div className={`glass-card glass-card--elevated ${className}`}>{children}</div>
}

function ProgressBar({ className = '' }) {
  return (
    <div className={`h-2 bg-white/[0.08] rounded-full overflow-hidden ring-1 ring-white/10 shadow-inner ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{
          background:
            'linear-gradient(90deg, var(--accent-start) 0%, var(--accent-rose) 45%, var(--accent-end) 100%)',
          boxShadow: '0 0 24px rgba(196,165,132,0.35)',
        }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />
    </div>
  )
}

function Cargando() {
  // Mensajes que se muestran durante la carga
  const mensajes = [
    'Analizando tu rostro...',
    'Detectando colores de piel...',
    'Identificando color de ojos...',
    'Analizando tu cabello...',
    'Calculando tu estación de color...',
    'Preparando recomendaciones...',
  ]

  return (
    <div className="section-container py-10 sm:py-14">
      <motion.div
        className="max-w-xl mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <SurfaceCard className="px-6 py-8 sm:px-10 sm:py-10 text-center rounded-[var(--radius-xl)]">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.05] mb-5 sm:mb-6"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <span className="pulse-dot" aria-hidden />
            <span className="text-xs sm:text-sm text-white/80 tracking-wide">Procesando análisis</span>
          </motion.div>

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8" aria-hidden>
            <div
              className="absolute -inset-6 rounded-full blur-2xl opacity-80"
              style={{
                background:
                  'radial-gradient(circle, rgba(196,165,132,0.22) 0%, rgba(157,127,184,0.18) 45%, transparent 80%)',
              }}
            />

            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: ['var(--accent-start)', 'var(--accent-rose)', 'var(--accent-end)'][index],
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.8 - index * 0.25,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full flex items-center justify-center border border-white/20"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(196,165,132,0.56) 0%, rgba(157,127,184,0.72) 100%)',
                  boxShadow:
                    '0 12px 36px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                <Sparkles className="w-8 h-8 text-white drop-shadow-md" aria-hidden />
              </div>
            </motion.div>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3 text-white/95">
            Analizando tu colorimetría
          </h2>
          <p className="text-white/62 text-sm sm:text-base mb-5 sm:mb-6">
            Combinamos rasgos faciales y contraste para identificar tu estación.
          </p>

          <div className="h-8 overflow-hidden">
            <motion.div
              animate={{ y: ['0%', '-500%', '-500%', '0%'] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                times: [0, 0.8, 0.9, 1],
              }}
            >
              {mensajes.map((mensaje, index) => (
                <p
                  key={index}
                  className="text-white/66 font-body text-sm sm:text-base h-8 flex items-center justify-center"
                >
                  {mensaje}
                </p>
              ))}
            </motion.div>
          </div>

          <ProgressBar className="mt-6 sm:mt-7" />

          <motion.div
            className="flex justify-center gap-2 mt-6 sm:mt-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            aria-hidden
          >
            {['#FF7F50', '#FFB6C1', '#9C27B0', '#E65100', '#228B22', '#1565C0'].map((color, index) => (
              <motion.div
                key={color}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-[var(--radius-sm)] ring-1 ring-white/20"
                style={{ backgroundColor: color }}
                animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: index * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          <p className="text-white/40 text-sm mt-7 sm:mt-8">
            Esto puede tomar unos segundos...
            {isRemoteBackend() && (
              <span className="block mt-2 text-white/32 text-xs">
                La primera petición puede tardar hasta 2 minutos si el servidor está iniciando.
              </span>
            )}
          </p>
        </SurfaceCard>
      </motion.div>
    </div>
  )
}

export default Cargando
