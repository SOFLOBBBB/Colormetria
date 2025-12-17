"""
Generador de Paleta de Colores
==============================
Genera paletas de colores personalizadas según la estación de color.
Incluye colores para ropa, accesorios, maquillaje y decoración.
"""

from typing import Dict, Any, List


# Paletas de colores por estación
PALETAS = {
    "primavera": {
        "principales": [
            {"nombre": "Coral", "hex": "#FF7F50", "rgb": [255, 127, 80]},
            {"nombre": "Durazno", "hex": "#FFCBA4", "rgb": [255, 203, 164]},
            {"nombre": "Amarillo Primavera", "hex": "#FFD700", "rgb": [255, 215, 0]},
            {"nombre": "Verde Manzana", "hex": "#8DB600", "rgb": [141, 182, 0]},
            {"nombre": "Turquesa Claro", "hex": "#40E0D0", "rgb": [64, 224, 208]},
            {"nombre": "Azul Cielo", "hex": "#87CEEB", "rgb": [135, 206, 235]},
            {"nombre": "Rosa Salmón", "hex": "#FA8072", "rgb": [250, 128, 114]},
            {"nombre": "Naranja Cálido", "hex": "#FF8C00", "rgb": [255, 140, 0]}
        ],
        "neutros": [
            {"nombre": "Marfil", "hex": "#FFFFF0", "rgb": [255, 255, 240]},
            {"nombre": "Beige Cálido", "hex": "#F5DEB3", "rgb": [245, 222, 179]},
            {"nombre": "Camel Claro", "hex": "#C4A77D", "rgb": [196, 167, 125]},
            {"nombre": "Café con Leche", "hex": "#D2B48C", "rgb": [210, 180, 140]},
            {"nombre": "Gris Cálido", "hex": "#A99B8D", "rgb": [169, 155, 141]}
        ],
        "acento": [
            {"nombre": "Rojo Tomate", "hex": "#FF6347", "rgb": [255, 99, 71]},
            {"nombre": "Violeta Claro", "hex": "#DDA0DD", "rgb": [221, 160, 221]},
            {"nombre": "Verde Esmeralda Claro", "hex": "#50C878", "rgb": [80, 200, 120]}
        ],
        "evitar": [
            {"nombre": "Negro Puro", "hex": "#000000", "rgb": [0, 0, 0]},
            {"nombre": "Gris Oscuro", "hex": "#404040", "rgb": [64, 64, 64]},
            {"nombre": "Burdeos Oscuro", "hex": "#4A0000", "rgb": [74, 0, 0]},
            {"nombre": "Azul Marino Muy Oscuro", "hex": "#000080", "rgb": [0, 0, 128]}
        ],
        "maquillaje": {
            "labios": ["Coral", "Durazno", "Rosa cálido", "Naranja suave"],
            "ojos": ["Dorado", "Bronce claro", "Verde manzana", "Melocotón"],
            "mejillas": ["Durazno", "Coral suave", "Rosa cálido"]
        }
    },
    
    "verano": {
        "principales": [
            {"nombre": "Rosa Pastel", "hex": "#FFB6C1", "rgb": [255, 182, 193]},
            {"nombre": "Lavanda", "hex": "#E6E6FA", "rgb": [230, 230, 250]},
            {"nombre": "Azul Polvo", "hex": "#B0E0E6", "rgb": [176, 224, 230]},
            {"nombre": "Malva", "hex": "#E0B0FF", "rgb": [224, 176, 255]},
            {"nombre": "Verde Salvia", "hex": "#9DC183", "rgb": [157, 193, 131]},
            {"nombre": "Azul Acero", "hex": "#4682B4", "rgb": [70, 130, 180]},
            {"nombre": "Rosa Antiguo", "hex": "#C08081", "rgb": [192, 128, 129]},
            {"nombre": "Gris Azulado", "hex": "#6699CC", "rgb": [102, 153, 204]}
        ],
        "neutros": [
            {"nombre": "Blanco Roto", "hex": "#FAFAFA", "rgb": [250, 250, 250]},
            {"nombre": "Gris Perla", "hex": "#C0C0C0", "rgb": [192, 192, 192]},
            {"nombre": "Taupe", "hex": "#8B8589", "rgb": [139, 133, 137]},
            {"nombre": "Gris Paloma", "hex": "#9A9A9A", "rgb": [154, 154, 154]},
            {"nombre": "Azul Marino Suave", "hex": "#3C4F65", "rgb": [60, 79, 101]}
        ],
        "acento": [
            {"nombre": "Frambuesa", "hex": "#E30B5C", "rgb": [227, 11, 92]},
            {"nombre": "Ciruela", "hex": "#8E4585", "rgb": [142, 69, 133]},
            {"nombre": "Verde Agua", "hex": "#7FFFD4", "rgb": [127, 255, 212]}
        ],
        "evitar": [
            {"nombre": "Naranja", "hex": "#FF8000", "rgb": [255, 128, 0]},
            {"nombre": "Amarillo Intenso", "hex": "#FFD700", "rgb": [255, 215, 0]},
            {"nombre": "Verde Lima", "hex": "#32CD32", "rgb": [50, 205, 50]},
            {"nombre": "Negro Intenso", "hex": "#000000", "rgb": [0, 0, 0]}
        ],
        "maquillaje": {
            "labios": ["Rosa frío", "Ciruela suave", "Baya", "Rosa antiguo"],
            "ojos": ["Gris", "Lavanda", "Plata", "Azul suave"],
            "mejillas": ["Rosa frío", "Malva suave", "Ciruela clara"]
        }
    },
    
    "otono": {
        "principales": [
            {"nombre": "Terracota", "hex": "#E2725B", "rgb": [226, 114, 91]},
            {"nombre": "Mostaza", "hex": "#FFDB58", "rgb": [255, 219, 88]},
            {"nombre": "Óxido", "hex": "#B7410E", "rgb": [183, 65, 14]},
            {"nombre": "Verde Oliva", "hex": "#808000", "rgb": [128, 128, 0]},
            {"nombre": "Naranja Quemado", "hex": "#CC5500", "rgb": [204, 85, 0]},
            {"nombre": "Verde Bosque", "hex": "#228B22", "rgb": [34, 139, 34]},
            {"nombre": "Café Chocolate", "hex": "#7B3F00", "rgb": [123, 63, 0]},
            {"nombre": "Dorado Antiguo", "hex": "#CFB53B", "rgb": [207, 181, 59]}
        ],
        "neutros": [
            {"nombre": "Crema", "hex": "#FFFDD0", "rgb": [255, 253, 208]},
            {"nombre": "Beige Oscuro", "hex": "#C8AD7F", "rgb": [200, 173, 127]},
            {"nombre": "Café con Leche", "hex": "#A67B5B", "rgb": [166, 123, 91]},
            {"nombre": "Chocolate", "hex": "#5C4033", "rgb": [92, 64, 51]},
            {"nombre": "Verde Militar", "hex": "#4B5320", "rgb": [75, 83, 32]}
        ],
        "acento": [
            {"nombre": "Coral Profundo", "hex": "#FF4040", "rgb": [255, 64, 64]},
            {"nombre": "Turquesa", "hex": "#30D5C8", "rgb": [48, 213, 200]},
            {"nombre": "Ciruela", "hex": "#8E4585", "rgb": [142, 69, 133]}
        ],
        "evitar": [
            {"nombre": "Rosa Chicle", "hex": "#FF69B4", "rgb": [255, 105, 180]},
            {"nombre": "Azul Eléctrico", "hex": "#0000FF", "rgb": [0, 0, 255]},
            {"nombre": "Negro Puro", "hex": "#000000", "rgb": [0, 0, 0]},
            {"nombre": "Gris Frío", "hex": "#808080", "rgb": [128, 128, 128]}
        ],
        "maquillaje": {
            "labios": ["Terracota", "Naranja cálido", "Café nude", "Rojo ladrillo"],
            "ojos": ["Bronce", "Dorado", "Verde oliva", "Café cálido"],
            "mejillas": ["Durazno oscuro", "Terracota suave", "Canela"]
        }
    },
    
    "invierno": {
        "principales": [
            {"nombre": "Negro", "hex": "#000000", "rgb": [0, 0, 0]},
            {"nombre": "Blanco Puro", "hex": "#FFFFFF", "rgb": [255, 255, 255]},
            {"nombre": "Rojo Cereza", "hex": "#DE3163", "rgb": [222, 49, 99]},
            {"nombre": "Azul Royal", "hex": "#4169E1", "rgb": [65, 105, 225]},
            {"nombre": "Fucsia", "hex": "#FF00FF", "rgb": [255, 0, 255]},
            {"nombre": "Verde Esmeralda", "hex": "#50C878", "rgb": [80, 200, 120]},
            {"nombre": "Azul Marino", "hex": "#000080", "rgb": [0, 0, 128]},
            {"nombre": "Morado Intenso", "hex": "#800080", "rgb": [128, 0, 128]}
        ],
        "neutros": [
            {"nombre": "Blanco Óptico", "hex": "#FFFFFF", "rgb": [255, 255, 255]},
            {"nombre": "Gris Carbón", "hex": "#36454F", "rgb": [54, 69, 79]},
            {"nombre": "Negro Profundo", "hex": "#0D0D0D", "rgb": [13, 13, 13]},
            {"nombre": "Plata", "hex": "#C0C0C0", "rgb": [192, 192, 192]},
            {"nombre": "Azul Noche", "hex": "#191970", "rgb": [25, 25, 112]}
        ],
        "acento": [
            {"nombre": "Rojo Carmesí", "hex": "#DC143C", "rgb": [220, 20, 60]},
            {"nombre": "Azul Eléctrico", "hex": "#00BFFF", "rgb": [0, 191, 255]},
            {"nombre": "Verde Lima Intenso", "hex": "#00FF00", "rgb": [0, 255, 0]}
        ],
        "evitar": [
            {"nombre": "Naranja", "hex": "#FF8000", "rgb": [255, 128, 0]},
            {"nombre": "Beige", "hex": "#F5F5DC", "rgb": [245, 245, 220]},
            {"nombre": "Café", "hex": "#8B4513", "rgb": [139, 69, 19]},
            {"nombre": "Amarillo Mostaza", "hex": "#FFDB58", "rgb": [255, 219, 88]}
        ],
        "maquillaje": {
            "labios": ["Rojo cereza", "Fucsia", "Ciruela oscura", "Rosa intenso"],
            "ojos": ["Negro", "Plata", "Azul intenso", "Morado"],
            "mejillas": ["Rosa frío intenso", "Fucsia suave", "Ciruela"]
        }
    }
}


