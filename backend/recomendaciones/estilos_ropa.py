"""
Recomendador de Estilos de Ropa
================================
Proporciona recomendaciones de ropa según:
- Estación de color
- Género
- Forma del rostro (correlacionada con tipo de cuerpo)
"""

from typing import Dict, Any, List


class RecomendadorRopa:
    """
    Genera recomendaciones de estilos de ropa personalizadas.
    """
    
    def __init__(self):
        """Inicializa las bases de datos de estilos"""
        self._inicializar_estilos()
    
    def _inicializar_estilos(self):
        """Inicializa los estilos por género"""
        
        # Estilos para mujeres
        self.estilos_femeninos = {
            "vestidos": {
                "tipos": [
                    {
                        "nombre": "Vestido Wrap (Cruzado)",
                        "descripcion": "Vestido que se cruza y ata en la cintura",
                        "ideal_para": ["todos"],
                        "beneficios": "Define la cintura y favorece a todas las figuras"
                    },
                    {
                        "nombre": "Vestido Línea A",
                        "descripcion": "Vestido que se ensancha desde el busto",
                        "ideal_para": ["redondo", "cuadrado", "manzana"],
                        "beneficios": "Disimula el abdomen y alarga la figura"
                    },
                    {
                        "nombre": "Vestido Tubo",
                        "descripcion": "Vestido ajustado al cuerpo",
                        "ideal_para": ["ovalado", "diamante", "corazon"],
                        "beneficios": "Resalta las curvas de forma elegante"
                    },
                    {
                        "nombre": "Vestido Imperio",
                        "descripcion": "Vestido con corte bajo el busto",
                        "ideal_para": ["redondo", "cuadrado", "corazon"],
                        "beneficios": "Alarga la figura y es muy cómodo"
                    },
                    {
                        "nombre": "Vestido Camisero",
                        "descripcion": "Vestido estilo camisa con botones",
                        "ideal_para": ["alargado", "ovalado", "diamante"],
                        "beneficios": "Versátil y estiloso"
                    }
                ]
            },
            "blusas": {
                "tipos": [
                    {
                        "nombre": "Blusa Peplum",
                        "descripcion": "Blusa con vuelo en la cintura",
                        "ideal_para": ["cuadrado", "alargado"],
                        "beneficios": "Crea la ilusión de curvas"
                    },
                    {
                        "nombre": "Blusa Cuello V",
                        "descripcion": "Blusa con escote en V",
                        "ideal_para": ["redondo", "cuadrado", "todos"],
                        "beneficios": "Alarga el cuello y estiliza"
                    },
                    {
                        "nombre": "Blusa Off-Shoulder",
                        "descripcion": "Blusa que descubre los hombros",
                        "ideal_para": ["corazon", "diamante", "ovalado"],
                        "beneficios": "Resalta los hombros y es muy femenina"
                    },
                    {
                        "nombre": "Camisa Clásica",
                        "descripcion": "Camisa de botones tradicional",
                        "ideal_para": ["todos"],
                        "beneficios": "Básico versátil y atemporal"
                    }
                ]
            },
            "pantalones": {
                "tipos": [
                    {
                        "nombre": "Pantalón Recto",
                        "descripcion": "Pantalón de pierna recta",
                        "ideal_para": ["todos"],
                        "beneficios": "Básico universal y profesional"
                    },
                    {
                        "nombre": "Pantalón Wide Leg",
                        "descripcion": "Pantalón de pierna ancha",
                        "ideal_para": ["ovalado", "diamante", "corazon"],
                        "beneficios": "Elegante y alarga las piernas"
                    },
                    {
                        "nombre": "Pantalón Palazzo",
                        "descripcion": "Pantalón muy ancho y fluido",
                        "ideal_para": ["redondo", "cuadrado", "alargado"],
                        "beneficios": "Cómodo y muy favorecedor"
                    },
                    {
                        "nombre": "Pantalón Bootcut",
                        "descripcion": "Pantalón acampanado desde la rodilla",
                        "ideal_para": ["corazon", "diamante"],
                        "beneficios": "Equilibra las proporciones"
                    }
                ]
            }
        }
        
        # Estilos para hombres
        self.estilos_masculinos = {
            "camisas": {
                "tipos": [
                    {
                        "nombre": "Camisa Slim Fit",
                        "descripcion": "Camisa de corte ajustado",
                        "ideal_para": ["ovalado", "alargado", "diamante"],
                        "beneficios": "Moderna y estiliza la figura"
                    },
                    {
                        "nombre": "Camisa Regular Fit",
                        "descripcion": "Camisa de corte clásico",
                        "ideal_para": ["todos"],
                        "beneficios": "Cómoda y versátil"
                    },
                    {
                        "nombre": "Camisa Oversized",
                        "descripcion": "Camisa de corte holgado",
                        "ideal_para": ["alargado", "ovalado"],
                        "beneficios": "Casual y moderna"
                    }
                ]
            },
            "pantalones": {
                "tipos": [
                    {
                        "nombre": "Pantalón Chino",
                        "descripcion": "Pantalón casual de algodón",
                        "ideal_para": ["todos"],
                        "beneficios": "Versátil para casual y semi-formal"
                    },
                    {
                        "nombre": "Jeans Rectos",
                        "descripcion": "Jeans de corte recto clásico",
                        "ideal_para": ["redondo", "cuadrado", "ovalado"],
                        "beneficios": "Básico atemporal"
                    },
                    {
                        "nombre": "Pantalón Slim",
                        "descripcion": "Pantalón de corte ajustado",
                        "ideal_para": ["alargado", "ovalado", "diamante"],
                        "beneficios": "Moderno y estiliza"
                    },
                    {
                        "nombre": "Pantalón de Vestir",
                        "descripcion": "Pantalón formal de corte clásico",
                        "ideal_para": ["todos"],
                        "beneficios": "Esencial para ocasiones formales"
                    }
                ]
            },
            "sacos": {
                "tipos": [
                    {
                        "nombre": "Saco Estructurado",
                        "descripcion": "Saco con hombreras definidas",
                        "ideal_para": ["ovalado", "alargado"],
                        "beneficios": "Da estructura y presencia"
                    },
                    {
                        "nombre": "Saco Desestructurado",
                        "descripcion": "Saco sin hombreras rígidas",
                        "ideal_para": ["cuadrado", "redondo"],
                        "beneficios": "Casual y cómodo"
                    },
                    {
                        "nombre": "Blazer Cruzado",
                        "descripcion": "Saco con botonadura cruzada",
                        "ideal_para": ["alargado", "diamante"],
                        "beneficios": "Elegante y agrega presencia"
                    }
                ]
            },
            "playeras": {
                "tipos": [
                    {
                        "nombre": "Playera Cuello V",
                        "descripcion": "Playera con escote en V",
                        "ideal_para": ["redondo", "cuadrado"],
                        "beneficios": "Alarga el cuello y estiliza"
                    },
                    {
                        "nombre": "Playera Cuello Redondo",
                        "descripcion": "Playera clásica con cuello redondo",
                        "ideal_para": ["alargado", "ovalado", "diamante"],
                        "beneficios": "Básico versátil"
                    },
                    {
                        "nombre": "Polo",
                        "descripcion": "Playera con cuello y botones",
                        "ideal_para": ["todos"],
                        "beneficios": "Casual elegante"
                    }
                ]
            }
        }
    
    def recomendar(
        self,
        estacion: Dict[str, Any],
        genero: str,
        forma_rostro: str
    ) -> Dict[str, Any]:
        """
        Genera recomendaciones de ropa personalizadas.
        
        Args:
            estacion: Información de la estación de color
            genero: "femenino" o "masculino"
            forma_rostro: Forma del rostro detectada
            
        Returns:
            Diccionario con recomendaciones de ropa
        """
        # Seleccionar base de estilos según género
        if genero.lower() in ["femenino", "mujer", "f"]:
            estilos_base = self.estilos_femeninos
            genero_norm = "femenino"
        else:
            estilos_base = self.estilos_masculinos
            genero_norm = "masculino"
        
        recomendaciones = {
            "genero": genero_norm,
            "forma_rostro": forma_rostro,
            "categorias": {}
        }
        
        # Generar recomendaciones por categoría
        for categoria, datos in estilos_base.items():
            items_recomendados = []
            
            for item in datos.get("tipos", []):
                # Verificar si es ideal para la forma de rostro
                formas_ideales = item.get("ideal_para", [])
                
                if "todos" in formas_ideales or forma_rostro in formas_ideales:
                    prioridad = "alta" if forma_rostro in formas_ideales else "media"
                else:
                    prioridad = "baja"
                
                items_recomendados.append({
                    **item,
                    "prioridad": prioridad,
                    "compatible_estacion": True
                })
            
            # Ordenar por prioridad
            items_ordenados = sorted(
                items_recomendados,
                key=lambda x: {"alta": 0, "media": 1, "baja": 2}.get(x["prioridad"], 3)
            )
            
            recomendaciones["categorias"][categoria] = items_ordenados
        
        # Agregar consejos generales según estación
        recomendaciones["consejos_estacion"] = self._consejos_por_estacion(
            estacion.get("id", "primavera"),
            genero_norm
        )
        
        # Agregar outfit sugerido
        recomendaciones["outfit_sugerido"] = self._generar_outfit(
            estacion,
            genero_norm,
            forma_rostro
        )
        
        return recomendaciones
    
    def _consejos_por_estacion(self, estacion: str, genero: str) -> List[str]:
        """Genera consejos de vestimenta según estación"""
        consejos = {
            "primavera": {
                "femenino": [
                    "Opta por telas ligeras y colores vibrantes",
                    "Los estampados florales pequeños te favorecen",
                    "Usa accesorios dorados para complementar tu tono cálido",
                    "Las telas con brillo suave como la seda te quedan bien",
                    "Evita colores muy oscuros o apagados"
                ],
                "masculino": [
                    "Elige camisas en tonos cálidos como salmón o celeste",
                    "Los pantalones en tonos beige y camel son ideales",
                    "Usa accesorios dorados o de cuero café",
                    "Opta por corbatas con patrones sutiles y colores vivos",
                    "Evita el negro total; prefiere azul marino o gris cálido"
                ]
            },
            "verano": {
                "femenino": [
                    "Las telas fluidas y suaves son perfectas para ti",
                    "Los tonos pastel iluminan tu rostro",
                    "Usa accesorios plateados o en oro rosado",
                    "Los estampados suaves y difuminados te favorecen",
                    "Evita colores muy intensos o neón"
                ],
                "masculino": [
                    "Elige camisas en tonos gris azulado o lavanda",
                    "Los trajes en gris medio son muy favorecedores",
                    "Usa corbatas en tonos suaves",
                    "Opta por accesorios plateados",
                    "Evita colores naranjas o amarillos intensos"
                ]
            },
            "otono": {
                "femenino": [
                    "Las telas con textura como tweed o lana te favorecen",
                    "Los colores terrosos son tu mejor aliado",
                    "Usa accesorios en bronce, cobre o oro antiguo",
                    "Los estampados étnicos y paisley te quedan genial",
                    "Evita colores muy fríos o pastel"
                ],
                "masculino": [
                    "Elige camisas en tonos terracota, mostaza o verde oliva",
                    "Los trajes en tonos café o verde bosque son ideales",
                    "Usa corbatas con patrones paisley o geométricos",
                    "Opta por accesorios de cuero en tonos café",
                    "Evita colores muy brillantes o neón"
                ]
            },
            "invierno": {
                "femenino": [
                    "Las telas estructuradas y elegantes te favorecen",
                    "Los colores intensos y puros son perfectos",
                    "Usa accesorios plateados o en oro blanco",
                    "Los estampados geométricos y definidos te quedan bien",
                    "El negro y blanco son tus básicos ideales"
                ],
                "masculino": [
                    "Elige camisas en blanco puro o colores intensos",
                    "Los trajes en negro o azul marino son perfectos",
                    "Usa corbatas en colores sólidos e intensos",
                    "Opta por accesorios plateados",
                    "Evita colores apagados o terrosos"
                ]
            }
        }
        
        return consejos.get(estacion, consejos["primavera"]).get(genero, [])
    
    def _generar_outfit(
        self,
        estacion: Dict[str, Any],
        genero: str,
        forma_rostro: str
    ) -> Dict[str, Any]:
        """Genera un outfit completo sugerido"""
        id_estacion = estacion.get("id", "primavera")
        
        outfits = {
            "primavera": {
                "femenino": {
                    "nombre": "Look Primaveral Fresco",
                    "ocasion": "Día casual o trabajo",
                    "prendas": [
                        "Blusa en tono coral o durazno",
                        "Falda línea A en beige o blanco roto",
                        "Sandalias o zapatos en nude",
                        "Bolso en tono camel o dorado"
                    ],
                    "accesorios": [
                        "Aretes dorados",
                        "Pulsera delicada",
                        "Pañuelo con estampado floral"
                    ]
                },
                "masculino": {
                    "nombre": "Look Cálido Casual",
                    "ocasion": "Casual elegante",
                    "prendas": [
                        "Camisa en tono salmón o celeste",
                        "Pantalón chino en beige",
                        "Zapatos mocasines café claro",
                        "Cinturón de cuero café"
                    ],
                    "accesorios": [
                        "Reloj con correa de cuero",
                        "Lentes de sol con marco dorado"
                    ]
                }
            },
            "verano": {
                "femenino": {
                    "nombre": "Look Suave y Elegante",
                    "ocasion": "Día o tarde",
                    "prendas": [
                        "Vestido en tono lavanda o rosa pastel",
                        "Blazer ligero en gris perla",
                        "Zapatos en plata o nude rosado",
                        "Bolso en tono gris o blanco"
                    ],
                    "accesorios": [
                        "Aretes plateados",
                        "Collar delicado",
                        "Pulsera de perlas"
                    ]
                },
                "masculino": {
                    "nombre": "Look Fresco y Profesional",
                    "ocasion": "Trabajo o evento",
                    "prendas": [
                        "Camisa en azul cielo o gris azulado",
                        "Pantalón de vestir gris",
                        "Zapatos oxford en negro o gris",
                        "Cinturón negro"
                    ],
                    "accesorios": [
                        "Reloj con acabado plateado",
                        "Mancuernillas sutiles"
                    ]
                }
            },
            "otono": {
                "femenino": {
                    "nombre": "Look Terroso Elegante",
                    "ocasion": "Cualquier ocasión",
                    "prendas": [
                        "Blusa en tono terracota o mostaza",
                        "Pantalón wide leg en verde oliva",
                        "Botines en café o camel",
                        "Bolso estructurado en café"
                    ],
                    "accesorios": [
                        "Aretes en bronce o cobre",
                        "Pañuelo con estampado étnico",
                        "Pulseras de cuero"
                    ]
                },
                "masculino": {
                    "nombre": "Look Cálido Sofisticado",
                    "ocasion": "Casual o semi-formal",
                    "prendas": [
                        "Suéter en tono óxido o verde bosque",
                        "Pantalón de pana o chino café",
                        "Zapatos brogue en café oscuro",
                        "Chamarra de cuero café"
                    ],
                    "accesorios": [
                        "Reloj con correa de cuero café",
                        "Bufanda en tonos tierra"
                    ]
                }
            },
            "invierno": {
                "femenino": {
                    "nombre": "Look Dramático y Elegante",
                    "ocasion": "Evento o noche",
                    "prendas": [
                        "Vestido negro o en tono joya (rojo, azul royal)",
                        "Blazer estructurado negro",
                        "Tacones en negro o plata",
                        "Clutch en plata o negro"
                    ],
                    "accesorios": [
                        "Aretes llamativos plateados",
                        "Collar statement",
                        "Anillo de piedra oscura"
                    ]
                },
                "masculino": {
                    "nombre": "Look Elegante Contrastante",
                    "ocasion": "Formal o evento",
                    "prendas": [
                        "Camisa blanca impecable",
                        "Traje negro o azul marino",
                        "Zapatos de vestir negros brillantes",
                        "Cinturón negro"
                    ],
                    "accesorios": [
                        "Reloj elegante con acabado plateado",
                        "Corbata en color intenso (rojo, morado)",
                        "Mancuernillas plateadas"
                    ]
                }
            }
        }
        
        return outfits.get(id_estacion, outfits["primavera"]).get(genero, {})

