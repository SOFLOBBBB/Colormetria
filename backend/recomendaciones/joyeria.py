"""
Recomendador de Joyería
=======================
Proporciona recomendaciones de joyería según:
- Estación de color (plata para frío, oro para cálido)
- Forma del rostro
- Subtono de piel
"""

from typing import Dict, Any, List


class RecomendadorJoyeria:
    """
    Genera recomendaciones de joyería personalizadas basadas en
    colorimetría y forma del rostro.
    """
    
    def __init__(self):
        """Inicializa las bases de datos de joyería"""
        self._inicializar_datos()
    
    def _inicializar_datos(self):
        """Inicializa tipos de joyería y recomendaciones"""
        
        # Metales por estación
        self.metales_por_estacion = {
            "primavera": {
                "principales": ["Oro amarillo", "Oro rosa", "Bronce dorado"],
                "evitar": ["Plata", "Platino", "Oro blanco"],
                "descripcion": "Los metales cálidos como el oro amarillo complementan tu subtono dorado"
            },
            "verano": {
                "principales": ["Plata", "Oro blanco", "Oro rosa suave", "Platino"],
                "evitar": ["Oro amarillo intenso", "Bronce", "Cobre"],
                "descripcion": "Los metales fríos como la plata armonizan con tu subtono rosado"
            },
            "otono": {
                "principales": ["Oro amarillo", "Bronce", "Cobre", "Oro antiguo"],
                "evitar": ["Plata brillante", "Platino"],
                "descripcion": "Los metales cálidos y terrosos realzan tu calidez natural"
            },
            "invierno": {
                "principales": ["Plata", "Platino", "Oro blanco", "Acero"],
                "evitar": ["Oro amarillo", "Bronce", "Cobre"],
                "descripcion": "Los metales fríos y brillantes complementan tu alto contraste"
            }
        }
        
        # Joyería por forma de rostro
        self.joyeria_por_rostro = {
            "ovalado": {
                "descripcion": "Tu rostro bien proporcionado es muy versátil",
                "aretes": {
                    "recomendados": [
                        {
                            "nombre": "Aros medianos",
                            "descripcion": "Los aros clásicos te quedan perfectos",
                            "beneficio": "Complementan la armonía de tu rostro"
                        },
                        {
                            "nombre": "Colgantes largos",
                            "descripcion": "Pendientes que caen elegantemente",
                            "beneficio": "Añaden sofisticación sin desequilibrar"
                        },
                        {
                            "nombre": "Ear cuffs",
                            "descripcion": "Brazaletes de oreja modernos",
                            "beneficio": "Puedes experimentar con estilos atrevidos"
                        },
                        {
                            "nombre": "Studs geométricos",
                            "descripcion": "Aretes pequeños con formas",
                            "beneficio": "Versátiles para el día a día"
                        }
                    ],
                    "tip": "¡Casi todo te queda bien! Experimenta con diferentes estilos"
                },
                "collares": {
                    "recomendados": ["Cualquier longitud", "Gargantillas", "Cadenas largas", "Pendientes statement"],
                    "tip": "Tu versatilidad te permite usar desde chokers hasta collares largos"
                }
            },
            "redondo": {
                "descripcion": "Tu rostro suave se beneficia de líneas que alargan",
                "aretes": {
                    "recomendados": [
                        {
                            "nombre": "Pendientes largos tipo gota",
                            "descripcion": "Aretes que caen hacia abajo",
                            "beneficio": "Alargan visualmente el rostro"
                        },
                        {
                            "nombre": "Geométricos verticales",
                            "descripcion": "Triángulos, rectángulos, líneas",
                            "beneficio": "Crean la ilusión de un rostro más alargado"
                        },
                        {
                            "nombre": "Colgantes lineales",
                            "descripcion": "Diseños que cuelgan en línea recta",
                            "beneficio": "Estilizan y definen"
                        },
                        {
                            "nombre": "Pendientes angulares",
                            "descripcion": "Formas con ángulos definidos",
                            "beneficio": "Añaden estructura al rostro suave"
                        }
                    ],
                    "evitar": ["Aros muy grandes y anchos", "Studs muy pequeños", "Formas circulares"],
                    "tip": "Busca formas alargadas que creen verticalidad"
                },
                "collares": {
                    "recomendados": ["Collares en V", "Cadenas largas", "Pendientes que caen"],
                    "evitar": ["Gargantillas anchas", "Collares cortos circulares"],
                    "tip": "Los collares que forman una V alargan el cuello"
                }
            },
            "cuadrado": {
                "descripcion": "Tu mandíbula fuerte se suaviza con formas curvas",
                "aretes": {
                    "recomendados": [
                        {
                            "nombre": "Aros circulares",
                            "descripcion": "Aros redondos de cualquier tamaño",
                            "beneficio": "Suavizan los ángulos de la mandíbula"
                        },
                        {
                            "nombre": "Formas orgánicas",
                            "descripcion": "Diseños con curvas naturales",
                            "beneficio": "Contrastan bellamente con tu estructura"
                        },
                        {
                            "nombre": "Pendientes ovalados",
                            "descripcion": "Formas redondeadas y suaves",
                            "beneficio": "Añaden feminidad y suavidad"
                        },
                        {
                            "nombre": "Colgantes curvos",
                            "descripcion": "Diseños con líneas onduladas",
                            "beneficio": "Equilibran los ángulos fuertes"
                        }
                    ],
                    "evitar": ["Formas cuadradas", "Diseños muy angulares", "Studs muy pequeños"],
                    "tip": "Las curvas son tus mejores amigas"
                },
                "collares": {
                    "recomendados": ["Collares con pendientes suaves", "Perlas", "Cadenas delicadas"],
                    "evitar": ["Gargantillas rígidas", "Diseños muy geométricos"],
                    "tip": "Busca líneas fluidas que suavicen"
                }
            },
            "corazon": {
                "descripcion": "Tu frente amplia y barbilla estrecha necesitan balance inferior",
                "aretes": {
                    "recomendados": [
                        {
                            "nombre": "Triángulos invertidos",
                            "descripcion": "Pendientes más anchos abajo",
                            "beneficio": "Añaden volumen a la mandíbula"
                        },
                        {
                            "nombre": "Gotas y lágrimas",
                            "descripcion": "Formas que ensanchan hacia abajo",
                            "beneficio": "Equilibran la frente amplia"
                        },
                        {
                            "nombre": "Chandelier (candelabro)",
                            "descripcion": "Pendientes elaborados que caen",
                            "beneficio": "Crean amplitud en la parte inferior"
                        },
                        {
                            "nombre": "Pendientes con volumen bajo",
                            "descripcion": "Diseños que se expanden abajo",
                            "beneficio": "Balancean las proporciones"
                        }
                    ],
                    "evitar": ["Triángulos con punta hacia abajo", "Diseños muy anchos arriba"],
                    "tip": "Busca diseños que añadan anchura a nivel de la mandíbula"
                },
                "collares": {
                    "recomendados": ["Collares cortos", "Gargantillas suaves", "Cadenas con pendiente central"],
                    "tip": "Los collares cortos equilibran la barbilla estrecha"
                }
            },
            "alargado": {
                "descripcion": "Tu rostro largo se beneficia de elementos que añadan anchura",
                "aretes": {
                    "recomendados": [
                        {
                            "nombre": "Aros anchos",
                            "descripcion": "Aros de diámetro grande",
                            "beneficio": "Añaden anchura visual al rostro"
                        },
                        {
                            "nombre": "Studs grandes",
                            "descripcion": "Aretes de botón prominentes",
                            "beneficio": "Acortan visualmente el rostro"
                        },
                        {
                            "nombre": "Clusters (racimos)",
                            "descripcion": "Grupos de piedras o elementos",
                            "beneficio": "Crean volumen horizontal"
                        },
                        {
                            "nombre": "Formas horizontales",
                            "descripcion": "Diseños que se extienden a lo ancho",
                            "beneficio": "Equilibran la longitud del rostro"
                        }
                    ],
                    "evitar": ["Pendientes muy largos y finos", "Colgantes que alargan más"],
                    "tip": "Busca elementos que añadan anchura, no longitud"
                },
                "collares": {
                    "recomendados": ["Gargantillas", "Collares cortos", "Múltiples cadenas"],
                    "evitar": ["Cadenas muy largas y finas", "Collares tipo sautoir"],
                    "tip": "Los collares cortos acortan visualmente el rostro"
                }
            },
            "diamante": {
                "descripcion": "Tus pómulos prominentes son tu mejor rasgo",
                "aretes": {
                    "recomendados": [
                        {
                            "nombre": "Pendientes en forma de diamante",
                            "descripcion": "Complementan la forma natural",
                            "beneficio": "Acentúan tus pómulos"
                        },
                        {
                            "nombre": "Studs delicados",
                            "descripcion": "Aretes pequeños y elegantes",
                            "beneficio": "No compiten con tus pómulos"
                        },
                        {
                            "nombre": "Colgantes medianos",
                            "descripcion": "Largo medio equilibrado",
                            "beneficio": "Equilibran frente y barbilla"
                        },
                        {
                            "nombre": "Formas de lágrima",
                            "descripcion": "Ensanchan hacia abajo suavemente",
                            "beneficio": "Suavizan la barbilla estrecha"
                        }
                    ],
                    "tip": "Tus pómulos hacen el trabajo, elige joyería que complemente sin competir"
                },
                "collares": {
                    "recomendados": ["Collares con volumen", "Gargantillas suaves", "Cadenas con pendiente"],
                    "tip": "Añade volumen en el área del cuello para equilibrar"
                }
            }
        }
        
        # Piedras preciosas por estación
        self.piedras_por_estacion = {
            "primavera": {
                "recomendadas": [
                    "Turquesa", "Coral", "Ámbar", "Citrino", 
                    "Peridoto", "Aguamarina cálida", "Topacio amarillo"
                ],
                "perlas": "Perlas crema o doradas",
                "descripcion": "Piedras en tonos cálidos y vibrantes"
            },
            "verano": {
                "recomendadas": [
                    "Amatista", "Cuarzo rosa", "Aguamarina", "Piedra luna",
                    "Perla blanca", "Zafiro rosa", "Turmalina rosa"
                ],
                "perlas": "Perlas blancas o rosadas",
                "descripcion": "Piedras en tonos suaves y fríos"
            },
            "otono": {
                "recomendadas": [
                    "Ámbar", "Cornalina", "Ojo de tigre", "Granate",
                    "Jaspe", "Ónice café", "Topacio imperial"
                ],
                "perlas": "Perlas champagne o doradas",
                "descripcion": "Piedras en tonos tierra cálidos"
            },
            "invierno": {
                "recomendadas": [
                    "Diamante", "Zafiro azul", "Rubí", "Esmeralda",
                    "Onix negro", "Amatista profunda", "Turmalina negra"
                ],
                "perlas": "Perlas blancas brillantes o negras (Tahití)",
                "descripcion": "Piedras intensas y dramáticas"
            }
        }
    
    def recomendar(
        self,
        estacion: Dict[str, Any],
        forma_rostro: str,
        subtono: str,
        genero: str = "femenino"
    ) -> Dict[str, Any]:
        """
        Genera recomendaciones de joyería personalizadas.
        
        Args:
            estacion: Información de la estación de color
            forma_rostro: Forma del rostro detectada
            subtono: Subtono de piel (cálido/frío/neutro)
            genero: Género del usuario
            
        Returns:
            Diccionario con recomendaciones de joyería
        """
        id_estacion = estacion.get("id", "primavera")
        
        # Obtener datos base
        metales = self.metales_por_estacion.get(id_estacion, self.metales_por_estacion["primavera"])
        joyeria_rostro = self.joyeria_por_rostro.get(forma_rostro, self.joyeria_por_rostro["ovalado"])
        piedras = self.piedras_por_estacion.get(id_estacion, self.piedras_por_estacion["primavera"])
        
        recomendaciones = {
            "forma_rostro": forma_rostro,
            "descripcion_rostro": joyeria_rostro["descripcion"],
            
            # Metales recomendados según estación
            "metales": {
                "recomendados": metales["principales"],
                "evitar": metales["evitar"],
                "descripcion": metales["descripcion"]
            },
            
            # Aretes según forma de rostro
            "aretes": {
                "estilos": joyeria_rostro["aretes"]["recomendados"],
                "evitar": joyeria_rostro["aretes"].get("evitar", []),
                "tip": joyeria_rostro["aretes"]["tip"]
            },
            
            # Collares según forma de rostro
            "collares": {
                "recomendados": joyeria_rostro["collares"]["recomendados"],
                "evitar": joyeria_rostro["collares"].get("evitar", []),
                "tip": joyeria_rostro["collares"]["tip"]
            },
            
            # Piedras preciosas según estación
            "piedras": {
                "recomendadas": piedras["recomendadas"],
                "perlas": piedras["perlas"],
                "descripcion": piedras["descripcion"]
            },
            
            # Consejos generales
            "consejos": self._generar_consejos(id_estacion, forma_rostro, subtono)
        }
        
        # Agregar sección específica para hombres si aplica
        if genero.lower() in ["masculino", "hombre", "m"]:
            recomendaciones["joyeria_masculina"] = self._joyeria_masculina(id_estacion)
        
        return recomendaciones
    
    def _generar_consejos(self, estacion: str, forma_rostro: str, subtono: str) -> List[str]:
        """Genera consejos personalizados de joyería"""
        consejos = []
        
        # Por subtono
        if subtono == "cálido":
            consejos.append("Tu piel con venas verdosas luce mejor con oro amarillo y tonos cálidos")
        elif subtono == "frío":
            consejos.append("Tu piel con venas azuladas luce mejor con plata, platino y oro blanco")
        else:
            consejos.append("Tu subtono neutro te permite usar tanto oro como plata")
        
        # Por estación
        consejos_estacion = {
            "primavera": "Elige joyería brillante y luminosa que refleje tu energía natural",
            "verano": "Opta por piezas delicadas y elegantes con acabados mate o suaves",
            "otono": "Busca joyería con textura y acabados antiguos o oxidados",
            "invierno": "Prefiere piezas statement con alto brillo y diseños definidos"
        }
        consejos.append(consejos_estacion.get(estacion, ""))
        
        # Consejo general de combinación
        consejos.append("Si tu look es llamativo, usa joyas discretas. Si es básico, ¡atrévete con piezas protagonistas!")
        
        # Consejo de autenticidad
        consejos.append("Lo más importante es que te sientas cómoda y fiel a tu estilo personal")
        
        return [c for c in consejos if c]  # Filtrar vacíos
    
    def _joyeria_masculina(self, estacion: str) -> Dict[str, Any]:
        """Recomendaciones de joyería para hombres"""
        
        base_metal = "oro" if estacion in ["primavera", "otono"] else "plata/acero"
        
        return {
            "reloj": {
                "metal": f"Correa de {base_metal} o cuero {'café' if estacion in ['primavera', 'otono'] else 'negro'}",
                "estilo": "Clásico" if estacion in ["verano", "invierno"] else "Deportivo-elegante"
            },
            "anillos": {
                "metal": base_metal.split("/")[0].capitalize(),
                "estilo": "Discreto y elegante"
            },
            "pulseras": {
                "opciones": [
                    f"Pulsera de cuero {'café' if estacion in ['primavera', 'otono'] else 'negro'}",
                    f"Cadena en {base_metal}",
                    "Brazalete minimalista"
                ]
            },
            "cadenas": {
                "metal": base_metal.split("/")[0].capitalize(),
                "largo": "Corta a media",
                "grosor": "Discreto"
            },
            "tip": f"Para {'primavera/otoño' if estacion in ['primavera', 'otono'] else 'verano/invierno'}, los tonos {'cálidos (oro, cuero café)' if estacion in ['primavera', 'otono'] else 'fríos (plata, acero, cuero negro)'} son ideales"
        }

