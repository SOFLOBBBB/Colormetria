import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { getClosetOutfits } from '../utils/storageCloset'
import { getBaseRecomendaciones, getLooksEditoriales } from '../data/recomendacionesEstilo'

const DESCRIPCION_ESTACION = {
  primavera: 'Tu energía cromática es cálida, luminosa y fresca. Te favorecen combinaciones vivas con base clara.',
  verano: 'Tu armonía es fría y suave. Funcionan mejor paletas empolvadas, elegantes y de bajo contraste.',
  otono: 'Tu profundidad se potencia con tonos terrosos, ricos y cálidos. Las texturas orgánicas elevan tu presencia.',
  invierno: 'Tu firma visual es intensa y contrastada. Colores nítidos y fríos proyectan sofisticación inmediata.',
}

const PALETA_EXTENDIDA = {
  primavera: {
    favorecen: [
      { nombre: 'Coral brillante', hex: '#FF7F50' },
      { nombre: 'Durazno suave', hex: '#FFCBA4' },
      { nombre: 'Menta cálida', hex: '#9EE7CF' },
      { nombre: 'Amarillo cálido', hex: '#FFD86E' },
    ],
    neutros: [
      { nombre: 'Marfil', hex: '#FFF9EF' },
      { nombre: 'Beige mantequilla', hex: '#EFE0C8' },
      { nombre: 'Camel suave', hex: '#CFAF85' },
    ],
    evitar: [
      { nombre: 'Negro absoluto', hex: '#101010' },
      { nombre: 'Gris humo frío', hex: '#7F8791' },
      { nombre: 'Borgoña frío', hex: '#5E1930' },
    ],
  },
  verano: {
    favorecen: [
      { nombre: 'Lavanda humo', hex: '#CBB9E6' },
      { nombre: 'Rosa polvo', hex: '#CFABB8' },
      { nombre: 'Azul bruma', hex: '#9CB7CF' },
      { nombre: 'Malva gris', hex: '#A98DA0' },
    ],
    neutros: [
      { nombre: 'Perla', hex: '#F4F0EE' },
      { nombre: 'Topo frío', hex: '#B8AEA8' },
      { nombre: 'Gris paloma', hex: '#B9C0C8' },
    ],
    evitar: [
      { nombre: 'Naranja puro', hex: '#EF6A2E' },
      { nombre: 'Mostaza', hex: '#C4981E' },
      { nombre: 'Oliva cálido', hex: '#6F6A3B' },
    ],
  },
  otono: {
    favorecen: [
      { nombre: 'Terracota', hex: '#B95E3E' },
      { nombre: 'Oliva profundo', hex: '#687047' },
      { nombre: 'Canela', hex: '#A75A3A' },
      { nombre: 'Mostaza tostado', hex: '#B9912E' },
    ],
    neutros: [
      { nombre: 'Marfil cálido', hex: '#F5EBDD' },
      { nombre: 'Camel', hex: '#C89A6C' },
      { nombre: 'Café cocoa', hex: '#5B3C2E' },
    ],
    evitar: [
      { nombre: 'Fucsia frío', hex: '#C91A8D' },
      { nombre: 'Azul eléctrico', hex: '#265BDE' },
      { nombre: 'Plata brillante', hex: '#C9CED4' },
    ],
  },
  invierno: {
    favorecen: [
      { nombre: 'Rojo cereza frío', hex: '#BE1E3C' },
      { nombre: 'Azul cobalto', hex: '#2F55D4' },
      { nombre: 'Esmeralda', hex: '#126C52' },
      { nombre: 'Fucsia frío', hex: '#BE2D8A' },
    ],
    neutros: [
      { nombre: 'Negro tinta', hex: '#101114' },
      { nombre: 'Blanco nítido', hex: '#FAFAFA' },
      { nombre: 'Gris carbón', hex: '#3A3E46' },
    ],
    evitar: [
      { nombre: 'Durazno cálido', hex: '#E9B491' },
      { nombre: 'Camel dorado', hex: '#C49A66' },
      { nombre: 'Naranja quemado', hex: '#B75A2B' },
    ],
  },
}

