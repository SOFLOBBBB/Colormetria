/**
 * Componente PanelRecomendaciones
 * Muestra recomendaciones de maquillaje y joyería según la estación colorimétrica
 * Usa datos locales — no depende de endpoints de backend adicionales
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, ChevronUp, Gem, Palette, Heart, Eye, CircleDot, Lightbulb, Ban } from 'lucide-react'

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
      ]
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
      ]
    }
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
      ]
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
      ]
    }
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
      ]
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
      ]
    }
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
      ]
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
      ]
    }
  }
}

function PanelRecomendaciones({ resultados, genero }) {
  const [seccionExpandida, setSeccionExpandida] = useState('maquillaje')

  const estacionId = resultados?.estacion?.id || 'verano'
  const rec = RECOMENDACIONES_LOCALES[estacionId] || RECOMENDACIONES_LOCALES.verano

  const toggleSeccion = (s) => setSeccionExpandida(seccionExpandida === s ? null : s)

  const SECCIONES = [
    {
      id: 'maquillaje',
      nombre: 'Maquillaje',
      subtitulo: 'Tonos ideales para tu colorimetría',
      Icono: Palette,
      gradiente: 'from-rose-500 to-pink-500',
    },
    {
      id: 'joyeria',
      nombre: 'Joyería y accesorios',
      subtitulo: 'Metales y piedras para tu estación',
      Icono: Gem,
      gradiente: 'from-amber-500 to-yellow-500',
    }
  ]

  return (
    <div className="section-container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h2 className="section-title">
            <Sparkles className="inline-block w-8 h-8 mr-2" />
            Recomendaciones de Belleza
          </h2>
          <p className="text-white/60">Colores y estilos que complementan tu colorimetría natural</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {SECCIONES.map((sec) => (
            <motion.div key={sec.id} className="glass-card" layout>
              <button
                type="button"
                onClick={() => toggleSeccion(sec.id)}
                className="w-full flex items-center justify-between p-3 min-h-[var(--min-touch,44px)] text-left"
                aria-expanded={seccionExpandida === sec.id}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${sec.gradiente} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <sec.Icono className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-xl font-semibold">{sec.nombre}</h3>
                    <p className="text-white/60 text-sm">{sec.subtitulo}</p>
                  </div>
                </div>
                {seccionExpandida === sec.id
                  ? <ChevronUp className="w-6 h-6 text-white/50" />
                  : <ChevronDown className="w-6 h-6 text-white/50" />
                }
              </button>

              <AnimatePresence>
                {seccionExpandida === sec.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t border-white/10 mt-4">
                      {sec.id === 'maquillaje' && (
                        <MaquillajePanel datos={rec.maquillaje} />
                      )}
                      {sec.id === 'joyeria' && (
                        <JoeriaPanel datos={rec.joyeria} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function MaquillajePanel({ datos }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Labios */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-rose-300">
            <Heart className="w-4 h-4" aria-hidden /> Labios
          </h4>
          <div className="space-y-3">
            {datos.labios.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-full shadow-md border border-white/20 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium">{item.nombre}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ojos */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-purple-300">
            <Eye className="w-4 h-4" aria-hidden /> Sombras
          </h4>
          <div className="space-y-3">
            {datos.ojos.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-full shadow-md border border-white/20 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium">{item.nombre}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mejillas */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-pink-300">
            <CircleDot className="w-4 h-4" aria-hidden /> Mejillas
          </h4>
          <div className="space-y-3">
            {datos.mejillas.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-full shadow-md border border-white/20 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium">{item.nombre}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Consejos */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4" aria-hidden /> Consejos profesionales
        </h4>
        <ul className="space-y-1.5">
          {datos.consejos.map((c, i) => (
            <li key={i} className="text-white/70 text-sm flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 flex-shrink-0">✦</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function JoeriaPanel({ datos }) {
  return (
    <div>
      {/* Metal ideal */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" aria-hidden /> Metal ideal
          </h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md" style={{ backgroundColor: datos.metal_hex }} />
            <p className="text-white/80 font-medium">{datos.metal_ideal}</p>
          </div>
        </div>
        <div className="flex-1 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
            <Ban className="w-4 h-4" aria-hidden /> Evitar
          </h4>
          <p className="text-white/60 text-sm">{datos.metal_evitar}</p>
        </div>
      </div>

      {/* Piedras */}
      <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <Gem className="w-4 h-4" />
          Piedras Recomendadas
        </h4>
        <div className="flex flex-wrap gap-2">
          {datos.piedrasclave.map((p, i) => (
            <motion.span
              key={i}
              className="px-3 py-1 rounded-full bg-white/10 text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05 }}
            >
              {p}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Estilos de joyería */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {datos.estilos.map((estilo, i) => (
          <motion.div
            key={i}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <h5 className="font-medium mb-1">{estilo.nombre}</h5>
            <p className="text-white/60 text-sm mb-2">{estilo.desc}</p>
            <p className="text-amber-300 text-xs">✓ {estilo.beneficio}</p>
          </motion.div>
        ))}
      </div>

      {/* Consejos */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4" aria-hidden /> Consejos de joyería
        </h4>
        <ul className="space-y-1.5">
          {datos.consejos.map((c, i) => (
            <li key={i} className="text-white/70 text-sm flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">✦</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PanelRecomendaciones
