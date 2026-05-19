/**
 * Catálogo visual SVG para ProbadorVisual.
 * Cada ítem expone draw(color, genero) => markup SVG (paths).
 */

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function hexToRgb(hex) {
  const s = String(hex || '#808080').replace('#', '')
  const n = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
  const v = parseInt(n, 16)
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('')}`
}

export function shade(hex, amount = -18) {
  const { r, g, b } = hexToRgb(hex)
  const f = (amount + 100) / 100
  return rgbToHex(r * f, g * f, b * f)
}

function stroke(color, w = 1.2) {
  return `stroke="${shade(color, -35)}" stroke-width="${w}" stroke-linejoin="round"`
}

/** @typedef {{ id: string, nombre: string, categoria: string, color: string, hex: string, estilo: string, ocasion: string, estacion?: string, draw: (color: string, genero?: string) => string }} SvgWardrobeItem */

/** @type {Record<string, SvgWardrobeItem[]>} */
export const DB = {
  superior: [
    {
      id: 'top-elegante',
      nombre: 'Top elegante',
      categoria: 'superior',
      color: 'Neutro',
      hex: '#CBB9E6',
      estilo: 'elegante',
      ocasion: 'oficina',
      draw: (c, g) => (g === 'masculino'
        ? `<path fill="${c}" ${stroke(c)} d="M78 128c28-18 96-18 124 0l14 58c-2 42-38 62-76 62s-74-20-76-62l14-58z"/><path fill="${shade(c,-22)}" opacity=".55" d="M92 132l48-8 48 8-8 52H100z"/>`
        : `<path fill="${c}" ${stroke(c)} d="M86 120c26-20 82-20 108 0l12 52c-4 48-34 72-66 72s-62-24-66-72l12-52z"/><path fill="${shade(c,-18)}" opacity=".45" d="M98 126l42-10 42 10-6 46H104z"/>`),
    },
    {
      id: 'camisa-oversize',
      nombre: 'Camisa oversize',
      categoria: 'superior',
      color: 'Marfil',
      hex: '#F4EBDD',
      estilo: 'minimalista',
      ocasion: 'casual',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M72 122h136l10 8-6 70H78l-6-70 10-8z"/><path fill="${shade(c,-15)}" d="M98 132h84v8H98z"/><path fill="${shade(c,-25)}" opacity=".5" d="M88 150 72 192h16z M192 150l16 42h-16z"/>`,
    },
    {
      id: 'polo-premium',
      nombre: 'Polo premium',
      categoria: 'superior',
      color: 'Durazno',
      hex: '#E8BE95',
      estilo: 'casual',
      ocasion: 'fin de semana',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M92 124h96l8 6v54c-2 28-30 44-56 44s-54-16-56-44v-54l8-6z"/><path fill="${shade(c,-20)}" d="M128 124v22"/><path fill="${shade(c,-12)}" d="M110 132l18-8 18 8v10h-36z"/>`,
    },
    {
      id: 'hoodie-premium',
      nombre: 'Hoodie premium',
      categoria: 'superior',
      color: 'Gris',
      hex: '#8F98A4',
      estilo: 'urbano',
      ocasion: 'casual',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M78 118c20-24 84-24 104 0 10 8 14 20 14 78 0 34-28 52-66 52S74 230 74 196c0-58 4-70 14-78z"/><path fill="${shade(c,-25)}" opacity=".55" d="M98 126c8-12 28-12 36 0v18H98z"/><path fill="${shade(c,-15)}" d="M92 150h96v12H92z"/>`,
    },
  ],
  inferior: [
    {
      id: 'pantalon-wide',
      nombre: 'Pantalón wide leg',
      categoria: 'inferior',
      color: 'Crema',
      hex: '#F5EBDD',
      estilo: 'minimalista',
      ocasion: 'oficina',
      draw: (c, g) => (g === 'masculino'
        ? `<path fill="${c}" ${stroke(c)} d="M98 248h84l10 118c-6 8-22 12-52 12s-46-4-52-12l10-118z"/><path fill="${shade(c,-18)}" opacity=".5" d="M110 260h60v96h-60z"/>`
        : `<path fill="${c}" ${stroke(c)} d="M92 244h96l14 124c-8 10-30 14-62 14s-54-4-62-14l14-124z"/><path fill="${shade(c,-16)}" opacity=".45" d="M108 256h64v104h-64z"/>`),
    },
    {
      id: 'jeans-rectos',
      nombre: 'Jeans rectos',
      categoria: 'inferior',
      color: 'Azul medio',
      hex: '#5A6E87',
      estilo: 'casual',
      ocasion: 'fin de semana',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M96 246h88l6 120c-4 6-18 10-50 10s-46-4-50-10l6-120z"/><path fill="${shade(c,-22)}" opacity=".55" d="M108 258h24v96h-24z M148 258h24v96h-24z"/><path fill="${shade(c,-12)}" d="M128 290h24v8h-24z"/>`,
    },
    {
      id: 'pantalon-sastre',
      nombre: 'Pantalón sastre',
      categoria: 'inferior',
      color: 'Tabaco',
      hex: '#8E5A3C',
      estilo: 'elegante',
      ocasion: 'formal',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M100 244h80l8 122c-6 8-24 12-48 12s-42-4-48-12l8-122z"/><path fill="${shade(c,-20)}" d="M124 244v20"/><path fill="${shade(c,-14)}" opacity=".5" d="M112 262h56v90h-56z"/>`,
    },
  ],
  'vestido/falda': [
    {
      id: 'vestido-satin',
      nombre: 'Vestido satinado',
      categoria: 'vestido/falda',
      color: 'Malva',
      hex: '#A98DA0',
      estilo: 'romantico',
      ocasion: 'evento',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M88 118c24-18 80-18 104 0l16 52c-6 46-30 78-68 78s-62-32-68-78l16-52z"/><path fill="${shade(c,-12)}" opacity=".55" d="M104 126l36-8 36 8-8 210c-8 12-24 18-28 18s-20-6-28-18l-8-210z"/><path fill="${shade(c,-25)}" opacity=".35" d="M120 150h40v160h-40z"/>`,
    },
    {
      id: 'falda-midi',
      nombre: 'Falda midi',
      categoria: 'vestido/falda',
      color: 'Melocotón',
      hex: '#FFDAB9',
      estilo: 'romantico',
      ocasion: 'cita',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M86 118h108l10 48H76l10-48z"/><path fill="${shade(c,-10)}" d="M82 166c6 88 38 128 58 128s52-40 58-128l-6-18H88z"/><path fill="${shade(c,-22)}" opacity=".4" d="M118 180h44v90h-44z"/>`,
    },
  ],
  calzado: [
    {
      id: 'botin-elegante',
      nombre: 'Botín elegante',
      categoria: 'calzado',
      color: 'Miel',
      hex: '#B17A46',
      estilo: 'elegante',
      ocasion: 'formal',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M82 404c8-18 24-24 38-24h40c14 0 30 6 38 24l6 28H76z"/><path fill="${shade(c,-25)}" d="M98 412h84v14H98z"/><ellipse fill="${shade(c,-12)}" cx="140" cy="432" rx="52" ry="10" opacity=".45"/>`,
    },
    {
      id: 'tenis-minimal',
      nombre: 'Tenis minimalistas',
      categoria: 'calzado',
      color: 'Gris',
      hex: '#9AA1A9',
      estilo: 'urbano',
      ocasion: 'casual',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M78 408c6-14 22-20 62-20s56 6 62 20l4 24H74z"/><path fill="${shade(c,-18)}" d="M92 414h96v10H92z"/><path fill="#fff" opacity=".25" d="M104 418h40v4h-40z"/>`,
    },
    {
      id: 'stiletto',
      nombre: 'Stiletto',
      categoria: 'calzado',
      color: 'Plata',
      hex: '#C9CED4',
      estilo: 'elegante',
      ocasion: 'evento',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M96 406c6-10 18-14 44-14s38 4 44 14l8 26H88z"/><path fill="${shade(c,-20)}" d="M132 392v18"/><path fill="${shade(c,-15)}" d="M118 418h48v8h-48z"/>`,
    },
  ],
  accesorio: [
    {
      id: 'bolso-elegante',
      nombre: 'Bolso elegante',
      categoria: 'accesorio',
      color: 'Beige',
      hex: '#E9DCC7',
      estilo: 'minimalista',
      ocasion: 'oficina',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M188 250h44c6 0 10 6 10 14v52c0 8-4 14-10 14h-44c-6 0-10-6-10-14v-52c0-8 4-14 10-14z"/><path fill="none" stroke="${shade(c,-30)}" stroke-width="3" d="M200 250v-14c0-6 8-6 8 0v14"/><path fill="${shade(c,-18)}" opacity=".5" d="M194 270h32v24h-32z"/>`,
    },
    {
      id: 'collar-delicado',
      nombre: 'Collar delicado',
      categoria: 'accesorio',
      color: 'Dorado',
      hex: '#CFAF85',
      estilo: 'elegante',
      ocasion: 'evento',
      draw: (c) => `<path fill="none" stroke="${c}" stroke-width="2.5" d="M108 108c16 18 48 18 64 0"/><circle fill="${c}" cx="140" cy="126" r="4"/>`,
    },
    {
      id: 'corbata',
      nombre: 'Corbata',
      categoria: 'accesorio',
      color: 'Vino',
      hex: '#6A1D35',
      estilo: 'formal',
      ocasion: 'formal',
      draw: (c) => `<path fill="${c}" ${stroke(c)} d="M132 118 148 132 140 220 128 220 120 132z"/><path fill="${shade(c,-15)}" opacity=".6" d="M132 130 136 200 128 200z"/>`,
    },
    {
      id: 'reloj',
      nombre: 'Reloj',
      categoria: 'accesorio',
      color: 'Cognac',
      hex: '#8E5A3C',
      estilo: 'elegante',
      ocasion: 'oficina',
      draw: (c) => `<circle fill="${c}" cx="198" cy="210" r="10" ${stroke(c)}/><path fill="none" stroke="${shade(c,-30)}" stroke-width="2" d="M188 210h20 M198 200v20"/>`,
    },
  ],
  'abrigo/blazer': [
    {
      id: 'blazer-estructurado',
      nombre: 'Blazer estructurado',
      categoria: 'abrigo/blazer',
      color: 'Camel',
      hex: '#C89A6C',
      estilo: 'minimalista',
      ocasion: 'oficina',
      draw: (c, g) => (g === 'masculino'
        ? `<path fill="${c}" ${stroke(c)} opacity=".94" d="M70 112h140l12 10v96c-4 38-36 58-82 58S58 254 58 218v-96l12-10z"/><path fill="${shade(c,-22)}" d="M128 122v132"/><path fill="${shade(c,-12)}" opacity=".55" d="M82 132 70 210 92 200z M196 132l12 78-22-10z"/>`
        : `<path fill="${c}" ${stroke(c)} opacity=".94" d="M74 110h132l10 8v98c-4 42-32 64-76 64S64 256 64 216v-98l10-8z"/><path fill="${shade(c,-20)}" d="M128 118v150"/><path fill="${shade(c,-10)}" opacity=".5" d="M88 124 76 204 98 196z M188 124l12 80-22-12z"/>`),
    },
    {
      id: 'trench-coat',
      nombre: 'Trench coat',
      categoria: 'abrigo/blazer',
      color: 'Arena',
      hex: '#CFAF85',
      estilo: 'elegante',
      ocasion: 'oficina',
      draw: (c) => `<path fill="${c}" ${stroke(c)} opacity=".92" d="M68 108h144l14 12v140c-6 44-40 68-86 68S54 304 54 260V120l14-12z"/><path fill="${shade(c,-18)}" d="M128 116v176"/><path fill="${shade(c,-10)}" opacity=".45" d="M80 140h16v120H80z M184 140h16v120h-16z"/><path fill="${shade(c,-25)}" d="M96 268h88v14H96z"/>`,
    },
    {
      id: 'abrigo-largo',
      nombre: 'Abrigo largo',
      categoria: 'abrigo/blazer',
      color: 'Chocolate',
      hex: '#5B3C2E',
      estilo: 'elegante',
      ocasion: 'formal',
      draw: (c) => `<path fill="${c}" ${stroke(c)} opacity=".93" d="M66 106h148l16 14v156c-8 48-44 72-90 72S50 314 50 276V120l16-14z"/><path fill="${shade(c,-22)}" d="M128 114v190"/><path fill="${shade(c,-12)}" opacity=".5" d="M78 128 64 220 90 210z M198 128l14 92-26-14z"/>`,
    },
  ],
}

