/**
 * SuitePremium — capa visual de vistas previas (fase 4).
 * No sustituye funcionalidad futura; enlaza a secciones reales del flujo actual.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Shirt, Store, ScanFace, BookOpenCheck, ArrowRight, Sparkles } from 'lucide-react'
import ClosetInteligente from './ClosetInteligente'
import ProbadorVisual from './ProbadorVisual'
import GuiaPremiumPDF from './GuiaPremiumPDF'

const ACCENT_POR_ESTACION = {
  primavera: 'from-amber-400/25 via-orange-400/15 to-pink-400/10',
  verano: 'from-pink-400/25 via-purple-400/15 to-blue-400/10',
  otono: 'from-orange-600/25 via-red-500/15 to-amber-600/10',
  invierno: 'from-blue-500/25 via-indigo-600/15 to-purple-600/10',
}

const ICON_WRAP = {
  primavera: 'from-amber-400/20 to-orange-500/25 border-amber-400/25',
  verano: 'from-purple-400/20 to-pink-500/25 border-purple-400/25',
  otono: 'from-orange-500/20 to-red-500/25 border-orange-400/25',
  invierno: 'from-blue-500/20 to-indigo-600/25 border-blue-400/25',
}

function formatGeneroLabel(genero) {
  if (genero === 'masculino') return 'Perfil masculino'
  if (genero === 'femenino') return 'Perfil femenino'
  return 'Perfil personalizado'
}

function normalizarConfianzaPct(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n) || n <= 0) return null
  const pct = n <= 1 ? n * 100 : n
  return Math.round(Math.min(100, Math.max(0, pct)))
}

function SuitePremium({ resultados, genero }) {
  const estacionId = resultados?.estacion?.id || 'verano'
  const estacionNombre = resultados?.estacion?.nombre || 'Tu estación cromática'
  const confianza = normalizarConfianzaPct(resultados?.estacion?.confianza)

  const fondoBarra = ACCENT_POR_ESTACION[estacionId] || ACCENT_POR_ESTACION.verano
  const iconWrap = ICON_WRAP[estacionId] || ICON_WRAP.verano

  const subtono = resultados?.features?.subtono || 'neutro'
  const contraste = resultados?.features?.contraste || 'medio'

  const contextoLinea = useMemo(() => {
    const bits = [formatGeneroLabel(genero), estacionNombre]
    if (confianza != null) bits.push(`Confianza del análisis ~${confianza}%`)
    return bits.join(' · ')
  }, [genero, estacionNombre, confianza])

  const bloques = [
    {
      key: 'closet',
      titulo: 'Clóset inteligente',
      icono: Shirt,
      cuerpo:
        'Vista previa: organiza decisiones alrededor de tu estación. Hoy puedes explorar looks compatibles en la galería de outfits (contenido local para demo).',
      cta: 'Ir a la galería de looks',
      href: '#seccion-galeria-outfits',
    },
    {
      key: 'tienda',
      titulo: 'Tienda recomendada',
      icono: Store,
      cuerpo:
        'Vista previa de compra con criterio: maquillaje y joyería alineados a tu paleta, con datos locales (sin checkout ni catálogo externo).',
      cta: 'Ver recomendaciones',
      href: '#seccion-recomendaciones',
    },
    {
      key: 'probador',
      titulo: 'Probador / avatar',
      icono: ScanFace,
      cuerpo:
        'Prueba estilos y tonos de cabello con tu imagen de referencia; la cámara es opcional. Próxima iteración unificará vista y avatar en un solo flujo.',
      cta: 'Abrir probador de cabello',
      href: '#seccion-probador-cabello',
    },
    {
      key: 'guia',
      titulo: 'Guía premium',
      icono: BookOpenCheck,
      cuerpo:
        'Tu guía cromática completa vive en el diagnóstico: paleta, métricas y consejos según el análisis actual.',
      cta: 'Ir al diagnóstico completo',
      href: '#seccion-resultados-analisis',
    },
  ]

  return (
    <div className="section-container pt-4 pb-8 md:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto"
      >
        <header className="text-center mb-8 md:mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Roadmap · Suite premium</p>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl inline-flex flex-wrap items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white/80 shrink-0" aria-hidden />
            <span>Experiencias en evolución</span>
          </h2>
          <p className="font-body text-white/58 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Previsualiza módulos futuros sin prometer integraciones que aún no existen. Lo disponible hoy enlaza a las secciones reales de tu sesión.
          </p>
          <div
            className={`mt-5 h-px max-w-md mx-auto rounded-full bg-gradient-to-r ${fondoBarra} opacity-90`}
            aria-hidden
          />
          <p className="font-body text-xs text-white/45 mt-4 tracking-wide">{contextoLinea}</p>
          <p className="font-body text-xs text-white/38 mt-1">
            Señales actuales: subtono {subtono.toLowerCase()}, contraste {contraste.toLowerCase()}.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {bloques.map((b, i) => (
            <motion.article
              key={b.key}
              id={`suite-${b.key}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] flex flex-col p-5 sm:p-6 min-h-[200px] scroll-mt-24"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${iconWrap} border shadow-[0_8px_24px_rgba(0,0,0,0.25)]`}
                >
                  <b.icono className="w-5 h-5 text-white/90" aria-hidden />
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/10 text-white/55">
                  Vista previa
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl text-white/95 tracking-tight mb-2">{b.titulo}</h3>
              <p className="font-body text-sm text-white/65 leading-relaxed flex-1">{b.cuerpo}</p>
              <a
                href={b.href}
                className="mt-5 inline-flex items-center justify-center gap-2 min-h-[var(--min-touch,44px)] rounded-xl border border-white/[0.14] bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-white/90 text-sm font-medium px-4"
              >
                {b.cta}
                <ArrowRight className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
              </a>
            </motion.article>
          ))}
        </div>

        <section className="mt-8 md:mt-10 space-y-4">
          <ClosetInteligente genero={genero} estacion={estacionId} />
          <ProbadorVisual genero={genero} estacion={estacionId} />
          <GuiaPremiumPDF resultados={resultados} genero={genero} />
          <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] p-5 sm:p-6">
            <h3 className="font-display text-lg sm:text-xl mb-2">Recomendaciones faciales avanzadas (próximamente)</h3>
            <p className="font-body text-white/62 text-sm leading-relaxed mb-3">
              Esta sección prepara el roadmap premium sin simular detección no implementada.
            </p>
            <ul className="text-sm text-white/75 space-y-1.5">
              <li>- Estructura facial: pómulos, frente, distancia entre ojos y simetría.</li>
              <li>- Guía de armonía para contour, highlight y sombreado.</li>
              <li>- Recomendaciones de maquillaje por geometría facial (cuando exista soporte de visión).</li>
            </ul>
          </div>
        </section>
      </motion.div>
    </div>
  )
}

export default SuitePremium
