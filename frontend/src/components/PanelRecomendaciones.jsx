/**
 * Componente PanelRecomendaciones
 * Muestra recomendaciones de maquillaje y joyería según la estación colorimétrica
 * Usa datos locales — no depende de endpoints de backend adicionales
 */

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Gem,
  Palette,
  Heart,
  Eye,
  CircleDot,
  Lightbulb,
  Ban,
} from 'lucide-react'

// Recomendaciones locales por estación
const RECOMENDACIONES_LOCALES = {
  primavera: {
    maquillaje: {
      labios: [
        { color: '#FF7F50', nombre: 'Coral brillante', desc: 'Tu color estrella para los labios' },
        { color: '#FFCBA4', nombre: 'Melocotón natural', desc: 'Para un look fresco y natural' },
        { color: '#FA8072', nombre: 'Salmón rosado', desc: 'Perfecto para el día a día' },
        { color: '#FF8C00', nombre: 'Naranja cálido', desc: 'Para looks atrevidos de verano' },
      ],
      ojos: [
        { color: '#D4A017', nombre: 'Dorado bronce', desc: 'Realza el color de tus ojos' },
        { color: '#C68642', nombre: 'Caramelo shimmer', desc: 'Para looks cálidos y luminosos' },
        { color: '#8B4513', nombre: 'Marrón cálido', desc: 'Perfecto para el ahumado suave' },
        { color: '#90EE90', nombre: 'Verde menta', desc: 'Para un toque de color único' },
      ],
      mejillas: [
        { color: '#FFB347', nombre: 'Durazno luminoso', desc: 'Tu rubor más favorecedor' },
        { color: '#FF7F50', nombre: 'Coral natural', desc: 'Da vida y calidez al rostro' },
        { color: '#FFDAB9', nombre: 'Bronce suave', desc: 'Para el look sunkissed' },
      ],
      consejos: [
        'Usa bases con subtono dorado o cálido para mejor cobertura',
        'El bronzer en tonos durazno-dorado crea un look irresistible',
        'Un iluminador en tono champagne o dorado es perfecto para ti',
        'Evita los correctores con subtono rosado muy frío',
      ],
    },
    joyeria: {
      metal_ideal: 'Oro amarillo y cobre',
      metal_hex: '#FFD700',
      metal_evitar: 'Plata fría y platino',
      piedrasclave: ['Topacio amarillo', 'Citrino', 'Coral', 'Ámbar', 'Turquesa dorada'],
      estilos: [
        { nombre: 'Aritos dorados', desc: 'Delicados o medianos en oro amarillo', beneficio: 'Enmarcan el rostro con calidez' },
        { nombre: 'Collar de cadena fina', desc: 'Oro amarillo o rosado con colgante', beneficio: 'Alarga y estiliza el cuello' },
        { nombre: 'Pulseras apiladas', desc: 'Mix de oro con elementos naturales', beneficio: 'Estilo boho chic muy favorecedor' },
        { nombre: 'Anillos dorados', desc: 'Simples o con piedras cálidas', beneficio: 'Complementan la piel cálida perfectamente' },
      ],
      consejos: [
        'El oro amarillo y cobrizo son tus aliados — úsalos sin miedo',
        'Las perlas en tono crema o dorado son especialmente elegantes para ti',
        'Prefiere la joyería delicada a las piezas muy voluminosas',
        'El cobre y el bronce añaden un toque artesanal muy favorecedor',
      ],
    },
  },
  verano: {
    maquillaje: {
      labios: [
        { color: '#C9A0A0', nombre: 'Rosa empolvado', desc: 'Tu tono de labios más armónico' },
        { color: '#C48A8A', nombre: 'Mauve suave', desc: 'Elegante y sofisticado' },
        { color: '#B57BA6', nombre: 'Berry frío', desc: 'Para looks de noche románticos' },
        { color: '#E8D5CC', nombre: 'Nude rosado', desc: 'Para el look "no makeup makeup"' },
      ],
      ojos: [
        { color: '#B57EDC', nombre: 'Lavanda', desc: 'Único y muy favorecedor para el verano' },
        { color: '#708090', nombre: 'Gris plateado', desc: 'Ahumado elegante y frío' },
        { color: '#4682B4', nombre: 'Azul pizarra', desc: 'Intensifica la mirada' },
        { color: '#C9A0DC', nombre: 'Lila shimmer', desc: 'Para un look delicado' },
      ],
      mejillas: [
        { color: '#FFB6C1', nombre: 'Rosa pálido', desc: 'Tu rubor más natural y armonioso' },
        { color: '#C9A0A0', nombre: 'Malva suave', desc: 'Añade profundidad sin calor' },
        { color: '#B57BA6', nombre: 'Berry difuminado', desc: 'Para lograr un look fresco y moderno' },
      ],
      consejos: [
        'Usa bases con subtono rosado-frío o neutro para máxima armonía',
        'El iluminador en tono plateado o nacarado es perfecto para ti',
        'Evita el bronzer intenso naranja — usa uno con tono frío-grisáceo',
        'El delineador en navy o gris es mejor que el negro intenso para el día',
      ],
    },
    joyeria: {
      metal_ideal: 'Plata y platino',
      metal_hex: '#C0C0C0',
      metal_evitar: 'Oro amarillo intenso',
      piedrasclave: ['Perla blanca', 'Amatista', 'Aguamarina', 'Zafiro', 'Cuarzo rosa'],
      estilos: [
        { nombre: 'Aretes de plata', desc: 'Delicados en plata o platino', beneficio: 'Harmoniza con tu subtono frío' },
        { nombre: 'Collar de perlas', desc: 'Perlas blancas o rosadas finas', beneficio: 'Ícono de elegancia para el verano' },
        { nombre: 'Brazalete plateado', desc: 'Fino o apilado en plata', beneficio: 'Maximiza elegancia sin calentar' },
        { nombre: 'Anillo de gema', desc: 'Amatista o aguamarina en plata', beneficio: 'Piedras frías que se integran perfectamente' },
      ],
      consejos: [
        'La plata y el platino son tus mejores aliados en joyería',
        'Las perlas blancas o en tono rosado son especialmente favorecedoras',
        'Las piedras en tonos morados, azules suaves y rosas frías se integran naturalmente',
        'Evita el oro amarillo intenso; el oro blanco es una alternativa excelente',
      ],
    },
  },
  otono: {
    maquillaje: {
      labios: [
        { color: '#CC5500', nombre: 'Terracota', desc: 'El labial por excelencia del otoño' },
        { color: '#8B4513', nombre: 'Óxido marrón', desc: 'Para looks profundos y ricos' },
        { color: '#800020', nombre: 'Borgoña cálido', desc: 'Dramático y sofisticado' },
        { color: '#A0522D', nombre: 'Marrón tostado', desc: 'Natural y favorecedor' },
      ],
      ojos: [
        { color: '#B8860B', nombre: 'Bronce antiguo', desc: 'Tu sombra estrella' },
        { color: '#CB6D51', nombre: 'Cobre oxidado', desc: 'Intensidad cálida y única' },
        { color: '#6B8E23', nombre: 'Verde kaki', desc: 'Perfecto para ojos con tonos verdes' },
        { color: '#8B4513', nombre: 'Marrón oscuro', desc: 'Para el ahumado cálido natural' },
      ],
      mejillas: [
        { color: '#FFCBA4', nombre: 'Melocotón intenso', desc: 'Calidez y luminosidad natural' },
        { color: '#CC5500', nombre: 'Terracota suave', desc: 'Complementa el ahumado cálido' },
        { color: '#B8860B', nombre: 'Bronce cálido', desc: 'Para el efecto sunkissed otoñal' },
      ],
      consejos: [
        'Las bases con subtono dorado-cálido realzan tu luminosidad natural',
        'El bronzer en tonos terrosos es absolutamente perfecto para ti',
        'Los iluminadores en tono cobre o bronce dorado son los más favorecedores',
        'Usa el delineador en marrón oscuro para un look natural y armónico',
      ],
    },
    joyeria: {
      metal_ideal: 'Oro antiguo y cobre',
      metal_hex: '#B8860B',
      metal_evitar: 'Plata fría y platino',
      piedrasclave: ['Ámbar', 'Topacio', 'Granate', 'Ojo de tigre', 'Rubí cálido'],
      estilos: [
        { nombre: 'Aretes de cobre', desc: 'Geométricos o artesanales en cobre', beneficio: 'El metal más favorecedor para el otoño' },
        { nombre: 'Collar de ámbar', desc: 'Piezas únicas en ámbar o resina', beneficio: 'Refleja la profundidad del otoño' },
        { nombre: 'Pulseras bohemias', desc: 'Combinación de cuero y metales cálidos', beneficio: 'Estilo natural y terroso' },
        { nombre: 'Anillos de piedra', desc: 'Topacio o granate en oro antiguo', beneficio: 'Las gemas cálidas se integran perfectamente' },
      ],
      consejos: [
        'El oro antiguo y el cobre son tus metales — evita la plata fría pura',
        'Las piedras semipreciosas en tonos cálidos (ámbar, topacio, granate) son perfectas',
        'La joyería artesanal y étnica complementa muy bien la paleta otoñal',
        'Las piezas grandes y llamativas en tonos tierra son muy favorecedoras',
      ],
    },
  },
  invierno: {
    maquillaje: {
      labios: [
        { color: '#CC0000', nombre: 'Rojo intenso', desc: 'Tu color más icónico y poderoso' },
        { color: '#990033', nombre: 'Borgoña frío', desc: 'Dramático y perfectamente frío' },
        { color: '#FF0099', nombre: 'Fucsia vibrante', desc: 'Para looks audaces y modernos' },
        { color: '#1A1A2E', nombre: 'Berry oscuro', desc: 'Ultra-sofisticado para la noche' },
      ],
      ojos: [
        { color: '#1C1C1C', nombre: 'Negro ahumado', desc: 'El ahumado clásico que te favorece' },
        { color: '#003366', nombre: 'Azul carb negro', desc: 'Intenso y fascinante' },
        { color: '#333333', nombre: 'Gris carbón', desc: 'Para ahumados modernos y fríos' },
        { color: '#C0C0C0', nombre: 'Plateado metallic', desc: 'Para un look glamour ícónico' },
      ],
      mejillas: [
        { color: '#FFB6C1', nombre: 'Rosa frío suave', desc: 'Tu rubor más armonioso' },
        { color: '#B57BA6', nombre: 'Berry translúcido', desc: 'Frío y sofisticado' },
        { color: '#FF4466', nombre: 'Frambuesa suave', desc: 'Para un toque de drama natural' },
      ],
      consejos: [
        'Las bases de cobertura alta con subtono frío son ideales para ti',
        'El contorno en tonos grises-fríos esculpe sin calentar el rostro',
        'El iluminador en tono plateado o diamante es tu mejor aliado',
        'Usa el delineador negro en trazo cat-eye para un look ultra poderoso',
      ],
    },
    joyeria: {
      metal_ideal: 'Plata y platino',
      metal_hex: '#E8E8E8',
      metal_evitar: 'Oro amarillo cálido',
      piedrasclave: ['Diamante', 'Zafiro', 'Esmeralda', 'Rubí frío', 'Onix negro'],
      estilos: [
        { nombre: 'Aretes statement', desc: 'Grandes y dramáticos en plata o cristal', beneficio: 'Complementan el alto contraste del invierno' },
        { nombre: 'Collar de plata', desc: 'Cadena gruesa o collar choker', beneficio: 'Moderno y poderoso para tu paleta' },
        { nombre: 'Anillos apilados plata', desc: 'Mix de plata con piedras negras o claras', beneficio: 'Crea visual interest sin contradecir' },
        { nombre: 'Pulsera rígida', desc: 'Bangle en plata o acero inoxidable', beneficio: 'Elegancia geométrica perfecta para el invierno' },
      ],
      consejos: [
        'La plata y el platino son tus metales definitivos — el oro blanco funciona también',
        'Las piedras en tonos azul, negro, blanco y rojo frío son las más armónicas',
        'Las piezas geométricas y estructuradas complementan tu naturaleza de alto contraste',
        'Puedes usar piezas más grandes y dramáticas que cualquier otra estación',
      ],
    },
  },
}

