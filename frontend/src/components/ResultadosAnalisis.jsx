/**
 * Componente ResultadosAnalisis
 * Muestra los resultados del análisis de colorimetría
 * Compatible con la API real de ColorMetría
 */

import { motion } from 'framer-motion'
import {
  Palette,
  Sun,
  Leaf,
  Snowflake,
  User,
  Scissors,
  TrendingUp,
  Sparkles,
  CircleDot,
  Ban,
  Lightbulb,
} from 'lucide-react'

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
    ],
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
    ],
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
    ],
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
    ],
  },
}

const ESTILOS_ESTACION = {
  primavera: {
    gradiente: 'from-amber-400 via-orange-400 to-pink-400',
    fondo: 'from-amber-500/20 to-orange-500/20',
    borde: 'border-amber-400/60',
    ring: 'ring-amber-400/25',
    icono: Sun,
    color: '#FF7F50',
  },
  verano: {
    gradiente: 'from-pink-300 via-purple-400 to-blue-400',
    fondo: 'from-purple-500/20 to-pink-500/20',
    borde: 'border-purple-400/60',
    ring: 'ring-purple-400/25',
    icono: Palette,
    color: '#9C27B0',
  },
  otono: {
    gradiente: 'from-orange-600 via-red-500 to-amber-600',
    fondo: 'from-orange-500/20 to-red-500/20',
    borde: 'border-orange-400/60',
    ring: 'ring-orange-400/25',
    icono: Leaf,
    color: '#E65100',
  },
  invierno: {
    gradiente: 'from-blue-500 via-indigo-600 to-purple-600',
    fondo: 'from-blue-500/20 to-indigo-500/20',
    borde: 'border-blue-400/60',
    ring: 'ring-blue-400/25',
    icono: Snowflake,
    color: '#1565C0',
  },
}

/** Subcomponentes locales: solo presentación; no alteran datos ni contratos del padre. */
function SectionHeader({ kicker, title, subtitle, icon: Icon }) {
  return (
    <header className="text-center mb-8 md:mb-10 max-w-2xl mx-auto">
      {Icon && (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 mb-4 text-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <Icon className="w-5 h-5" aria-hidden />
        </span>
      )}
      {kicker && (
        <p className="font-body text-[11px] sm:text-xs uppercase tracking-[0.22em] text-white/45 mb-2">{kicker}</p>
      )}
      <h2 className="section-title mb-0">{title}</h2>
      {subtitle && <p className="font-body text-white/58 text-sm sm:text-base mt-3 leading-relaxed">{subtitle}</p>}
    </header>
  )
}

function DetectedColorCard({ icon: Icon, label, hex, nombre }) {
  return (
    <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] flex gap-4 sm:gap-5 items-center min-h-[5.5rem]">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-lg border border-white/20 flex-shrink-0 palette-swatch-pro"
        style={{ backgroundColor: hex }}
      />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-white/45 shrink-0" aria-hidden />
          <span className="font-body text-[11px] uppercase tracking-[0.14em] text-white/45">{label}</span>
        </div>
        <p className="font-mono text-[11px] sm:text-xs text-white/50" translate="no">
          {hex}
        </p>
        <p className="font-display text-base sm:text-lg text-white/95 mt-0.5 truncate">{nombre}</p>
      </div>
    </div>
  )
}

function MetricCard({ label, value, caption, accent, children }) {
  return (
    <div
      className={`glass-card glass-card--elevated ring-1 ring-white/[0.08] text-center flex flex-col items-center justify-center min-h-[10rem] sm:min-h-[11rem] ${accent}`}
    >
      <div className="mb-4 flex justify-center">{children}</div>
      <p className="font-body text-[11px] uppercase tracking-[0.16em] text-white/45 mb-1">{label}</p>
      <p className="font-display text-xl sm:text-2xl capitalize text-white/95">{value}</p>
      {caption && <p className="font-body text-xs text-white/48 mt-2 max-w-[14rem] mx-auto leading-snug">{caption}</p>}
    </div>
  )
}

function SubtonoOrb({ subtonoLabel = 'neutro' }) {
  const subtonoColor =
    subtonoLabel === 'cálido' || subtonoLabel === 'warm'
      ? 'from-amber-400 to-orange-500'
      : subtonoLabel === 'frío' || subtonoLabel === 'cool'
        ? 'from-sky-400 to-violet-500'
        : 'from-zinc-400 to-zinc-600'

  return (
    <div
      className={`w-14 h-14 rounded-full bg-gradient-to-br ${subtonoColor} shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-2 ring-white/10`}
      aria-hidden
    />
  )
}

