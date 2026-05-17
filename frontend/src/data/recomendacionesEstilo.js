const COLOR_GUIDE = {
  primavera: {
    recomendados: ['coral', 'durazno', 'verde lima', 'crema', 'dorado'],
    evitar: ['negro puro', 'gris ceniza', 'morado frío'],
  },
  verano: {
    recomendados: ['lavanda', 'rosa polvo', 'azul cielo', 'gris perla', 'plata'],
    evitar: ['naranja intenso', 'mostaza', 'marrón cálido'],
  },
  otono: {
    recomendados: ['terracota', 'oliva', 'camello', 'óxido', 'oro antiguo'],
    evitar: ['plata brillante', 'fucsia frío', 'azul eléctrico'],
  },
  invierno: {
    recomendados: ['negro', 'blanco nítido', 'esmeralda', 'azul cobalto', 'plata'],
    evitar: ['melocotón cálido', 'camel dorado', 'naranja quemado'],
  },
}

const OUTFITS = {
  femenino: {
    primavera: [
      {
        id: 'f-primavera-casual-1',
        nombre: 'Casual luminoso',
        ocasion: 'casual',
        estilo: 'casual',
        prendas: ['blusa coral fluida', 'jeans claro recto', 'sandalia nude'],
        accesorios: ['bolsa mimbre', 'aretes dorados'],
        notaEstilo: 'Combina tonos cálidos suaves para mantener frescura y luminosidad.',
        porQueFunciona: 'El coral cerca del rostro ilumina piel cálida de primavera.',
      },
      {
        id: 'f-primavera-oficina-1',
        nombre: 'Oficina soft power',
        ocasion: 'oficina',
        estilo: 'minimalista',
        prendas: ['blusa marfil', 'pantalón crema sastre', 'blazer durazno'],
        accesorios: ['reloj dorado fino', 'bolsa estructurada beige'],
        notaEstilo: 'Silueta limpia con acentos cálidos controlados.',
        porQueFunciona: 'Neutros cálidos y durazno respetan la temperatura de primavera.',
      },
      {
        id: 'f-primavera-cita-1',
        nombre: 'Romántico melocotón',
        ocasion: 'cita',
        estilo: 'romantico',
        prendas: ['vestido midi melocotón', 'sandalia dorada'],
        accesorios: ['collar delicado', 'bolsa pequeña crema'],
        notaEstilo: 'Texturas ligeras y detalles brillantes sin sobrecargar.',
        porQueFunciona: 'Los tonos melocotón elevan la naturalidad del subtono cálido.',
      },
    ],
    verano: [
      {
        id: 'f-verano-casual-1',
        nombre: 'Casual empolvado',
        ocasion: 'casual',
        estilo: 'minimalista',
        prendas: ['blusa lila suave', 'pantalón gris claro', 'tenis blanco roto'],
        accesorios: ['bolsa rosa polvo', 'aretes plata'],
        notaEstilo: 'Paleta fría suave y líneas depuradas.',
        porQueFunciona: 'El contraste suave respeta la armonía típica de verano.',
      },
      {
        id: 'f-verano-formal-1',
        nombre: 'Elegancia fría',
        ocasion: 'formal',
        estilo: 'elegante',
        prendas: ['vestido mauve satinado', 'stilettos gris perla'],
        accesorios: ['clutch plateado', 'joyería de perla'],
        notaEstilo: 'Acabado satinado y joyería fría para un look refinado.',
        porQueFunciona: 'Mauve + plata mantiene balance frío y sofisticado.',
      },
      {
        id: 'f-verano-fin-semana-1',
        nombre: 'Weekend urbano suave',
        ocasion: 'fin de semana',
        estilo: 'urbano',
        prendas: ['playera rosa pálido', 'falda denim clara', 'sneaker lavanda'],
        accesorios: ['mini backpack gris', 'lentes plateados'],
        notaEstilo: 'Comodidad con toques fríos contemporáneos.',
        porQueFunciona: 'La gama pastel evita dureza y favorece piel verano.',
      },
    ],
    otono: [
      {
        id: 'f-otono-casual-1',
        nombre: 'Terracota diario',
        ocasion: 'casual',
        estilo: 'casual',
        prendas: ['blusa terracota', 'jeans índigo oscuro', 'botín cuero miel'],
        accesorios: ['bolsa cognac', 'aretes cobre'],
        notaEstilo: 'Capas cálidas y textura en cuero.',
        porQueFunciona: 'Terracota y cognac realzan profundidad de otoño.',
      },
      {
        id: 'f-otono-evento-1',
        nombre: 'Evento cálido premium',
        ocasion: 'evento',
        estilo: 'elegante',
        prendas: ['vestido borgoña cálido', 'sandalia bronce'],
        accesorios: ['joyería oro viejo', 'clutch chocolate'],
        notaEstilo: 'Acabados ricos y metales envejecidos.',
        porQueFunciona: 'Borgoña cálido armoniza con estación profunda y terrosa.',
      },
      {
        id: 'f-otono-oficina-1',
        nombre: 'Oficina earthy chic',
        ocasion: 'oficina',
        estilo: 'minimalista',
        prendas: ['blusa oliva', 'pantalón camello', 'blazer café'],
        accesorios: ['cinturón cognac', 'reloj dorado mate'],
        notaEstilo: 'Look profesional con neutrales cálidos.',
        porQueFunciona: 'Oliva y camello dan estructura sin apagar el rostro.',
      },
    ],
    invierno: [
      {
        id: 'f-invierno-formal-1',
        nombre: 'Power contraste',
        ocasion: 'formal',
        estilo: 'elegante',
        prendas: ['blazer negro', 'top blanco nítido', 'pantalón negro sastre'],
        accesorios: ['stilettos negros', 'joyería plata'],
        notaEstilo: 'Contraste alto y líneas marcadas.',
        porQueFunciona: 'La dupla blanco/negro maximiza el potencial de invierno.',
      },
      {
        id: 'f-invierno-cita-1',
        nombre: 'Cita esmeralda',
        ocasion: 'cita',
        estilo: 'romantico',
        prendas: ['vestido esmeralda', 'abrigo negro', 'sandalia plata'],
        accesorios: ['clutch negro', 'aretes brillantes'],
        notaEstilo: 'Color joya protagonista con base neutra.',
        porQueFunciona: 'Verde joya mantiene intensidad fría ideal para invierno.',
      },
      {
        id: 'f-invierno-fin-semana-1',
        nombre: 'Urbano gráfico',
        ocasion: 'fin de semana',
        estilo: 'urbano',
        prendas: ['playera blanca', 'falda negra', 'bota chunky negra'],
        accesorios: ['lentes oscuros', 'bolsa estructurada'],
        notaEstilo: 'Silueta moderna y monocromía con contraste.',
        porQueFunciona: 'El alto contraste y negros puros favorecen estación invierno.',
      },
    ],
  },
  masculino: {
    primavera: [
      {
        id: 'm-primavera-casual-1',
        nombre: 'Casual claro de primavera',
        ocasion: 'casual',
        estilo: 'casual',
        prendas: ['playera coral suave', 'jean claro slim', 'tenis crema'],
        accesorios: ['gorra beige', 'reloj dorado cepillado'],
        notaEstilo: 'Combinación relajada con contraste medio.',
        porQueFunciona: 'Tonos cálidos claros iluminan y evitan dureza visual.',
      },
      {
        id: 'm-primavera-oficina-1',
        nombre: 'Oficina smart warm',
        ocasion: 'oficina',
        estilo: 'minimalista',
        prendas: ['camisa marfil', 'pantalón de vestir arena', 'blazer camel'],
        accesorios: ['cinturón café', 'zapato derby miel'],
        notaEstilo: 'Formalidad ligera sin perder temperatura cálida.',
        porQueFunciona: 'Neutrales cálidos armonizan con primavera masculina.',
      },
      {
        id: 'm-primavera-fin-semana-1',
        nombre: 'Weekend polo clean',
        ocasion: 'fin de semana',
        estilo: 'urbano',
        prendas: ['polo durazno', 'bermuda piedra', 'tenis blanco roto'],
        accesorios: ['lentes ámbar', 'reloj deportivo'],
        notaEstilo: 'Look fresco para clima cálido.',
        porQueFunciona: 'Polo cálido + bermuda clara conserva ligereza cromática.',
      },
    ],
    verano: [
      {
        id: 'm-verano-casual-1',
        nombre: 'Casual frío urbano',
        ocasion: 'casual',
        estilo: 'urbano',
        prendas: ['playera azul grisáceo', 'jeans medio', 'sneakers grises'],
        accesorios: ['reloj acero', 'lentes plata'],
        notaEstilo: 'Texturas limpias y tono frío moderado.',
        porQueFunciona: 'Azules suaves son coherentes con estación verano.',
      },
      {
        id: 'm-verano-formal-1',
        nombre: 'Formal soft navy',
        ocasion: 'formal',
        estilo: 'elegante',
        prendas: ['camisa blanca fría', 'traje azul marino suave', 'corbata lavanda humo'],
        accesorios: ['zapato negro pulido', 'cinturón negro'],
        notaEstilo: 'Formal clásico con acento frío sutil.',
        porQueFunciona: 'Lavanda + marino mejora contraste sin endurecer.',
      },
      {
        id: 'm-verano-oficina-1',
        nombre: 'Oficina business casual',
        ocasion: 'oficina',
        estilo: 'minimalista',
        prendas: ['camisa gris perla', 'pantalón vestir azul acero', 'mocasín café frío'],
        accesorios: ['reloj metal mate', 'lentes delgados'],
        notaEstilo: 'Apariencia profesional de bajo contraste.',
        porQueFunciona: 'La paleta fría y apagada favorece perfil verano.',
      },
    ],
    otono: [
      {
        id: 'm-otono-casual-1',
        nombre: 'Casual terroso',
        ocasion: 'casual',
        estilo: 'casual',
        prendas: ['playera mostaza suave', 'jeans oscuro', 'bota café'],
        accesorios: ['gorra oliva', 'reloj cuero'],
        notaEstilo: 'Combinación robusta y fácil de repetir.',
        porQueFunciona: 'Mostaza y oliva conectan con base cálida de otoño.',
      },
      {
        id: 'm-otono-formal-1',
        nombre: 'Formal cobre',
        ocasion: 'formal',
        estilo: 'elegante',
        prendas: ['camisa marfil cálido', 'blazer chocolate', 'pantalón vestir tabaco', 'corbata terracota'],
        accesorios: ['derby café oscuro', 'cinturón piel'],
        notaEstilo: 'Formal clásico con acentos cálidos ricos.',
        porQueFunciona: 'La gama tierra evita que el rostro se vea apagado.',
      },
      {
        id: 'm-otono-evento-1',
        nombre: 'Evento smart rustic',
        ocasion: 'evento',
        estilo: 'urbano',
        prendas: ['camisa oliva', 'pantalón negro cálido', 'blazer óxido'],
        accesorios: ['botín piel', 'lentes carey'],
        notaEstilo: 'Look moderno con personalidad cálida.',
        porQueFunciona: 'Óxido y oliva potencian la profundidad otoñal.',
      },
    ],
    invierno: [
      {
        id: 'm-invierno-formal-1',
        nombre: 'Formal alto contraste',
        ocasion: 'formal',
        estilo: 'elegante',
        prendas: ['camisa blanca nítida', 'traje negro', 'corbata vino frío'],
        accesorios: ['oxford negro', 'reloj metálico'],
        notaEstilo: 'Silueta estructurada y contraste contundente.',
        porQueFunciona: 'El negro/blanco realza el perfil de invierno masculino.',
      },
      {
        id: 'm-invierno-casual-1',
        nombre: 'Casual cobalto',
        ocasion: 'casual',
        estilo: 'casual',
        prendas: ['playera azul cobalto', 'jean negro', 'tenis blancos'],
        accesorios: ['gorra negra', 'lentes oscuros'],
        notaEstilo: 'Color protagonista sobre base neutra.',
        porQueFunciona: 'Azul cobalto es color joya ideal para invierno.',
      },
      {
        id: 'm-invierno-oficina-1',
        nombre: 'Oficina sharp',
        ocasion: 'oficina',
        estilo: 'minimalista',
        prendas: ['camisa azul hielo', 'pantalón vestir carbón', 'blazer azul noche'],
        accesorios: ['cinturón negro', 'zapato derby negro'],
        notaEstilo: 'Profesional sin perder intensidad cromática.',
        porQueFunciona: 'Tonos fríos y nítidos sostienen armonía de invierno.',
      },
    ],
  },
}