const KEYWORD_MAP = [
  { re: /vestido/i, cat: 'vestido/falda', id: 'vestido-satin' },
  { re: /falda/i, cat: 'vestido/falda', id: 'falda-midi' },
  { re: /blazer|saco/i, cat: 'abrigo/blazer', id: 'blazer-estructurado' },
  { re: /trench|abrigo/i, cat: 'abrigo/blazer', id: 'trench-coat' },
  { re: /bolso|bolsa|clutch|backpack/i, cat: 'accesorio', id: 'bolso-elegante' },
  { re: /corbata/i, cat: 'accesorio', id: 'corbata' },
  { re: /reloj/i, cat: 'accesorio', id: 'reloj' },
  { re: /collar|arete/i, cat: 'accesorio', id: 'collar-delicado' },
  { re: /sandalia|tac[oó]n|stiletto|oxford|derby|bot[ií]n|sneaker|tenis|zapato|mocasin/i, cat: 'calzado', id: 'botin-elegante' },
  { re: /jean|denim/i, cat: 'inferior', id: 'jeans-rectos' },
  { re: /pantalon|pantalón|sastre|tabaco|carb[oó]n/i, cat: 'inferior', id: 'pantalon-sastre' },
  { re: /polo|playera|camisa|blusa|top|hoodie|sueter|sweater/i, cat: 'superior', id: 'top-elegante' },
]

