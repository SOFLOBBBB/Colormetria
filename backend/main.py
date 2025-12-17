"""
ColorMetría - API de análisis de colorimetría personal
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
import io
import base64
from PIL import Image
import numpy as np
from typing import Optional, List

# Importar módulos de análisis
from analizadores.detector_rostro import DetectorRostro
from analizadores.analizador_colores import AnalizadorColores
from analizadores.clasificador_estacion import ClasificadorEstacion
from recomendaciones.paleta_colores import generador_paleta
from recomendaciones.estilos_ropa import RecomendadorRopa
from recomendaciones.estilos_cabello import RecomendadorCabello
from recomendaciones.joyeria import RecomendadorJoyeria

# Importar módulos de generación
from generador.cambio_cabello import GeneradorCabello
from generador.buscador_outfits import BuscadorOutfits

# Importar módulos de base de datos
from database.conexion import obtener_db, crear_tablas
from database.crud import CRUDUsuario, CRUDAnalisis, CRUDRecomendacion

app = FastAPI(
    title="ColorMetría API",
    description="API de análisis de colorimetría personal",
    version="1.0.0"
)

import os
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.on_event("startup")
async def startup_event():
    crear_tablas()
    print("ColorMetría API iniciada")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar analizadores
detector_rostro = DetectorRostro()
analizador_colores = AnalizadorColores()
clasificador_estacion = ClasificadorEstacion()
recomendador_ropa = RecomendadorRopa()
recomendador_cabello = RecomendadorCabello()
recomendador_joyeria = RecomendadorJoyeria()

# Inicializar generadores (lazy loading para SAM e inpainting)
generador_cabello = GeneradorCabello(usar_gpu=False)
buscador_outfits = BuscadorOutfits()


@app.get("/")
async def raiz():
    """Endpoint de bienvenida"""
    return {
        "mensaje": "¡Bienvenido a ColorMetría API!",
        "descripcion": "API de análisis de colorimetría personal",
        "endpoints": {
            "analizar": "/analizar - POST con imagen para análisis completo",
            "documentacion": "/docs - Documentación interactiva"
        }
    }


@app.get("/salud")
async def verificar_salud():
    """Verificar estado del servidor"""
    return {"estado": "activo", "mensaje": "Servidor funcionando correctamente"}


@app.post("/analizar")
async def analizar_imagen(
    archivo: UploadFile = File(..., description="Imagen del rostro a analizar"),
    genero: str = "femenino",
    guardar: bool = Query(True, description="Guardar el análisis en la base de datos"),
    db: Session = Depends(obtener_db)
):
    """
    Analiza una imagen del rostro y devuelve:
    - Estación de color (Primavera, Verano, Otoño, Invierno)
    - Subtono de piel (Cálido, Frío, Neutro)
    - Colores que favorecen
    - Recomendaciones de ropa
    - Recomendaciones de peinados
    
    El análisis se guarda automáticamente en la base de datos.
    """
    try:
        # Validar tipo de archivo
        if not archivo.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="El archivo debe ser una imagen (jpg, png, etc.)"
            )
        
        # Leer imagen
        contenido = await archivo.read()
        imagen = Image.open(io.BytesIO(contenido))
        imagen_np = np.array(imagen.convert("RGB"))
        
        # Detectar rostro y obtener landmarks
        resultado_rostro = detector_rostro.detectar(imagen_np)
        
        if not resultado_rostro["rostro_detectado"]:
            raise HTTPException(
                status_code=400,
                detail="No se detectó un rostro en la imagen. Por favor, sube una foto clara de tu rostro."
            )
        
        # Analizar colores (piel, ojos, cabello) usando regiones precisas de MediaPipe
        colores = analizador_colores.analizar(
            imagen_np,
            resultado_rostro["landmarks"],
            resultado_rostro["region_rostro"],
            resultado_rostro.get("regiones")  # Regiones precisas extraídas por MediaPipe
        )
        
        # Clasificar estación de color
        estacion = clasificador_estacion.clasificar(colores)
        
        # Generar paleta de colores recomendados
        paleta = generador_paleta(estacion)
        
        # Obtener recomendaciones de ropa
        ropa = recomendador_ropa.recomendar(
            estacion=estacion,
            genero=genero,
            forma_rostro=resultado_rostro.get("forma_rostro", "ovalado")
        )
        
        # Obtener recomendaciones de cabello
        cabello = recomendador_cabello.recomendar(
            forma_rostro=resultado_rostro.get("forma_rostro", "ovalado"),
            genero=genero,
            estacion=estacion
        )
        
        # Obtener recomendaciones de joyería
        joyeria = recomendador_joyeria.recomendar(
            estacion=estacion,
            forma_rostro=resultado_rostro.get("forma_rostro", "ovalado"),
            subtono=colores["subtono"],
            genero=genero
        )
        
        # Guardar en base de datos
        analisis_id = None
        if guardar:
            analisis_db = CRUDAnalisis.crear(
                db=db,
                estacion=estacion["id"],
                subtono=colores["subtono"],
                contraste=colores.get("contraste", "medio"),
                forma_rostro=resultado_rostro.get("forma_rostro", "ovalado"),
                color_piel_hex=colores["piel"]["hex"],
                color_piel_nombre=colores["piel"]["nombre"],
                color_ojos_hex=colores["ojos"]["hex"],
                color_ojos_nombre=colores["ojos"]["nombre"],
                color_cabello_hex=colores["cabello"]["hex"],
                color_cabello_nombre=colores["cabello"]["nombre"],
                confianza=estacion["confianza"],
                genero=genero
            )
            analisis_id = analisis_db.id
            
            # Guardar recomendaciones
            CRUDRecomendacion.crear(db, analisis_id, "paleta", paleta)
            CRUDRecomendacion.crear(db, analisis_id, "ropa", ropa)
            CRUDRecomendacion.crear(db, analisis_id, "cabello", cabello)
            CRUDRecomendacion.crear(db, analisis_id, "joyeria", joyeria)
        
        return {
            "exito": True,
            "analisis_id": analisis_id,
            "analisis": {
                "estacion": estacion,
                "subtono": colores["subtono"],
                "colores_detectados": {
                    "piel": colores["piel"],
                    "ojos": colores["ojos"],
                    "cabello": colores["cabello"]
                },
                "forma_rostro": resultado_rostro.get("forma_rostro", "ovalado"),
                "contraste": colores.get("contraste", "medio")
            },
            "recomendaciones": {
                "paleta_colores": paleta,
                "ropa": ropa,
                "cabello": cabello,
                "joyeria": joyeria
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la imagen: {str(e)}"
        )


@app.post("/analizar-rapido")
async def analizar_rapido(archivo: UploadFile = File(...)):
    """
    Análisis rápido que solo devuelve la estación de color
    y los colores principales detectados.
    """
    try:
        contenido = await archivo.read()
        imagen = Image.open(io.BytesIO(contenido))
        imagen_np = np.array(imagen.convert("RGB"))
        
        resultado_rostro = detector_rostro.detectar(imagen_np)
        
        if not resultado_rostro["rostro_detectado"]:
            raise HTTPException(
                status_code=400,
                detail="No se detectó un rostro en la imagen."
            )
        
        colores = analizador_colores.analizar(
            imagen_np,
            resultado_rostro["landmarks"],
            resultado_rostro["region_rostro"]
        )
        
        estacion = clasificador_estacion.clasificar(colores)
        paleta = generador_paleta(estacion)
        
        return {
            "exito": True,
            "estacion": estacion,
            "subtono": colores["subtono"],
            "paleta_principal": paleta["principales"][:6]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/estaciones")
async def obtener_estaciones():
    """Devuelve información sobre las 4 estaciones de color"""
    return {
        "estaciones": [
            {
                "nombre": "Primavera",
                "subtono": "Cálido",
                "caracteristicas": "Tonos cálidos y brillantes, piel con subtono dorado",
                "descripcion": "Colores frescos, vivos y luminosos como los de la primavera"
            },
            {
                "nombre": "Verano",
                "subtono": "Frío",
                "caracteristicas": "Tonos fríos y suaves, piel con subtono rosado",
                "descripcion": "Colores suaves, apagados y elegantes"
            },
            {
                "nombre": "Otoño",
                "subtono": "Cálido",
                "caracteristicas": "Tonos cálidos y profundos, piel con subtono dorado",
                "descripcion": "Colores terrosos, ricos y cálidos como las hojas de otoño"
            },
            {
                "nombre": "Invierno",
                "subtono": "Frío",
                "caracteristicas": "Tonos fríos y brillantes, alto contraste",
                "descripcion": "Colores intensos, puros y dramáticos"
            }
        ]
    }


# =====================================================
# ENDPOINTS DE BASE DE DATOS (CRUD)
# =====================================================

@app.get("/historial")
async def obtener_historial(
    skip: int = Query(0, description="Número de registros a saltar"),
    limit: int = Query(20, description="Número máximo de registros"),
    db: Session = Depends(obtener_db)
):
    """
    Obtiene el historial de análisis realizados.
    Permite paginación con skip y limit.
    """
    analisis_lista = CRUDAnalisis.obtener_todos(db, skip=skip, limit=limit)
    return {
        "total": len(analisis_lista),
        "analisis": [a.to_dict() for a in analisis_lista]
    }


@app.get("/historial/{analisis_id}")
async def obtener_analisis_por_id(
    analisis_id: int,
    db: Session = Depends(obtener_db)
):
    """
    Obtiene un análisis específico por su ID.
    Incluye todas las recomendaciones asociadas.
    """
    analisis = CRUDAnalisis.obtener_por_id(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    
    recomendaciones = CRUDRecomendacion.obtener_por_analisis(db, analisis_id)
    
    return {
        "analisis": analisis.to_dict(),
        "recomendaciones": [r.to_dict() for r in recomendaciones]
    }


@app.delete("/historial/{analisis_id}")
async def eliminar_analisis(
    analisis_id: int,
    db: Session = Depends(obtener_db)
):
    """Elimina un análisis y sus recomendaciones asociadas"""
    exito = CRUDAnalisis.eliminar(db, analisis_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    return {"mensaje": "Análisis eliminado correctamente"}


@app.get("/estadisticas")
async def obtener_estadisticas(db: Session = Depends(obtener_db)):
    """
    Obtiene estadísticas generales de los análisis realizados.
    
    Incluye:
    - Total de análisis
    - Distribución por estación
    - Distribución por género
    """
    return CRUDAnalisis.obtener_estadisticas(db)


# =====================================================
# ENDPOINTS DE USUARIOS
# =====================================================

@app.post("/usuarios")
async def crear_usuario(
    nombre: str,
    email: str,
    genero: str,
    db: Session = Depends(obtener_db)
):
    """Crea un nuevo usuario en el sistema"""
    # Verificar si el email ya existe
    existente = CRUDUsuario.obtener_por_email(db, email)
    if existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    usuario = CRUDUsuario.crear(db, nombre=nombre, email=email, genero=genero)
    return {"mensaje": "Usuario creado correctamente", "usuario": usuario.to_dict()}


@app.get("/usuarios")
async def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(obtener_db)
):
    """Lista todos los usuarios registrados"""
    usuarios = CRUDUsuario.obtener_todos(db, skip=skip, limit=limit)
    return {"usuarios": [u.to_dict() for u in usuarios]}


@app.get("/usuarios/{usuario_id}/analisis")
async def obtener_analisis_usuario(
    usuario_id: int,
    db: Session = Depends(obtener_db)
):
    """Obtiene todos los análisis de un usuario específico"""
    usuario = CRUDUsuario.obtener_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    analisis = CRUDAnalisis.obtener_por_usuario(db, usuario_id)
    return {
        "usuario": usuario.to_dict(),
        "analisis": [a.to_dict() for a in analisis]
    }


# =====================================================
# ENDPOINTS DE GENERACIÓN DE CABELLO
# =====================================================

@app.get("/cabello/estilos")
async def obtener_estilos_cabello(
    genero: str = Query("femenino", description="Género para filtrar estilos"),
    estacion: str = Query("primavera", description="Estación de colorimetría")
):
    """
    Obtiene los estilos de cabello disponibles con colores recomendados.
    
    Cada estilo incluye:
    - Nombre y descripción
    - Prompt para generación
    - Colores recomendados según la estación
    """
    estilos = generador_cabello.obtener_estilos_recomendados(genero, "ovalado", estacion)
    return {
        "estilos": estilos,
        "total": len(estilos)
    }


@app.get("/cabello/colores")
async def obtener_colores_cabello(
    estacion: str = Query(None, description="Filtrar por estación de colorimetría")
):
    """
    Obtiene los colores de cabello disponibles.
    
    Si se especifica estación, solo devuelve colores compatibles.
    """
    colores = []
    for color_id, color in generador_cabello.COLORES_CABELLO.items():
        if estacion is None or estacion.lower() in color["estacion"]:
            colores.append({
                "id": color_id,
                "nombre": color["nombre"],
                "hex": color["hex"],
                "estaciones": color["estacion"]
            })
    
    return {"colores": colores, "total": len(colores)}


@app.post("/cabello/generar")
async def generar_cabello(
    archivo: UploadFile = File(..., description="Imagen del rostro"),
    estilo: str = Form("ondas_largas", description="ID del estilo de cabello"),
    color: str = Form(None, description="ID del color de cabello")
):
    """
    Genera una variación de cabello sobre la imagen proporcionada.
    
    Usa Segment Anything para detectar el cabello y Stable Diffusion
    para generar el nuevo estilo.
    
    ⚠️ NOTA: La primera vez puede tardar varios minutos en descargar los modelos.
    """
    try:
        # Leer imagen
        contenido = await archivo.read()
        imagen = Image.open(io.BytesIO(contenido))
        imagen_np = np.array(imagen.convert("RGB"))
        
        # Detectar rostro para obtener landmarks
        resultado_rostro = detector_rostro.detectar(imagen_np)
        
        if not resultado_rostro.get("rostro_detectado"):
            raise HTTPException(
                status_code=400,
                detail="No se detectó ningún rostro en la imagen"
            )
        
        # Segmentar cabello
        mascara = generador_cabello.segmentar_cabello(
            imagen_np,
            resultado_rostro["landmarks"]
        )
        
        # Generar variación
        imagen_resultado = generador_cabello.generar_variacion(
            imagen_np,
            mascara,
            estilo=estilo,
            color=color
        )
        
        # Convertir a base64 para enviar
        pil_resultado = Image.fromarray(imagen_resultado)
        buffer = io.BytesIO()
        pil_resultado.save(buffer, format="PNG")
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "imagen_generada": f"data:image/png;base64,{imagen_base64}",
            "estilo_aplicado": estilo,
            "color_aplicado": color
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando cabello: {str(e)}")


@app.post("/cabello/previsualizaciones")
async def generar_previsualizaciones_cabello(
    archivo: UploadFile = File(..., description="Imagen del rostro"),
    genero: str = Form("femenino"),
    estacion: str = Form("primavera"),
    max_variaciones: int = Form(4, description="Número máximo de variaciones")
):
    """
    Genera múltiples previsualizaciones de estilos de cabello recomendados.
    
    Ideal para mostrar opciones al usuario antes de elegir.
    """
    try:
        # Leer imagen
        contenido = await archivo.read()
        imagen = Image.open(io.BytesIO(contenido))
        imagen_np = np.array(imagen.convert("RGB"))
        
        # Detectar rostro
        resultado_rostro = detector_rostro.detectar(imagen_np)
        
        if not resultado_rostro.get("rostro_detectado"):
            raise HTTPException(status_code=400, detail="No se detectó ningún rostro")
        
        # Generar previsualizaciones
        previsualizaciones = generador_cabello.generar_previsualizaciones(
            imagen_np,
            resultado_rostro["landmarks"],
            genero,
            estacion,
            max_variaciones
        )
        
        # Convertir imágenes a base64
        resultados = []
        for prev in previsualizaciones:
            pil_img = Image.fromarray(prev["imagen"])
            buffer = io.BytesIO()
            pil_img.save(buffer, format="PNG")
            imagen_b64 = base64.b64encode(buffer.getvalue()).decode()
            
            resultados.append({
                "imagen": f"data:image/png;base64,{imagen_b64}",
                "estilo": prev["estilo"],
                "color": prev["color"],
                "descripcion": prev["descripcion"]
            })
        
        return {"previsualizaciones": resultados, "total": len(resultados)}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando previsualizaciones: {str(e)}")


# =====================================================
# ENDPOINTS DE OUTFITS
# =====================================================

@app.get("/outfits/buscar")
async def buscar_outfits(
    estacion: str = Query(..., description="Estación de colorimetría"),
    ocasion: str = Query(None, description="casual, formal, deportivo, fiesta"),
    genero: str = Query(None, description="masculino, femenino"),
    limite: int = Query(10, description="Número máximo de resultados")
):
    """
    Busca outfits en la base de datos curada.
    
    Filtra por estación, ocasión y género.
    """
    outfits = buscador_outfits.buscar_outfits(estacion, ocasion, genero, limite)
    return {"outfits": outfits, "total": len(outfits)}


@app.get("/outfits/recomendaciones")
async def obtener_recomendaciones_outfits(
    estacion: str = Query(..., description="Estación de colorimetría"),
    genero: str = Query("femenino", description="Género"),
    forma_rostro: str = Query(None, description="Forma del rostro")
):
    """
    Obtiene recomendaciones personalizadas de outfits.
    
    Incluye:
    - Paleta de colores de la estación
    - Outfits casuales y formales
    - Consejos de estilo personalizados
    """
    recomendaciones = buscador_outfits.obtener_recomendaciones(
        estacion, genero, forma_rostro
    )
    return recomendaciones


@app.get("/outfits/paleta/{estacion}")
async def obtener_paleta_outfits(estacion: str):
    """
    Obtiene la paleta de colores completa de una estación.
    
    Útil para mostrar qué colores debe buscar el usuario.
    """
    paleta = buscador_outfits.obtener_paleta_estacion(estacion)
    return {"estacion": estacion, "colores": paleta}


@app.post("/outfits/agregar")
async def agregar_outfit(
    estacion: str = Form(...),
    nombre: str = Form(...),
    descripcion: str = Form(...),
    ocasion: str = Form("casual"),
    prendas: str = Form(..., description="Lista de prendas separadas por coma"),
    colores: str = Form(..., description="Lista de colores hex separados por coma"),
    genero: str = Form("unisex"),
    imagen: UploadFile = File(None, description="Imagen del outfit")
):
    """
    Agrega un nuevo outfit a la base de datos curada.
    
    Permite subir una imagen del outfit desde Pinterest u otra fuente.
    """
    try:
        outfit = {
            "nombre": nombre,
            "descripcion": descripcion,
            "ocasion": ocasion,
            "prendas": [p.strip() for p in prendas.split(",")],
            "colores": [c.strip() for c in colores.split(",")],
            "genero": genero
        }
        
        imagen_bytes = None
        if imagen:
            imagen_bytes = await imagen.read()
        
        exito = buscador_outfits.agregar_outfit(estacion, outfit, imagen_bytes)
        
        if exito:
            return {"mensaje": "Outfit agregado correctamente", "outfit": outfit}
        else:
            raise HTTPException(status_code=400, detail="No se pudo agregar el outfit")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error agregando outfit: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

