"""
Recomendador de Estilos de Cabello
===================================
Proporciona recomendaciones de peinados según:
- Forma del rostro
- Género
- Estación de color (para tonos de tinte)
"""

from typing import Dict, Any, List


class RecomendadorCabello:
    """
    Genera recomendaciones de estilos de cabello personalizadas.
    """
    
    def __init__(self):
        """Inicializa las bases de datos de estilos"""
        self._inicializar_estilos()
    
    def _inicializar_estilos(self):
        """Inicializa los estilos de cabello por género y forma de rostro"""
        
        # Estilos para mujeres
        self.estilos_femeninos = {
            "ovalado": {
                "descripcion": "El rostro ovalado es considerado ideal y puede llevar casi cualquier estilo",
                "estilos": [
                    {
                        "nombre": "Bob Clásico",
                        "descripcion": "Corte recto a la altura de la mandíbula",
                        "longitud": "corto",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Capas Largas",
                        "descripcion": "Cabello largo con capas sutiles para dar movimiento",
                        "longitud": "largo",
                        "mantenimiento": "bajo",
                        "ideal_para": ["cabello liso", "ondulado", "rizado"]
                    },
                    {
                        "nombre": "Pixie Elegante",
                        "descripcion": "Corte muy corto con textura",
                        "longitud": "muy corto",
                        "mantenimiento": "alto",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Lob (Long Bob)",
                        "descripcion": "Bob largo que llega a los hombros",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Flequillo Recto",
                        "descripcion": "Flequillo clásico que enmarca el rostro",
                        "longitud": "cualquiera",
                        "mantenimiento": "alto",
                        "ideal_para": ["cabello liso"]
                    }
                ]
            },
            "redondo": {
                "descripcion": "El rostro redondo se beneficia de estilos que alarguen visualmente",
                "estilos": [
                    {
                        "nombre": "Capas Largas con Volumen Arriba",
                        "descripcion": "Capas que empiezan debajo de la barbilla con volumen en la coronilla",
                        "longitud": "largo",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Lob Asimétrico",
                        "descripcion": "Bob largo con corte angular que alarga el rostro",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Raya Lateral Profunda",
                        "descripcion": "Peinado con raya muy de lado para crear asimetría",
                        "longitud": "cualquiera",
                        "mantenimiento": "bajo",
                        "ideal_para": ["todos los tipos"]
                    },
                    {
                        "nombre": "Ondas Sueltas Largas",
                        "descripcion": "Cabello largo con ondas naturales",
                        "longitud": "largo",
                        "mantenimiento": "bajo",
                        "ideal_para": ["cabello ondulado", "rizado"]
                    }
                ],
                "evitar": [
                    "Cortes muy cortos redondos",
                    "Bob a la altura de la barbilla",
                    "Flequillo recto grueso",
                    "Raya al centro"
                ]
            },
            "cuadrado": {
                "descripcion": "El rostro cuadrado se suaviza con estilos que añadan curvas",
                "estilos": [
                    {
                        "nombre": "Ondas Suaves",
                        "descripcion": "Ondas que suavizan los ángulos de la mandíbula",
                        "longitud": "medio a largo",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Capas Suaves Enmarcando el Rostro",
                        "descripcion": "Capas que caen suavemente sobre la mandíbula",
                        "longitud": "medio a largo",
                        "mantenimiento": "bajo",
                        "ideal_para": ["todos los tipos"]
                    },
                    {
                        "nombre": "Flequillo Lateral",
                        "descripcion": "Flequillo barrido hacia un lado",
                        "longitud": "cualquiera",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Lob Texturizado",
                        "descripcion": "Bob largo con textura y movimiento",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    }
                ],
                "evitar": [
                    "Cortes muy rectos y simétricos",
                    "Bob angular que enfatice la mandíbula",
                    "Cabello muy corto pegado a la cabeza"
                ]
            },
            "alargado": {
                "descripcion": "El rostro alargado se equilibra con estilos que añadan ancho",
                "estilos": [
                    {
                        "nombre": "Ondas con Volumen Lateral",
                        "descripcion": "Ondas que añaden ancho a los lados",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Bob con Volumen",
                        "descripcion": "Bob a la altura de la barbilla con volumen",
                        "longitud": "corto",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Flequillo Tupido",
                        "descripcion": "Flequillo grueso que acorta visualmente el rostro",
                        "longitud": "cualquiera",
                        "mantenimiento": "alto",
                        "ideal_para": ["cabello liso"]
                    },
                    {
                        "nombre": "Rizos Definidos",
                        "descripcion": "Rizos que añaden ancho al rostro",
                        "longitud": "medio a largo",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello rizado", "ondulado"]
                    }
                ],
                "evitar": [
                    "Cabello muy largo y liso",
                    "Volumen excesivo arriba",
                    "Raya al centro sin flequillo"
                ]
            },
            "corazon": {
                "descripcion": "El rostro corazón se equilibra añadiendo volumen en la parte inferior",
                "estilos": [
                    {
                        "nombre": "Bob con Volumen en las Puntas",
                        "descripcion": "Bob que se ensancha hacia las puntas",
                        "longitud": "corto a medio",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Capas que Empiezan en la Barbilla",
                        "descripcion": "Capas que añaden volumen a la parte inferior del rostro",
                        "longitud": "medio a largo",
                        "mantenimiento": "bajo",
                        "ideal_para": ["todos los tipos"]
                    },
                    {
                        "nombre": "Ondas a la Altura de la Mandíbula",
                        "descripcion": "Ondas que equilibran la frente ancha",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Flequillo Lateral Ligero",
                        "descripcion": "Flequillo suave que suaviza la frente",
                        "longitud": "cualquiera",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    }
                ],
                "evitar": [
                    "Volumen excesivo en la parte superior",
                    "Cabello muy corto y pegado arriba",
                    "Estilos muy recogidos"
                ]
            },
            "diamante": {
                "descripcion": "El rostro diamante se equilibra añadiendo ancho en frente y mentón",
                "estilos": [
                    {
                        "nombre": "Flequillo Lateral Amplio",
                        "descripcion": "Flequillo que añade ancho a la frente",
                        "longitud": "cualquiera",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Bob con Volumen en la Barbilla",
                        "descripcion": "Bob que equilibra los pómulos prominentes",
                        "longitud": "corto",
                        "mantenimiento": "medio",
                        "ideal_para": ["cabello liso", "ondulado"]
                    },
                    {
                        "nombre": "Capas Suaves con Volumen",
                        "descripcion": "Capas que suavizan los pómulos",
                        "longitud": "medio a largo",
                        "mantenimiento": "bajo",
                        "ideal_para": ["todos los tipos"]
                    }
                ],
                "evitar": [
                    "Cabello muy corto sin volumen",
                    "Estilos que añadan ancho a los pómulos",
                    "Cabello totalmente recogido"
                ]
            }
        }
        
        # Estilos para hombres
        self.estilos_masculinos = {
            "ovalado": {
                "descripcion": "Forma versátil que permite casi cualquier estilo",
                "estilos": [
                    {
                        "nombre": "Pompadour Clásico",
                        "descripcion": "Cabello peinado hacia arriba y atrás con volumen",
                        "longitud": "corto arriba largo",
                        "mantenimiento": "alto",
                        "productos": ["Pomada", "Cera"]
                    },
                    {
                        "nombre": "Undercut",
                        "descripcion": "Lados rapados con longitud arriba",
                        "longitud": "variado",
                        "mantenimiento": "medio",
                        "productos": ["Gel", "Cera"]
                    },
                    {
                        "nombre": "Crew Cut",
                        "descripcion": "Corte militar clásico",
                        "longitud": "muy corto",
                        "mantenimiento": "bajo",
                        "productos": ["Ninguno o poco gel"]
                    },
                    {
                        "nombre": "Textured Crop",
                        "descripcion": "Cabello corto con textura en la parte superior",
                        "longitud": "corto",
                        "mantenimiento": "medio",
                        "productos": ["Pasta texturizante"]
                    },
                    {
                        "nombre": "Slick Back",
                        "descripcion": "Cabello peinado hacia atrás",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "productos": ["Pomada brillante"]
                    }
                ]
            },
            "redondo": {
                "descripcion": "Mejor con estilos que alarguen el rostro",
                "estilos": [
                    {
                        "nombre": "Pompadour Alto",
                        "descripcion": "Pompadour con mucho volumen que alarga el rostro",
                        "longitud": "medio arriba",
                        "mantenimiento": "alto",
                        "productos": ["Pomada", "Spray fijador"]
                    },
                    {
                        "nombre": "Faux Hawk",
                        "descripcion": "Estilo mohawk sutil con altura",
                        "longitud": "corto a medio",
                        "mantenimiento": "medio",
                        "productos": ["Gel", "Cera"]
                    },
                    {
                        "nombre": "Quiff",
                        "descripcion": "Flequillo voluminoso peinado hacia arriba y atrás",
                        "longitud": "medio",
                        "mantenimiento": "alto",
                        "productos": ["Mousse", "Spray"]
                    },
                    {
                        "nombre": "Side Part con Volumen",
                        "descripcion": "Raya lateral con volumen en la parte superior",
                        "longitud": "corto a medio",
                        "mantenimiento": "medio",
                        "productos": ["Pomada"]
                    }
                ],
                "evitar": [
                    "Cortes muy redondos",
                    "Flequillo recto",
                    "Cabello muy pegado a los lados"
                ]
            },
            "cuadrado": {
                "descripcion": "Mejor con estilos que suavicen los ángulos",
                "estilos": [
                    {
                        "nombre": "Textured Fringe",
                        "descripcion": "Flequillo con textura que suaviza la frente",
                        "longitud": "corto a medio",
                        "mantenimiento": "medio",
                        "productos": ["Pasta mate"]
                    },
                    {
                        "nombre": "Messy Quiff",
                        "descripcion": "Quiff despeinado y natural",
                        "longitud": "medio",
                        "mantenimiento": "bajo",
                        "productos": ["Spray de sal marina"]
                    },
                    {
                        "nombre": "Layered Cut",
                        "descripcion": "Corte con capas para suavizar",
                        "longitud": "medio",
                        "mantenimiento": "bajo",
                        "productos": ["Crema para peinar"]
                    },
                    {
                        "nombre": "Side Swept",
                        "descripcion": "Cabello barrido hacia un lado con movimiento",
                        "longitud": "medio",
                        "mantenimiento": "bajo",
                        "productos": ["Cera ligera"]
                    }
                ],
                "evitar": [
                    "Cortes muy estructurados",
                    "Undercut muy marcado",
                    "Líneas muy definidas"
                ]
            },
            "alargado": {
                "descripcion": "Mejor con estilos que añadan ancho",
                "estilos": [
                    {
                        "nombre": "Side Part Clásico",
                        "descripcion": "Raya lateral con volumen a los lados",
                        "longitud": "corto a medio",
                        "mantenimiento": "bajo",
                        "productos": ["Pomada"]
                    },
                    {
                        "nombre": "Fringe (Flequillo)",
                        "descripcion": "Flequillo que acorta visualmente el rostro",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "productos": ["Cera"]
                    },
                    {
                        "nombre": "Textured Crop Ancho",
                        "descripcion": "Crop con textura que añade ancho",
                        "longitud": "corto",
                        "mantenimiento": "medio",
                        "productos": ["Pasta texturizante"]
                    },
                    {
                        "nombre": "Buzz Cut con Volumen Lateral",
                        "descripcion": "Corte muy corto que no añade altura",
                        "longitud": "muy corto",
                        "mantenimiento": "bajo",
                        "productos": ["Ninguno"]
                    }
                ],
                "evitar": [
                    "Pompadour muy alto",
                    "Cabello muy largo arriba",
                    "Estilos que añadan altura"
                ]
            },
            "corazon": {
                "descripcion": "Mejor con estilos que equilibren la frente ancha",
                "estilos": [
                    {
                        "nombre": "Fringe Lateral",
                        "descripcion": "Flequillo barrido que cubre parte de la frente",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "productos": ["Cera", "Spray"]
                    },
                    {
                        "nombre": "Medium Length Textured",
                        "descripcion": "Cabello medio con textura",
                        "longitud": "medio",
                        "mantenimiento": "bajo",
                        "productos": ["Crema texturizante"]
                    },
                    {
                        "nombre": "Side Part Suave",
                        "descripcion": "Raya lateral con caída natural",
                        "longitud": "medio",
                        "mantenimiento": "bajo",
                        "productos": ["Pomada ligera"]
                    }
                ],
                "evitar": [
                    "Cabello muy corto que exponga la frente",
                    "Pompadour muy alto",
                    "Estilos que añadan ancho arriba"
                ]
            },
            "diamante": {
                "descripcion": "Mejor con estilos que equilibren los pómulos",
                "estilos": [
                    {
                        "nombre": "Textured Fringe",
                        "descripcion": "Flequillo con textura",
                        "longitud": "medio",
                        "mantenimiento": "medio",
                        "productos": ["Pasta mate"]
                    },
                    {
                        "nombre": "Swept Back con Volumen",
                        "descripcion": "Cabello hacia atrás con volumen lateral",
                        "longitud": "medio a largo",
                        "mantenimiento": "medio",
                        "productos": ["Pomada"]
                    },
                    {
                        "nombre": "Side Part con Volumen",
                        "descripcion": "Raya lateral que añade ancho a frente y barbilla",
                        "longitud": "medio",
                        "mantenimiento": "bajo",
                        "productos": ["Cera"]
                    }
                ],
                "evitar": [
                    "Estilos que añadan ancho a los pómulos",
                    "Cabello muy pegado a los lados"
                ]
            }
        }
        
        # Colores de tinte recomendados por estación
        self.colores_tinte = {
            "primavera": {
                "recomendados": [
                    "Rubio dorado",
                    "Rubio miel",
                    "Castaño claro dorado",
                    "Pelirrojo cobrizo",
                    "Caramelo",
                    "Bronde (rubio + castaño)"
                ],
                "evitar": [
                    "Negro azabache",
                    "Rubio platino frío",
                    "Castaño cenizo"
                ],
                "mechas": "Mechas doradas o cobrizas"
            },
            "verano": {
                "recomendados": [
                    "Rubio cenizo",
                    "Rubio platino",
                    "Castaño cenizo",
                    "Gris plateado",
                    "Rubio champagne",
                    "Castaño frío"
                ],
                "evitar": [
                    "Negro puro",
                    "Rubio dorado intenso",
                    "Castaño rojizo"
                ],
                "mechas": "Mechas platino o cenizas"
            },
            "otono": {
                "recomendados": [
                    "Castaño chocolate",
                    "Caoba",
                    "Pelirrojo intenso",
                    "Bronce",
                    "Caramelo oscuro",
                    "Negro cálido con reflejos cobrizos"
                ],
                "evitar": [
                    "Rubio platino",
                    "Negro azulado",
                    "Colores muy fríos"
                ],
                "mechas": "Mechas cobrizas o caramelo"
            },
            "invierno": {
                "recomendados": [
                    "Negro azabache",
                    "Castaño muy oscuro",
                    "Negro con reflejos azules",
                    "Rubio platino (extremo)",
                    "Burdeos oscuro",
                    "Morado intenso"
                ],
                "evitar": [
                    "Castaño medio dorado",
                    "Rubio miel",
                    "Colores cálidos intermedios"
                ],
                "mechas": "Mechas contrastantes: platino o negro intenso"
            }
        }
    
    def recomendar(
        self,
        forma_rostro: str,
        genero: str,
        estacion: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Genera recomendaciones de cabello personalizadas.
        
        Args:
            forma_rostro: Forma del rostro detectada
            genero: "femenino" o "masculino"
            estacion: Información de la estación de color
            
        Returns:
            Diccionario con recomendaciones de cabello
        """
        # Normalizar forma de rostro
        forma = forma_rostro.lower() if forma_rostro else "ovalado"
        if forma not in ["ovalado", "redondo", "cuadrado", "alargado", "corazon", "diamante"]:
            forma = "ovalado"
        
        # Seleccionar base de estilos según género
        if genero.lower() in ["femenino", "mujer", "f"]:
            estilos_base = self.estilos_femeninos
            genero_norm = "femenino"
        else:
            estilos_base = self.estilos_masculinos
            genero_norm = "masculino"
        
        # Obtener estilos para la forma de rostro
        datos_forma = estilos_base.get(forma, estilos_base["ovalado"])
        
        # Obtener colores de tinte según estación
        id_estacion = estacion.get("id", "primavera")
        colores = self.colores_tinte.get(id_estacion, self.colores_tinte["primavera"])
        
        return {
            "forma_rostro": forma,
            "genero": genero_norm,
            "descripcion_forma": datos_forma.get("descripcion", ""),
            "estilos_recomendados": datos_forma.get("estilos", []),
            "estilos_evitar": datos_forma.get("evitar", []),
            "colores_tinte": colores,
            "consejos": self._generar_consejos(forma, genero_norm)
        }
    
    def _generar_consejos(self, forma_rostro: str, genero: str) -> List[str]:
        """Genera consejos personalizados para el cuidado del cabello"""
        consejos_generales = [
            "Visita a tu estilista cada 6-8 semanas para mantener el corte",
            "Usa productos adecuados para tu tipo de cabello",
            "Protege tu cabello del calor antes de usar herramientas de styling"
        ]
        
        consejos_forma = {
            "ovalado": "Tu forma de rostro es muy versátil - ¡experimenta con diferentes estilos!",
            "redondo": "Busca estilos que añadan altura y evita volumen a los lados",
            "cuadrado": "Suaviza los ángulos con ondas y capas",
            "alargado": "Añade ancho a los lados y considera un flequillo",
            "corazon": "Equilibra con volumen en la parte inferior del cabello",
            "diamante": "Añade suavidad en la frente y la barbilla"
        }
        
        consejos_finales = consejos_generales.copy()
        if forma_rostro in consejos_forma:
            consejos_finales.insert(0, consejos_forma[forma_rostro])
        
        return consejos_finales

