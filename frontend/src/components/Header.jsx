/**
 * Cabecera: marca y acción de nuevo análisis.
 */

import { motion } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'

function Header({ onReiniciar, mostrarBotonReiniciar }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#14121f]/75 backdrop-blur-xl backdrop-saturate-150 shadow-soft">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem]">
          <motion.button
            type="button"
            className="flex items-center gap-3 cursor-pointer text-left rounded-app focus-visible:outline-offset-4"
            onClick={onReiniciar}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            aria-label="Volver al inicio"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
              <div
                className="absolute inset-0 rounded-full opacity-90"
                style={{
                  background:
                    'conic-gradient(from 210deg, #c4a584, #9d7fb8, #8b9dc3, #c4a584)',
                }}
              />
              <div className="absolute inset-[3px] rounded-full bg-[#14121f]/85 flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-amber-100/90" aria-hidden />
              </div>
            </div>
            <div>
              <span className="font-display text-lg sm:text-xl font-semibold block bg-gradient-to-r from-[#faf9f7] via-[#e8dcc8] to-[#d4c8e0] bg-clip-text text-transparent">
                ColorMetría
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/45 tracking-[0.2em] uppercase font-body font-medium">
                Tu paleta personal
              </span>
            </div>
          </motion.button>

          {mostrarBotonReiniciar && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onReiniciar}
              className="btn-ghost min-h-[var(--min-touch,44px)] flex items-center gap-2 px-4 text-sm font-medium"
              aria-label="Nuevo análisis"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Nuevo análisis</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
