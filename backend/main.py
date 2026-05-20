"""API de análisis de colorimetría: detección de rostro, análisis LAB y clasificación en estación."""

import os
import uuid

os.environ.setdefault("MPLBACKEND", "Agg")

# Antes de cualquier import que cargue TFLite/MediaPipe (libGLESv2.so.2)
from env_grafico import configurar_entorno_mesa_completo

configurar_entorno_mesa_completo()

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import numpy as np
from PIL import Image
import io
import json
import threading
import time
import base64
import cv2
from datetime import datetime

from database import obtener_db, crear_tablas, CRUDAnalisis, CRUDRecomendacion

app = FastAPI(title="ColorMetría API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

crear_tablas()

_analizadores_cache: Optional[Dict[str, Any]] = None
_analizadores_error: Optional[str] = None
_analizadores_error_timestamp: Optional[float] = None

COOLDOWN_REINTENTO_SEGUNDOS = 60
HAIR_TRYON_ENABLED = os.getenv("ENABLE_HAIR_TRYON", "1").strip().lower() in {"1", "true", "yes", "on"}
ENABLE_GENERATIVE_HAIR_EDIT = (
    os.getenv("ENABLE_GENERATIVE_HAIR_EDIT", os.getenv("ENABLE_OPENAI_HAIR_EDIT", "0"))
    .strip()
    .lower()
    in {"1", "true", "yes", "on"}
)
HAIR_EDIT_PROVIDER = os.getenv("HAIR_EDIT_PROVIDER", "openai").strip().lower()
HAIR_EDIT_API_KEY = os.getenv("HAIR_EDIT_API_KEY", os.getenv("OPENAI_API_KEY", "")).strip()
MAX_IMAGEN_BYTES = int(os.getenv("HAIR_TRYON_MAX_IMAGE_BYTES", str(6 * 1024 * 1024)))
MAX_LADO_TRYON = int(os.getenv("HAIR_TRYON_MAX_SIDE", "1024"))
HAIR_TRYON_USE_BISENET = os.getenv("HAIR_TRYON_USE_BISENET", "1").strip().lower() in {"1", "true", "yes", "on"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_BLEND_MODES = {"multiply", "overlay", "soft-light"}
DEFAULT_BLEND_MODE = "multiply"
ALLOWED_HAIR_EDIT_MODES = {"color", "style", "color_style"}
_generador_hair_edit_cache: Optional["GenerativeHairEditor"] = None


class GenerativeHairEditError(RuntimeError):
    """Error controlado para el módulo generativo de cabello."""


def _build_hair_edit_prompt(
    modo: str,
    color_hex: Optional[str],
    color_nombre: Optional[str],
    estilo_peinado: Optional[str],
) -> str:
    color_objetivo = (color_nombre or color_hex or "").strip()
    estilo_objetivo = (estilo_peinado or "").strip()

    if modo == "color":
        if not color_objetivo:
            raise ValueError("Debes indicar un color para el modo color")
        return (
            f"Edit the image to change only the hair color to {color_objetivo}. "
            "Preserve the person's identity, face, skin tone, expression, pose, clothing, "
            "background, and lighting. Keep the hairstyle and hair length the same. "
            "Make the result photorealistic and natural."
        )

    if modo == "style":
        if not estilo_objetivo:
            raise ValueError("Debes indicar un peinado para el modo style")
        return (
            f"Edit the image to change only the hairstyle to {estilo_objetivo}. "
            "Preserve the person's identity, face, skin tone, expression, pose, clothing, "
            "background, and lighting. Keep the result photorealistic and natural."
        )

    if modo == "color_style":
        if not color_objetivo:
            raise ValueError("Debes indicar un color para el modo color_style")
        if not estilo_objetivo:
            raise ValueError("Debes indicar un peinado para el modo color_style")
        return (
            f"Edit the image to change only the hair to a {estilo_objetivo} hairstyle with "
            f"{color_objetivo} color. Preserve identity, face, skin tone, expression, pose, "
            "clothing, background, and lighting. Make the hair realistic and naturally blended."
        )

    raise ValueError("modo inválido. Usa: color, style o color_style")


def _multipart_formdata_bytes(
    fields: Dict[str, str],
    file_field: str,
    filename: str,
    content_type: str,
    file_bytes: bytes,
):
    boundary = f"----HairEditBoundary{uuid.uuid4().hex}"
    body = bytearray()

    for key, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode("utf-8"))
        body.extend(str(value).encode("utf-8"))
        body.extend(b"\r\n")

    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(
        (
            f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'
            f"Content-Type: {content_type}\r\n\r\n"
        ).encode("utf-8")
    )
    body.extend(file_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    return bytes(body), boundary


def _image_bytes_to_data_url_png(image_bytes: bytes) -> str:
    imagen_pil = Image.open(io.BytesIO(image_bytes))
    if imagen_pil.mode != "RGB":
        imagen_pil = imagen_pil.convert("RGB")
    buffer = io.BytesIO()
    imagen_pil.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


class GenerativeHairEditor:
    """Cliente lazy para edición generativa de cabello."""

    def __init__(self, provider: str, api_key: str):
        if not api_key:
            raise GenerativeHairEditError("No hay clave configurada para la simulación avanzada.")
        if provider != "openai":
            raise GenerativeHairEditError("Proveedor no soportado para simulación avanzada.")
        print("[hair-edit] Inicializando generador...", flush=True)
        import urllib.error as urllib_error
        import urllib.request as urllib_request

        self.provider = provider
        self.api_key = api_key
        self._urllib_error = urllib_error
        self._urllib_request = urllib_request

    def procesar(self, image_bytes: bytes, prompt: str, input_mime: str) -> str:
        fields = {
            "model": "gpt-image-1",
            "prompt": prompt,
            "size": "1024x1024",
        }
        payload, boundary = _multipart_formdata_bytes(
            fields=fields,
            file_field="image",
            filename="input.png" if "png" in input_mime else "input.jpg",
            content_type=input_mime or "image/png",
            file_bytes=image_bytes,
        )

        request = self._urllib_request.Request(
            url="https://api.openai.com/v1/images/edits",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
        )

        try:
            with self._urllib_request.urlopen(request, timeout=90) as resp:
                raw = resp.read().decode("utf-8")
        except self._urllib_error.HTTPError as e:
            detail = ""
            try:
                raw_err = e.read().decode("utf-8")
                err_json = json.loads(raw_err)
                detail = (
                    err_json.get("error", {}).get("message")
                    or err_json.get("message")
                    or str(e)
                )
            except Exception:
                detail = str(e)
            raise GenerativeHairEditError(
                f"No se pudo generar la vista previa en este momento. {detail}".strip()
            ) from e
        except Exception as e:
            raise GenerativeHairEditError(
                "No se pudo generar la vista previa en este momento. Intenta nuevamente."
            ) from e

        try:
            data = json.loads(raw)
            first = (data.get("data") or [{}])[0]
            b64 = first.get("b64_json")
            if b64:
                return f"data:image/png;base64,{b64}"

            image_url = first.get("url")
            if image_url:
                with self._urllib_request.urlopen(image_url, timeout=30) as img_resp:
                    return _image_bytes_to_data_url_png(img_resp.read())
        except Exception as e:
            raise GenerativeHairEditError(
                "Respuesta inválida del motor de simulación avanzada."
            ) from e

        raise GenerativeHairEditError("No se pudo obtener la imagen generada.")


def get_generador_hair_edit() -> GenerativeHairEditor:
    global _generador_hair_edit_cache
    if _generador_hair_edit_cache is None:
        _generador_hair_edit_cache = GenerativeHairEditor(
            provider=HAIR_EDIT_PROVIDER,
            api_key=HAIR_EDIT_API_KEY,
        )
    return _generador_hair_edit_cache


def _obtener_analizadores() -> Dict[str, Any]:
    """Carga bajo demanda los analizadores (MediaPipe, sklearn, etc.) y los cachea."""
    global _analizadores_cache, _analizadores_error, _analizadores_error_timestamp
    if _analizadores_cache is not None:
        return _analizadores_cache
    if _analizadores_error is not None and _analizadores_error_timestamp is not None:
        if time.time() - _analizadores_error_timestamp < COOLDOWN_REINTENTO_SEGUNDOS:
            raise RuntimeError(_analizadores_error)
        _analizadores_error = None
        _analizadores_error_timestamp = None
    try:
        from analizadores import (
            AnalizadorRobusto,
            ClasificadorRobusto,
            DetectorRostro,
            AnalizadorColores,
        )
        from analizadores.atributos_faciales import analizar_atributos as analizar_atributos_faciales

        detector_rostro = DetectorRostro()
        analizador_robusto = AnalizadorRobusto(usar_normalizacion=True)
        clasificador_robusto = ClasificadorRobusto(usar_ml=False)
        analizador_colores_legacy = AnalizadorColores()
        _analizadores_cache = {
            "detector_rostro": detector_rostro,
            "analizador_robusto": analizador_robusto,
            "clasificador_robusto": clasificador_robusto,
            "analizador_colores_legacy": analizador_colores_legacy,
            "analizar_atributos_faciales": analizar_atributos_faciales,
        }
        return _analizadores_cache
    except Exception as e:
        _analizadores_error = str(e)
        _analizadores_error_timestamp = time.time()
        print(f"[ColorMetria] Error cargando analizadores: {e}", flush=True)
        raise RuntimeError(_analizadores_error)


def _normalizar_imagen_para_analisis(contenido: bytes, max_lado: int) -> tuple[Image.Image, np.ndarray]:
    """Abre bytes de imagen, convierte a RGB y limita su resolución máxima."""
    imagen_pil = Image.open(io.BytesIO(contenido))
    if imagen_pil.mode != "RGB":
        imagen_pil = imagen_pil.convert("RGB")
    imagen_np = np.array(imagen_pil)
    alto, ancho = imagen_np.shape[:2]
    if max(alto, ancho) > max_lado:
        if ancho > alto:
            nuevo_ancho = max_lado
            nuevo_alto = int(alto * max_lado / ancho)
        else:
            nuevo_alto = max_lado
            nuevo_ancho = int(ancho * max_lado / alto)
        imagen_pil = imagen_pil.resize((nuevo_ancho, nuevo_alto), Image.Resampling.LANCZOS)
        imagen_np = np.array(imagen_pil)
    return imagen_pil, imagen_np


def _validar_upload_imagen(archivo: UploadFile, contenido: bytes, max_bytes: int):
    """Valida mime y tamaño para reducir errores y consumo excesivo de recursos."""
    if not contenido:
        raise HTTPException(status_code=422, detail="La imagen está vacía")
    if len(contenido) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"La imagen excede el límite permitido de {max_bytes // (1024 * 1024)}MB",
        )
    mime = (archivo.content_type or "").lower().strip()
    if mime and mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Formato de imagen no soportado. Usa: {', '.join(sorted(ALLOWED_MIME_TYPES))}",
        )


def _hex_a_rgb(hex_color: str) -> tuple[int, int, int]:
    s = str(hex_color or "").strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6:
        raise ValueError("Color HEX inválido")
    try:
        r = int(s[0:2], 16)
        g = int(s[2:4], 16)
        b = int(s[4:6], 16)
    except ValueError as err:
        raise ValueError("Color HEX inválido") from err
    return r, g, b


def _generar_preview_tinte_cabello(
    imagen_np: np.ndarray,
    landmarks: Any,
    color_hex: str,
    intensidad: int,
    blend_mode: str,
) -> tuple[np.ndarray, str]:
    """Intenta segmentar cabello con BiSeNet y recolorear; cae a elipse si falla.

    Devuelve ``(imagen_resultado, modo)`` donde ``modo`` ∈ ``{"bisenet", "fallback_elipse"}``.
    """
    if HAIR_TRYON_USE_BISENET:
        try:
            # Import LAZY: si torch no estuviera disponible o el módulo fallara,
            # lo capturamos y caemos al método heurístico actual.
            from analizadores.hair_segmentation import (
                aplicar_tinte_real,
                obtener_segmentador_cabello,
                refinar_mascara_cabello,
                HairSegmentationError,
            )

            segmentador = obtener_segmentador_cabello()
            mascara_bool = segmentador.segmentar_cabello(imagen_np)
            cobertura = float(mascara_bool.mean())
            if cobertura < 0.005:
                raise HairSegmentationError(
                    f"Máscara BiSeNet demasiado pequeña ({cobertura*100:.2f}%); "
                    f"se descarta para no degradar el preview"
                )
            mascara_feather = refinar_mascara_cabello(
                mascara_bool, kernel_px=5, feather_px=11
            )
            resultado = aplicar_tinte_real(
                imagen_rgb=imagen_np,
                mascara=mascara_feather,
                color_hex=color_hex,
                intensidad=intensidad,
                blend_mode=blend_mode,
            )
            return resultado, "bisenet"
        except Exception as exc:
            print(
                f"[HairTryOn] BiSeNet falló, usando fallback elíptico: {exc!r}",
                flush=True,
            )

    print("[HairTryOn] Generando preview con máscara elíptica heurística", flush=True)
    resultado = _simular_tinte_cabello(
        imagen_np=imagen_np,
        landmarks=landmarks,
        color_hex=color_hex,
        intensidad=intensidad,
        blend_mode=blend_mode,
    )
    return resultado, "fallback_elipse"


def _respuesta_hair_edit_no_disponible(reason: str = "Generative provider unavailable") -> JSONResponse:
    return JSONResponse(
        content={
            "exito": False,
            "advanced_available": False,
            "fallback_available": True,
            "reason": reason,
            "mensaje": "La simulacion avanzada no esta disponible. Puedes continuar con simulacion local.",
        }
    )


def _mascara_heuristica_cabello_suave(
    landmarks: Any,
    alto: int,
    ancho: int,
) -> np.ndarray:
    puntos = np.array([(lm[0], lm[1]) for lm in landmarks], dtype=np.float32)
    if puntos.size == 0:
        raise ValueError("Landmarks inválidos")

    x_min = max(0, int(np.min(puntos[:, 0])))
    x_max = min(ancho - 1, int(np.max(puntos[:, 0])))
    y_min = max(0, int(np.min(puntos[:, 1])))
    y_max = min(alto - 1, int(np.max(puntos[:, 1])))

    rostro_h = max(1, y_max - y_min)
    rostro_w = max(1, x_max - x_min)
    cx = int((x_min + x_max) / 2)

    yy, xx = np.ogrid[:alto, :ancho]

    # Casquete superior (frente/corona) + laterales para cubrir cabello largo.
    top_cy = int(y_min - rostro_h * 0.22)
    top_rx = int(rostro_w * 0.82)
    top_ry = int(rostro_h * 0.68)
    top_cap = ((xx - cx) / max(1, top_rx)) ** 2 + ((yy - top_cy) / max(1, top_ry)) ** 2 <= 1.0
    top_limit = yy <= y_min + int(rostro_h * 0.38)

    lateral_y = int(y_min + rostro_h * 0.28)
    lateral_rx = int(rostro_w * 0.72)
    lateral_ry = int(rostro_h * 0.94)
    side_left = (
        ((xx - int(x_min - rostro_w * 0.20)) / max(1, lateral_rx)) ** 2
        + ((yy - lateral_y) / max(1, lateral_ry)) ** 2
        <= 1.0
    )
    side_right = (
        ((xx - int(x_max + rostro_w * 0.20)) / max(1, lateral_rx)) ** 2
        + ((yy - lateral_y) / max(1, lateral_ry)) ** 2
        <= 1.0
    )

    face_core = (
        ((xx - cx) / max(1, int(rostro_w * 0.56))) ** 2
        + ((yy - int(y_min + rostro_h * 0.50)) / max(1, int(rostro_h * 0.64))) ** 2
        <= 1.0
    )
    mascara = (top_cap & top_limit) | side_left | side_right
    mascara = mascara & ~face_core

    if not np.any(mascara):
        raise ValueError("Máscara de cabello vacía")

    # Bordes suaves para evitar efecto de "paint" duro.
    mask_u8 = (mascara.astype(np.uint8) * 255)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_CLOSE, kernel)
    mask_u8 = cv2.GaussianBlur(mask_u8.astype(np.float32), (15, 15), 0)
    return np.clip(mask_u8 / 255.0, 0.0, 1.0)


