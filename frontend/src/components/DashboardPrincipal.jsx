import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Shirt,
  Wand2,
  Store,
  BookOpenText,
  Trophy,
  Gem,
  Target,
  Gauge,
  CheckCircle2,
} from 'lucide-react'

const ESTILOS_ESTACION = {
  primavera: {
    gradiente: 'from-amber-400 via-orange-400 to-pink-400',
    fondo: 'from-amber-500/20 to-orange-500/20',
    borde: 'border-amber-400/40',
    acento: 'text-amber-200',
  },
  verano: {
    gradiente: 'from-pink-300 via-purple-400 to-blue-400',
    fondo: 'from-purple-500/20 to-pink-500/20',
    borde: 'border-purple-400/40',
    acento: 'text-purple-200',
  },
  otono: {
    gradiente: 'from-orange-600 via-red-500 to-amber-600',
    fondo: 'from-orange-500/20 to-red-500/20',
    borde: 'border-orange-400/40',
    acento: 'text-orange-200',
  },
  invierno: {
    gradiente: 'from-blue-500 via-indigo-600 to-purple-600',
    fondo: 'from-blue-500/20 to-indigo-500/20',
    borde: 'border-blue-400/40',
    acento: 'text-blue-200',
  },
}

function formatGeneroLabel(genero) {
  if (genero === 'masculino') return 'Perfil masculino'
  if (genero === 'femenino') return 'Perfil femenino'
  return 'Perfil personalizado'
}

/** Anclas a secciones reales del flujo de resultados (sin routing). */
const ANCHOR_ACCESO = {
  guia: 'suite-guia',
  closet: 'suite-closet',
  probador: 'suite-probador',
  tienda: 'suite-tienda',
}

function scrollToId(id) {
  if (!id) return
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function calcularProgresoEstilo(resultados) {
  const estacionOk = Boolean(resultados?.estacion?.id)
  const subtonoOk = Boolean(resultados?.features?.subtono)
  const contrasteOk = Boolean(resultados?.features?.contraste)
  const confianza = Number(resultados?.estacion?.confianza || 0)
  const confianzaOk = confianza > 0
  const caracteristicasOk = Array.isArray(resultados?.estacion?.caracteristicas) && resultados.estacion.caracteristicas.length > 0

  const completados = [estacionOk, subtonoOk, contrasteOk, confianzaOk, caracteristicasOk].filter(Boolean).length
  return Math.round((completados / 5) * 100)
}

function normalizarConfianzaPct(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n) || n <= 0) return 0
  const pct = n <= 1 ? n * 100 : n
  return Math.round(Math.min(100, Math.max(0, pct)))
}

function DashboardHeroEstacion({ estacionLabel, descripcion, subtono, contraste, intensidad, progreso, estilo, onGoGuide, onGoNuevo }) {
  return (
    <section className={`glass-card glass-card--elevated ring-1 ring-white/[0.08] border ${estilo.borde} bg-gradient-to-br ${estilo.fondo}`}>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-white/50 mb-3">Centro de control personal</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white/95 mb-3">
            {estacionLabel}
          </h2>
          <p className="font-body text-white/70 leading-relaxed text-sm sm:text-base">{descripcion}</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="px-3 py-1.5 rounded-full text-xs bg-white/[0.08] border border-white/[0.12] text-white/85">
              Subtono: <strong className="font-medium capitalize">{subtono}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs bg-white/[0.08] border border-white/[0.12] text-white/85">
              Contraste: <strong className="font-medium capitalize">{contraste}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs bg-white/[0.08] border border-white/[0.12] text-white/85">
              Intensidad: <strong className="font-medium capitalize">{intensidad}</strong>
            </span>
          </div>
        </div>

        <div className="w-full lg:w-[20rem] space-y-3">
          <button
            type="button"
            onClick={onGoGuide}
            className={`w-full min-h-[var(--min-touch,44px)] rounded-xl bg-gradient-to-r ${estilo.gradiente} text-white font-semibold px-4 py-3 flex items-center justify-center gap-2 shadow-lg`}
          >
            Ver guía personalizada
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onGoNuevo}
            className="w-full min-h-[var(--min-touch,44px)] rounded-xl border border-white/[0.14] bg-white/[0.05] hover:bg-white/[0.08] transition-colors text-white/90 px-4 py-3 flex items-center justify-center gap-2"
          >
            Ir al inicio del análisis
            <RotateCcw className="w-4 h-4" aria-hidden />
          </button>
          <p className="text-xs text-white/50 text-center">Tu perfil cromático avanza: {progreso}%</p>
        </div>
      </div>
    </section>
  )
}

function DashboardProgressCard({ progreso }) {
  return (
    <section className="glass-card glass-card--elevated ring-1 ring-white/[0.08]">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="font-display text-lg text-white/95">Progreso de estilo</h3>
        <span className="text-sm font-semibold text-white">{progreso}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="text-sm text-white/60 mt-3 leading-relaxed">
        Tu perfil cromático está bien encaminado. Conecta esta guía con decisiones reales de compra y combinación para pulir tu estilo.
      </p>
    </section>
  )
}

