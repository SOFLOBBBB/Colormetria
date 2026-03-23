/**
 * PantallaInicio — Premium Beauty-Tech Edition
 * Upgraded with Google Stitch-inspired luxury aesthetics.
 * Logic & props contract unchanged: onIniciar(generoSeleccionado)
 */

import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import {
  Camera, Palette, Shirt, Sparkles, Scissors,
  ArrowRight, User, UserCircle, Sun, CloudRain, Leaf, Snowflake
} from 'lucide-react'

/* ─── Reusable: 3D tilt card ─────────────────────────────────────── */
function Card3D({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 280, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 280, damping: 30 })

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900, ...style }}
      className={`card-3d glass-card ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ─── Reusable: animated color swatch ────────────────────────────── */
function Swatch3D({ color, index }) {
  return (
    <motion.div
      className="swatch-3d rounded-2xl"
      style={{
        width: 'clamp(2.5rem, 5vw, 3.2rem)',
        height: 'clamp(2.5rem, 5vw, 3.2rem)',
        backgroundColor: color,
        boxShadow: `
          0 10px 24px rgba(0,0,0,0.42),
          0 2px 4px rgba(0,0,0,0.22),
          inset 0 1px 0 rgba(255,255,255,0.28)
        `,
      }}
      initial={{ opacity: 0, y: 18, scale: 0.72 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.38 + index * 0.08,
        duration: 0.55,
        ease: [0.34, 1.56, 0.64, 1], // spring-like overshoot
      }}
      whileHover={{
        scale: 1.2,
        y: -10,
        rotate: -3,
        boxShadow: `var(--swatch-glow-size) ${color}88, 0 14px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)`,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      }}
      aria-hidden
    />
  )
}

/* ─── Reusable: season card ──────────────────────────────────────── */
function SeasonCard({ estacion, index }) {
  const { nombre, Icono, colores, desc, gradiente } = estacion
  return (
    <motion.div
      className="season-badge p-5 text-center flex flex-col items-center gap-3"
      style={{
        background: `linear-gradient(160deg, ${gradiente[0]}22 0%, ${gradiente[1]}18 50%, rgba(20,18,31,0.92) 100%)`,
      }}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.62 + index * 0.09, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Season gradient backdrop blurred spot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${gradiente[0]}28 0%, transparent 70%)`,
        }}
        aria-hidden
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: `linear-gradient(145deg, ${gradiente[0]}44, ${gradiente[1]}44)`,
          boxShadow: `0 6px 18px ${gradiente[0]}33, inset 0 1px 0 rgba(255,255,255,0.18)`,
        }}
      >
        <Icono className="w-5 h-5 text-white/90" aria-hidden />
      </div>

      <span className="font-display font-semibold text-sm sm:text-base text-white/95 relative z-10">
        {nombre}
      </span>

      <div className="flex justify-center gap-2 relative z-10">
        {colores.map((color, i) => (
          <div
            key={i}
            className="rounded-full border border-white/25"
            style={{
              width: 'clamp(1rem, 2.5vw, 1.35rem)',
              height: 'clamp(1rem, 2.5vw, 1.35rem)',
              backgroundColor: color,
              boxShadow: `0 4px 10px ${color}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
            aria-hidden
          />
        ))}
      </div>

      <span className="text-xs text-white/52 relative z-10 tracking-wide">{desc}</span>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────────────── */
function PantallaInicio({ onIniciar }) {
  const [generoSeleccionado, setGeneroSeleccionado] = useState('femenino')

  const caracteristicas = [
    {
      icono: Camera,
      titulo: 'Análisis Facial',
      descripcion: 'Detectamos tu rostro y analizamos sus características únicas',
      color: '#c4a584',
    },
    {
      icono: Palette,
      titulo: 'Colorimetría Personal',
      descripcion: 'Identificamos tu estación de color: Primavera, Verano, Otoño o Invierno',
      color: '#d4a5b8',
    },
    {
      icono: Shirt,
      titulo: 'Estilos de Ropa',
      descripcion: 'Recomendaciones de prendas que favorecen tu figura',
      color: '#8b9dc3',
    },
    {
      icono: Scissors,
      titulo: 'Peinados',
      descripcion: 'Cortes y estilos que complementan la forma de tu rostro',
      color: '#9d7fb8',
    },
  ]

  const estaciones = [
    {
      nombre: 'Primavera',
      Icono: Sun,
      colores: ['#FF7F50', '#FFD700', '#40E0D0'],
      desc: 'Cálido y brillante',
      gradiente: ['#ff7f50', '#ffd700'],
    },
    {
      nombre: 'Verano',
      Icono: CloudRain,
      colores: ['#E6E6FA', '#9C27B0', '#4682B4'],
      desc: 'Frío y suave',
      gradiente: ['#9c27b0', '#4682b4'],
    },
    {
      nombre: 'Otoño',
      Icono: Leaf,
      colores: ['#E65100', '#808000', '#7B3F00'],
      desc: 'Cálido y profundo',
      gradiente: ['#e65100', '#808000'],
    },
    {
      nombre: 'Invierno',
      Icono: Snowflake,
      colores: ['#FFFFFF', '#1565C0', '#000000'],
      desc: 'Frío y brillante',
      gradiente: ['#1565c0', '#6ab0f5'],
    },
  ]

  const paletaSwatches = ['#FF7F50', '#FFB6C1', '#9C27B0', '#E65100', '#1565C0', '#228B22']

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.11 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <div className="section-container py-10 sm:py-14 lg:py-16">

      {/* ── Hero ────────────────────────────────────── */}
      <motion.div
        className="text-center mb-14 sm:mb-20 max-w-4xl mx-auto relative"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Silk glow behind hero text */}
        <div
          className="absolute inset-x-0 -top-16 h-72 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,165,132,0.18) 0%, rgba(139,111,158,0.12) 50%, transparent 80%)',
            filter: 'blur(2px)',
          }}
          aria-hidden
        />

        {/* Editorial badge */}
        <motion.div
          className="inline-flex items-center gap-2.5 px-4 py-2 sm:px-5 rounded-full border border-white/18 bg-white/[0.055] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] mb-6 sm:mb-8 ring-1 ring-white/[0.04]"
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          role="status"
          aria-label="Análisis de colorimetría"
        >
          <span className="pulse-dot" aria-hidden />
          <span className="text-xs sm:text-sm font-medium text-white/82 tracking-[0.06em]">
            Análisis de colorimetría personal
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-200/75 flex-shrink-0" aria-hidden />
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-semibold mb-5 sm:mb-7 px-2 leading-[1.12]">
          <motion.span
            className="block bg-gradient-to-br from-[#faf9f7] via-[#edddd0] to-[#d8c8e4] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            Descubre los colores
          </motion.span>
          <motion.span
            className="block bg-gradient-to-br from-[#e8d8c0] via-[#cdbede] to-[#b8a8c8] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            que te favorecen
          </motion.span>
        </h1>

        <motion.p
          className="font-body text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-10 sm:mb-12 px-3 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.55 }}
        >
          Analiza tu rostro, identifica tu estación cromática y obtén recomendaciones de
          color, ropa y estilo alineadas con tu colorimetría.
        </motion.p>

        {/* ── Animated 3D palette ──────────── */}
        <motion.div
          className="flex justify-center gap-3 sm:gap-4 mb-2 px-4"
          style={{
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {paletaSwatches.map((color, index) => (
            <Swatch3D key={color} color={color} index={index} />
          ))}
        </motion.div>

        {/* Subtle label under palette */}
        <motion.p
          className="text-[11px] sm:text-xs text-white/32 tracking-[0.14em] uppercase font-body mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Tu estación revelada al instante
        </motion.p>
      </motion.div>

      {/* ── Gender selector card ────────────────────── */}
      <motion.div
        className="glass-card glass-card--elevated max-w-lg mx-auto mb-14 sm:mb-20"
        style={{ boxShadow: 'var(--shadow-elevated)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="text-xl sm:text-2xl font-display font-semibold text-center mb-7 text-white/95">
          ¿Cómo te identificas?
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6" role="group" aria-label="Selección de género">
          {/* Femenino */}
          <motion.button
            type="button"
            onClick={() => setGeneroSeleccionado('femenino')}
            className={[
              'relative min-h-[var(--min-touch,44px)] p-5 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden',
              generoSeleccionado === 'femenino'
                ? 'border-pink-400/70 bg-pink-500/18 gender-selected'
                : 'border-white/18 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/28'
            ].join(' ')}
            style={{ transition: 'background 0.28s, border-color 0.28s, box-shadow 0.28s' }}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            aria-pressed={generoSeleccionado === 'femenino'}
          >
            {generoSeleccionado === 'femenino' && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(236,100,160,0.18) 0%, transparent 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.32 }}
                aria-hidden
              />
            )}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2.5"
              style={{
                background: generoSeleccionado === 'femenino'
                  ? 'linear-gradient(145deg, #f472b6, #d946ef)'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: generoSeleccionado === 'femenino'
                  ? '0 8px 20px rgba(244,114,182,0.42), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : 'none',
                transition: 'all 0.32s var(--ease-out-expo)',
              }}
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden />
            </div>
            <span className="font-medium text-sm sm:text-base relative z-10">Femenino</span>
          </motion.button>

          {/* Masculino */}
          <motion.button
            type="button"
            onClick={() => setGeneroSeleccionado('masculino')}
            className={[
              'relative min-h-[var(--min-touch,44px)] p-5 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden',
              generoSeleccionado === 'masculino'
                ? 'border-blue-400/70 bg-blue-500/18 gender-selected'
                : 'border-white/18 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/28'
            ].join(' ')}
            style={{ transition: 'background 0.28s, border-color 0.28s, box-shadow 0.28s' }}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            aria-pressed={generoSeleccionado === 'masculino'}
          >
            {generoSeleccionado === 'masculino' && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(59,130,246,0.2) 0%, transparent 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.32 }}
                aria-hidden
              />
            )}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2.5"
              style={{
                background: generoSeleccionado === 'masculino'
                  ? 'linear-gradient(145deg, #60a5fa, #3b82f6)'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: generoSeleccionado === 'masculino'
                  ? '0 8px 20px rgba(96,165,250,0.42), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : 'none',
                transition: 'all 0.32s var(--ease-out-expo)',
              }}
            >
              <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden />
            </div>
            <span className="font-medium text-sm sm:text-base relative z-10">Masculino</span>
          </motion.button>
        </div>

        {/* CTA — shimmer primary button */}
        <motion.button
          type="button"
          onClick={() => onIniciar(generoSeleccionado)}
          className="w-full btn-primary shimmer-btn flex items-center justify-center gap-2.5 text-base sm:text-lg min-h-[var(--min-touch,44px)] font-semibold tracking-wide"
          whileHover={{ scale: 1.022, y: -2 }}
          whileTap={{ scale: 0.974 }}
        >
          <Camera className="w-5 h-5 flex-shrink-0" aria-hidden />
          Comenzar Análisis
          <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden />
        </motion.button>
      </motion.div>

      {/* ── Feature cards ───────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {caracteristicas.map((c, index) => (
          <motion.div key={index} variants={itemVariants} className="h-full">
            <Card3D className="glass-card--elevated glass-card--floating text-center h-full flex flex-col">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-app-lg flex items-center justify-center mx-auto mb-4"
                style={{
                  background: `linear-gradient(145deg, ${c.color}44 0%, ${c.color}28 100%)`,
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: `0 8px 20px ${c.color}30, inset 0 1px 0 rgba(255,255,255,0.18)`,
                }}
              >
                <c.icono className="w-7 h-7 text-white/95" aria-hidden />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{c.titulo}</h3>
              <p className="text-white/58 text-sm leading-relaxed">{c.descripcion}</p>
            </Card3D>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Season section ──────────────────────────── */}
      <motion.div
        className="mt-16 sm:mt-20 lg:mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-title inline-block">Las 4 estaciones de color</h2>
          <p className="text-white/48 text-sm sm:text-base font-body mt-2 max-w-sm mx-auto leading-relaxed">
            Cada persona pertenece a una estación que define su paleta ideal
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {estaciones.map((estacion, index) => (
            <SeasonCard key={estacion.nombre} estacion={estacion} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default PantallaInicio