const JOYERIA_GENERO = {
  femenino: {
    aretes: ['Aros grandes pulidos', 'Perlas pequeñas', 'Gotas largas', 'Geométricos limpios', 'Studs minimalistas'],
    collares: ['Cadena fina en capas', 'Colgante focal a clavícula', 'Choker sutil según contraste'],
    accesorios: ['Bolsa estructurada o blanda según ocasión', 'Cinturón en neutro base', 'Lentes con montura armónica'],
  },
  masculino: {
    aretes: [],
    collares: [],
    accesorios: ['Reloj metálico o de piel', 'Lentes de línea limpia', 'Cinturones en cuero sobrio', 'Corbatas de acento', 'Gorras para casual'],
  },
}

const METALES = {
  primavera: 'Oro amarillo y oro rosado suave',
  verano: 'Plata, platino y oro blanco',
  otono: 'Oro viejo, bronce y cobre',
  invierno: 'Plata pulida y acero oscuro',
}

const CABELLO = {
  primavera: {
    sugeridos: ['miel dorado', 'caramelo', 'cobrizo suave'],
    evitar: ['ceniza frío', 'negro azulado'],
    acabados: ['brillo natural', 'ondas ligeras', 'movimiento aireado'],
  },
  verano: {
    sugeridos: ['ceniza suave', 'chocolate frío', 'rubio beige frío'],
    evitar: ['dorado intenso', 'cobrizo brillante'],
    acabados: ['satín suave', 'textura controlada', 'volumen delicado'],
  },
  otono: {
    sugeridos: ['auburn', 'caoba', 'marrón cálido'],
    evitar: ['platino helado', 'negro azulado'],
    acabados: ['textura rica', 'ondas definidas', 'acabado mate cálido'],
  },
  invierno: {
    sugeridos: ['negro azulado', 'café espresso frío', 'platino helado'],
    evitar: ['miel cálido', 'cobre intenso'],
    acabados: ['pulido espejo', 'líneas estructuradas', 'contraste alto'],
  },
}

const ARMARIO_ESENCIAL = {
  femenino: [
    'Blazer estructurado',
    'Blusa protagonista',
    'Top neutro premium',
    'Pantalón sastre',
    'Jeans recto oscuro',
    'Vestido/falda de impacto',
    'Zapato formal',
    'Zapato casual',
    'Bolsa versátil',
    'Joyería firma',
  ],
  masculino: [
    'Camisa formal blanca o azul',
    'Polo/playera premium',
    'Blazer versátil',
    'Pantalón de vestir',
    'Jeans oscuro limpio',
    'Bermuda bien estructurada',
    'Zapato formal',
    'Sneaker minimalista',
    'Reloj de firma',
    'Lentes y cinturón base',
  ],
}

const MAQUILLAJE_EDITORIAL = {
  primavera: {
    labios: 'coral cálido, durazno brillante',
    ojos: 'dorado suave, marrón miel',
    mejillas: 'rubor melocotón',
    iluminador: 'champagne cálido',
  },
  verano: {
    labios: 'rosa polvo, malva suave',
    ojos: 'taupe frío, lavanda',
    mejillas: 'rosa frío translúcido',
    iluminador: 'perla fría',
  },
  otono: {
    labios: 'terracota, canela',
    ojos: 'bronce, oliva profundo',
    mejillas: 'durazno tostado',
    iluminador: 'oro viejo',
  },
  invierno: {
    labios: 'rojo frío, berry profundo',
    ojos: 'gris carbón, azul noche',
    mejillas: 'rosa frambuesa fría',
    iluminador: 'plata',
  },
}

const GROOMING_EDITORIAL = {
  primavera: ['Barba corta limpia', 'Peinado con textura ligera', 'Acentos casuales con gorra y lentes cálidos'],
  verano: ['Afeitado prolijo o barba muy controlada', 'Cabello de acabado natural', 'Formal/casual en contraste medio'],
  otono: ['Barba definida con volumen medio', 'Peinado mate texturizado', 'Accesorios cuero cálido y reloj sobrio'],
  invierno: ['Líneas de barba precisas o afeitado pulido', 'Peinado estructurado', 'Contraste alto en formal/casual'],
}

