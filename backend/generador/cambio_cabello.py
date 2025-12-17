"""
Generador de Cambio de Cabello
==============================
Usa Segment Anything (SAM) para segmentar el cabello
y Stable Diffusion Inpainting para generar nuevos estilos.

Características:
- Segmentación automática de cabello
- Múltiples estilos predefinidos
- Generación de variaciones de color y corte
"""

import os
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Tuple, Optional
import torch

# Lazy imports para optimizar memoria
_sam_model = None
_inpaint_pipeline = None


class GeneradorCabello:
    """
    Generador de estilos de cabello virtual.
    
    Flujo:
    1. Detectar región del cabello con SAM
    2. Crear máscara de inpainting
    3. Generar nuevo cabello con Stable Diffusion
    """
    
    # Estilos de cabello predefinidos con prompts optimizados
    ESTILOS_CABELLO = {
        "corto_moderno": {
            "nombre": "Corto Moderno",
            "prompt": "short modern pixie haircut, stylish layers, professional look",
            "descripcion": "Corte pixie con capas estilizadas",
            "genero": "unisex"
        },
        "bob_clasico": {
            "nombre": "Bob Clásico",
            "prompt": "classic bob haircut, chin length, sleek straight hair",
            "descripcion": "Bob hasta la barbilla, liso y elegante",
            "genero": "femenino"
        },
        "ondas_largas": {
            "nombre": "Ondas Largas",
            "prompt": "long wavy hair, soft beach waves, flowing hair",
            "descripcion": "Cabello largo con ondas suaves tipo playa",
            "genero": "femenino"
        },
        "lacio_largo": {
            "nombre": "Lacio Largo",
            "prompt": "long straight silky hair, smooth and shiny",
            "descripcion": "Cabello largo, lacio y brillante",
            "genero": "femenino"
        },
        "rizado_natural": {
            "nombre": "Rizado Natural",
            "prompt": "natural curly hair, defined curls, voluminous",
            "descripcion": "Rizos naturales con volumen",
            "genero": "unisex"
        },
        "fade_masculino": {
            "nombre": "Fade Moderno",
            "prompt": "modern fade haircut, short sides, textured top",
            "descripcion": "Degradado con textura arriba",
            "genero": "masculino"
        },
        "undercut": {
            "nombre": "Undercut",
            "prompt": "undercut hairstyle, shaved sides, longer on top",
            "descripcion": "Lados rapados con largo arriba",
            "genero": "masculino"
        },
        "pompadour": {
            "nombre": "Pompadour",
            "prompt": "classic pompadour hairstyle, slicked back, volume on top",
            "descripcion": "Estilo clásico con volumen",
            "genero": "masculino"
        },
        "shag_capas": {
            "nombre": "Shag con Capas",
            "prompt": "shaggy layered haircut, textured layers, effortless style",
            "descripcion": "Corte en capas desestructurado",
            "genero": "unisex"
        },
        "flequillo_cortina": {
            "nombre": "Flequillo Cortina",
            "prompt": "curtain bangs hairstyle, face framing layers",
            "descripcion": "Flequillo abierto enmarcando el rostro",
            "genero": "femenino"
        }
    }
    
    # Colores de cabello con prompts
    COLORES_CABELLO = {
        "rubio_platino": {
            "nombre": "Rubio Platino",
            "prompt": "platinum blonde hair, icy blonde, cool toned",
            "hex": "#E8E4D9",
            "estacion": ["invierno", "verano"]
        },
        "rubio_dorado": {
            "nombre": "Rubio Dorado",
            "prompt": "golden blonde hair, warm honey blonde, sun-kissed",
            "hex": "#D4A84B",
            "estacion": ["primavera", "otoño"]
        },
        "rubio_cenizo": {
            "nombre": "Rubio Cenizo",
            "prompt": "ash blonde hair, cool toned blonde, muted blonde",
            "hex": "#B8A590",
            "estacion": ["verano"]
        },
        "castaño_claro": {
            "nombre": "Castaño Claro",
            "prompt": "light brown hair, chestnut brown, warm brown",
            "hex": "#8B6914",
            "estacion": ["primavera", "otoño"]
        },
        "castaño_chocolate": {
            "nombre": "Castaño Chocolate",
            "prompt": "chocolate brown hair, rich brown, deep brown",
            "hex": "#4A3728",
            "estacion": ["otoño", "invierno"]
        },
        "negro_azabache": {
            "nombre": "Negro Azabache",
            "prompt": "jet black hair, shiny black, deep black",
            "hex": "#1A1A1A",
            "estacion": ["invierno"]
        },
        "pelirrojo_cobrizo": {
            "nombre": "Pelirrojo Cobrizo",
            "prompt": "copper red hair, ginger hair, warm red tones",
            "hex": "#B44C2A",
            "estacion": ["otoño", "primavera"]
        },
        "rojo_borgona": {
            "nombre": "Rojo Borgoña",
            "prompt": "burgundy red hair, wine red, deep red",
            "hex": "#722F37",
            "estacion": ["invierno", "otoño"]
        },
        "castaño_cenizo": {
            "nombre": "Castaño Cenizo",
            "prompt": "ash brown hair, cool brown, muted brown",
            "hex": "#6B5B4F",
            "estacion": ["verano"]
        },
        "balayage_natural": {
            "nombre": "Balayage Natural",
            "prompt": "natural balayage, sun-kissed highlights, dimensional color",
            "hex": "#A67B5B",
            "estacion": ["primavera", "verano", "otoño"]
        }
    }
    
    def __init__(self, usar_gpu: bool = False):
        """
        Inicializa el generador.
        
        Args:
            usar_gpu: Si usar GPU para procesamiento (requiere CUDA)
        """
        self.device = "cuda" if usar_gpu and torch.cuda.is_available() else "cpu"
        self.sam_loaded = False
        self.inpaint_loaded = False
        
        # Directorio para modelos
        self.modelo_dir = os.path.join(os.path.dirname(__file__), "..", "modelos")
        os.makedirs(self.modelo_dir, exist_ok=True)
        
        print(f"✅ GeneradorCabello inicializado (dispositivo: {self.device})")
    
    def _cargar_sam(self):
        """Carga el modelo SAM de forma lazy"""
        global _sam_model
        
        if _sam_model is not None:
            return _sam_model
        
        try:
            from segment_anything import sam_model_registry, SamPredictor
            
            # Intentar cargar modelo SAM
            sam_checkpoint = os.path.join(self.modelo_dir, "sam_vit_b_01ec64.pth")
            
            if not os.path.exists(sam_checkpoint):
                print("⚠️ Modelo SAM no encontrado. Descargando...")
                self._descargar_sam(sam_checkpoint)
            
            sam = sam_model_registry["vit_b"](checkpoint=sam_checkpoint)
            sam.to(device=self.device)
            _sam_model = SamPredictor(sam)
            self.sam_loaded = True
            print("✅ SAM cargado correctamente")
            return _sam_model
            
        except Exception as e:
            print(f"⚠️ Error cargando SAM: {e}")
            return None
    
    def _descargar_sam(self, ruta_destino: str):
        """Descarga el modelo SAM"""
        import urllib.request
        
        url = "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth"
        print(f"Descargando SAM desde {url}...")
        urllib.request.urlretrieve(url, ruta_destino)
        print("✅ SAM descargado")
    
    def _cargar_inpainting(self):
        """Carga el modelo de inpainting de forma lazy"""
        global _inpaint_pipeline
        
        if _inpaint_pipeline is not None:
            return _inpaint_pipeline
        
        try:
            from diffusers import StableDiffusionInpaintPipeline
            
            print("Cargando modelo de inpainting (esto puede tardar)...")
            
            _inpaint_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
                "runwayml/stable-diffusion-inpainting",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None
            )
            _inpaint_pipeline.to(self.device)
            
            # Optimizaciones de memoria
            if self.device == "cpu":
                _inpaint_pipeline.enable_attention_slicing()
            
            self.inpaint_loaded = True
            print("✅ Modelo de inpainting cargado")
            return _inpaint_pipeline
            
        except Exception as e:
            print(f"⚠️ Error cargando inpainting: {e}")
            return None
    
    def segmentar_cabello(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]]
    ) -> np.ndarray:
        """
        Segmenta la región del cabello usando SAM.
        
        Args:
            imagen: Imagen RGB como numpy array
            landmarks: Landmarks de MediaPipe
            
        Returns:
            Máscara binaria del cabello
        """
        sam = self._cargar_sam()
        
        if sam is None:
            # Fallback: usar estimación basada en landmarks
            return self._segmentar_cabello_fallback(imagen, landmarks)
        
        sam.set_image(imagen)
        
        # Puntos de referencia para el cabello (encima de la frente)
        altura, ancho = imagen.shape[:2]
        
        # Punto superior de la frente
        frente = landmarks[10] if len(landmarks) > 10 else (ancho//2, altura//4, 0)
        
        # Puntos para guiar SAM hacia el cabello
        puntos_positivos = np.array([
            [frente[0], max(0, frente[1] - 50)],  # Arriba de la frente
            [frente[0] - 80, frente[1] - 30],     # Lado izquierdo
            [frente[0] + 80, frente[1] - 30],     # Lado derecho
        ])
        
        # Puntos negativos (no cabello)
        puntos_negativos = np.array([
            [frente[0], frente[1] + 100],  # Cara
            [frente[0], altura - 50],       # Parte inferior
        ])
        
        puntos = np.vstack([puntos_positivos, puntos_negativos])
        etiquetas = np.array([1, 1, 1, 0, 0])  # 1=cabello, 0=no cabello
        
        mascaras, _, _ = sam.predict(
            point_coords=puntos,
            point_labels=etiquetas,
            multimask_output=True
        )
        
        # Usar la máscara más grande (probablemente el cabello)
        mascara = mascaras[np.argmax([m.sum() for m in mascaras])]
        
        return (mascara * 255).astype(np.uint8)
    
    def _segmentar_cabello_fallback(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]]
    ) -> np.ndarray:
        """
        Segmentación de respaldo usando detección de color y landmarks.
        """
        altura, ancho = imagen.shape[:2]
        mascara = np.zeros((altura, ancho), dtype=np.uint8)
        
        # Obtener región aproximada del cabello
        if len(landmarks) > 10:
            frente = landmarks[10]
            
            # Región elíptica encima de la frente
            centro = (int(frente[0]), max(0, int(frente[1]) - 60))
            ejes = (int(ancho * 0.35), int(altura * 0.25))
            
            cv2.ellipse(mascara, centro, ejes, 0, 0, 360, 255, -1)
        else:
            # Región superior de la imagen
            mascara[0:altura//3, :] = 255
        
        # Refinar con detección de color
        hsv = cv2.cvtColor(imagen, cv2.COLOR_RGB2HSV)
        
        # Excluir piel (tonos de piel tienen hue específico)
        mascara_piel = cv2.inRange(hsv, (0, 20, 70), (25, 200, 255))
        mascara = cv2.bitwise_and(mascara, cv2.bitwise_not(mascara_piel))
        
        # Suavizar bordes
        mascara = cv2.GaussianBlur(mascara, (21, 21), 0)
        _, mascara = cv2.threshold(mascara, 127, 255, cv2.THRESH_BINARY)
        
        return mascara
    
    def generar_variacion(
        self,
        imagen: np.ndarray,
        mascara_cabello: np.ndarray,
        estilo: str = "ondas_largas",
        color: str = None,
        seed: int = None
    ) -> np.ndarray:
        """
        Genera una variación de cabello usando inpainting.
        
        Args:
            imagen: Imagen original RGB
            mascara_cabello: Máscara del cabello
            estilo: ID del estilo de cabello
            color: ID del color (opcional)
            seed: Semilla para reproducibilidad
            
        Returns:
            Imagen con nuevo cabello
        """
        pipeline = self._cargar_inpainting()
        
        if pipeline is None:
            print("⚠️ Inpainting no disponible, retornando original")
            return imagen
        
        # Construir prompt
        prompt_partes = []
        
        if estilo in self.ESTILOS_CABELLO:
            prompt_partes.append(self.ESTILOS_CABELLO[estilo]["prompt"])
        
        if color and color in self.COLORES_CABELLO:
            prompt_partes.append(self.COLORES_CABELLO[color]["prompt"])
        
        prompt = ", ".join(prompt_partes) + ", high quality, photorealistic, natural looking hair"
        negative_prompt = "blurry, distorted, unnatural, bad quality, deformed face"
        
        # Preparar imágenes para el pipeline
        pil_imagen = Image.fromarray(imagen)
        pil_mascara = Image.fromarray(mascara_cabello)
        
        # Redimensionar para el modelo
        size = (512, 512)
        pil_imagen_resized = pil_imagen.resize(size)
        pil_mascara_resized = pil_mascara.resize(size)
        
        # Configurar generador para reproducibilidad
        generator = None
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)
        
        # Generar
        resultado = pipeline(
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=pil_imagen_resized,
            mask_image=pil_mascara_resized,
            num_inference_steps=30,
            guidance_scale=7.5,
            generator=generator
        ).images[0]
        
        # Redimensionar al tamaño original
        resultado = resultado.resize(pil_imagen.size)
        
        return np.array(resultado)
    
    def obtener_estilos_recomendados(
        self,
        genero: str,
        forma_rostro: str,
        estacion: str
    ) -> List[Dict[str, Any]]:
        """
        Obtiene estilos de cabello recomendados.
        
        Args:
            genero: "masculino", "femenino" o "unisex"
            forma_rostro: Forma del rostro detectada
            estacion: Estación de colorimetría
            
        Returns:
            Lista de estilos recomendados
        """
        recomendados = []
        
        for estilo_id, estilo in self.ESTILOS_CABELLO.items():
            if estilo["genero"] in [genero, "unisex"]:
                # Agregar colores recomendados para la estación
                colores_compatibles = [
                    (color_id, color)
                    for color_id, color in self.COLORES_CABELLO.items()
                    if estacion.lower() in color["estacion"]
                ]
                
                recomendados.append({
                    "id": estilo_id,
                    "nombre": estilo["nombre"],
                    "descripcion": estilo["descripcion"],
                    "colores_recomendados": [
                        {
                            "id": cid,
                            "nombre": c["nombre"],
                            "hex": c["hex"]
                        }
                        for cid, c in colores_compatibles[:3]
                    ]
                })
        
        return recomendados
    
    def generar_previsualizaciones(
        self,
        imagen: np.ndarray,
        landmarks: List[Tuple[int, int, float]],
        genero: str,
        estacion: str,
        max_variaciones: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Genera múltiples previsualizaciones de estilos de cabello.
        
        Returns:
            Lista de diccionarios con imagen y metadatos
        """
        # Segmentar cabello una vez
        mascara = self.segmentar_cabello(imagen, landmarks)
        
        # Obtener estilos recomendados
        estilos = self.obtener_estilos_recomendados(genero, "ovalado", estacion)
        
        resultados = []
        
        for i, estilo in enumerate(estilos[:max_variaciones]):
            # Usar primer color recomendado
            color_id = estilo["colores_recomendados"][0]["id"] if estilo["colores_recomendados"] else None
            
            try:
                imagen_generada = self.generar_variacion(
                    imagen,
                    mascara,
                    estilo=estilo["id"],
                    color=color_id,
                    seed=42 + i  # Semilla diferente para cada variación
                )
                
                resultados.append({
                    "imagen": imagen_generada,
                    "estilo": estilo["nombre"],
                    "color": estilo["colores_recomendados"][0]["nombre"] if estilo["colores_recomendados"] else None,
                    "descripcion": estilo["descripcion"]
                })
            except Exception as e:
                print(f"⚠️ Error generando variación {estilo['nombre']}: {e}")
        
        return resultados