def generador_paleta(estacion: Dict[str, Any]) -> Dict[str, Any]:
    """
    Genera una paleta de colores personalizada según la estación.
    
    Args:
        estacion: Diccionario con información de la estación de color
        
    Returns:
        Diccionario con paleta de colores completa
    """
    id_estacion = estacion.get("id", "primavera")
    
    if id_estacion not in PALETAS:
        id_estacion = "primavera"
    
    paleta_base = PALETAS[id_estacion]
    
    # Agregar información adicional
    paleta = paleta_base.copy()
    paleta["estacion"] = estacion.get("nombre", "Primavera")
    paleta["descripcion"] = f"Paleta de colores para {estacion.get('nombre', 'tu estación')}"
    
    # Agregar consejos de uso
    paleta["consejos"] = _generar_consejos(id_estacion)
    
    # Agregar combinaciones sugeridas
    paleta["combinaciones"] = _generar_combinaciones(id_estacion, paleta_base)
    
    return paleta


def _generar_consejos(estacion: str) -> List[str]:
    """Genera consejos de uso de colores según la estación"""
    consejos = {
        "primavera": [
            "Usa colores cálidos y brillantes como base de tu guardarropa",
            "El coral y el durazno son excelentes para prendas cerca del rostro",
            "Combina neutros cálidos como beige y camel con toques de color",
            "Evita el negro puro; opta por café oscuro o azul marino",
            "Los estampados florales y los colores vibrantes te favorecen"
        ],
        "verano": [
            "Los tonos suaves y apagados son tu mejor aliado",
            "El rosa pastel y lavanda iluminan tu rostro",
            "Usa gris como neutro en lugar de negro o beige",
            "Los colores 'polvorientos' te hacen lucir radiante",
            "Evita colores muy brillantes o neón"
        ],
        "otono": [
            "Los colores terrosos y ricos son perfectos para ti",
            "El verde oliva y terracota son básicos esenciales",
            "Puedes usar tonos intensos cerca del rostro",
            "Los estampados étnicos y naturales te favorecen",
            "Evita colores muy fríos o pastel"
        ],
        "invierno": [
            "Los colores intensos y de alto contraste son ideales",
            "El blanco puro y negro son básicos perfectos para ti",
            "Puedes usar colores brillantes y saturados",
            "Los estampados geométricos y definidos te favorecen",
            "Evita colores apagados o terrosos"
        ]
    }
    
    return consejos.get(estacion, consejos["primavera"])


def _generar_combinaciones(estacion: str, paleta: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Genera combinaciones de colores sugeridas"""
    combinaciones = []
    
    principales = paleta.get("principales", [])
    neutros = paleta.get("neutros", [])
    acentos = paleta.get("acento", [])
    
    if len(principales) >= 2 and len(neutros) >= 1:
        # Combinación 1: Neutro + Principal + Acento
        combinaciones.append({
            "nombre": "Clásica",
            "descripcion": "Base neutra con toque de color",
            "colores": [
                neutros[0] if neutros else principales[0],
                principales[0],
                acentos[0] if acentos else principales[1]
            ]
        })
        
        # Combinación 2: Monocromática
        combinaciones.append({
            "nombre": "Monocromática",
            "descripcion": "Diferentes tonos del mismo color",
            "colores": [principales[0], principales[1] if len(principales) > 1 else principales[0]]
        })
        
        # Combinación 3: Atrevida
        if len(principales) >= 3:
            combinaciones.append({
                "nombre": "Atrevida",
                "descripcion": "Mezcla de colores vibrantes",
                "colores": [principales[0], principales[2], principales[4] if len(principales) > 4 else principales[1]]
            })
    
    return combinaciones


def obtener_colores_complementarios(color_hex: str, estacion: str) -> List[Dict[str, Any]]:
    """
    Obtiene colores que combinan bien con un color dado,
    filtrados por la estación del usuario.
    """
    paleta = PALETAS.get(estacion, PALETAS["primavera"])
    
    # Por ahora, devolver colores de la paleta que contrasten
    todos_colores = paleta["principales"] + paleta["neutros"]
    
    return todos_colores[:5]