function ContrasteOrb({ nivel }) {
  const n = nivel || 'medio'
  const isAlto = n === 'alto'
  const isBajo = n === 'bajo'

  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-2 ring-white/10 overflow-hidden"
      aria-hidden
      style={{
        background: isAlto
          ? 'linear-gradient(135deg, #0a0a0a 0%, #f5f5f5 100%)'
          : isBajo
            ? 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%)'
            : 'linear-gradient(135deg, #71717a 0%, #3f3f46 100%)',
      }}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${isAlto ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 'bg-gray-400'}`}
      />
    </div>
  )
}

function PaletteSection({
  title,
  icon: Icon,
  accentClass = 'text-white/90',
  borderMuted,
  children,
}) {
  return (
    <div
      className={`glass-card glass-card--elevated ring-1 ring-white/[0.08] ${borderMuted || ''}`}
    >
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.08]">
        <span className={`inline-flex p-2 rounded-lg bg-white/[0.06] border border-white/10 ${accentClass}`}>
          <Icon className="w-4 h-4" aria-hidden />
        </span>
        <h4 className="font-display text-lg sm:text-xl font-semibold tracking-tight">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function ResultadosAnalisis({ resultados, imagen }) {
  const estacion = resultados.estacion
  const colores = resultados.colores || {}
  const features = resultados.features || {}

  const estiloE = ESTILOS_ESTACION[estacion?.id] || ESTILOS_ESTACION.verano
  const paleta = PALETAS_LOCALES[estacion?.id] || PALETAS_LOCALES.verano
  const IconoEstacion = estiloE.icono

  const confianzaPct = estacion?.confianza
    ? Math.round(estacion.confianza * (estacion.confianza <= 1 ? 100 : 1))
    : 0

  const subtonoLabel = features.subtono || 'neutro'
  const contrasteLabel = features.contraste || 'medio'

  const subtonoCaption =
    subtonoLabel === 'cálido' || subtonoLabel === 'warm'
      ? 'Base dorada o melocotón que armoniza con tu estación.'
      : subtonoLabel === 'frío' || subtonoLabel === 'cool'
        ? 'Subtono rosado o azulado que equilibra con tu paleta.'
        : 'Equilibrio entre tonos cálidos y fríos en tu piel.'

  const contrasteCaption =
    contrasteLabel === 'alto'
      ? 'Rostro y cabello con diferencia marcada; los contrastes puros te favorecen.'
      : contrasteLabel === 'bajo'
        ? 'Transiciones suaves; los tonos empolvados y difuminados armonizan mejor.'
        : 'Variación equilibrada entre rasgos; versatilidad en tonos medios.'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="section-container py-8 md:py-10">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <SectionHeader
            kicker="Diagnóstico"
            title="Tu análisis de colorimetría"
            subtitle="Descubre los colores que resaltan tu belleza natural"
          />
        </motion.div>

        {/* Tarjeta principal de estación */}
        <motion.div
          variants={itemVariants}
          className={`glass-card glass-card--elevated max-w-4xl mx-auto mb-10 md:mb-12 bg-gradient-to-br ${estiloE.fondo} border ${estiloE.borde} ring-1 ${estiloE.ring}`}
        >
          <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">
            {imagen && (
              <div className="flex justify-center lg:justify-start shrink-0">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
                  <img
                    src={typeof imagen === 'string' ? imagen : URL.createObjectURL(imagen)}
                    alt="Tu foto"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0 text-center lg:text-left">
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 lg:gap-5 mb-5">
                <motion.div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${estiloE.gradiente} flex items-center justify-center shadow-lg ring-1 ring-white/20`}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  <IconoEstacion className="w-8 h-8 text-white drop-shadow-md" />
                </motion.div>
                <div>
                  <p className="font-body text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/50 mb-1">
                    Estación cromática
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white/95 tracking-tight">
                    {estacion?.nombre || 'Verano'}
                  </h3>
                </div>
              </div>

              <p className="font-body text-white/72 text-sm sm:text-[15px] leading-relaxed mb-6 max-w-prose mx-auto lg:mx-0">
                {estacion?.descripcion}
              </p>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400/90 shrink-0" aria-hidden />
                  <span className="font-body text-xs sm:text-sm text-white/60">Confianza del análisis</span>
                  <strong className="font-display text-white ml-auto tabular-nums">{confianzaPct}%</strong>
                </div>
                <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden ring-1 ring-white/[0.06]">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${estiloE.gradiente}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${confianzaPct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                  />
                </div>
              </div>

              {estacion?.caracteristicas && (
                <ul className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {estacion.caracteristicas.map((c, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.1 }}
                      className="font-body inline-flex items-center gap-2 text-white/80 text-xs sm:text-[13px] bg-white/[0.07] border border-white/[0.1] px-3 py-1.5 rounded-full"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${estiloE.gradiente}`} aria-hidden />
                      {c}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* Colores detectados */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-10 md:mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-white/45 text-center mb-4">Muestras detectadas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {colores.piel && (
              <DetectedColorCard
                icon={User}
                label="Tono de piel"
                hex={colores.piel.hex}
                nombre={colores.piel.nombre}
              />
            )}
            {colores.cabello && (
              <DetectedColorCard
                icon={Scissors}
                label="Color de cabello"
                hex={colores.cabello.hex}
                nombre={colores.cabello.nombre}
              />
            )}
          </div>
        </motion.div>

        {/* Subtono + contraste */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto mb-10 md:mb-12">
          <MetricCard
            label="Subtono de piel"
            value={subtonoLabel}
            caption={subtonoCaption}
            accent=""
          >
            <SubtonoOrb subtonoLabel={subtonoLabel} />
          </MetricCard>
          <MetricCard
            label="Nivel de contraste"
            value={contrasteLabel}
            caption={contrasteCaption}
            accent=""
          >
            <ContrasteOrb nivel={features.contraste} />
          </MetricCard>
        </motion.div>

        {/* Paleta de colores */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center mb-2">
            <p className="font-body text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Guía de estación</p>
            <h3 className="section-title text-2xl sm:text-3xl md:text-4xl mb-0 inline-flex flex-wrap items-center justify-center gap-2">
              <Palette className="inline w-7 h-7 sm:w-8 sm:h-8 opacity-90 shrink-0" aria-hidden />
              <span>Tu paleta de colores</span>
            </h3>
          </div>

          <PaletteSection title="Colores que te favorecen" icon={Sparkles} accentClass="text-amber-100/90">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3">
              {paleta.principales.map((color, i) => (
                <motion.div
                  key={i}
                  className="group relative flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: i * 0.04,
                    type: 'spring',
                    stiffness: 380,
                    damping: 28,
                  }}
                  whileHover={{ scale: 1.06, y: -4 }}
                >
                  <div
                    className="palette-swatch-pro w-full aspect-square rounded-xl border border-white/25 cursor-pointer"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <span className="text-[9px] sm:text-[10px] text-white/55 text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                    {color.nombre}
                  </span>
                </motion.div>
              ))}
            </div>
          </PaletteSection>

          <PaletteSection title="Neutros ideales" icon={CircleDot} accentClass="text-white/80">
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
              {paleta.neutros.map((color, i) => (
                <motion.div
                  key={i}
                  className="group relative flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, scale: 0.88, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                  whileHover={{ scale: 1.06, y: -2 }}
                >
                  <div
                    className="palette-swatch-pro w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-white/25 cursor-pointer"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <span className="text-[9px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity text-center max-w-[4.5rem]">
                    {color.nombre}
                  </span>
                </motion.div>
              ))}
            </div>
          </PaletteSection>

          <PaletteSection
            title="Colores a evitar"
            icon={Ban}
            accentClass="text-red-200/90"
            borderMuted="border-red-500/20 border"
          >
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
              {paleta.evitar.map((color, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="palette-swatch-pro w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-white/15 opacity-65"
                    style={{ backgroundColor: color.hex }}
                    title={color.nombre}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[110%] h-px bg-red-500/80 rotate-45 shadow-sm" />
                  </div>
                </motion.div>
              ))}
            </div>
          </PaletteSection>

          <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] bg-gradient-to-br from-[color:var(--accent-end)]/15 via-transparent to-[color:var(--accent-start)]/10 border border-white/[0.08]">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex p-2 rounded-lg bg-white/[0.06] border border-white/10 text-amber-100/90">
                <Lightbulb className="w-4 h-4" aria-hidden />
              </span>
              <h4 className="font-display text-lg sm:text-xl font-semibold">Consejos para tu paleta</h4>
            </div>
            <ul className="space-y-3">
              {paleta.consejos.map((c, i) => (
                <motion.li
                  key={i}
                  className="font-body flex items-start gap-3 text-white/78 text-sm sm:text-[15px] leading-relaxed"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <span className="text-[color:var(--accent-start)] mt-1 flex-shrink-0 opacity-90" aria-hidden>
                    ✦
                  </span>
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
