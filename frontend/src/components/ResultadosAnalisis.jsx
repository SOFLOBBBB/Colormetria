/**
 * Componente ResultadosAnalisis
 * Muestra los resultados del análisis de colorimetría
 */

import { motion } from 'framer-motion'
import { Palette, Sun, Moon, Leaf, Snowflake, Eye, User, Scissors } from 'lucide-react'

// Mapeo de estaciones a sus estilos
const ESTILOS_ESTACION = {
  primavera: {
    gradiente: 'from-amber-400 via-orange-400 to-coral-400',
    fondo: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    borde: 'border-amber-400',
    icono: Sun,
    emoji: '🌸'
  },
  verano: {
    gradiente: 'from-pink-300 via-purple-400 to-blue-400',
    fondo: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    borde: 'border-purple-400',
    icono: Palette,
    emoji: '🌊'
  },
  otono: {
    gradiente: 'from-orange-500 via-red-500 to-amber-600',
    fondo: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    borde: 'border-orange-400',
    icono: Leaf,
    emoji: '🍂'
  },
  invierno: {
    gradiente: 'from-blue-400 via-indigo-500 to-purple-600',
    fondo: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20',
    borde: 'border-blue-400',
    icono: Snowflake,
    emoji: '❄️'
  }
}

function ResultadosAnalisis({ resultados, imagen }) {
  const { analisis, recomendaciones } = resultados
  const estacion = analisis.estacion
  const estiloEstacion = ESTILOS_ESTACION[estacion.id] || ESTILOS_ESTACION.primavera
  const IconoEstacion = estiloEstacion.icono
  
  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  return (
    <div className="section-container py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Título de sección */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="section-title">Tu Análisis de Colorimetría</h2>
          <p className="text-white/60">Descubre los colores que resaltan tu belleza natural</p>
        </motion.div>
        
        {/* Tarjeta principal de estación */}
        <motion.div 
          variants={itemVariants}
          className={`glass-card ${estiloEstacion.fondo} border-2 ${estiloEstacion.borde} max-w-4xl mx-auto mb-12`}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Imagen del usuario */}
            {imagen && (
              <div className="w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white/20">
                <img 
                  src={imagen} 
                  alt="Tu foto" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Información de estación */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <motion.div 
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${estiloEstacion.gradiente} flex items-center justify-center`}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <IconoEstacion className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-white/60 text-sm">Tu estación de color es</p>
                  <h3 className="font-display text-3xl font-bold">
                    {estiloEstacion.emoji} {estacion.nombre}
                  </h3>
                </div>
              </div>
              
              <p className="text-white/80 mb-4">{estacion.descripcion}</p>
              
              {/* Confianza */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm">
                  Confianza del análisis: <strong>{estacion.confianza}%</strong>
                </span>
              </div>
            </div>
          </div>
          
          {/* Características */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="font-semibold mb-3">Características de tu estación:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {estacion.caracteristicas.map((caracteristica, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center gap-2 text-white/70"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${estiloEstacion.gradiente}`} />
                  {caracteristica}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
        
        {/* Colores detectados */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {/* Color de piel */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-white/70" />
              <h4 className="font-semibold">Tono de Piel</h4>
            </div>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: analisis.colores_detectados.piel.hex }}
              />
              <div>
                <p className="font-medium">{analisis.colores_detectados.piel.nombre}</p>
                <p className="text-sm text-white/60">{analisis.colores_detectados.piel.hex}</p>
                <p className="text-xs text-white/40 capitalize">Luminosidad: {analisis.colores_detectados.piel.luminosidad.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
          
          {/* Color de ojos */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-white/70" />
              <h4 className="font-semibold">Color de Ojos</h4>
            </div>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: analisis.colores_detectados.ojos.hex }}
              />
              <div>
                <p className="font-medium">{analisis.colores_detectados.ojos.nombre}</p>
                <p className="text-sm text-white/60">{analisis.colores_detectados.ojos.hex}</p>
                <p className="text-xs text-white/40 capitalize">Categoría: {analisis.colores_detectados.ojos.categoria}</p>
              </div>
            </div>
          </div>
          
          {/* Color de cabello */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Scissors className="w-6 h-6 text-white/70" />
              <h4 className="font-semibold">Color de Cabello</h4>
            </div>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: analisis.colores_detectados.cabello.hex }}
              />
              <div>
                <p className="font-medium">{analisis.colores_detectados.cabello.nombre}</p>
                <p className="text-sm text-white/60">{analisis.colores_detectados.cabello.hex}</p>
                <p className="text-xs text-white/40 capitalize">Categoría: {analisis.colores_detectados.cabello.categoria}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Información adicional */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {/* Subtono */}
          <div className="glass-card text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 ${
              analisis.subtono === 'cálido' 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : analisis.subtono === 'frío'
                ? 'bg-gradient-to-br from-blue-400 to-purple-500'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`} />
            <h4 className="font-semibold mb-1">Subtono de Piel</h4>
            <p className="text-lg capitalize">{analisis.subtono}</p>
          </div>
          
          {/* Contraste */}
          <div className="glass-card text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
              analisis.contraste === 'alto'
                ? 'bg-gradient-to-br from-black to-white'
                : analisis.contraste === 'bajo'
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}>
              <div className={`w-6 h-6 rounded-full ${analisis.contraste === 'alto' ? 'bg-white' : 'bg-gray-500'}`} />
            </div>
            <h4 className="font-semibold mb-1">Nivel de Contraste</h4>
            <p className="text-lg capitalize">{analisis.contraste}</p>
          </div>
          
          {/* Forma de rostro */}
          <div className="glass-card text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-1">Forma de Rostro</h4>
            <p className="text-lg capitalize">{analisis.forma_rostro}</p>
          </div>
        </motion.div>
        
        {/* Paleta de colores */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <h3 className="section-title text-center mb-8">
            <Palette className="inline-block w-8 h-8 mr-2" />
            Tu Paleta de Colores
          </h3>
          
          {/* Colores principales */}
          <div className="glass-card mb-6">
            <h4 className="font-semibold mb-4">Colores que Te Favorecen</h4>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {recomendaciones.paleta_colores.principales.map((color, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div 
                    className="color-swatch w-full aspect-square"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {color.nombre}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Colores neutros */}
          <div className="glass-card mb-6">
            <h4 className="font-semibold mb-4">Neutros Ideales</h4>
            <div className="grid grid-cols-5 gap-3 max-w-md">
              {recomendaciones.paleta_colores.neutros.map((color, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div 
                    className="color-swatch w-full aspect-square"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {color.nombre}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Colores a evitar */}
          <div className="glass-card border-red-500/30">
            <h4 className="font-semibold mb-4 text-red-300">Colores a Evitar</h4>
            <div className="grid grid-cols-4 gap-3 max-w-xs">
              {recomendaciones.paleta_colores.evitar.map((color, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <div 
                    className="color-swatch w-full aspect-square opacity-60"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 rotate-45" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Consejos */}
          <div className="glass-card mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h4 className="font-semibold mb-4">💡 Consejos para tu Paleta</h4>
            <ul className="space-y-2">
              {recomendaciones.paleta_colores.consejos.map((consejo, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-2 text-white/80"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <span className="text-purple-400">•</span>
                  {consejo}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ResultadosAnalisis

