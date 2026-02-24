/**
 * Componente GaleriaOutfits
 * Muestra outfits recomendados según la colorimetría del usuario
 * Con imágenes de moodboard por estación y consejos de estilo
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shirt, Sparkles, Heart, ChevronRight, Palette, Star, Lightbulb, Briefcase, PartyPopper } from 'lucide-react'

// Datos locales de outfits por estación (no dependen del backend)
const DATOS_ESTACION = {
  primavera: {
    nombre: 'Primavera',
    gradiente: 'from-orange-400 via-pink-400 to-amber-300',
    imagen: '/images/outfits/primavera.png',
    descripcion: 'Colores cálidos, dorados y frescos que iluminan tu tono natural',
    paleta: [
      { nombre: 'Coral', hex: '#FF7F50' },
      { nombre: 'Melocotón', hex: '#FFCBA4' },
      { nombre: 'Amarillo Cálido', hex: '#FFD700' },
      { nombre: 'Verde Lima', hex: '#7FFF00' },
      { nombre: 'Rosa Salmón', hex: '#FA8072' },
      { nombre: 'Durazno', hex: '#FFDAB9' },
      { nombre: 'Naranja Cálido', hex: '#FF8C00' },
      { nombre: 'Crema', hex: '#FFFDD0' },
    ],
    outfits: [
      {
        id: 1,
        nombre: 'Look Casual Primaveral',
        descripcion: 'Blusa coral con pantalón crema y accesorios dorados',
        ocasion: 'casual',
        prendas: ['Blusa coral de seda', 'Pantalón crema ancho', 'Sandalias doradas', 'Bolso de mimbre'],
        colores: ['#FF7F50', '#FFFDD0', '#FFD700'],
        tip: 'Combina el coral con tonos crema para un look fresco y natural'
      },
      {
        id: 2,
        nombre: 'Elegancia Dorada',
        descripcion: 'Vestido amarillo cálido con accesorios en tono cobre',
        ocasion: 'formal',
        prendas: ['Vestido midi amarillo', 'Tacones cobre', 'Clutch dorado', 'Aretes de aro cobre'],
        colores: ['#FFD700', '#B8860B', '#FF8C00'],
        tip: 'Los metales dorados y cobrizos son tus mejores aliados'
      },
      {
        id: 3,
        nombre: 'Brunch Chic',
        descripcion: 'Conjunto melocotón con detalles florales',
        ocasion: 'casual',
        prendas: ['Top floral en tonos melocotón', 'Falda plisada crema', 'Mules beige', 'Sombrero de paja'],
        colores: ['#FFDAB9', '#FFFDD0', '#FA8072'],
        tip: 'Los estampados florales en tonos cálidos son perfectos para tu paleta'
      },
      {
        id: 4,
        nombre: 'Noche Coral',
        descripcion: 'Vestido coral con joyería dorada fina',
        ocasion: 'fiesta',
        prendas: ['Vestido cocktail coral', 'Stilettos nude', 'Clutch dorado pequeño', 'Collar delicado dorado'],
        colores: ['#FF7F50', '#F4A460', '#FFD700'],
        tip: 'El coral en telas fluidas es absolutamente irresistible para tu tono'
      },
    ],
    consejos: [
      'Elige telas ligeras como seda, gasa o lino que reflejen la luz natural',
      'Los estampados florales en tonos cálidos son perfectos para ti',
      'Minimiza el negro puro; prefiere el marrón cálido o el marino suave',
      'Los metales dorados y cobrizos realzan tu luminosidad natural',
      'El blanco marfil y el crema son mejores que el blanco puro para tu tono'
    ]
  },
  verano: {
    nombre: 'Verano',
    gradiente: 'from-purple-400 via-pink-300 to-blue-300',
    imagen: '/images/outfits/verano.png',
    descripcion: 'Tonos suaves, fríos y delicados que armonizan con tu subtono rosado',
    paleta: [
      { nombre: 'Lavanda', hex: '#E6E6FA' },
      { nombre: 'Rosa Polvo', hex: '#DBA0A0' },
      { nombre: 'Azul Cielo', hex: '#87CEFA' },
      { nombre: 'Malva', hex: '#C48A8A' },
      { nombre: 'Gris Azulado', hex: '#A0A8B4' },
      { nombre: 'Rosa Antiguo', hex: '#C9A0A0' },
      { nombre: 'Lila Suave', hex: '#D8B4E2' },
      { nombre: 'Blanco Rosado', hex: '#FFF0F5' },
    ],
    outfits: [
      {
        id: 1,
        nombre: 'Suave y Romántico',
        descripcion: 'Blusa de lavanda suave con pantalón gris azulado',
        ocasion: 'casual',
        prendas: ['Blusa fluida lavanda', 'Pantalón gris azulado', 'Bailarinas nude', 'Bolso de cuero nude'],
        colores: ['#E6E6FA', '#A0A8B4', '#DBA0A0'],
        tip: 'Los colores suaves y difuminados son los más favorecedores para ti'
      },
      {
        id: 2,
        nombre: 'Elegancia Polvorienta',
        descripcion: 'Vestido mauve midi con perlas finas',
        ocasion: 'formal',
        prendas: ['Vestido midi mauve', 'Tacones gris perla', 'Collar de perlas', 'Bolso pequeño rosa antiguo'],
        colores: ['#C48A8A', '#A0A8B4', '#DBA0A0'],
        tip: 'Las perlas son la joya perfecta para tus tonos delicados'
      },
      {
        id: 3,
        nombre: 'Brisa de Mar',
        descripcion: 'Conjunto azul cielo con detalles en blanco rosado',
        ocasion: 'casual',
        prendas: ['Top azul cielo', 'Falda midi blanco rosado', 'Sandalias nude', 'Sombrero de ala ancha'],
        colores: ['#87CEFA', '#FFF0F5', '#E6E6FA'],
        tip: 'Los azules suaves y fríos son especialmente favorecedores para tu paleta verano'
      },
      {
        id: 4,
        nombre: 'Noche Lila',
        descripcion: 'Vestido lila suave con accesorios plateados',
        ocasion: 'fiesta',
        prendas: ['Vestido cocktail lila', 'Stilettos plata', 'Clutch plateado', 'Aretes de plata delicados'],
        colores: ['#D8B4E2', '#C9A0A0', '#A0A8B4'],
        tip: 'La plata y el platino son los metales más armoniosos con tu subtono frío'
      },
    ],
    consejos: [
      'Mantén los colores suaves y difuminados, evita los tonos muy saturados',
      'La plata es tu metal; evita el oro amarillo intenso',
      'Los estampados sutiles en tonos grisáceos o pasteles fríos te favorecen',
      'El blanco rosado o el marfil son mejores que el blanco puro brillante',
      'El negro puede ser reemplazado por el azul marino profundo o gris carbón'
    ]
  },
  otono: {
    nombre: 'Otoño',
    gradiente: 'from-orange-600 via-amber-500 to-yellow-600',
    imagen: '/images/outfits/otono.png',
    descripcion: 'Tonos terrosos, ricos y cálidos que resaltan tu profundidad natural',
    paleta: [
      { nombre: 'Terracota', hex: '#CC5500' },
      { nombre: 'Camello', hex: '#C19A6B' },
      { nombre: 'Oliva', hex: '#6B8E23' },
      { nombre: 'Mostaza', hex: '#FFDB58' },
      { nombre: 'Marrón Cálido', hex: '#8B4513' },
      { nombre: 'Óxido', hex: '#B7410E' },
      { nombre: 'Dorado Tierra', hex: '#B8860B' },
      { nombre: 'Borgoña Cálido', hex: '#800020' },
    ],
    outfits: [
      {
        id: 1,
        nombre: 'Otoño Casual',
        descripcion: 'Suéter mostaza con pantalón camello y botas marrón',
        ocasion: 'casual',
        prendas: ['Suéter oversize mostaza', 'Pantalón camello de tela', 'Botas marrón castaño', 'Bolso de cuero marrón'],
        colores: ['#FFDB58', '#C19A6B', '#8B4513'],
        tip: 'Las texturas ricas como la lana, el cuero y el terciopelo son ideales para tu paleta'
      },
      {
        id: 2,
        nombre: 'Elegancia Terrosa',
        descripcion: 'Vestido terracota con joyería de oro antiguo',
        ocasion: 'formal',
        prendas: ['Vestido midi terracota', 'Tacones marrón oscuro', 'Collar de ámbar', 'Bolso de cuero tostado'],
        colores: ['#CC5500', '#8B4513', '#B8860B'],
        tip: 'El oro antiguo y el cobre son los metales perfectos para el otoño'
      },
      {
        id: 3,
        nombre: 'Campo y Naturaleza',
        descripcion: 'Look oliva y óxido con accesorios de cuero',
        ocasion: 'casual',
        prendas: ['Chaqueta de campo oliva', 'Camiseta óxido', 'Jeans oscuros', 'Botines de cuero marrón'],
        colores: ['#6B8E23', '#B7410E', '#8B4513'],
        tip: 'El verde oliva y los naranjas oxidados son combinaciones icónicas de otoño'
      },
      {
        id: 4,
        nombre: 'Noche Borgoña',
        descripcion: 'Vestido borgoña con detalles dorados',
        ocasion: 'fiesta',
        prendas: ['Vestido borgoña de terciopelo', 'Stilettos dorados', 'Clutch dorado oscuro', 'Aretes de granate'],
        colores: ['#800020', '#B8860B', '#CC5500'],
        tip: 'El borgoña cálido es espectacular en tu paleta; irradia sofisticación'
      },
    ],
    consejos: [
      'Las texturas ricas como lana, ante y terciopelo son perfectas para ti',
      'El oro antiguo y el cobre son tus metales; evita el plateado frío',
      'Los estampados animal print en tonos cálidos (leopardo, tortuga) te favorecen',
      'El negro puede resultar muy intenso; prefiere el marrón oscuro o el vino',
      'Construye looks layered (capas) que mezclen distintas tonalidades terrosas'
    ]
  },
  invierno: {
    nombre: 'Invierno',
    gradiente: 'from-blue-600 via-indigo-500 to-purple-600',
    imagen: '/images/outfits/invierno.png',
    descripcion: 'Colores intensos, nítidos y contrastantes que amplían tu poder natural',
    paleta: [
      { nombre: 'Negro Puro', hex: '#000000' },
      { nombre: 'Blanco Nítido', hex: '#FFFFFF' },
      { nombre: 'Azul Eléctrico', hex: '#0066FF' },
      { nombre: 'Rojo Intenso', hex: '#CC0000' },
      { nombre: 'Borgoña Frío', hex: '#990033' },
      { nombre: 'Morado Real', hex: '#6600CC' },
      { nombre: 'Verde Esmeralda', hex: '#006633' },
      { nombre: 'Fucsia', hex: '#FF0099' },
    ],
    outfits: [
      {
        id: 1,
        nombre: 'Contraste Clásico',
        descripcion: 'Blusa blanca con pantalón negro y accesorios plateados',
        ocasion: 'casual',
        prendas: ['Blusa blanca nítida', 'Pantalón negro tailored', 'Zapatos de charol negro', 'Cinturón plateado'],
        colores: ['#FFFFFF', '#000000', '#C0C0C0'],
        tip: 'El contraste negro-blanco es tu combinación más poderosa y natural'
      },
      {
        id: 2,
        nombre: 'Power Look Azul',
        descripcion: 'Blazer azul eléctrico con pantalón blanco y plateado',
        ocasion: 'formal',
        prendas: ['Blazer azul eléctrico', 'Pantalón blanco nítido', 'Tacones plateados', 'Collar de plata'],
        colores: ['#0066FF', '#FFFFFF', '#C0C0C0'],
        tip: 'El azul eléctrico irradia tu intensidad natural; elige cortes estructurados'
      },
      {
        id: 3,
        nombre: 'Rojo Audaz',
        descripcion: 'Abrigo rojo intenso sobre conjunto negro',
        ocasion: 'casual',
        prendas: ['Abrigo rojo intenso', 'Jersey negro', 'Jeans negro oscuro', 'Botines negros de charol'],
        colores: ['#CC0000', '#000000', '#330000'],
        tip: 'El rojo puro y vibrante es uno de tus colores estrella, úsalo con confianza'
      },
      {
        id: 4,
        nombre: 'Noche Esmeralda',
        descripcion: 'Vestido esmeralda con joyería de plata intensa',
        ocasion: 'fiesta',
        prendas: ['Vestido cocktail esmeralda', 'Stilettos plateados', 'Clutch negro', 'Aretes de esmeralda y plata'],
        colores: ['#006633', '#000000', '#C0C0C0'],
        tip: 'El verde esmeralda con joyas de plata es un look de invierno absolutamente espectacular'
      },
    ],
    consejos: [
      'Sé valiente con los colores; los tonos intensos y puros son los más favorecedores',
      'La plata y el platino son tus metales; el oro puede apagarte',
      'El negro puro te sienta perfectamente, es parte natural de tu paleta',
      'Los cortes estructurados y geométricos complementan tu naturaleza de alto contraste',
      'Los estampados gráficos en blanco y negro son especialmente chic para ti'
    ]
  }
}

const OCASIONES = [
  { id: null, nombre: 'Todos', Icono: Sparkles },
  { id: 'casual', nombre: 'Casual', Icono: Shirt },
  { id: 'formal', nombre: 'Formal', Icono: Briefcase },
  { id: 'fiesta', nombre: 'Fiesta', Icono: PartyPopper },
]

function GaleriaOutfits({ estacion, genero }) {
  const [ocasionFiltro, setOcasionFiltro] = useState(null)
  const [outfitExpandido, setOutfitExpandido] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [mostrarImagen, setMostrarImagen] = useState(true)

  const datos = DATOS_ESTACION[estacion] || DATOS_ESTACION.verano

  const toggleFavorito = (outfitId) => {
    setFavoritos(prev =>
      prev.includes(outfitId)
        ? prev.filter(id => id !== outfitId)
        : [...prev, outfitId]
    )
  }

  const outfitsFiltrados = ocasionFiltro
    ? datos.outfits.filter(o => o.ocasion === ocasionFiltro)
    : datos.outfits

  return (
    <div className="glass-card max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${datos.gradiente} flex items-center justify-center`}>
          <Shirt className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">
            Outfits para {datos.nombre}
          </h3>
          <p className="text-white/60 text-sm">{datos.descripcion}</p>
        </div>
      </div>

      {/* Imagen de moodboard de la estación */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 cursor-pointer"
        style={{ maxHeight: mostrarImagen ? '420px' : '0px' }}
        onClick={() => setMostrarImagen(!mostrarImagen)}
        layout
      >
        <img
          src={datos.imagen}
          alt={`Moodboard ${datos.nombre}`}
          className="w-full object-cover rounded-2xl"
          style={{ maxHeight: '420px' }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-2xl`} />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-semibold text-lg drop-shadow-lg flex items-center gap-2">
            <Palette className="w-5 h-5" aria-hidden /> Tu moodboard de {datos.nombre}
          </p>
          <p className="text-white/80 text-sm">Paleta personalizada para realzar tus colores naturales</p>
        </div>
      </motion.div>

      {/* Paleta de colores */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-white/80">
          <Palette className="w-5 h-5 text-pink-400" />
          Tu Paleta de {datos.nombre}
        </h4>
        <div className="flex flex-wrap gap-3">
          {datos.paleta.map((color, index) => (
            <motion.div
              key={index}
              className="group relative flex flex-col items-center gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06, type: 'spring' }}
              whileHover={{ scale: 1.1, y: -4 }}
            >
              <div
                className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 cursor-pointer"
                style={{ backgroundColor: color.hex }}
                title={color.nombre}
              />
              <span className="text-white/60 text-[10px] text-center leading-tight max-w-[3rem] opacity-0 group-hover:opacity-100 transition-opacity">
                {color.nombre}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {OCASIONES.map((ocasion) => (
          <motion.button
            type="button"
            key={String(ocasion.id)}
            onClick={() => setOcasionFiltro(ocasion.id)}
            className={`min-h-[var(--min-touch,44px)] px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${ocasionFiltro === ocasion.id
                ? `bg-gradient-to-r ${datos.gradiente} text-white font-semibold`
                : 'bg-white/10 hover:bg-white/20'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ocasion.Icono className="w-4 h-4" aria-hidden />
            {ocasion.nombre}
          </motion.button>
        ))}
      </div>

      {/* Grid de outfits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {outfitsFiltrados.map((outfit, index) => (
          <motion.div
            key={outfit.id}
            className={`rounded-xl overflow-hidden border transition-all cursor-pointer ${outfitExpandido === outfit.id
                ? `border-pink-500 bg-white/10`
                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/8'
              }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setOutfitExpandido(outfitExpandido === outfit.id ? null : outfit.id)}
            layout
            whileHover={{ y: -2 }}
          >
            {/* Header del outfit */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 capitalize text-white/60">
                      {outfit.ocasion}
                    </span>
                    {favoritos.includes(outfit.id) && (
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <h4 className="font-semibold">{outfit.nombre}</h4>
                  <p className="text-white/60 text-sm mt-1">{outfit.descripcion}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorito(outfit.id)
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                >
                  <Heart
                    className={`w-5 h-5 ${favoritos.includes(outfit.id)
                        ? 'fill-pink-500 text-pink-500'
                        : 'text-white/40'
                      }`}
                  />
                </button>
              </div>

              {/* Paleta del outfit */}
              <div className="flex gap-2 items-center">
                {outfit.colores.map((color, i) => (
                  <motion.div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white/20 shadow-md"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
                <ChevronRight className={`w-4 h-4 text-white/40 ml-auto transition-transform ${outfitExpandido === outfit.id ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Expandido: prendas y tip */}
            <AnimatePresence>
              {outfitExpandido === outfit.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-3">
                    <h5 className="text-sm font-medium text-white/80 mb-2">Prendas clave:</h5>
                    <ul className="grid grid-cols-2 gap-1 mb-3">
                      {outfit.prendas.map((prenda, i) => (
                        <li key={i} className="text-white/60 text-xs flex items-start gap-1">
                          <span className="text-pink-400 mt-0.5">•</span>
                          {prenda}
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <p className="text-white/80 text-xs flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-pink-300 flex-shrink-0 mt-0.5" aria-hidden />
                        <span><span className="text-pink-300 font-semibold">Tip: </span>{outfit.tip}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Consejos de estilo */}
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${datos.gradiente.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')}/10 border border-white/10`}>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Consejos de Estilo para {datos.nombre}
        </h4>
        <ul className="space-y-2">
          {datos.consejos.map((consejo, index) => (
            <motion.li
              key={index}
              className="text-white/70 text-sm flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
            >
              <span className="text-pink-400 mt-1 flex-shrink-0">✦</span>
              {consejo}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default GaleriaOutfits