const GROOMING_MASCULINO = {
  primavera: ['Barba corta con contorno suave', 'Cera mate ligera', 'Fragancia cítrica cálida'],
  verano: ['Barba degradada limpia', 'Acabado natural sin brillo', 'Fragancia acuática fresca'],
  otono: ['Barba media bien definida', 'Aceite de barba amaderado', 'Fragancia especiada cálida'],
  invierno: ['Afeitado o barba precisa', 'Peinado estructurado', 'Fragancia amaderada fría'],
}

const MAQUILLAJE_FEMENINO = {
  primavera: ['Labial coral', 'Rubor durazno', 'Iluminador champagne'],
  verano: ['Labial rosa polvo', 'Rubor malva', 'Sombras lavanda'],
  otono: ['Labial terracota', 'Rubor cálido', 'Sombras cobre'],
  invierno: ['Labial rojo frío', 'Delineado negro', 'Iluminador plata'],
}

const OCASIONES = ['casual', 'formal', 'oficina', 'evento', 'cita', 'fin de semana']
const ESTILOS = ['casual', 'formal', 'elegante', 'minimalista', 'romantico', 'urbano']

export function normalizarGenero(genero) {
  return genero === 'masculino' ? 'masculino' : 'femenino'
}

export function getOpcionesFiltros() {
  return { ocasiones: OCASIONES, estilos: ESTILOS }
}

