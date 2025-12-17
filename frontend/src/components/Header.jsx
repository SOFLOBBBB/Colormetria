/**
 * Componente Header
 * Barra de navegación superior con logo y acciones
 */

import { motion } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'

function Header({ onReiniciar, mostrarBotonReiniciar }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={onReiniciar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icono animado */}
            <motion.div 
              className="relative w-10 h-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primavera via-verano to-invierno opacity-80" />
              <div className="absolute inset-1 rounded-full bg-black/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            
            {/* Nombre */}
            <div>
              <h1 className="font-display text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                ColorMetría
              </h1>
              <p className="text-[10px] text-white/50 -mt-1 tracking-wider">
                TU PALETA PERSONAL
              </p>
            </div>
          </motion.div>
          
          {/* Botón reiniciar */}
          {mostrarBotonReiniciar && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onReiniciar}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Análisis</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