function DashboardQuickAccessGrid({ active, onSelect }) {
  const items = [
    { id: 'closet', label: 'Clóset', desc: 'Inspiración de looks por estación', icon: Shirt },
    { id: 'probador', label: 'Probador', desc: 'Cabello y referencia visual', icon: Wand2 },
    { id: 'tienda', label: 'Tienda', desc: 'Recomendaciones locales de belleza', icon: Store },
    { id: 'guia', label: 'Guía', desc: 'Diagnóstico y paleta completos', icon: BookOpenText },
  ]

  return (
    <section className="glass-card glass-card--elevated ring-1 ring-white/[0.08]">
      <h3 className="font-display text-lg text-white/95 mb-4">Accesos rápidos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`text-left rounded-xl border p-4 min-h-[var(--min-touch,44px)] transition-all ${
              active === item.id
                ? 'bg-white/[0.12] border-white/25 ring-1 ring-white/15'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4 text-white/80" aria-hidden />
              <p className="font-medium text-white/95 text-sm">{item.label}</p>
            </div>
            <p className="text-xs text-white/58 leading-relaxed">{item.desc}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

function DashboardInsightList({ insights }) {
  return (
    <section className="glass-card glass-card--elevated ring-1 ring-white/[0.08]">
      <h3 className="font-display text-lg text-white/95 mb-4">Resumen personalizado</h3>
      <ul className="space-y-3">
        {insights.map((insight, idx) => (
          <li key={idx} className="text-sm text-white/78 flex items-start gap-2 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-300 flex-shrink-0" aria-hidden />
            {insight}
          </li>
        ))}
      </ul>
    </section>
  )
}

function DashboardAchievements({ progreso, estacionLabel }) {
  const achievements = [
    { id: 'season', label: 'Estación detectada', icon: Trophy, unlocked: Boolean(estacionLabel) },
    { id: 'progress', label: 'Perfil encaminado', icon: Gauge, unlocked: progreso >= 60 },
    { id: 'premium', label: 'Ruta premium activa', icon: Gem, unlocked: progreso >= 80 },
  ]

  return (
    <section className="glass-card glass-card--elevated ring-1 ring-white/[0.08]">
      <h3 className="font-display text-lg text-white/95 mb-3">Hitos del perfil</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 border text-xs transition-colors ${
              a.unlocked
                ? 'border-emerald-400/30 bg-emerald-500/[0.08] text-emerald-200'
                : 'border-white/[0.08] bg-white/[0.03] text-white/40'
            }`}
          >
            <a.icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {a.label}
          </div>
        ))}
      </div>
      <p className="text-xs text-white/45 mt-3">Perfil cromático completo al {progreso}%.</p>
    </section>
  )
}

function DashboardPrincipal({ resultados, genero }) {
  const [accesoActivo, setAccesoActivo] = useState('guia')

  const estacionId = resultados?.estacion?.id || 'verano'
  const estilo = ESTILOS_ESTACION[estacionId] || ESTILOS_ESTACION.verano
  const progreso = useMemo(() => calcularProgresoEstilo(resultados), [resultados])

  const estacionLabel = resultados?.estacion?.nombre || 'Estación cromática'
  const descripcion = resultados?.estacion?.descripcion || 'Tu centro de control personal de estilo está listo para acompañar cada decisión con criterio estético.'
  const subtono = resultados?.features?.subtono || 'neutro'
  const contraste = resultados?.features?.contraste || 'medio'
  const intensidad = resultados?.features?.intensidad || (progreso >= 80 ? 'alta' : 'media')
  const confianza = normalizarConfianzaPct(resultados?.estacion?.confianza)

  const insights = [
    `Tu estación dominante es ${estacionLabel.toLowerCase()} y el análisis proyecta una confianza cercana al ${confianza || 0}%.`,
    `La combinación ${subtono.toLowerCase()} + contraste ${contraste.toLowerCase()} marca la dirección estética de tus mejores looks.`,
    `${formatGeneroLabel(genero)}: prioriza piezas clave en esta paleta para construir una firma visual coherente.`,
  ]

  const proximoPaso =
    accesoActivo === 'guia'
      ? 'Explora la guía y traduce tu análisis en decisiones concretas de compra y combinación.'
      : accesoActivo === 'closet'
        ? 'Empieza por clasificar tus prendas base en el clóset y detecta huecos por color.'
        : accesoActivo === 'probador'
          ? 'Prueba dos o tres combinaciones antes de comprar para validar contraste e intensidad.'
          : 'Crea una wishlist por estación y filtra primero por tonos compatibles.'

  return (
    <div className="section-container py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <header className="text-center mb-5 md:mb-6">
          <p className="font-body text-[10px] uppercase tracking-[0.24em] text-white/40 mb-1.5">Fashion-tech con IA</p>
          <h1 className="section-title text-2xl sm:text-3xl md:text-4xl inline-flex items-center gap-2 mb-0">
            <Sparkles className={`w-5 h-5 ${estilo.acento}`} aria-hidden />
            Atelier de Estilo Personal
          </h1>
        </header>

        <div className="max-w-5xl mx-auto space-y-4">
          <DashboardHeroEstacion
            estacionLabel={estacionLabel}
            descripcion={descripcion}
            subtono={subtono}
            contraste={contraste}
            intensidad={intensidad}
            progreso={progreso}
            estilo={estilo}
            onGoGuide={() => {
              setAccesoActivo('guia')
              scrollToId('seccion-resultados-analisis')
            }}
            onGoNuevo={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardProgressCard progreso={progreso} />
            <DashboardQuickAccessGrid
              active={accesoActivo}
              onSelect={(id) => {
                setAccesoActivo(id)
                scrollToId(ANCHOR_ACCESO[id])
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardInsightList insights={insights} />
            <DashboardAchievements progreso={progreso} estacionLabel={estacionLabel} />
          </div>

          <section className="glass-card glass-card--elevated ring-1 ring-white/[0.06] bg-gradient-to-r from-white/[0.04] to-white/[0.02]">
            <div className="flex items-start gap-3">
              <Target className="w-4 h-4 mt-0.5 text-cyan-300 shrink-0" aria-hidden />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">Próximo paso</p>
                <p className="text-sm text-white/70 leading-relaxed">{proximoPaso}</p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardPrincipal
