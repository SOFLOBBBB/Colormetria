import { LAYER_Z_INDEX } from '../../data/svgWardrobe'

/**
 * Capa SVG sobre el maniquí.
 * @param {{ layer: string, item: object|null, zIndex?: number, className?: string }} props
 */
function ClothingLayer({ layer, item, zIndex, className = '' }) {
  if (!item?.draw) return null

  const color = item.hex || item.color || '#9aa1b0'
  const genero = item.genero || 'femenino'
  const markup = item.draw(color, genero)
  const z = zIndex ?? LAYER_Z_INDEX[layer] ?? 10

  return (
    <svg
      viewBox="0 0 280 480"
      className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out ${className}`}
      style={{ zIndex: z }}
      aria-hidden={!item.nombre}
      aria-label={item.nombre ? `Capa ${layer}: ${item.nombre}` : undefined}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export default ClothingLayer
