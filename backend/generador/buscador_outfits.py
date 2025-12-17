"""
Buscador de Outfits
===================
Base de datos curada de outfits organizados por:
- Estación de colorimetría
- Ocasión (casual, formal, etc.)
- Tipo de prenda
- Estilo

Las imágenes se pueden agregar manualmente a la carpeta de outfits.
"""

import os
import json
from typing import Dict, Any, List, Optional
from pathlib import Path


class BuscadorOutfits:
    """
    Buscador de outfits desde una base de datos curada.
    
    Estructura de carpetas:
    /outfits
        /primavera
            /casual
            /formal
            /deportivo
        /verano
            /casual
            /formal
            ...
        /otono
            ...
        /invierno
            ...
    """
    
    # Catálogo de outfits predefinido (metadata)
    # Las imágenes se agregan manualmente
    CATALOGO_BASE = {
        "primavera": {
            "colores_base": ["coral", "durazno", "turquesa", "verde menta", "amarillo cálido"],
            "descripcion": "Colores cálidos y brillantes que reflejan la frescura de la primavera",
            "outfits": [
                {
                    "id": "pri_casual_01",
                    "nombre": "Look Coral Fresco",
                    "descripcion": "Blusa coral con jeans claros",
                    "ocasion": "casual",
                    "prendas": ["blusa coral", "jeans claros", "sandalias beige"],
                    "colores": ["#FF7F50", "#E8E4D9", "#D4A574"]
                },
                {
                    "id": "pri_casual_02",
                    "nombre": "Vestido Primaveral",
                    "descripcion": "Vestido floral en tonos cálidos",
                    "ocasion": "casual",
                    "prendas": ["vestido floral", "cardigan beige", "flats nude"],
                    "colores": ["#FFB6C1", "#FFDAB9", "#F5DEB3"]
                },
                {
                    "id": "pri_formal_01",
                    "nombre": "Oficina Elegante",
                    "descripcion": "Blazer durazno con pantalón crema",
                    "ocasion": "formal",
                    "prendas": ["blazer durazno", "blusa blanca", "pantalón crema", "tacones nude"],
                    "colores": ["#FFCBA4", "#FFFFFF", "#FFFDD0"]
                },
                {
                    "id": "pri_formal_02",
                    "nombre": "Traje Clásico Primavera",
                    "descripcion": "Traje en tono cálido para hombre",
                    "ocasion": "formal",
                    "genero": "masculino",
                    "prendas": ["traje beige", "camisa celeste", "corbata coral"],
                    "colores": ["#D4A574", "#87CEEB", "#FF7F50"]
                }
            ]
        },
        "verano": {
            "colores_base": ["rosa palo", "lavanda", "azul cielo", "gris perla", "verde salvia"],
            "descripcion": "Colores suaves y fríos que complementan el subtono rosado",
            "outfits": [
                {
                    "id": "ver_casual_01",
                    "nombre": "Look Lavanda Suave",
                    "descripcion": "Blusa lavanda con pantalón gris",
                    "ocasion": "casual",
                    "prendas": ["blusa lavanda", "pantalón gris", "zapatillas blancas"],
                    "colores": ["#E6E6FA", "#A9A9A9", "#FFFFFF"]
                },
                {
                    "id": "ver_casual_02",
                    "nombre": "Vestido Rosa Empolvado",
                    "descripcion": "Vestido midi en rosa suave",
                    "ocasion": "casual",
                    "prendas": ["vestido rosa palo", "cardigan gris", "sandalias plateadas"],
                    "colores": ["#FFB6C1", "#C0C0C0", "#E8E8E8"]
                },
                {
                    "id": "ver_formal_01",
                    "nombre": "Elegancia Veraniega",
                    "descripcion": "Traje en tonos fríos suaves",
                    "ocasion": "formal",
                    "prendas": ["blazer gris perla", "blusa rosa", "falda azul cielo"],
                    "colores": ["#D3D3D3", "#FFB6C1", "#87CEEB"]
                },
                {
                    "id": "ver_formal_02",
                    "nombre": "Ejecutivo Verano",
                    "descripcion": "Look formal masculino en tonos fríos",
                    "ocasion": "formal",
                    "genero": "masculino",
                    "prendas": ["traje gris claro", "camisa azul claro", "corbata lavanda"],
                    "colores": ["#A9A9A9", "#ADD8E6", "#E6E6FA"]
                }
            ]
        },
        "otono": {
            "colores_base": ["terracota", "mostaza", "verde oliva", "burdeos", "naranja quemado"],
            "descripcion": "Colores cálidos y profundos inspirados en los tonos de otoño",
            "outfits": [
                {
                    "id": "oto_casual_01",
                    "nombre": "Look Terracota",
                    "descripcion": "Suéter terracota con jeans oscuros",
                    "ocasion": "casual",
                    "prendas": ["suéter terracota", "jeans oscuros", "botines café"],
                    "colores": ["#E2725B", "#2F4F4F", "#8B4513"]
                },
                {
                    "id": "oto_casual_02",
                    "nombre": "Estilo Mostaza",
                    "descripcion": "Cardigan mostaza con falda verde oliva",
                    "ocasion": "casual",
                    "prendas": ["cardigan mostaza", "blusa crema", "falda verde oliva"],
                    "colores": ["#FFDB58", "#FFFDD0", "#808000"]
                },
                {
                    "id": "oto_formal_01",
                    "nombre": "Oficina Otoñal",
                    "descripcion": "Blazer burdeos con pantalón mostaza",
                    "ocasion": "formal",
                    "prendas": ["blazer burdeos", "blusa crema", "pantalón mostaza"],
                    "colores": ["#722F37", "#FFFDD0", "#FFDB58"]
                },
                {
                    "id": "oto_formal_02",
                    "nombre": "Ejecutivo Otoño",
                    "descripcion": "Traje en tonos tierra para hombre",
                    "ocasion": "formal",
                    "genero": "masculino",
                    "prendas": ["traje café", "camisa beige", "corbata terracota"],
                    "colores": ["#8B4513", "#F5DEB3", "#E2725B"]
                }
            ]
        },
        "invierno": {
            "colores_base": ["negro", "blanco puro", "rojo intenso", "azul marino", "fucsia"],
            "descripcion": "Colores intensos y contrastantes que realzan el alto contraste natural",
            "outfits": [
                {
                    "id": "inv_casual_01",
                    "nombre": "Look Blanco y Negro",
                    "descripcion": "Clásico monocromático con acento de color",
                    "ocasion": "casual",
                    "prendas": ["suéter negro", "pantalón blanco", "accesorios rojos"],
                    "colores": ["#000000", "#FFFFFF", "#FF0000"]
                },
                {
                    "id": "inv_casual_02",
                    "nombre": "Vestido Rojo Impactante",
                    "descripcion": "Vestido rojo con accesorios negros",
                    "ocasion": "casual",
                    "prendas": ["vestido rojo", "blazer negro", "tacones negros"],
                    "colores": ["#FF0000", "#000000", "#1A1A1A"]
                },
                {
                    "id": "inv_formal_01",
                    "nombre": "Elegancia Invernal",
                    "descripcion": "Look sofisticado en azul marino",
                    "ocasion": "formal",
                    "prendas": ["blazer azul marino", "blusa blanca", "falda negra"],
                    "colores": ["#000080", "#FFFFFF", "#000000"]
                },
                {
                    "id": "inv_formal_02",
                    "nombre": "Ejecutivo Invierno",
                    "descripcion": "Traje negro clásico con camisa blanca",
                    "ocasion": "formal",
                    "genero": "masculino",
                    "prendas": ["traje negro", "camisa blanca", "corbata azul marino"],
                    "colores": ["#000000", "#FFFFFF", "#000080"]
                }
            ]
        }
    }
    
    def __init__(self, directorio_outfits: str = None):
        """
        Inicializa el buscador de outfits.
        
        Args:
            directorio_outfits: Ruta al directorio de imágenes de outfits
        """
        if directorio_outfits:
            self.directorio = Path(directorio_outfits)
        else:
            self.directorio = Path(__file__).parent.parent / "static" / "outfits"
        
        # Crear estructura de directorios si no existe
        self._crear_estructura_directorios()
        
        # Cargar catálogo personalizado si existe
        self.catalogo = self._cargar_catalogo()
        
        print(f"✅ BuscadorOutfits inicializado en {self.directorio}")
    
    def _crear_estructura_directorios(self):
        """Crea la estructura de carpetas para los outfits"""
        for estacion in ["primavera", "verano", "otono", "invierno"]:
            for ocasion in ["casual", "formal", "deportivo", "fiesta"]:
                ruta = self.directorio / estacion / ocasion
                ruta.mkdir(parents=True, exist_ok=True)
    
    def _cargar_catalogo(self) -> Dict[str, Any]:
        """Carga el catálogo de outfits"""
        ruta_catalogo = self.directorio / "catalogo.json"
        
        if ruta_catalogo.exists():
            with open(ruta_catalogo, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            # Guardar catálogo base
            self._guardar_catalogo(self.CATALOGO_BASE)
            return self.CATALOGO_BASE
    
    def _guardar_catalogo(self, catalogo: Dict[str, Any]):
        """Guarda el catálogo de outfits"""
        ruta_catalogo = self.directorio / "catalogo.json"
        with open(ruta_catalogo, "w", encoding="utf-8") as f:
            json.dump(catalogo, f, ensure_ascii=False, indent=2)
    
    def buscar_outfits(
        self,
        estacion: str,
        ocasion: str = None,
        genero: str = None,
        limite: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Busca outfits según criterios.
        
        Args:
            estacion: primavera, verano, otono, invierno
            ocasion: casual, formal, deportivo, fiesta
            genero: masculino, femenino
            limite: Número máximo de resultados
            
        Returns:
            Lista de outfits que coinciden
        """
        estacion_key = estacion.lower().replace("otoño", "otono")
        
        if estacion_key not in self.catalogo:
            return []
        
        outfits = self.catalogo[estacion_key].get("outfits", [])
        resultados = []
        
        for outfit in outfits:
            # Filtrar por ocasión
            if ocasion and outfit.get("ocasion") != ocasion:
                continue
            
            # Filtrar por género
            outfit_genero = outfit.get("genero", "unisex")
            if genero and outfit_genero not in [genero, "unisex"]:
                continue
            
            # Buscar imagen asociada
            imagen_path = self._buscar_imagen_outfit(outfit["id"], estacion_key)
            
            resultados.append({
                **outfit,
                "imagen_url": imagen_path,
                "estacion": estacion_key
            })
            
            if len(resultados) >= limite:
                break
        
        return resultados
    
    def _buscar_imagen_outfit(self, outfit_id: str, estacion: str) -> Optional[str]:
        """Busca la imagen asociada a un outfit"""
        extensiones = [".jpg", ".jpeg", ".png", ".webp"]
        
        for ocasion in ["casual", "formal", "deportivo", "fiesta"]:
            for ext in extensiones:
                ruta = self.directorio / estacion / ocasion / f"{outfit_id}{ext}"
                if ruta.exists():
                    return f"/static/outfits/{estacion}/{ocasion}/{outfit_id}{ext}"
        
        return None
    
    def obtener_recomendaciones(
        self,
        estacion: str,
        genero: str = "femenino",
        forma_rostro: str = None,
        preferencias: List[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene recomendaciones personalizadas de outfits.
        
        Returns:
            Diccionario con outfits por ocasión y paleta de colores
        """
        estacion_key = estacion.lower().replace("otoño", "otono")
        
        if estacion_key not in self.catalogo:
            estacion_key = "primavera"  # Default
        
        info_estacion = self.catalogo[estacion_key]
        
        return {
            "estacion": estacion,
            "colores_base": info_estacion["colores_base"],
            "descripcion": info_estacion["descripcion"],
            "outfits_casual": self.buscar_outfits(estacion_key, "casual", genero, 3),
            "outfits_formal": self.buscar_outfits(estacion_key, "formal", genero, 3),
            "consejos_estilo": self._generar_consejos(estacion_key, genero, forma_rostro)
        }
    
    def _generar_consejos(
        self,
        estacion: str,
        genero: str,
        forma_rostro: str
    ) -> List[str]:
        """Genera consejos personalizados"""
        consejos = {
            "primavera": [
                "Los tonos cálidos y brillantes como coral y durazno iluminan tu rostro",
                "Evita colores muy oscuros o apagados que pueden opacarte",
                "Los accesorios dorados complementan tu colorimetría",
                "El blanco cálido (marfil, crema) te favorece más que el blanco puro"
            ],
            "verano": [
                "Los tonos suaves y fríos como lavanda y rosa palo armonizan con tu piel",
                "Evita colores muy vibrantes o cálidos que pueden crear conflicto",
                "Los accesorios plateados o en oro rosa te favorecen",
                "Los colores apagados y polvorientos realzan tu belleza natural"
            ],
            "otono": [
                "Los tonos tierra como terracota y mostaza resaltan tu calidez",
                "Evita colores fríos o muy claros que pueden lavarte",
                "Los accesorios dorados o en tonos bronce complementan tu look",
                "Los estampados en tonos otoñales te quedan espectaculares"
            ],
            "invierno": [
                "Los colores intensos y contrastantes realzan tu alto contraste natural",
                "El negro y el blanco puro son tus mejores aliados",
                "Los colores joya (rubí, esmeralda, zafiro) te favorecen",
                "Evita colores apagados o sin intensidad"
            ]
        }
        
        return consejos.get(estacion, consejos["primavera"])
    
    def agregar_outfit(
        self,
        estacion: str,
        outfit: Dict[str, Any],
        imagen_bytes: bytes = None
    ) -> bool:
        """
        Agrega un nuevo outfit al catálogo.
        
        Args:
            estacion: Estación del outfit
            outfit: Metadatos del outfit
            imagen_bytes: Bytes de la imagen (opcional)
            
        Returns:
            True si se agregó correctamente
        """
        estacion_key = estacion.lower().replace("otoño", "otono")
        
        if estacion_key not in self.catalogo:
            return False
        
        # Agregar ID si no tiene
        if "id" not in outfit:
            prefix = estacion_key[:3]
            ocasion = outfit.get("ocasion", "casual")[:3]
            num = len(self.catalogo[estacion_key]["outfits"]) + 1
            outfit["id"] = f"{prefix}_{ocasion}_{num:02d}"
        
        self.catalogo[estacion_key]["outfits"].append(outfit)
        self._guardar_catalogo(self.catalogo)
        
        # Guardar imagen si se proporcionó
        if imagen_bytes:
            ocasion = outfit.get("ocasion", "casual")
            ruta_imagen = self.directorio / estacion_key / ocasion / f"{outfit['id']}.jpg"
            with open(ruta_imagen, "wb") as f:
                f.write(imagen_bytes)
        
        return True
    
    def obtener_paleta_estacion(self, estacion: str) -> List[Dict[str, str]]:
        """
        Obtiene la paleta de colores de una estación.
        
        Returns:
            Lista de colores con nombre y hex
        """
        paletas = {
            "primavera": [
                {"nombre": "Coral", "hex": "#FF7F50"},
                {"nombre": "Durazno", "hex": "#FFCBA4"},
                {"nombre": "Turquesa cálido", "hex": "#40E0D0"},
                {"nombre": "Verde menta", "hex": "#98FF98"},
                {"nombre": "Amarillo cálido", "hex": "#FFD700"},
                {"nombre": "Salmón", "hex": "#FA8072"},
                {"nombre": "Marfil", "hex": "#FFFFF0"},
                {"nombre": "Dorado", "hex": "#FFD700"}
            ],
            "verano": [
                {"nombre": "Lavanda", "hex": "#E6E6FA"},
                {"nombre": "Rosa palo", "hex": "#FFB6C1"},
                {"nombre": "Azul cielo", "hex": "#87CEEB"},
                {"nombre": "Gris perla", "hex": "#D3D3D3"},
                {"nombre": "Verde salvia", "hex": "#9DC183"},
                {"nombre": "Malva", "hex": "#E0B0FF"},
                {"nombre": "Azul pastel", "hex": "#AEC6CF"},
                {"nombre": "Frambuesa suave", "hex": "#E30B5C"}
            ],
            "otono": [
                {"nombre": "Terracota", "hex": "#E2725B"},
                {"nombre": "Mostaza", "hex": "#FFDB58"},
                {"nombre": "Verde oliva", "hex": "#808000"},
                {"nombre": "Burdeos", "hex": "#722F37"},
                {"nombre": "Naranja quemado", "hex": "#CC5500"},
                {"nombre": "Café", "hex": "#8B4513"},
                {"nombre": "Ocre", "hex": "#CC7722"},
                {"nombre": "Bronce", "hex": "#CD7F32"}
            ],
            "invierno": [
                {"nombre": "Negro", "hex": "#000000"},
                {"nombre": "Blanco puro", "hex": "#FFFFFF"},
                {"nombre": "Rojo intenso", "hex": "#FF0000"},
                {"nombre": "Azul marino", "hex": "#000080"},
                {"nombre": "Fucsia", "hex": "#FF00FF"},
                {"nombre": "Esmeralda", "hex": "#50C878"},
                {"nombre": "Púrpura real", "hex": "#7851A9"},
                {"nombre": "Plateado", "hex": "#C0C0C0"}
            ]
        }
        
        estacion_key = estacion.lower().replace("otoño", "otono")
        return paletas.get(estacion_key, paletas["primavera"])