export function getBaseRecomendaciones(estacion, genero) {
  const generoId = normalizarGenero(genero)
  const estacionId = COLOR_GUIDE[estacion] ? estacion : 'verano'
  return {
    estacion: estacionId,
    genero: generoId,
    colorGuide: COLOR_GUIDE[estacionId],
    grooming: generoId === 'masculino' ? GROOMING_MASCULINO[estacionId] : [],
    maquillaje: generoId === 'femenino' ? MAQUILLAJE_FEMENINO[estacionId] : [],
  }
}

export function getOutfitsPorContexto({
  estacion,
  genero,
  ocasion = 'casual',
  estilo = null,
}) {
  const generoId = normalizarGenero(genero)
  const estacionId = COLOR_GUIDE[estacion] ? estacion : 'verano'
  const outfitsBase = OUTFITS[generoId]?.[estacionId] || []

  return outfitsBase.filter((item) => {
    const matchOcasion = ocasion ? item.ocasion === ocasion : true
    const matchEstilo = estilo ? item.estilo === estilo : true
    return matchOcasion && matchEstilo
  })
}

export function getSugerenciasFallback(estacion, genero) {
  const generoId = normalizarGenero(genero)
  const estacionId = COLOR_GUIDE[estacion] ? estacion : 'verano'
  return OUTFITS[generoId]?.[estacionId] || []
}

export function getLooksEditoriales(estacion, genero) {
  const generoId = normalizarGenero(genero)
  const estacionId = COLOR_GUIDE[estacion] ? estacion : 'verano'
  const base = OUTFITS[generoId]?.[estacionId] || []

  const byOcasion = (keys) => {
    for (const key of keys) {
      const hit = base.find((item) => item.ocasion === key)
      if (hit) return hit
    }
    return null
  }

  const day = byOcasion(['casual', 'fin de semana'])
  const office = byOcasion(['formal', 'oficina'])
  const night = byOcasion(['evento', 'cita', 'formal'])

  return [day, office, night].filter(Boolean).slice(0, 3)
}