def _simular_tinte_cabello(
    imagen_np: np.ndarray,
    landmarks: Any,
    color_hex: str,
    intensidad: int,
    blend_mode: str,
) -> np.ndarray:
    """Fallback local de tinte usando máscara heurística + recolor LAB."""
    from analizadores.hair_segmentation import aplicar_tinte_real

    alto, ancho = imagen_np.shape[:2]
    mascara_suave = _mascara_heuristica_cabello_suave(
        landmarks=landmarks,
        alto=alto,
        ancho=ancho,
    )
    return aplicar_tinte_real(
        imagen_rgb=imagen_np,
        mascara=mascara_suave,
        color_hex=color_hex,
        intensidad=intensidad,
        blend_mode=blend_mode,
    )


def _np_to_data_url_png(imagen_np: np.ndarray) -> str:
    imagen = Image.fromarray(imagen_np.astype(np.uint8), mode="RGB")
    buffer = io.BytesIO()
    imagen.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def _prewarm_analizadores():
    """Carga analizadores en background tras el arranque del servidor."""
    try:
        _obtener_analizadores()
        print("[ColorMetria] Pre-warm de analizadores completado", flush=True)
    except Exception as e:
        print(f"[ColorMetria] Pre-warm fallo (se cargaran bajo demanda): {e}", flush=True)


