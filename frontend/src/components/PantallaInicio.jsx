/**
 * PantallaInicio — Premium incremental refresh.
 * Logic & props contract unchanged: onIniciar(generoSeleccionado)
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Palette,
  Shirt,
  Sparkles,
  Scissors,
  ArrowRight,
  User,
  UserCircle,
  Sun,
  CloudRain,
  Leaf,
  Snowflake,
} from 'lucide-react'

function SurfaceCard({ children, className = '' }) {
  return <div className={`glass-card glass-card--elevated ${className}`}>{children}</div>
}

function ButtonPrimary({ children, className = '', ...props }) {
  return (
    <motion.button
      type="button"
      className={`btn-primary min-h-[var(--min-touch,44px)] w-full inline-flex items-center justify-center gap-2.5 text-base sm:text-lg font-semibold ${className}`}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

function ButtonSecondary({ children, className = '', ...props }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`btn-ghost min-h-[var(--min-touch,44px)] inline-flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

function SectionHeader({ badge, titulo, descripcion, center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {badge && (
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.05] mb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200/80" aria-hidden />
          <span className="text-xs sm:text-sm text-white/78 tracking-wide">{badge}</span>
        </motion.div>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.14] text-white/95">
        {titulo}
      </h2>
      {descripcion && (
        <p className="font-body text-white/62 text-sm sm:text-base leading-relaxed mt-3 max-w-2xl mx-auto">
          {descripcion}
        </p>
      )}
    </div>
  )
}

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
    <div className="section-container py-8 sm:py-12 lg:py-16">
      <motion.section
        className="max-w-4xl mx-auto text-center mb-10 sm:mb-14"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeader
          center
          badge="Análisis de colorimetría personal"
          titulo="Descubre los colores que te favorecen"
          descripcion="Analiza tu rostro, identifica tu estación cromática y recibe recomendaciones de color, ropa y estilo alineadas con tu colorimetría."
        />

        <SurfaceCard className="mt-8 sm:mt-10">
          <div className="flex justify-center gap-2.5 sm:gap-3.5 flex-wrap">
            {paletaSwatches.map((color, index) => (
              <motion.div
                key={color}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-[var(--radius-md)] ring-1 ring-white/20"
                style={{ backgroundColor: color }}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.06, duration: 0.32 }}
                whileHover={{ y: -4, scale: 1.05 }}
                aria-hidden
              />
            ))}
          </div>
          <p className="text-[11px] sm:text-xs text-white/42 tracking-[0.12em] uppercase mt-4 sm:mt-5">
            Tu estación revelada al instante
          </p>
        </SurfaceCard>
      </motion.section>

      <motion.section
        className="max-w-xl mx-auto mb-12 sm:mb-16 lg:mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <SurfaceCard>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-center mb-6 text-white/95">
            ¿Cómo te identificas?
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6" role="group" aria-label="Selección de género">
            <ButtonSecondary
              onClick={() => setGeneroSeleccionado('femenino')}
              className={[
                'relative p-4 sm:p-5 rounded-[var(--radius-lg)] border flex flex-col',
                'items-center justify-center gap-2 overflow-hidden',
                generoSeleccionado === 'femenino'
                  ? 'border-pink-400/60 bg-pink-500/18 ring-1 ring-pink-300/30'
                  : 'border-white/18 bg-white/[0.04]',
              ].join(' ')}
              aria-pressed={generoSeleccionado === 'femenino'}
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                style={{
                  background:
                    generoSeleccionado === 'femenino'
                      ? 'linear-gradient(145deg, #f472b6, #d946ef)'
                      : 'rgba(255,255,255,0.08)',
                }}
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
              </div>
              <span className="font-medium text-sm sm:text-base">Femenino</span>
            </ButtonSecondary>

            <ButtonSecondary
              onClick={() => setGeneroSeleccionado('masculino')}
              className={[
                'relative p-4 sm:p-5 rounded-[var(--radius-lg)] border flex flex-col',
                'items-center justify-center gap-2 overflow-hidden',
                generoSeleccionado === 'masculino'
                  ? 'border-blue-400/60 bg-blue-500/18 ring-1 ring-blue-300/30'
                  : 'border-white/18 bg-white/[0.04]',
              ].join(' ')}
              aria-pressed={generoSeleccionado === 'masculino'}
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                style={{
                  background:
                    generoSeleccionado === 'masculino'
                      ? 'linear-gradient(145deg, #60a5fa, #3b82f6)'
                      : 'rgba(255,255,255,0.08)',
                }}
              >
                <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
              </div>
              <span className="font-medium text-sm sm:text-base">Masculino</span>
            </ButtonSecondary>
          </div>

          <ButtonPrimary onClick={() => onIniciar(generoSeleccionado)} className="shimmer-btn">
            <Camera className="w-5 h-5 flex-shrink-0" aria-hidden />
            Comenzar Análisis
            <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden />
          </ButtonPrimary>
        </SurfaceCard>
      </motion.section>

      <motion.section
        className="mb-14 sm:mb-16 lg:mb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-5 sm:mb-7 text-center">
          <SectionHeader
            center
            titulo="Qué analiza ColorMetría"
            descripcion="Un flujo integral para traducir rasgos faciales en recomendaciones prácticas y personalizadas."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {caracteristicas.map((c, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <SurfaceCard className="h-full text-center flex flex-col glass-card--floating">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--radius-md)] flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: `linear-gradient(145deg, ${c.color}44 0%, ${c.color}22 100%)`,
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <c.icono className="w-6 h-6 sm:w-7 sm:h-7 text-white/95" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-white/95">{c.titulo}</h3>
                <p className="text-white/58 text-sm leading-relaxed">{c.descripcion}</p>
              </SurfaceCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mt-14 sm:mt-16 lg:mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
      >
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="section-title inline-block">Las 4 estaciones de color</h2>
          <p className="text-white/50 text-sm sm:text-base font-body mt-2 max-w-md mx-auto leading-relaxed">
            Cada persona pertenece a una estación que define su paleta ideal.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {estaciones.map((estacion, index) => (
            <motion.div
              key={estacion.nombre}
              className="season-badge p-4 sm:p-5 text-center flex flex-col items-center gap-3"
              style={{
                background: `linear-gradient(160deg, ${estacion.gradiente[0]}20 0%, ${estacion.gradiente[1]}15 42%, rgba(20,18,31,0.92) 100%)`,
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.07, duration: 0.4 }}
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-[var(--radius-md)] flex items-center justify-center"
                style={{
                  background: `linear-gradient(145deg, ${estacion.gradiente[0]}44, ${estacion.gradiente[1]}44)`,
                }}
              >
                <estacion.Icono className="w-5 h-5 text-white/90" aria-hidden />
              </div>

              <span className="font-display font-semibold text-sm sm:text-base text-white/95">
                {estacion.nombre}
              </span>

              <div className="flex justify-center gap-2">
                {estacion.colores.map((color, i) => (
                  <div
                    key={i}
                    className="rounded-full border border-white/25"
                    style={{
                      width: '1rem',
                      height: '1rem',
                      backgroundColor: color,
                    }}
                    aria-hidden
                  />
                ))}
              </div>

              <span className="text-xs text-white/55 tracking-wide">{estacion.desc}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

export default PantallaInicio