function formatDate(date) {
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Section({ title, children, pageBreak = false }) {
  return (
    <section className={`pdf-section ${pageBreak ? 'pdf-page-break-before' : ''}`}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ColorRow({ title, items }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="chip-grid">
        {items.map((item) => (
          <div key={item.nombre} className="color-chip">
            <span className="swatch" style={{ background: item.hex }} />
            <div>
              <p className="chip-title">{item.nombre}</p>
              <p className="chip-sub">{item.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GuiaPremiumPDF({ resultados, genero }) {
  const estacion = resultados?.estacion?.id || 'verano'
  const base = getBaseRecomendaciones(estacion, genero)
  const paleta = PALETA_EXTENDIDA[estacion] || PALETA_EXTENDIDA.verano
  const looksEditoriales = useMemo(() => getLooksEditoriales(estacion, genero), [estacion, genero])
  const [outfitsGuardados, setOutfitsGuardados] = useState(() => getClosetOutfits().slice(0, 3))
  const [expandida, setExpandida] = useState(false)
  const generoId = genero === 'masculino' ? 'masculino' : 'femenino'
  const usuario = 'Cliente ColorMetría'
  const hoy = formatDate(new Date())
  const confianza = Math.round((resultados?.estacion?.confianza || 0) * 100)
  const subtono = resultados?.features?.subtono || 'N/D'
  const contraste = resultados?.features?.contraste || 'N/D'
  const chroma = resultados?.features?.croma || resultados?.features?.chroma || 'No disponible'

  useEffect(() => {
    const refresh = () => setOutfitsGuardados(getClosetOutfits().slice(0, 3))
    window.addEventListener('closet-updated', refresh)
    return () => window.removeEventListener('closet-updated', refresh)
  }, [])

  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="glass-card glass-card--elevated ring-1 ring-white/[0.08] border border-white/[0.1] p-5 sm:p-6 guia-pdf-wrap">
      <style>{`
        /* ── Screen: editorial preview card ── */
        .guia-pdf-wrap .pdf-guide {
          background: linear-gradient(160deg, #f5f0e9 0%, #f0ebe1 50%, #e9e2d8 100%);
          color: #1a1310;
          border-radius: 16px;
          border: 1px solid rgba(95, 71, 51, 0.14);
          padding: 28px 30px;
          font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
          font-size: 0.875rem;
          line-height: 1.65;
        }
        .guia-pdf-wrap .pdf-cover h1,
        .guia-pdf-wrap .pdf-section h2,
        .guia-pdf-wrap .look-card h4 {
          font-family: 'Playfair Display', 'Times New Roman', Georgia, serif;
          letter-spacing: -0.01em;
        }
        .guia-pdf-wrap .pdf-cover {
          padding: 0 0 28px;
          border-bottom: 1px solid rgba(61, 45, 30, 0.16);
          margin-bottom: 26px;
        }
        .guia-pdf-wrap .pdf-cover h1 {
          font-size: 2.15rem;
          line-height: 1.1;
          margin: 6px 0 10px;
          color: #1a1310;
        }
        .guia-pdf-wrap .pdf-kicker {
          text-transform: uppercase;
          letter-spacing: 0.24em;
          font-size: 0.65rem;
          color: rgba(49, 35, 23, 0.6);
          font-family: 'Montserrat', sans-serif;
        }
        .guia-pdf-wrap .pdf-tagline {
          font-size: 0.88rem;
          color: rgba(43, 31, 22, 0.72);
          max-width: 500px;
          line-height: 1.55;
          margin-bottom: 14px;
        }
        .guia-pdf-wrap .pdf-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px 16px;
          margin-top: 12px;
          font-size: 0.82rem;
          color: rgba(43, 31, 22, 0.82);
          background: rgba(255, 252, 246, 0.5);
          border: 1px solid rgba(73, 56, 41, 0.1);
          border-radius: 10px;
          padding: 10px 14px;
        }
        .guia-pdf-wrap .pdf-section {
          margin-bottom: 22px;
          break-inside: avoid;
        }
        .guia-pdf-wrap .pdf-section h2 {
          font-size: 1.35rem;
          margin: 0 0 14px;
          color: #1a1310;
          border-bottom: 1px solid rgba(59, 42, 28, 0.15);
          padding-bottom: 7px;
        }
        .guia-pdf-wrap .pdf-section h3 {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 0 0 8px;
          color: rgba(46, 33, 23, 0.6);
          font-family: 'Montserrat', sans-serif;
        }
        .guia-pdf-wrap .chip-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        .guia-pdf-wrap .color-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 251, 245, 0.7);
          border: 1px solid rgba(73, 56, 41, 0.13);
          border-radius: 9px;
          padding: 8px 10px;
          break-inside: avoid;
        }
        .guia-pdf-wrap .swatch {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid rgba(30, 23, 18, 0.22);
          flex-shrink: 0;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .guia-pdf-wrap .chip-title {
          margin: 0;
          font-weight: 600;
          font-size: 0.85rem;
          color: #1a1310;
        }
        .guia-pdf-wrap .chip-sub {
          margin: 0;
          font-size: 0.72rem;
          color: rgba(45, 34, 25, 0.6);
          font-family: 'Montserrat', sans-serif;
        }
        .guia-pdf-wrap .editorial-box {
          background: rgba(255, 252, 247, 0.55);
          border: 1px solid rgba(73, 56, 41, 0.12);
          border-radius: 9px;
          padding: 11px 13px;
          margin-bottom: 9px;
          break-inside: avoid;
        }
        .guia-pdf-wrap .editorial-box ul {
          margin: 7px 0 0;
          padding-left: 16px;
        }
        .guia-pdf-wrap .editorial-box li {
          margin-bottom: 3px;
          color: rgba(43, 31, 22, 0.88);
        }
        .guia-pdf-wrap .look-card {
          border: 1px solid rgba(73, 56, 41, 0.14);
          border-radius: 10px;
          padding: 13px 14px;
          background: rgba(255, 252, 246, 0.65);
          margin-bottom: 10px;
          break-inside: avoid;
        }
        .guia-pdf-wrap .look-card h4 {
          margin: 0 0 7px;
          font-size: 1.05rem;
          color: #1a1310;
        }
        .guia-pdf-wrap .pdf-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .guia-pdf-wrap .pdf-small {
          font-size: 0.845rem;
          line-height: 1.6;
          color: rgba(43, 31, 22, 0.88);
          margin-bottom: 6px;
        }
        .guia-pdf-wrap .pdf-page-break-before {
          page-break-before: always;
          break-before: page;
        }
        @media (max-width: 768px) {
          .guia-pdf-wrap .pdf-guide {
            padding: 18px;
          }
          .guia-pdf-wrap .chip-grid,
          .guia-pdf-wrap .pdf-columns,
          .guia-pdf-wrap .pdf-meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-400/20 border border-amber-300/25 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white/90" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl">Guía editorial personal</h3>
            <p className="text-sm text-white/55">
              Diagnóstico, paleta, looks y armario esencial en un documento descargable.
            </p>
          </div>
        </div>
        <div className="screen-only flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpandida((prev) => !prev)}
            className="min-h-[40px] px-3 rounded-xl border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.08] inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors"
          >
            {expandida ? 'Contraer' : 'Desplegar'}
            {expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandida && (
            <button
              type="button"
              onClick={handleImprimir}
              className="min-h-[40px] px-3 rounded-xl bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-500 hover:to-orange-500 text-sm font-medium inline-flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          )}
        </div>
      </div>

      <div className={`pdf-guide ${expandida ? '' : 'hidden print:block'}`}>
        <header className="pdf-cover">
          <p className="pdf-kicker">ColorMetría · Análisis personalizado</p>
          <h1>Guía editorial de estilo personal</h1>
          <p className="pdf-tagline">
            Diagnóstico cromático completo con paleta, looks y armario esencial —
            diseñado para convertir tu estación en decisiones de estilo diarias.
          </p>
          <div className="pdf-meta-grid">
            <p><strong>Estación:</strong> {resultados?.estacion?.nombre || 'N/D'}</p>
            <p><strong>Subtono:</strong> {subtono}</p>
            <p><strong>Contraste:</strong> {contraste}</p>
            <p><strong>Confianza:</strong> {confianza}%</p>
            <p><strong>Perfil:</strong> {generoId}</p>
            <p><strong>Fecha:</strong> {hoy}</p>
          </div>
        </header>

        <Section title="Análisis de color">
          <div className="editorial-box">
            <p className="pdf-small"><strong>Estación cromática:</strong> {resultados?.estacion?.nombre || 'N/D'}</p>
            <p className="pdf-small">{DESCRIPCION_ESTACION[estacion] || DESCRIPCION_ESTACION.verano}</p>
            <p className="pdf-small">
              <strong>Confianza del análisis:</strong> {confianza}%. Esta lectura define la temperatura, profundidad y contraste ideal para tus prendas, accesorios y acabados.
            </p>
          </div>
          <div className="pdf-columns">
            <div className="editorial-box">
              <h3>Métricas clave</h3>
              <ul className="pdf-small">
                <li>Subtono: {subtono}</li>
                <li>Contraste: {contraste}</li>
                <li>Intensidad / chroma: {chroma}</li>
                <li>Rango recomendado: {base.colorGuide.recomendados.join(', ')}</li>
              </ul>
            </div>
            <div className="editorial-box">
              <h3>Qué significa para ti</h3>
              <ul className="pdf-small">
                <li>Optimiza tu presencia sin sobrecargar el look.</li>
                <li>Mejora coherencia entre ropa, accesorios y acabado personal.</li>
                <li>Facilita compras inteligentes para clóset cápsula.</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Paleta personal">
          <ColorRow title="Colores que favorecen" items={paleta.favorecen} />
          <ColorRow title="Neutros ideales" items={paleta.neutros} />
          <ColorRow title="Colores a evitar" items={paleta.evitar} />
          <p className="pdf-small">
            Microcopy de uso: construye una base con neutros ideales y agrega 1-2 acentos por look para mantener balance y sofisticación visual.
          </p>
        </Section>

        <Section title="Joyería y accesorios" pageBreak>
          <div className="editorial-box">
            <p className="pdf-small"><strong>Metal recomendado:</strong> {METALES[estacion]}</p>
            <p className="pdf-small"><strong>Relojes:</strong> pieza limpia de caja media con correa en neutro base.</p>
            <p className="pdf-small"><strong>Lentes:</strong> monturas en contraste coherente con tu estación.</p>
          </div>
          {generoId === 'femenino' ? (
            <div className="pdf-columns">
              <div className="editorial-box">
                <h3>Aretes</h3>
                <ul className="pdf-small">
                  {JOYERIA_GENERO.femenino.aretes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="editorial-box">
                <h3>Collares y complementos</h3>
                <ul className="pdf-small">
                  {JOYERIA_GENERO.femenino.collares.map((item) => <li key={item}>{item}</li>)}
                  {JOYERIA_GENERO.femenino.accesorios.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="editorial-box">
              <h3>Accesorios masculinos clave</h3>
              <ul className="pdf-small">
                {JOYERIA_GENERO.masculino.accesorios.map((item) => <li key={item}>{item}</li>)}
                <li>Zapatos: prioriza horma clásica para formal y sneaker minimal para casual.</li>
              </ul>
            </div>
          )}
        </Section>

        <Section title="Cabello">
          <div className="pdf-columns">
            <div className="editorial-box">
              <h3>Tonos sugeridos</h3>
              <ul className="pdf-small">
                {CABELLO[estacion].sugeridos.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="editorial-box">
              <h3>Tonos a evitar</h3>
              <ul className="pdf-small">
                {CABELLO[estacion].evitar.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="editorial-box">
            <h3>Acabados recomendados</h3>
            <ul className="pdf-small">
              {CABELLO[estacion].acabados.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </Section>

        {generoId === 'femenino' ? (
          <Section title="Maquillaje" pageBreak>
            <div className="editorial-box">
              <p className="pdf-small"><strong>Labios:</strong> {MAQUILLAJE_EDITORIAL[estacion].labios}</p>
              <p className="pdf-small"><strong>Ojos:</strong> {MAQUILLAJE_EDITORIAL[estacion].ojos}</p>
              <p className="pdf-small"><strong>Mejillas:</strong> {MAQUILLAJE_EDITORIAL[estacion].mejillas}</p>
              <p className="pdf-small"><strong>Iluminador / bronzer:</strong> {MAQUILLAJE_EDITORIAL[estacion].iluminador}</p>
              <p className="pdf-small"><strong>Contour / highlight:</strong> guía general por contraste, sin medición facial automatizada.</p>
            </div>
            <p className="pdf-small">
              Recomendaciones faciales avanzadas estarán disponibles en una próxima versión.
            </p>
          </Section>
        ) : (
          <Section title="Grooming" pageBreak>
            <div className="editorial-box">
              <ul className="pdf-small">
                {GROOMING_EDITORIAL[estacion].map((item) => <li key={item}>{item}</li>)}
                <li>Cuidado facial: limpieza suave + hidratación + protector solar diario.</li>
                <li>Formal/casual: ajusta contraste de piezas según ocasión y estación.</li>
              </ul>
            </div>
          </Section>
        )}

        <Section title="Looks sugeridos">
          {looksEditoriales.map((look, idx) => (
            <article key={look.id} className="look-card">
              <h4>
                {idx === 0 ? 'Look día / casual' : idx === 1 ? 'Look formal / oficina' : 'Look noche / evento'} · {look.nombre}
              </h4>
              <p className="pdf-small"><strong>Prendas:</strong> {look.prendas.join(', ')}</p>
              <p className="pdf-small"><strong>Accesorios:</strong> {look.accesorios.join(', ')}</p>
              <p className="pdf-small"><strong>Paleta del look:</strong> {base.colorGuide.recomendados.slice(0, 3).join(', ')}</p>
              <p className="pdf-small"><strong>Por qué funciona:</strong> {look.porQueFunciona}</p>
            </article>
          ))}
          {!looksEditoriales.length && (
            <p className="pdf-small">No hay looks disponibles para este perfil todavía.</p>
          )}
          {outfitsGuardados.length > 0 && (
            <div className="editorial-box">
              <h3>Outfits guardados en tu clóset</h3>
              <ul className="pdf-small">
                {outfitsGuardados.map((o) => (
                  <li key={o.id}>{o.nombre}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <Section title="Armario esencial" pageBreak>
          <div className="editorial-box">
            <h3>10 prendas clave</h3>
            <ul className="pdf-small">
              {ARMARIO_ESENCIAL[generoId].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="pdf-columns">
            <div className="editorial-box">
              <h3>Neutros base</h3>
              <p className="pdf-small">{paleta.neutros.map((n) => n.nombre).join(', ')}</p>
            </div>
            <div className="editorial-box">
              <h3>Acentos y tejidos</h3>
              <p className="pdf-small">
                Acentos: {paleta.favorecen.slice(0, 3).map((a) => a.nombre).join(', ')}.
              </p>
              <p className="pdf-small">
                Tejidos recomendados: algodón premium, lana ligera, satín mate, cuero limpio, mezclas estructuradas.
              </p>
            </div>
          </div>
        </Section>

        <footer className="pdf-section">
          <h2>Cierre editorial</h2>
          <p className="pdf-small">
            Tu mejor imagen no es tendencia: es coherencia entre color, estructura y autenticidad.
          </p>
          <p className="pdf-small"><strong>ColorMetría</strong> · Guía personalizada</p>
        </footer>
      </div>

      {expandida && (
        <div className="screen-only mt-4 flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-white/45">El PDF incluye paleta, looks, joyería y armario esencial. No incluye dashboard ni módulos interactivos.</p>
          <motion.button
            type="button"
            onClick={handleImprimir}
            className="shrink-0 min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-sm font-medium inline-flex items-center gap-2 transition-all"
            whileHover={{ scale: 1.01 }}
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default GuiaPremiumPDF
