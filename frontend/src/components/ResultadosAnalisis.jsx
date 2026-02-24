/**
 * Componente ResultadosAnalisis
 * Muestra los resultados del análisis de colorimetría
 * Compatible con la API real de ColorMetría
 */

import { motion } from 'framer-motion'
import { Palette, Sun, Leaf, Snowflake, User, Scissors, TrendingUp, Sparkles, CircleDot, Ban, Lightbulb } from 'lucide-react'

// Paletas de colores locales por estación
const PALETAS_LOCALES = {
  primavera: {
    principales: [
      { nombre: 'Coral', hex: '#FF7F50' },
      { nombre: 'Melocotón', hex: '#FFDAB9' },
      { nombre: 'Amarillo Cálido', hex: '#FFD700' },
      { nombre: 'Verde Lima', hex: '#90EE90' },
      { nombre: 'Rosa Salmón', hex: '#FA8072' },
      { nombre: 'Durazno', hex: '#FFCBA4' },
      { nombre: 'Naranja', hex: '#FF8C00' },
      { nombre: 'Turquesa Cálido', hex: '#48D1CC' },
    ],
    neutros: [
      { nombre: 'Crema', hex: '#FFFDD0' },
      { nombre: 'Marfil', hex: '#FFFFF0' },
      { nombre: 'Beige Cálido', hex: '#F5DEB3' },
      { nombre: 'Marrón Claro', hex: '#DEB887' },
      { nombre: 'Camel', hex: '#C19A6B' },
    ],
    evitar: [
      { nombre: 'Negro Puro', hex: '#000000' },
      { nombre: 'Gris Frío', hex: '#808080' },
      { nombre: 'Morado Frío', hex: '#800080' },
      { nombre: 'Azul Marino', hex: '#000080' },
    ],
    maquillaje: {
      labios: ['Coral rosado', 'Melocotón natural', 'Durazno brillante', 'Rosa cálido'],
      ojos: ['Bronce dorado', 'Marrón cálido', 'Verde kaki', 'Melocotón shimmer'],
      mejillas: ['Coral suave', 'Melocotón luminoso', 'Durazno natural'],
    },
    consejos: [
      'Elige telas que reflejen la luz como seda o satén en tonos cálidos',
      'Los metales dorados y cobrizos son tus mejores aliados',
      'El bronce y el coral son colores que hacen resplandecer tu tono natural',
      'Minimiza el negro puro; prefiere el marrón cálido o el marino suave',
    ]
  },
  verano: {
    principales: [
      { nombre: 'Lavanda', hex: '#E6E6FA' },
      { nombre: 'Rosa Antiguo', hex: '#C9A0A0' },
      { nombre: 'Azul Acero', hex: '#87CEEB' },
      { nombre: 'Mauve', hex: '#C48A8A' },
      { nombre: 'Lila', hex: '#C8A2C8' },
      { nombre: 'Azul Grisáceo', hex: '#A0A8B4' },
      { nombre: 'Rosa Pálido', hex: '#FFB6C1' },
      { nombre: 'Ciruelo Suave', hex: '#C9A0DC' },
    ],
    neutros: [
      { nombre: 'Blanco Rosado', hex: '#FFF0F5' },
      { nombre: 'Gris Perla', hex: '#D3D3D3' },
      { nombre: 'Azul Grisáceo', hex: '#B0BEC5' },
      { nombre: 'Nude Frío', hex: '#E8D5CC' },
      { nombre: 'Greige Frío', hex: '#C2B9B0' },
    ],
    evitar: [
      { nombre: 'Naranja', hex: '#FF7F00' },
      { nombre: 'Amarillo Intenso', hex: '#FFFF00' },
      { nombre: 'Marrón Cálido', hex: '#8B4513' },
      { nombre: 'Rojo Vibrante', hex: '#FF0000' },
    ],
    maquillaje: {
      labios: ['Rosa empolvado', 'Malva suave', 'Berry frío', 'Nude rosado'],
      ojos: ['Lavanda', 'Gris plateado', 'Azul pizarra', 'Mauve shimmer'],
      mejillas: ['Rosa pálido', 'Malva suave', 'Berry translúcido'],
    },
    consejos: [
      'Los tonos difuminados y con grano son más armoniosos que los brillantes intensos',
      'La plata es tu metal principal; evita el oro amarillo intenso',
      'El blanco marfil suave es mejor que el blanco puro brillante',
      'Los estampados delicados y acuarela complementan perfectamente tu paleta',
    ]
  },
  otono: {
    principales: [
      { nombre: 'Terracota', hex: '#CC5500' },
      { nombre: 'Camello', hex: '#C19A6B' },
      { nombre: 'Oliva', hex: '#6B8E23' },
      { nombre: 'Mostaza', hex: '#FFDB58' },
      { nombre: 'Marrón Cálido', hex: '#8B4513' },
      { nombre: 'Óxido', hex: '#B7410E' },
      { nombre: 'Verde Musgo', hex: '#8A9A5B' },
      { nombre: 'Borgoña Cálido', hex: '#800020' },
    ],
    neutros: [
      { nombre: 'Camel', hex: '#C19A6B' },
      { nombre: 'Chocolate', hex: '#7B3F00' },
      { nombre: 'Beige Dorado', hex: '#F5DEB3' },
      { nombre: 'Toffee', hex: '#A0720A' },
      { nombre: 'Crema Cálida', hex: '#FAEBD7' },
    ],
    evitar: [
      { nombre: 'Negro Frío', hex: '#1C1C1C' },
      { nombre: 'Azul Frío', hex: '#0000CD' },
      { nombre: 'Rosa Pastel', hex: '#FFB6C1' },
      { nombre: 'Plata Fría', hex: '#C0C0C0' },
    ],
    maquillaje: {
      labios: ['Terracota', 'Óxido metálico', 'Borgoña cálido', 'Marrón tostado'],
      ojos: ['Bronce oscuro', 'Cobre antiguo', 'Verde kaki', 'Marrón terroso'],
      mejillas: ['Melocotón intenso', 'Terracota suave', 'Bronce cálido'],
    },
    consejos: [
      'Las texturas ricas como terciopelo, ante y lana son perfectas para tu paleta',
      'El oro antiguo y el cobre son tus metales — evita la plata fría',
      'Los estampados animal print en tonos cálidos son especialmente favorecedores',
      'Mezcla capas en distintas intensidades de colores terrosos para un look rico',
    ]
  },
  invierno: {
    principales: [
      { nombre: 'Negro Puro', hex: '#000000' },
      { nombre: 'Blanco Nítido', hex: '#FFFFFF' },
      { nombre: 'Azul Eléctrico', hex: '#0066FF' },
      { nombre: 'Rojo Intenso', hex: '#CC0000' },
      { nombre: 'Borgoña Frío', hex: '#990033' },
      { nombre: 'Morado Real', hex: '#6600CC' },
      { nombre: 'Esmeralda', hex: '#006633' },
      { nombre: 'Fucsia', hex: '#FF0099' },
    ],
    neutros: [
      { nombre: 'Negro', hex: '#000000' },
      { nombre: 'Blanco Puro', hex: '#FFFFFF' },
      { nombre: 'Gris Carbón', hex: '#333333' },
      { nombre: 'Marino Profundo', hex: '#003366' },
      { nombre: 'Gris Plata', hex: '#C0C0C0' },
    ],
    evitar: [
      { nombre: 'Naranja Cálido', hex: '#FF7F00' },
      { nombre: 'Marrón Cálido', hex: '#8B4513' },
      { nombre: 'Amarillo Dorado', hex: '#FFD700' },
      { nombre: 'Melocotón', hex: '#FFDAB9' },
    ],
    maquillaje: {
      labios: ['Rojo intenso', 'Borgoña frío', 'Berry oscuro', 'Fucsia'],
      ojos: ['Negro ahumado', 'Azul marino', 'Gris carbón', 'Plateado'],
      mejillas: ['Rosa frío', 'Berry translúcido', 'Frambuesa suave'],
    },
    consejos: [
      'Los colores intensos y puros como el negro, blanco y azul royal te favorecen',
      'La plata y el platino son tus metales — el oro puede apagarte',
      'Los cortes geométricos y estructurados complementan tu naturaleza de alto contraste',
      'Atrévete con los colores saturados — son perfectos para tu colorimetría',
    ]
  }
}