const DEMO_ID_MAP = {
  'fp-sup-1': 'top-elegante',
  'fp-sup-2': 'top-elegante',
  'fv-sup-1': 'top-elegante',
  'fv-sup-2': 'top-elegante',
  'fo-sup-1': 'top-elegante',
  'fo-sup-2': 'hoodie-premium',
  'fi-sup-1': 'camisa-oversize',
  'fi-sup-2': 'top-elegante',
  'fp-inf-1': 'pantalon-wide',
  'fv-inf-1': 'pantalon-sastre',
  'fo-inf-1': 'pantalon-sastre',
  'fi-inf-1': 'pantalon-sastre',
  'fp-vest-1': 'vestido-satin',
  'fv-vest-1': 'falda-midi',
  'fo-vest-1': 'vestido-satin',
  'fi-vest-1': 'falda-midi',
  'fp-cal-1': 'stiletto',
  'fv-cal-1': 'stiletto',
  'fo-cal-1': 'botin-elegante',
  'fi-cal-1': 'stiletto',
  'fp-acc-1': 'bolso-elegante',
  'fv-acc-1': 'bolso-elegante',
  'fo-acc-1': 'bolso-elegante',
  'fi-acc-1': 'bolso-elegante',
  'fp-abri-1': 'blazer-estructurado',
  'fv-abri-1': 'blazer-estructurado',
  'fo-abri-1': 'abrigo-largo',
  'fi-abri-1': 'blazer-estructurado',
  'mp-sup-1': 'camisa-oversize',
  'mp-sup-2': 'polo-premium',
  'mv-sup-1': 'camisa-oversize',
  'mv-sup-2': 'polo-premium',
  'mo-sup-1': 'camisa-oversize',
  'mo-sup-2': 'polo-premium',
  'mi-sup-1': 'camisa-oversize',
  'mi-sup-2': 'polo-premium',
  'mp-inf-1': 'pantalon-sastre',
  'mv-inf-1': 'jeans-rectos',
  'mo-inf-1': 'pantalon-sastre',
  'mi-inf-1': 'pantalon-sastre',
  'mp-cal-1': 'botin-elegante',
  'mv-cal-1': 'tenis-minimal',
  'mo-cal-1': 'botin-elegante',
  'mi-cal-1': 'botin-elegante',
  'mp-acc-1': 'reloj',
  'mv-acc-1': 'reloj',
  'mo-acc-1': 'reloj',
  'mi-acc-1': 'corbata',
  'mp-abri-1': 'blazer-estructurado',
  'mv-abri-1': 'blazer-estructurado',
  'mo-abri-1': 'abrigo-largo',
  'mi-abri-1': 'blazer-estructurado',
}

