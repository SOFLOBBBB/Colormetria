const PRENDAS_DEMO = {
  femenino: {
    primavera: [
      { id: 'fp-sup-1', nombre: 'Blusa coral satinada', categoria: 'superior', ocasion: 'oficina', color: 'Coral', hex: '#FF7F50', estilo: 'elegante', descripcion: 'Aporta luz al rostro y mantiene un acabado pulido.' },
      { id: 'fp-sup-2', nombre: 'Top durazno suave', categoria: 'superior', ocasion: 'casual', color: 'Durazno', hex: '#FFCBA4', estilo: 'romantico', descripcion: 'Ideal para looks frescos de día.' },
      { id: 'fp-inf-1', nombre: 'Pantalón crema sastre', categoria: 'inferior', ocasion: 'oficina', color: 'Crema', hex: '#F5EBDD', estilo: 'minimalista', descripcion: 'Base neutra para combinaciones cálidas.' },
      { id: 'fp-vest-1', nombre: 'Vestido midi melocotón', categoria: 'vestido/falda', ocasion: 'evento', color: 'Melocotón', hex: '#FFDAB9', estilo: 'romantico', descripcion: 'Fluido, femenino y muy favorecedor para primavera.' },
      { id: 'fp-cal-1', nombre: 'Sandalia dorada fina', categoria: 'calzado', ocasion: 'formal', color: 'Dorado', hex: '#CFAF85', estilo: 'elegante', descripcion: 'Eleva conjuntos sin endurecer la paleta.' },
      { id: 'fp-acc-1', nombre: 'Bolsa beige estructurada', categoria: 'accesorio', ocasion: 'oficina', color: 'Beige', hex: '#E9DCC7', estilo: 'minimalista', descripcion: 'Accesorio versátil para rotación semanal.' },
      { id: 'fp-abri-1', nombre: 'Blazer camel claro', categoria: 'abrigo/blazer', ocasion: 'oficina', color: 'Camel', hex: '#C89A6C', estilo: 'minimalista', descripcion: 'Capa base para clima templado.' },
    ],
    verano: [
      { id: 'fv-sup-1', nombre: 'Blusa lila empolvada', categoria: 'superior', ocasion: 'oficina', color: 'Lila', hex: '#CBB9E6', estilo: 'minimalista', descripcion: 'Aporta suavidad y armonía fría.' },
      { id: 'fv-sup-2', nombre: 'Top rosa polvo', categoria: 'superior', ocasion: 'casual', color: 'Rosa polvo', hex: '#CFABB8', estilo: 'casual', descripcion: 'Look relajado de contraste suave.' },
      { id: 'fv-inf-1', nombre: 'Pantalón gris perla', categoria: 'inferior', ocasion: 'oficina', color: 'Gris perla', hex: '#D5D8DD', estilo: 'minimalista', descripcion: 'Neutro frío para estilismos de diario.' },
      { id: 'fv-vest-1', nombre: 'Falda midi malva', categoria: 'vestido/falda', ocasion: 'evento', color: 'Malva', hex: '#A98DA0', estilo: 'romantico', descripcion: 'Movimiento ligero con tono elegante.' },
      { id: 'fv-cal-1', nombre: 'Tacón gris humo', categoria: 'calzado', ocasion: 'formal', color: 'Gris humo', hex: '#8C929A', estilo: 'elegante', descripcion: 'Ideal para oficina y cenas.' },
      { id: 'fv-acc-1', nombre: 'Bolso lavanda claro', categoria: 'accesorio', ocasion: 'fin de semana', color: 'Lavanda', hex: '#D7C9EA', estilo: 'urbano', descripcion: 'Accent suave para casual premium.' },
      { id: 'fv-abri-1', nombre: 'Blazer azul bruma', categoria: 'abrigo/blazer', ocasion: 'oficina', color: 'Azul bruma', hex: '#9CB7CF', estilo: 'minimalista', descripcion: 'Mantiene perfil frío con estructura.' },
    ],
    otono: [
      { id: 'fo-sup-1', nombre: 'Blusa terracota', categoria: 'superior', ocasion: 'casual', color: 'Terracota', hex: '#B95E3E', estilo: 'casual', descripcion: 'Protagonista cálida para otoño.' },
      { id: 'fo-sup-2', nombre: 'Top oliva profundo', categoria: 'superior', ocasion: 'fin de semana', color: 'Oliva', hex: '#687047', estilo: 'urbano', descripcion: 'Tono icónico de la estación.' },
      { id: 'fo-inf-1', nombre: 'Pantalón tabaco', categoria: 'inferior', ocasion: 'oficina', color: 'Tabaco', hex: '#8E5A3C', estilo: 'minimalista', descripcion: 'Neutro cálido para múltiples combinaciones.' },
      { id: 'fo-vest-1', nombre: 'Vestido borgoña cálido', categoria: 'vestido/falda', ocasion: 'evento', color: 'Borgoña cálido', hex: '#7A2F3B', estilo: 'elegante', descripcion: 'Profundidad visual con acabado sofisticado.' },
      { id: 'fo-cal-1', nombre: 'Botín cuero miel', categoria: 'calzado', ocasion: 'casual', color: 'Miel', hex: '#B17A46', estilo: 'casual', descripcion: 'Fuerte en looks de transición climática.' },
      { id: 'fo-acc-1', nombre: 'Bolsa cognac', categoria: 'accesorio', ocasion: 'oficina', color: 'Cognac', hex: '#9D6339', estilo: 'elegante', descripcion: 'Pieza base para paleta tierra.' },
      { id: 'fo-abri-1', nombre: 'Blazer chocolate', categoria: 'abrigo/blazer', ocasion: 'formal', color: 'Chocolate', hex: '#5B3C2E', estilo: 'elegante', descripcion: 'Aporta estructura y profundidad.' },
    ],
    invierno: [
      { id: 'fi-sup-1', nombre: 'Top blanco nítido', categoria: 'superior', ocasion: 'oficina', color: 'Blanco nítido', hex: '#FAFAFA', estilo: 'minimalista', descripcion: 'Base de alto contraste.' },
      { id: 'fi-sup-2', nombre: 'Blusa azul cobalto', categoria: 'superior', ocasion: 'evento', color: 'Cobalto', hex: '#2F55D4', estilo: 'elegante', descripcion: 'Color joya de gran impacto.' },
      { id: 'fi-inf-1', nombre: 'Pantalón negro sastre', categoria: 'inferior', ocasion: 'formal', color: 'Negro', hex: '#101114', estilo: 'elegante', descripcion: 'Línea limpia para estilizar silueta.' },
      { id: 'fi-vest-1', nombre: 'Falda negra estructurada', categoria: 'vestido/falda', ocasion: 'oficina', color: 'Negro', hex: '#111217', estilo: 'minimalista', descripcion: 'Funciona con tops de alto contraste.' },
      { id: 'fi-cal-1', nombre: 'Stiletto plata', categoria: 'calzado', ocasion: 'evento', color: 'Plata', hex: '#C9CED4', estilo: 'elegante', descripcion: 'Acento frío para look nocturno.' },
      { id: 'fi-acc-1', nombre: 'Bolsa negra rígida', categoria: 'accesorio', ocasion: 'formal', color: 'Negro', hex: '#1C1D22', estilo: 'minimalista', descripcion: 'Complemento de presencia editorial.' },
      { id: 'fi-abri-1', nombre: 'Blazer negro premium', categoria: 'abrigo/blazer', ocasion: 'formal', color: 'Negro', hex: '#121318', estilo: 'elegante', descripcion: 'Capa clave de invierno de alto contraste.' },
    ],
  },
  masculino: {
    primavera: [
      { id: 'mp-sup-1', nombre: 'Camisa marfil', categoria: 'superior', ocasion: 'oficina', color: 'Marfil', hex: '#F4EBDD', estilo: 'formal', descripcion: 'Camisa ligera para look business cálido.' },
      { id: 'mp-sup-2', nombre: 'Polo durazno', categoria: 'superior', ocasion: 'fin de semana', color: 'Durazno', hex: '#E8BE95', estilo: 'casual', descripcion: 'Casual limpio para primavera.' },
      { id: 'mp-inf-1', nombre: 'Pantalón vestir arena', categoria: 'inferior', ocasion: 'oficina', color: 'Arena', hex: '#CFAF85', estilo: 'minimalista', descripcion: 'Neutro base para camisa o polo.' },
      { id: 'mp-cal-1', nombre: 'Derby miel', categoria: 'calzado', ocasion: 'formal', color: 'Miel', hex: '#A9703F', estilo: 'formal', descripcion: 'Formal cálido sin rigidez excesiva.' },
      { id: 'mp-acc-1', nombre: 'Reloj dorado cepillado', categoria: 'accesorio', ocasion: 'oficina', color: 'Dorado', hex: '#C09A5B', estilo: 'elegante', descripcion: 'Acento metálico suave.' },
      { id: 'mp-abri-1', nombre: 'Blazer camel', categoria: 'abrigo/blazer', ocasion: 'oficina', color: 'Camel', hex: '#B4895C', estilo: 'formal', descripcion: 'Estructura smart para oficina.' },
    ],
    verano: [
      { id: 'mv-sup-1', nombre: 'Camisa azul hielo', categoria: 'superior', ocasion: 'oficina', color: 'Azul hielo', hex: '#BFD0DF', estilo: 'formal', descripcion: 'Refuerza armonía fría de verano.' },
      { id: 'mv-sup-2', nombre: 'Playera gris frío', categoria: 'superior', ocasion: 'casual', color: 'Gris frío', hex: '#8F98A4', estilo: 'urbano', descripcion: 'Fácil de combinar con denim oscuro.' },
      { id: 'mv-inf-1', nombre: 'Jeans azul medio', categoria: 'inferior', ocasion: 'fin de semana', color: 'Azul medio', hex: '#5A6E87', estilo: 'casual', descripcion: 'Base relajada para looks diarios.' },
      { id: 'mv-cal-1', nombre: 'Sneaker gris', categoria: 'calzado', ocasion: 'casual', color: 'Gris', hex: '#9AA1A9', estilo: 'urbano', descripcion: 'Complemento cómodo y neutro.' },
      { id: 'mv-acc-1', nombre: 'Lentes plata', categoria: 'accesorio', ocasion: 'oficina', color: 'Plata', hex: '#C5CCD3', estilo: 'minimalista', descripcion: 'Montura fina y limpia.' },
      { id: 'mv-abri-1', nombre: 'Blazer azul acero', categoria: 'abrigo/blazer', ocasion: 'formal', color: 'Azul acero', hex: '#5D718C', estilo: 'formal', descripcion: 'Eleva outfits business-casual.' },
    ],
    otono: [
      { id: 'mo-sup-1', nombre: 'Camisa oliva', categoria: 'superior', ocasion: 'oficina', color: 'Oliva', hex: '#687047', estilo: 'formal', descripcion: 'Color clave de otoño masculino.' },
      { id: 'mo-sup-2', nombre: 'Playera mostaza suave', categoria: 'superior', ocasion: 'casual', color: 'Mostaza', hex: '#B9912E', estilo: 'casual', descripcion: 'Acento cálido para fines de semana.' },
      { id: 'mo-inf-1', nombre: 'Pantalón tabaco', categoria: 'inferior', ocasion: 'formal', color: 'Tabaco', hex: '#7A5339', estilo: 'elegante', descripcion: 'Sólido para oficina y reuniones.' },
      { id: 'mo-cal-1', nombre: 'Botín cuero', categoria: 'calzado', ocasion: 'evento', color: 'Cuero', hex: '#7B4A2D', estilo: 'urbano', descripcion: 'Acabado robusto y elegante.' },
      { id: 'mo-acc-1', nombre: 'Reloj correa cognac', categoria: 'accesorio', ocasion: 'oficina', color: 'Cognac', hex: '#8E5A3C', estilo: 'elegante', descripcion: 'Complemento clásico de temporada.' },
      { id: 'mo-abri-1', nombre: 'Blazer chocolate', categoria: 'abrigo/blazer', ocasion: 'formal', color: 'Chocolate', hex: '#4A2F24', estilo: 'formal', descripcion: 'Capa protagonista en otoño.' },
    ],
    invierno: [
      { id: 'mi-sup-1', nombre: 'Camisa blanca nítida', categoria: 'superior', ocasion: 'formal', color: 'Blanco nítido', hex: '#F8F9FB', estilo: 'formal', descripcion: 'Base de alto contraste para sastrería.' },
      { id: 'mi-sup-2', nombre: 'Playera cobalto', categoria: 'superior', ocasion: 'casual', color: 'Cobalto', hex: '#2F55D4', estilo: 'urbano', descripcion: 'Acento moderno y vibrante.' },
      { id: 'mi-inf-1', nombre: 'Pantalón carbón', categoria: 'inferior', ocasion: 'oficina', color: 'Carbón', hex: '#3A3E46', estilo: 'minimalista', descripcion: 'Neutro frío elegante.' },
      { id: 'mi-cal-1', nombre: 'Oxford negro', categoria: 'calzado', ocasion: 'formal', color: 'Negro', hex: '#121318', estilo: 'formal', descripcion: 'Impecable para eventos y oficina.' },
      { id: 'mi-acc-1', nombre: 'Corbata vino frío', categoria: 'accesorio', ocasion: 'formal', color: 'Vino frío', hex: '#6A1D35', estilo: 'elegante', descripcion: 'Punto focal en sastrería invernal.' },
      { id: 'mi-abri-1', nombre: 'Blazer azul noche', categoria: 'abrigo/blazer', ocasion: 'oficina', color: 'Azul noche', hex: '#1F2A48', estilo: 'formal', descripcion: 'Alternativa sofisticada al negro.' },
    ],
  },
}

export function getPrendasDemo(estacion = 'verano', genero = 'femenino') {
  const generoId = genero === 'masculino' ? 'masculino' : 'femenino'
  const estacionId = ['primavera', 'verano', 'otono', 'invierno'].includes(estacion) ? estacion : 'verano'
  return PRENDAS_DEMO[generoId]?.[estacionId] || []
}
