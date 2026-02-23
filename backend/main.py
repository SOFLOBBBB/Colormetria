"""API de análisis de colorimetría: detección de rostro, análisis LAB y clasificación en estación."""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
import numpy as np
from PIL import Image
import io
import os
import json
import time
from datetime import datetime

from database import obtener_db, crear_tablas, CRUDAnalisis, CRUDRecomendacion
from analizadores import (
    AnalizadorRobusto,
    ClasificadorRobusto,
    DetectorRostro,
    AnalizadorColores,
)
from analizadores.atributos_faciales import analizar_atributos as analizar_atributos_faciales

app = FastAPI(title="ColorMetría API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector_rostro = DetectorRostro()
analizador_robusto = AnalizadorRobusto(usar_normalizacion=True)
clasificador_robusto = ClasificadorRobusto(usar_ml=False)
analizador_colores_legacy = AnalizadorColores()
crear_tablas()

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
        "endpoints": {"/analizar": "POST", "/health": "GET"},
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
        contenido = await archivo.read()
        imagen_pil = Image.open(io.BytesIO(contenido))
        if imagen_pil.mode != "RGB":
            imagen_pil = imagen_pil.convert("RGB")
        imagen_np = np.array(imagen_pil)

        deteccion = detector_rostro.detectar(imagen_np)
        if deteccion is None:
            raise HTTPException(status_code=400, detail="No se detectó rostro en la imagen")
        landmarks = deteccion["landmarks"]
        region_rostro = deteccion["region_rostro"]

        atributos = analizar_atributos_faciales(imagen_np)

        t0 = time.time()
        resultado = analizador_robusto.analizar(imagen_np, landmarks=landmarks)
        metodo = "robusto"

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