function findById(category, id) {
  const pool = DB[category] || []
  return pool.find((item) => item.id === id) || null
}

/**
 * Resuelve una prenda demo/clóset/preview a ítem SVG equipable.
 * @param {object} prenda
 * @param {string} [genero]
 */
export function resolveSvgWardrobeItem(prenda, genero = 'femenino') {
  if (!prenda) return null
  const categoria = prenda.categoria || 'superior'
  const hex = prenda.hex || prenda.color || '#9aa1b0'

  let svgId = DEMO_ID_MAP[prenda.id]
  if (!svgId) {
    const hit = KEYWORD_MAP.find((k) => k.re.test(prenda.nombre || ''))
    if (hit && (hit.cat === categoria || categoria === hit.cat)) svgId = hit.id
  }
  if (!svgId) {
    const pool = DB[categoria] || []
    svgId = pool[0]?.id
  }

  const base = findById(categoria, svgId) || (DB[categoria] || [])[0]
  if (!base) return null

  return {
    ...base,
    sourceId: prenda.id,
    nombre: prenda.nombre || base.nombre,
    categoria,
    hex,
    color: prenda.color || base.color,
    estilo: prenda.estilo || base.estilo,
    ocasion: prenda.ocasion || base.ocasion,
    genero,
    draw: (color, g) => base.draw(color || hex, g || genero),
  }
}

