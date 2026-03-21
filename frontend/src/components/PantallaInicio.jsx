/**
 * Componente PantallaInicio
 * Pantalla de bienvenida con selección de género e información
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Palette, Shirt, Sparkles, Scissors, ArrowRight, User, UserCircle, Sun, CloudRain, Leaf, Snowflake } from 'lucide-react'

function PantallaInicio({ onIniciar }) {
  const [generoSeleccionado, setGeneroSeleccionado] = useState('femenino')
  
  // Características del sistema
  const caracteristicas = [
    {
      icono: Camera,
      titulo: 'Análisis Facial',
      descripcion: 'Detectamos tu rostro y analizamos sus características únicas'
    },
    {
      icono: Palette,
      titulo: 'Colorimetría Personal',
      descripcion: 'Identificamos tu estación de color: Primavera, Verano, Otoño o Invierno'
    },
    {
      icono: Shirt,
      titulo: 'Estilos de Ropa',
      descripcion: 'Recomendaciones de prendas que favorecen tu figura'
    },
    {
      icono: Scissors,
      titulo: 'Peinados',
      descripcion: 'Cortes y estilos que complementan la forma de tu rostro'
    }
  ]
  
  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  return (
    <div className="section-container py-10 sm:py-14 lg:py-16">
      <motion.div
        className="text-center mb-14 sm:mb-20 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-5 rounded-full border border-white/15 bg-mesh-subtle backdrop-blur-md mb-5 sm:mb-7"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          role="status"
          aria-label="Análisis de colorimetría"
        >
          <Sparkles className="w-4 h-4 text-amber-200/90 flex-shrink-0" aria-hidden />
          <span className="text-xs sm:text-sm font-medium text-white/85 tracking-wide">
            Análisis de colorimetría personal
          </span>
        </motion.div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-semibold mb-5 sm:mb-7 px-2 leading-tight">
          <span className="bg-gradient-to-br from-[#faf9f7] via-[#ebe3d6] to-[#cfc0d8] bg-clip-text text-transparent">
            Descubre los colores
          </span>
          <br />
          <span className="bg-gradient-to-br from-[#e8dcc8] to-[#b8a8c8] bg-clip-text text-transparent">
            que te favorecen
          </span>
        </h1>
        <p className="font-body text-base sm:text-lg text-white/65 max-w-xl mx-auto mb-8 sm:mb-10 px-3 leading-relaxed">
          Analiza tu rostro, identifica tu estación cromática y obtén recomendaciones de
          color, ropa y estilo alineadas con tu colorimetría.
        </p>
        
        {/* Paleta animada decorativa */}
        <motion.div 
          className="flex justify-center gap-3 mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {['#FF7F50', '#FFB6C1', '#9C27B0', '#E65100', '#1565C0', '#228B22'].map((color, index) => (
            <motion.div
              key={color}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg"
              style={{ backgroundColor: color }}
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
      
      {/* Selección de género */}
      <motion.div
        className="glass-card glass-card--elevated max-w-lg mx-auto mb-14 sm:mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <h3 className="text-xl sm:text-2xl font-display font-semibold text-center mb-6 text-white/95">
          ¿Cómo te identificas?
        </h3>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6" role="group" aria-label="Selección de género">
          <motion.button
            type="button"
            onClick={() => setGeneroSeleccionado('femenino')}
            className={`min-h-[var(--min-touch,44px)] p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
              generoSeleccionado === 'femenino'
                ? 'border-pink-400 bg-pink-500/20'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={generoSeleccionado === 'femenino'}
          >
            <User className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-pink-300" aria-hidden />
            <span className="font-medium text-sm sm:text-base">Femenino</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setGeneroSeleccionado('masculino')}
            className={`min-h-[var(--min-touch,44px)] p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
              generoSeleccionado === 'masculino'
                ? 'border-blue-400 bg-blue-500/20'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={generoSeleccionado === 'masculino'}
          >
            <UserCircle className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-blue-300" aria-hidden />
            <span className="font-medium text-sm sm:text-base">Masculino</span>
          </motion.button>
        </div>
        <motion.button
          type="button"
          onClick={() => onIniciar(generoSeleccionado)}
          className="w-full btn-primary flex items-center justify-center gap-2 text-base sm:text-lg min-h-[var(--min-touch,44px)]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Camera className="w-5 h-5" />
          Comenzar Análisis
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
      
      {/* Características */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {caracteristicas.map((caracteristica, index) => (
          <motion.div
            key={index}
            className="glass-card text-center h-full flex flex-col"
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.22 } }}
          >
            <div
              className="w-14 h-14 rounded-app-lg flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(145deg, rgba(196,165,132,0.35) 0%, rgba(157,127,184,0.45) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <caracteristica.icono className="w-7 h-7 text-white/95" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">
              {caracteristica.titulo}
            </h3>
            <p className="text-white/60 text-sm">
              {caracteristica.descripcion}
            </p>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div
        className="mt-12 sm:mt-16 lg:mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="section-title text-center mb-6 sm:mb-8">Las 4 estaciones de color</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { nombre: 'Primavera', Icono: Sun, colores: ['#FF7F50', '#FFD700', '#40E0D0'], desc: 'Cálido y brillante' },
            { nombre: 'Verano', Icono: CloudRain, colores: ['#E6E6FA', '#9C27B0', '#4682B4'], desc: 'Frío y suave' },
            { nombre: 'Otoño', Icono: Leaf, colores: ['#E65100', '#808000', '#7B3F00'], desc: 'Cálido y profundo' },
            { nombre: 'Invierno', Icono: Snowflake, colores: ['#FFFFFF', '#1565C0', '#000000'], desc: 'Frío y brillante' }
          ].map((estacion, index) => (
            <motion.div
              key={estacion.nombre}
              className="glass-card text-center p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex justify-center mb-2">
                <estacion.Icono className="w-8 h-8 sm:w-9 sm:h-9 text-white/90" aria-hidden />
              </div>
              <h4 className="font-display font-semibold mb-2 text-sm sm:text-base">{estacion.nombre}</h4>
              <div className="flex justify-center gap-1.5 sm:gap-2 mb-2">
                {estacion.colores.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/30"
                    style={{ backgroundColor: color }}
                    role="img"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-xs text-white/50">{estacion.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default PantallaInicio

