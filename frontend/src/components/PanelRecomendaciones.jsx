/**
 * Componente PanelRecomendaciones
 * Muestra las recomendaciones de ropa y peinados
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shirt, Scissors, Sparkles, ChevronDown, ChevronUp, Star, AlertCircle, Gem, Circle } from 'lucide-react'

function PanelRecomendaciones({ resultados, genero }) {
  const [seccionExpandida, setSeccionExpandida] = useState('ropa')
  const { recomendaciones } = resultados
  
  // Toggle de sección
  const toggleSeccion = (seccion) => {
    setSeccionExpandida(seccionExpandida === seccion ? null : seccion)
  }
  
  return (
    <div className="section-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="section-title">
            <Sparkles className="inline-block w-8 h-8 mr-2" />
            Recomendaciones de Estilo
          </h2>
          <p className="text-white/60">
            Prendas y estilos que complementan tu colorimetría
          </p>
        </div>
        
        {/* Panel de Ropa */}
        <motion.div 
          className="glass-card mb-6 max-w-4xl mx-auto"
          layout
        >
          <button
            onClick={() => toggleSeccion('ropa')}
            className="w-full flex items-center justify-between p-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-xl font-semibold">Estilos de Ropa</h3>
                <p className="text-white/60 text-sm">Prendas que favorecen tu figura</p>
              </div>
            </div>
            {seccionExpandida === 'ropa' ? (
              <ChevronUp className="w-6 h-6 text-white/50" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white/50" />
            )}
          </button>
          
          <AnimatePresence>
            {seccionExpandida === 'ropa' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-white/10 mt-4">
                  {/* Outfit sugerido */}
                  {recomendaciones.ropa.outfit_sugerido && (
                    <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <h4 className="font-semibold">{recomendaciones.ropa.outfit_sugerido.nombre}</h4>
                      </div>
                      <p className="text-white/60 text-sm mb-4">
                        Ideal para: {recomendaciones.ropa.outfit_sugerido.ocasion}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Prendas:</h5>
                          <ul className="space-y-1">
                            {recomendaciones.ropa.outfit_sugerido.prendas.map((prenda, i) => (
                              <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                                <span className="text-purple-400">•</span>
                                {prenda}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Accesorios:</h5>
                          <ul className="space-y-1">
                            {recomendaciones.ropa.outfit_sugerido.accesorios.map((accesorio, i) => (
                              <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                                <span className="text-pink-400">•</span>
                                {accesorio}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Categorías de ropa */}
                  {Object.entries(recomendaciones.ropa.categorias).map(([categoria, items]) => (
                    <div key={categoria} className="mb-6">
                      <h4 className="font-semibold capitalize mb-4 flex items-center gap-2">
                        <Shirt className="w-5 h-5 text-purple-400" />
                        {categoria}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.slice(0, 4).map((item, index) => (
                          <motion.div
                            key={index}
                            className={`p-4 rounded-xl border ${
                              item.prioridad === 'alta' 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : item.prioridad === 'media'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium">{item.nombre}</h5>
                              {item.prioridad === 'alta' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-sm mb-2">{item.descripcion}</p>
                            <p className="text-white/40 text-xs">{item.beneficios}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Consejos de estación */}
                  <div className="mt-6 p-4 rounded-xl bg-white/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      💡 Consejos según tu Estación
                    </h4>
                    <ul className="space-y-2">
                      {recomendaciones.ropa.consejos_estacion.map((consejo, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          {consejo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Panel de Peinados */}
        <motion.div 
          className="glass-card mb-6 max-w-4xl mx-auto"
          layout
        >
          <button
            onClick={() => toggleSeccion('cabello')}
            className="w-full flex items-center justify-between p-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-xl font-semibold">Estilos de Cabello</h3>
                <p className="text-white/60 text-sm">Cortes y peinados para tu rostro</p>
              </div>
            </div>
            {seccionExpandida === 'cabello' ? (
              <ChevronUp className="w-6 h-6 text-white/50" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white/50" />
            )}
          </button>
          
          <AnimatePresence>
            {seccionExpandida === 'cabello' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-white/10 mt-4">
                  {/* Descripción de forma de rostro */}
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <h4 className="font-semibold mb-2">
                      Tu forma de rostro: <span className="capitalize">{recomendaciones.cabello.forma_rostro}</span>
                    </h4>
                    <p className="text-white/70 text-sm">{recomendaciones.cabello.descripcion_forma}</p>
                  </div>
                  
                  {/* Estilos recomendados */}
                  <h4 className="font-semibold mb-4">Estilos Recomendados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {recomendaciones.cabello.estilos_recomendados.map((estilo, index) => (
                      <motion.div
                        key={index}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h5 className="font-medium mb-2">{estilo.nombre}</h5>
                        <p className="text-white/60 text-sm mb-3">{estilo.descripcion}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                            {estilo.longitud}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                            Mantenimiento: {estilo.mantenimiento}
                          </span>
                        </div>
                        {estilo.ideal_para && (
                          <p className="text-white/40 text-xs mt-2">
                            Ideal para: {estilo.ideal_para.join(', ')}
                          </p>
                        )}
                        {estilo.productos && (
                          <p className="text-white/40 text-xs mt-1">
                            Productos: {estilo.productos.join(', ')}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Estilos a evitar */}
                  {recomendaciones.cabello.estilos_evitar && recomendaciones.cabello.estilos_evitar.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-300">
                        <AlertCircle className="w-5 h-5" />
                        Estilos a Evitar
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {recomendaciones.cabello.estilos_evitar.map((estilo, index) => (
                          <li key={index} className="text-white/60 text-sm flex items-center gap-2">
                            <span className="text-red-400">✕</span>
                            {estilo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Colores de tinte */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <h4 className="font-semibold mb-3 text-green-300">🎨 Colores de Tinte Recomendados</h4>
                      <ul className="space-y-1">
                        {recomendaciones.cabello.colores_tinte.recomendados.map((color, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            {color}
                          </li>
                        ))}
                      </ul>
                      <p className="text-white/50 text-xs mt-3">
                        💡 {recomendaciones.cabello.colores_tinte.mechas}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <h4 className="font-semibold mb-3 text-red-300">🚫 Colores a Evitar</h4>
                      <ul className="space-y-1">
                        {recomendaciones.cabello.colores_tinte.evitar.map((color, index) => (
                          <li key={index} className="text-white/60 text-sm flex items-center gap-2">
                            <span className="text-red-400">✕</span>
                            {color}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Consejos */}
                  <div className="p-4 rounded-xl bg-white/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      💡 Consejos para tu Cabello
                    </h4>
                    <ul className="space-y-2">
                      {recomendaciones.cabello.consejos.map((consejo, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          {consejo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Panel de Joyería */}
        <motion.div 
          className="glass-card mb-6 max-w-4xl mx-auto"
          layout
        >
          <button
            onClick={() => toggleSeccion('joyeria')}
            className="w-full flex items-center justify-between p-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-xl font-semibold">Joyería</h3>
                <p className="text-white/60 text-sm">Metales y estilos para tu rostro</p>
              </div>
            </div>
            {seccionExpandida === 'joyeria' ? (
              <ChevronUp className="w-6 h-6 text-white/50" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white/50" />
            )}
          </button>
          
          <AnimatePresence>
            {seccionExpandida === 'joyeria' && recomendaciones.joyeria && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-white/10 mt-4">
                  {/* Descripción de forma de rostro */}
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-amber-500/30">
                    <h4 className="font-semibold mb-2">
                      Tu forma de rostro: <span className="capitalize">{recomendaciones.joyeria.forma_rostro}</span>
                    </h4>
                    <p className="text-white/70 text-sm">{recomendaciones.joyeria.descripcion_rostro}</p>
                  </div>
                  
                  {/* Metales recomendados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <h4 className="font-semibold mb-3 text-green-300">✨ Metales Recomendados</h4>
                      <ul className="space-y-1">
                        {recomendaciones.joyeria.metales?.recomendados?.map((metal, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                            <Circle className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {metal}
                          </li>
                        ))}
                      </ul>
                      <p className="text-white/50 text-xs mt-3">
                        {recomendaciones.joyeria.metales?.descripcion}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <h4 className="font-semibold mb-3 text-red-300">🚫 Metales a Evitar</h4>
                      <ul className="space-y-1">
                        {recomendaciones.joyeria.metales?.evitar?.map((metal, index) => (
                          <li key={index} className="text-white/60 text-sm flex items-center gap-2">
                            <span className="text-red-400">✕</span>
                            {metal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Aretes recomendados */}
                  <h4 className="font-semibold mb-4">💎 Aretes para tu Rostro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {recomendaciones.joyeria.aretes?.estilos?.slice(0, 4).map((arete, index) => (
                      <motion.div
                        key={index}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h5 className="font-medium mb-1">{arete.nombre}</h5>
                        <p className="text-white/60 text-sm mb-2">{arete.descripcion}</p>
                        <p className="text-amber-300 text-xs">✓ {arete.beneficio}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Tip de aretes */}
                  {recomendaciones.joyeria.aretes?.tip && (
                    <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-white/70 text-sm">
                        💡 <strong>Tip:</strong> {recomendaciones.joyeria.aretes.tip}
                      </p>
                    </div>
                  )}
                  
                  {/* Aretes a evitar */}
                  {recomendaciones.joyeria.aretes?.evitar?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium mb-2 text-red-300 text-sm">Estilos de aretes a evitar:</h5>
                      <ul className="flex flex-wrap gap-2">
                        {recomendaciones.joyeria.aretes.evitar.map((item, index) => (
                          <li key={index} className="px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Piedras preciosas */}
                  <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <h4 className="font-semibold mb-3 text-purple-300">💎 Piedras Preciosas</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recomendaciones.joyeria.piedras?.recomendadas?.map((piedra, index) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-white/10 text-sm">
                          {piedra}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/60 text-sm">
                      🦪 {recomendaciones.joyeria.piedras?.perlas}
                    </p>
                  </div>
                  
                  {/* Consejos */}
                  <div className="p-4 rounded-xl bg-white/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      💡 Consejos de Joyería
                    </h4>
                    <ul className="space-y-2">
                      {recomendaciones.joyeria.consejos?.map((consejo, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          {consejo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Panel de Maquillaje */}
        <motion.div 
          className="glass-card max-w-4xl mx-auto"
          layout
        >
          <button
            onClick={() => toggleSeccion('maquillaje')}
            className="w-full flex items-center justify-between p-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-xl font-semibold">Maquillaje</h3>
                <p className="text-white/60 text-sm">Tonos ideales para tu colorimetría</p>
              </div>
            </div>
            {seccionExpandida === 'maquillaje' ? (
              <ChevronUp className="w-6 h-6 text-white/50" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white/50" />
            )}
          </button>
          
          <AnimatePresence>
            {seccionExpandida === 'maquillaje' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-white/10 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Labios */}
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <h4 className="font-semibold mb-3 text-rose-300">💋 Labios</h4>
                      <ul className="space-y-1">
                        {recomendaciones.paleta_colores.maquillaje.labios.map((tono, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-400" />
                            {tono}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Ojos */}
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                      <h4 className="font-semibold mb-3 text-purple-300">👁️ Sombras de Ojos</h4>
                      <ul className="space-y-1">
                        {recomendaciones.paleta_colores.maquillaje.ojos.map((tono, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-400" />
                            {tono}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Mejillas */}
                    <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                      <h4 className="font-semibold mb-3 text-pink-300">🌸 Rubor/Mejillas</h4>
                      <ul className="space-y-1">
                        {recomendaciones.paleta_colores.maquillaje.mejillas.map((tono, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-pink-400" />
                            {tono}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PanelRecomendaciones