export function getWardrobeCatalog(genero = 'femenino', estacion = 'verano') {
  const cats = genero === 'masculino'
    ? ['superior', 'inferior', 'calzado', 'accesorio', 'abrigo/blazer']
    : ['superior', 'inferior', 'vestido/falda', 'calzado', 'accesorio', 'abrigo/blazer']

  return cats.reduce((acc, cat) => {
    acc[cat] = (DB[cat] || []).map((item) => ({
      ...item,
      categoria: cat,
      genero,
      estacion,
    }))
    return acc
  }, {})
}

export function mergeCatalogWithDemo(demoItems, genero, estacion) {
  const catalog = getWardrobeCatalog(genero, estacion)
  const merged = { ...catalog }

  demoItems.forEach((demo) => {
    const cat = demo.categoria
    if (!merged[cat]) merged[cat] = []
    const resolved = resolveSvgWardrobeItem(demo, genero)
    if (!resolved) return
    const exists = merged[cat].some((x) => x.sourceId === demo.id || x.id === resolved.id)
    if (!exists) {
      merged[cat].push({
        ...resolved,
        sourceId: demo.id,
        demo,
      })
    }
  })

  return merged
}

export const LAYER_Z_INDEX = {
  inferior: 20,
  'vestido/falda': 25,
  superior: 30,
  calzado: 40,
  accesorio: 50,
  'abrigo/blazer': 60,
}