const SECCIONES_BASE = [
  {
    id: 'maquillaje',
    nombre: 'Maquillaje',
    subtitulo: 'Tonos ideales para tu colorimetría',
    Icono: Palette,
    gradiente: 'from-rose-400/90 via-violet-500/80 to-fuchsia-500/70',
  },
  {
    id: 'joyeria',
    nombre: 'Joyería y accesorios',
    subtitulo: 'Metales y piedras para tu estación',
    Icono: Gem,
    gradiente: 'from-amber-400/85 via-amber-600/70 to-[#5c4a3d]/80',
  },
]

function RecommendationSwatchItem({ item, delay = 0 }) {
  return (
    <motion.div
      className="flex items-center gap-3 sm:gap-4 p-3 rounded-[var(--radius-lg)] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12] transition-colors"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 2 }}
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md border border-white/20 flex-shrink-0 ring-1 ring-black/10"
        style={{ backgroundColor: item.color }}
      />
      <div className="min-w-0">
        <p className="font-display text-sm sm:text-[15px] font-medium text-white/95 truncate">{item.nombre}</p>
        <p className="font-body text-white/52 text-xs leading-snug mt-0.5">{item.desc}</p>
      </div>
    </motion.div>
  )
}

function RecommendationTipsBlock({ title, icon: Icon, tips, accent = 'from-[color:var(--accent-start)]/25 to-[color:var(--accent-end)]/15' }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] p-4 sm:p-5 border border-white/[0.1] bg-gradient-to-br ${accent} ring-1 ring-white/[0.06]`}
    >
      <h4 className="font-display text-sm sm:text-base font-semibold mb-3 flex items-center gap-2 text-white/95">
        {Icon && <Icon className="w-4 h-4 text-[color:var(--accent-start)] shrink-0" aria-hidden />}
        {title}
      </h4>
      <ul className="space-y-2.5">
        {tips.map((c, i) => (
          <li key={i} className="font-body text-white/72 text-sm leading-relaxed flex items-start gap-2.5">
            <span className="text-[color:var(--accent-start)] mt-1 flex-shrink-0 opacity-90" aria-hidden>
              ✦
            </span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MaquillajePanel({ datos }) {
  return (
    <RecommendationPanel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
        <div>
          <h4 className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-300/90" aria-hidden /> Labios
          </h4>
          <div className="space-y-2.5">
            {datos.labios.map((item, i) => (
              <RecommendationSwatchItem key={i} item={item} delay={i * 0.06} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-300/90" aria-hidden /> Sombras
          </h4>
          <div className="space-y-2.5">
            {datos.ojos.map((item, i) => (
              <RecommendationSwatchItem key={i} item={item} delay={i * 0.06} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-body text-[11px] uppercase tracking-[0.18em] text-white/45 mb-4 flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-pink-300/90" aria-hidden /> Mejillas
          </h4>
          <div className="space-y-2.5">
            {datos.mejillas.map((item, i) => (
              <RecommendationSwatchItem key={i} item={item} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </div>
      <RecommendationTipsBlock
        title="Consejos profesionales"
        icon={Lightbulb}
        tips={datos.consejos}
        accent="from-rose-500/15 via-transparent to-violet-500/10"
      />
    </RecommendationPanel>
  )
}

function JoyeriaPanel({ datos }) {
  return (
    <RecommendationPanel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-[var(--radius-lg)] p-4 sm:p-5 border border-emerald-500/25 bg-emerald-500/[0.07] ring-1 ring-white/[0.06]">
          <h4 className="font-body text-[11px] uppercase tracking-[0.18em] text-emerald-200/90 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" aria-hidden /> Metal ideal
          </h4>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full border-2 border-white/25 shadow-md ring-1 ring-black/15 flex-shrink-0"
              style={{ backgroundColor: datos.metal_hex }}
            />
            <p className="font-body text-white/88 text-sm sm:text-[15px] leading-snug">{datos.metal_ideal}</p>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] p-4 sm:p-5 border border-red-500/30 bg-red-500/[0.07] ring-1 ring-white/[0.06]">
          <h4 className="font-body text-[11px] uppercase tracking-[0.18em] text-red-200/90 mb-3 flex items-center gap-2">
            <Ban className="w-4 h-4" aria-hidden /> Evitar
          </h4>
          <p className="font-body text-white/65 text-sm leading-relaxed">{datos.metal_evitar}</p>
        </div>
      </div>

      <div className="mb-8 rounded-[var(--radius-lg)] p-4 sm:p-5 border border-violet-500/25 bg-violet-500/[0.06] ring-1 ring-white/[0.06]">
        <h4 className="font-body text-[11px] uppercase tracking-[0.18em] text-violet-200/90 mb-4 flex items-center gap-2">
          <Gem className="w-4 h-4" aria-hidden />
          Piedras recomendadas
        </h4>
        <div className="flex flex-wrap gap-2">
          {datos.piedrasclave.map((p, i) => (
            <motion.span
              key={i}
              className="font-body px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs sm:text-sm text-white/85"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
            >
              {p}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {datos.estilos.map((estilo, i) => (
          <motion.div
            key={i}
            className="p-4 sm:p-5 rounded-[var(--radius-lg)] bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.06] transition-colors ring-1 ring-white/[0.04]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
          >
            <h5 className="font-display text-[15px] sm:text-base font-semibold mb-1.5">{estilo.nombre}</h5>
            <p className="font-body text-white/58 text-sm mb-3 leading-relaxed">{estilo.desc}</p>
            <p className="font-body text-[11px] sm:text-xs text-[color:var(--accent-start)]/95">✓ {estilo.beneficio}</p>
          </motion.div>
        ))}
      </div>

      <RecommendationTipsBlock
        title="Consejos de joyería"
        icon={Lightbulb}
        tips={datos.consejos}
        accent="from-amber-500/12 via-transparent to-[#5c4a3d]/20"
      />
    </RecommendationPanel>
  )
}

function RecommendationPanel({ children }) {
  return <div className="px-1 sm:px-0">{children}</div>
}

function RecommendationAccordion({
  sec,
  expanded,
  onToggle,
  children,
}) {
  const open = expanded === sec.id

  return (
    <motion.div
      className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.08] overflow-hidden"
      layout
    >
      <button
        type="button"
        onClick={() => onToggle(sec.id)}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 min-h-[var(--min-touch,44px)] text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${sec.gradiente} flex items-center justify-center shadow-lg flex-shrink-0 ring-1 ring-white/15`}
          >
            <sec.Icono className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" aria-hidden />
          </div>
          <div className="text-left min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-semibold text-white/95 tracking-tight truncate">
              {sec.nombre}
            </h3>
            <p className="font-body text-white/55 text-xs sm:text-sm mt-0.5 line-clamp-2">{sec.subtitulo}</p>
          </div>
        </div>
        <span className="text-white/45 group-hover:text-white/60 transition-colors shrink-0">
          {open ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 sm:pb-6 pt-0 border-t border-white/[0.08]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PanelRecomendaciones({ resultados, genero }) {
  const mostrarMaquillaje = genero !== 'masculino'

  const seccionesVisibles = useMemo(
    () => (mostrarMaquillaje ? SECCIONES_BASE : SECCIONES_BASE.filter((s) => s.id !== 'maquillaje')),
    [mostrarMaquillaje],
  )

  const [seccionExpandida, setSeccionExpandida] = useState(() =>
    mostrarMaquillaje ? 'maquillaje' : 'joyeria',
  )

  const estacionId = resultados?.estacion?.id || 'verano'
  const rec = RECOMENDACIONES_LOCALES[estacionId] || RECOMENDACIONES_LOCALES.verano

  const toggleSeccion = (id) => setSeccionExpandida((prev) => (prev === id ? null : id))

  return (
    <div className="section-container py-8 md:py-10 border-t border-white/[0.06]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <header className="text-center mb-10 md:mb-12 max-w-2xl mx-auto">
          <p className="font-body text-[11px] sm:text-xs uppercase tracking-[0.22em] text-white/45 mb-3">Suite de estilo</p>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl mb-0 inline-flex flex-wrap items-center justify-center gap-2">
            <Sparkles className="inline w-7 h-7 sm:w-8 sm:h-8 opacity-90 shrink-0" aria-hidden />
            <span>Recomendaciones de belleza</span>
          </h2>
          <p className="font-body text-white/58 text-sm sm:text-base mt-4 leading-relaxed">
            Colores y estilos que complementan tu colorimetría natural
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-5">
          {seccionesVisibles.map((sec) => (
            <RecommendationAccordion
              key={sec.id}
              sec={sec}
              expanded={seccionExpandida}
              onToggle={toggleSeccion}
            >
              {sec.id === 'maquillaje' && <MaquillajePanel datos={rec.maquillaje} />}
              {sec.id === 'joyeria' && <JoyeriaPanel datos={rec.joyeria} />}
            </RecommendationAccordion>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default PanelRecomendaciones