@app.on_event("startup")
def startup_prewarm():
    thread = threading.Thread(target=_prewarm_analizadores, daemon=True)
    thread.start()

INFO_ESTACION = {
    "primavera": {
        "descripcion": "Tonos cálidos con subtono dorado. Colores vivos, frescos y brillantes.",
        "caracteristicas": [
            "Subtono cálido (matices dorados/amarillos)",
            "Chroma alto",
            "Paleta: Amarillos cálidos, corales, melocotones, verdes frescos",
        ],
    },
    "verano": {
        "descripcion": "Tonos fríos con subtono rosado. Colores suaves y delicados.",
        "caracteristicas": [
            "Subtono frío (matices rosados/azulados)",
            "Chroma bajo-medio",
            "Paleta: Rosas, azules suaves, lavandas, grises azulados",
        ],
    },
    "otono": {
        "descripcion": "Tonos cálidos con subtono dorado. Colores terrosos y profundos.",
        "caracteristicas": [
            "Subtono cálido",
            "Chroma medio-bajo",
            "Paleta: Naranjas quemados, olivas, marrones, terracotas",
        ],
    },
    "invierno": {
        "descripcion": "Tonos fríos con subtono azulado. Colores intensos y contrastantes.",
        "caracteristicas": [
            "Subtono frío (matices azulados/rosados)",
            "Chroma alto",
            "Paleta: Rojos intensos, azules eléctricos, negros, blancos nítidos",
        ],
    },
}
SUBTONO_ES = {"cool": "frío", "warm": "cálido", "neutral": "neutro"}


def _subtono_para_bd(subtono) -> str:
    """Convierte subtono (en o en_ES) a español para BD."""
    s = str(subtono or "neutro").strip().lower()
    return SUBTONO_ES.get(s, s)


def _rgb_a_hex(rgb) -> str:
    """Lista o array [r,g,b] a #RRGGBB."""
    if not rgb or len(rgb) < 3:
        return "#808080"
    r, g, b = int(rgb[0]), int(rgb[1]), int(rgb[2])
    return f"#{max(0, min(255, r)):02x}{max(0, min(255, g)):02x}{max(0, min(255, b)):02x}"


def _info_estacion(estacion_id: str):
    return INFO_ESTACION.get(estacion_id.lower(), INFO_ESTACION["verano"])