const ESTILOS_ESTACION = {
  primavera: {
    gradiente: 'from-amber-400 via-orange-400 to-pink-400',
    fondo: 'from-amber-500/20 to-orange-500/20',
    borde: 'border-amber-400',
    icono: Sun,
    color: '#FF7F50',
  },
  verano: {
    gradiente: 'from-pink-300 via-purple-400 to-blue-400',
    fondo: 'from-purple-500/20 to-pink-500/20',
    borde: 'border-purple-400',
    icono: Palette,
    color: '#9C27B0',
  },
  otono: {
    gradiente: 'from-orange-600 via-red-500 to-amber-600',
    fondo: 'from-orange-500/20 to-red-500/20',
    borde: 'border-orange-400',
    icono: Leaf,
    color: '#E65100',
  },
  invierno: {
    gradiente: 'from-blue-500 via-indigo-600 to-purple-600',
    fondo: 'from-blue-500/20 to-indigo-500/20',
    borde: 'border-blue-400',
    icono: Snowflake,
    color: '#1565C0',
  }
}

function ResultadosAnalisis({ resultados, imagen }) {
  // Map actual API response structure
  const estacion = resultados.estacion
  const colores = resultados.colores || {}
  const features = resultados.features || {}

  const estiloE = ESTILOS_ESTACION[estacion?.id] || ESTILOS_ESTACION.verano
  const paleta = PALETAS_LOCALES[estacion?.id] || PALETAS_LOCALES.verano
  const IconoEstacion = estiloE.icono

  const confianzaPct = estacion?.confianza
    ? Math.round(estacion.confianza * (estacion.confianza <= 1 ? 100 : 1))
    : 0

  // Subtono display
  const subtonoLabel = features.subtono || 'neutro'
  const subtonoColor = subtonoLabel === 'cálido' || subtonoLabel === 'warm'
    ? 'from-amber-400 to-orange-500'
    : subtonoLabel === 'frío' || subtonoLabel === 'cool'
      ? 'from-blue-400 to-purple-500'
      : 'from-gray-400 to-gray-500'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="section-container py-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Título */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="section-title">Tu Análisis de Colorimetría</h2>
          <p className="text-white/60">Descubre los colores que resaltan tu belleza natural</p>
        </motion.div>

        {/* Tarjeta principal de estación */}
        <motion.div
          variants={itemVariants}
          className={`glass-card bg-gradient-to-br ${estiloE.fondo} border-2 ${estiloE.borde} max-w-4xl mx-auto mb-10`}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Imagen del usuario */}
            {imagen && (
              <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white/20 shadow-xl">
                <img
                  src={typeof imagen === 'string' ? imagen : URL.createObjectURL(imagen)}
                  alt="Tu foto"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <motion.div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${estiloE.gradiente} flex items-center justify-center shadow-lg`}
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <IconoEstacion className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-white/60 text-sm">Tu estación de color es</p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold">
                    {estacion?.nombre || 'Verano'}
                  </h3>
                </div>
              </div>

              <p className="text-white/80 mb-4 leading-relaxed">{estacion?.descripcion}</p>

              {/* Confianza animada */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/70">Confianza del análisis</span>
                  <strong className="text-white ml-auto">{confianzaPct}%</strong>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${estiloE.gradiente}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${confianzaPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Características */}
              {estacion?.caracteristicas && (
                <ul className="flex flex-wrap gap-2">
                  {estacion.caracteristicas.map((c, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-1.5 text-white/70 text-xs bg-white/10 px-2 py-1 rounded-full"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${estiloE.gradiente}`} />
                      {c}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* Colores detectados */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          {/* Color de piel */}
          {colores.piel && (
            <div className="glass-card flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white/20 flex-shrink-0"
                style={{ backgroundColor: colores.piel.hex }}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-white/50" />
                  <h4 className="font-semibold text-sm">Tono de Piel</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">{colores.piel.hex}</p>
                <p className="text-white/80 text-sm mt-1">{colores.piel.nombre}</p>
              </div>
            </div>
          )}

          {/* Color de cabello */}
          {colores.cabello && (
            <div className="glass-card flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white/20 flex-shrink-0"
                style={{ backgroundColor: colores.cabello.hex }}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Scissors className="w-4 h-4 text-white/50" />
                  <h4 className="font-semibold text-sm">Color de Cabello</h4>
                </div>
                <p className="text-white/60 text-xs font-mono">{colores.cabello.hex}</p>
                <p className="text-white/80 text-sm mt-1">{colores.cabello.nombre}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info adicional: subtono + contraste */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          <div className="glass-card text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 bg-gradient-to-br ${subtonoColor}`} />
            <h4 className="font-semibold mb-1">Subtono de Piel</h4>
            <p className="text-lg capitalize">{subtonoLabel}</p>
          </div>
          <div className="glass-card text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${features.contraste === 'alto'
                ? 'bg-gradient-to-br from-black to-white'
                : features.contraste === 'bajo'
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
              <div className={`w-6 h-6 rounded-full ${features.contraste === 'alto' ? 'bg-white' : 'bg-gray-400'}`} />
            </div>
            <h4 className="font-semibold mb-1">Nivel de Contraste</h4>
            <p className="text-lg capitalize">{features.contraste || 'medio'}</p>
          </div>
        </motion.div>

        {/* Paleta de colores */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <h3 className="section-title text-center mb-8">
            <Palette className="inline-block w-8 h-8 mr-2" />
            Tu Paleta de Colores
          </h3>

          <div className="glass-card mb-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" aria-hidden />
              Colores que te favorecen
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
              {paleta.principales.map((color, i) => (
                <motion.div
                  key={i}
                  className="group relative flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring' }}
                  whileHover={{ scale: 1.12, y: -4 }}
                >
                  <div
                    className="w-full aspect-square rounded-xl shadow-lg border-2 border-white/20 cursor-pointer"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <span className="text-[9px] text-white/50 text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                    {color.nombre}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card mb-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <CircleDot className="w-4 h-4" aria-hidden />
              Neutros ideales
            </h4>
            <div className="flex gap-4">
              {paleta.neutros.map((color, i) => (
                <motion.div
                  key={i}
                  className="group relative flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 cursor-pointer"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <span className="text-[9px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity text-center">{color.nombre}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card mb-6 border-red-500/30">
            <h4 className="font-semibold mb-4 text-red-300 flex items-center gap-2">
              <Ban className="w-4 h-4" aria-hidden />
              Colores a evitar
            </h4>
            <div className="flex gap-4">
              {paleta.evitar.map((color, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 opacity-60"
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

          <div className="glass-card bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" aria-hidden />
              Consejos para tu paleta
            </h4>
            <ul className="space-y-2">
              {paleta.consejos.map((c, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-white/80 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">✦</span>
                  {c}
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