@app.get("/")
async def root():
    return {
        "mensaje": "ColorMetría API v2.0",
        "version": "2.0.0",
        "endpoints": {
            "/analizar": "POST",
            "/hair-tryon": "POST",
            "/hair-edit": "POST",
            "/health": "GET",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analizar")
async def analizar(
    archivo: UploadFile = File(...),
    genero: str = "femenino",
    usuario_id: Optional[int] = None,
    db: Session = Depends(obtener_db),
):
    """Analiza imagen y devuelve estación colorimétrica, colores y features."""
    try:
        analizadores = _obtener_analizadores()
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Servicio de análisis no disponible: {e}. Reintente más tarde.",
        )
    try:
        contenido = await archivo.read()
        imagen_pil, imagen_np = _normalizar_imagen_para_analisis(contenido, 1024)

        detector_rostro = analizadores["detector_rostro"]
        deteccion = detector_rostro.detectar(imagen_np)
        if deteccion is None:
            raise HTTPException(status_code=400, detail="No se detectó rostro en la imagen")
        landmarks = deteccion["landmarks"]
        region_rostro = deteccion["region_rostro"]

        atributos = analizadores["analizar_atributos_faciales"](imagen_np)

        t0 = time.time()
        analizador_robusto = analizadores["analizador_robusto"]
        resultado = analizador_robusto.analizar(imagen_np, landmarks=landmarks)
        metodo = "robusto"

        analizador_colores_legacy = analizadores["analizador_colores_legacy"]
        if "error" in resultado:
            resultado = analizador_colores_legacy.analizar(
                imagen_np, landmarks, region_rostro
            )
            metodo = "legacy"
            resultado = {
                "confiable": True,
                "features": {
                    "subtono": SUBTONO_ES.get(
                        resultado.get("subtono", "neutral").lower(), "neutro"
                    ),
                    "contraste": resultado.get("contraste", "medio"),
                    "chroma": "medio",
                    "median_l": resultado.get("piel", {}).get("valor_l", 50),
                    "median_a": 0,
                    "median_b": 0,
                },
                "roi_piel_rgb": resultado.get("piel", {}).get("rgb", [128, 128, 128]),
                "roi_cabello_rgb": resultado.get("cabello", {}).get("rgb", [128, 128, 128]),
            }

        features = resultado.get("features", {})
        t_analisis = time.time() - t0

        t1 = time.time()
        clasificador_robusto = analizadores["clasificador_robusto"]
        clasificacion = clasificador_robusto.clasificar(features)
        t_clasif = time.time() - t1

        estacion_id = clasificacion.get("estacion", "verano")
        confianza = clasificacion.get("confianza", 0.5)
        info = _info_estacion(estacion_id)

        color_piel_rgb = resultado.get("roi_piel_rgb", [128, 128, 128])
        color_cabello_rgb = resultado.get("roi_cabello_rgb", [128, 128, 128])
        color_piel_hex = _rgb_a_hex(color_piel_rgb)
        color_cabello_hex = _rgb_a_hex(color_cabello_rgb)

        estacion = {
            "id": estacion_id,
            "nombre": estacion_id.capitalize(),
            "confianza": confianza,
            "descripcion": info["descripcion"],
            "caracteristicas": info["caracteristicas"],
            "fuente": "analisis_robusto",
            "probabilidades": clasificacion.get("probabilidades", {}),
        }

        analisis_id = None
        try:
            analisis_db = CRUDAnalisis.crear(
                db=db,
                estacion=estacion_id,
                subtono=_subtono_para_bd(features.get("subtono")),
                contraste=features.get("contraste", "medio"),
                forma_rostro="ovalada",
                color_piel_hex=color_piel_hex,
                color_piel_nombre="Detectado",
                color_ojos_hex="#808080",
                color_ojos_nombre="Detectado",
                color_cabello_hex=color_cabello_hex,
                color_cabello_nombre="Detectado",
                confianza=confianza,
                genero=genero,
                usuario_id=usuario_id,
            )
            analisis_id = analisis_db.id
        except Exception:
            pass

        log_path = os.path.join(os.path.dirname(__file__), "server_eval.log")
        try:
            with open(log_path, "a") as f:
                f.write(
                    json.dumps(
                        {
                            "ts": datetime.now().isoformat(),
                            "metodo": metodo,
                            "estacion": estacion_id,
                            "confianza": confianza,
                            "t_analisis": round(t_analisis, 3),
                            "t_clasif": round(t_clasif, 3),
                        }
                    )
                    + "\n"
                )
        except Exception:
            pass

        payload = {
                "exito": True,
                "analisis_id": analisis_id,
                "estacion": estacion,
                "colores": {
                    "piel": {
                        "hex": color_piel_hex,
                        "rgb": color_piel_rgb,
                        "nombre": "Piel detectada",
                    },
                    "cabello": {
                        "hex": color_cabello_hex,
                        "rgb": color_cabello_rgb,
                        "nombre": "Cabello detectado",
                    },
                },
                "features": {
                    "subtono": features.get("subtono", "neutro"),
                    "contraste": features.get("contraste", "medio"),
                    "chroma": features.get("chroma", "medio"),
                    "confiable": resultado.get("confiable", True),
                    "razon_no_confiable": resultado.get("razon_no_confiable"),
                },
                "explicacion": clasificacion.get("explicacion", ""),
            }
        if atributos:
            payload["atributos_faciales"] = atributos
        return JSONResponse(content=payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/hair-tryon")
async def hair_tryon(
    archivo: UploadFile = File(...),
    color_hex: str = Form("#8B4513"),
    intensidad: int = Form(38),
    blend_mode: str = Form(DEFAULT_BLEND_MODE),
):
    """Simulación visual de tinte sobre imagen usando landmarks faciales."""
    if not HAIR_TRYON_ENABLED:
        raise HTTPException(status_code=503, detail="Hair try-on deshabilitado temporalmente")
    try:
        analizadores = _obtener_analizadores()
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Servicio de análisis no disponible: {e}. Reintente más tarde.",
        )

    contenido = await archivo.read()
    _validar_upload_imagen(archivo, contenido, MAX_IMAGEN_BYTES)

    if blend_mode not in ALLOWED_BLEND_MODES:
        raise HTTPException(
            status_code=422,
            detail=f"blend_mode inválido. Permitidos: {', '.join(sorted(ALLOWED_BLEND_MODES))}",
        )
    try:
        intensidad = int(intensidad)
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="intensidad debe ser un número entero")
    if not (5 <= intensidad <= 90):
        raise HTTPException(status_code=422, detail="intensidad debe estar entre 5 y 90")

    try:
        _, imagen_np = _normalizar_imagen_para_analisis(contenido, MAX_LADO_TRYON)
        detector_rostro = analizadores["detector_rostro"]
        deteccion = detector_rostro.detectar(imagen_np)
        if deteccion is None:
            raise HTTPException(status_code=422, detail="No se detectó rostro en la imagen")
        landmarks = deteccion["landmarks"]

        imagen_resultado, modo_usado = _generar_preview_tinte_cabello(
            imagen_np=imagen_np,
            landmarks=landmarks,
            color_hex=color_hex,
            intensidad=intensidad,
            blend_mode=blend_mode,
        )
        preview_data_url = _np_to_data_url_png(imagen_resultado)
        return JSONResponse(
            content={
                "exito": True,
                "modo": modo_usado,
                "parametros": {
                    "color_hex": color_hex,
                    "intensidad": int(intensidad),
                    "blend_mode": blend_mode,
                },
                "preview_data_url": preview_data_url,
            }
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo generar preview: {e}")


@app.post("/hair-edit")
async def hair_edit(
    archivo: UploadFile = File(...),
    modo: str = Form(...),
    color_hex: Optional[str] = Form(None),
    color_nombre: Optional[str] = Form(None),
    estilo_peinado: Optional[str] = Form(None),
    estacion: Optional[str] = Form(None),
    genero: Optional[str] = Form(None),
    intensidad: Optional[int] = Form(None),
):
    """Edición generativa de cabello (color/estilo) con proveedor externo opcional."""
    modo_normalizado = str(modo or "").strip().lower()
    if modo_normalizado not in ALLOWED_HAIR_EDIT_MODES:
        raise HTTPException(status_code=422, detail="modo inválido. Usa: color, style o color_style")

    if not ENABLE_GENERATIVE_HAIR_EDIT:
        print("[hair-edit] Generative disabled, using local fallback", flush=True)
        return _respuesta_hair_edit_no_disponible()
    if not HAIR_EDIT_API_KEY:
        print("[hair-edit] Provider unavailable: missing_api_key", flush=True)
        print("[hair-edit] Generative disabled, using local fallback", flush=True)
        return _respuesta_hair_edit_no_disponible()
    if HAIR_EDIT_PROVIDER != "openai":
        print(f"[hair-edit] Provider unavailable: unsupported_provider:{HAIR_EDIT_PROVIDER}", flush=True)
        print("[hair-edit] Generative disabled, using local fallback", flush=True)
        return _respuesta_hair_edit_no_disponible()

    contenido = await archivo.read()
    _validar_upload_imagen(archivo, contenido, MAX_IMAGEN_BYTES)
    try:
        prompt = _build_hair_edit_prompt(
            modo=modo_normalizado,
            color_hex=color_hex,
            color_nombre=color_nombre,
            estilo_peinado=estilo_peinado,
        )
        generador = get_generador_hair_edit()
        preview_data_url = generador.procesar(
            image_bytes=contenido,
            prompt=prompt,
            input_mime=(archivo.content_type or "image/png"),
        )
        return JSONResponse(
            content={
                "exito": True,
                "modo": modo_normalizado,
                "motor": "generative_hair_edit",
                "preview_data_url": preview_data_url,
                "prompt_usado": prompt,
                "mensaje": "Resultado generado",
                "meta": {
                    "estacion": estacion,
                    "genero": genero,
                    "intensidad": intensidad,
                },
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except GenerativeHairEditError as e:
        print(f"[hair-edit] Provider unavailable: {e}", flush=True)
        print("[hair-edit] Generative disabled, using local fallback", flush=True)
        return _respuesta_hair_edit_no_disponible()
    except HTTPException:
        raise
    except Exception as e:
        print(f"[hair-edit] Provider unavailable: {e!r}", flush=True)
        print("[hair-edit] Generative disabled, using local fallback", flush=True)
        return _respuesta_hair_edit_no_disponible()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
