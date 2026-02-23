"""
Script de entrenamiento para clasificador robusto.

Extrae features usando AnalizadorRobusto (CIELAB: subtono, contraste, chroma)
y entrena un modelo ML para clasificar estaciones.
"""

import os
import sys
import cv2
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
import joblib
import json

# Agregar backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from analizadores import AnalizadorRobusto, DetectorRostro


def cargar_dataset(carpeta_dataset: str):
    """
    Carga imágenes del dataset organizadas por estación.
    
    Estructura esperada:
    carpeta_dataset/
        primavera/
            imagen1.png
            imagen2.png
        verano/
        otono/
        invierno/
    """
    carpeta = Path(carpeta_dataset)
    estaciones = ["primavera", "verano", "otono", "invierno"]
    
    X = []
    y = []
    rutas_imagenes = []
    
    detector = DetectorRostro()
    analizador = AnalizadorRobusto(usar_normalizacion=True)
    
    print("Cargando dataset...")
    
    for estacion in estaciones:
        carpeta_estacion = carpeta / estacion
        
        if not carpeta_estacion.exists():
            print(f"  Saltando {estacion}: carpeta no existe")
            continue
        
        archivos = list(carpeta_estacion.glob("*.png")) + list(carpeta_estacion.glob("*.jpg"))
        
        print(f"  {estacion}: {len(archivos)} imágenes")
        
        for archivo in archivos:
            # Cargar imagen
            imagen_bgr = cv2.imread(str(archivo))
            if imagen_bgr is None:
                continue
            
            imagen_rgb = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2RGB)
            
            # Detectar rostro
            deteccion = detector.detectar(imagen_rgb)
            if deteccion is None:
                continue
            
            # Analizar features
            resultado = analizador.analizar(imagen_rgb, landmarks=deteccion["landmarks"])
            
            if "error" in resultado or not resultado.get("confiable", False):
                continue
            
            features = resultado["features"]
            
            # Extraer features numéricos
            feature_vector = [
                features.get("median_a", 0),
                features.get("median_b", 0),
                features.get("median_l", 50),
                features.get("median_chroma", 0),
                features.get("p75_chroma", 0),
                features.get("varianza_l", 0),
                features.get("contraste_absoluto", 0) if features.get("contraste_absoluto") is not None else 0,
            ]
            
            X.append(feature_vector)
            y.append(estacion)
            rutas_imagenes.append(str(archivo))
    
    return np.array(X), np.array(y), rutas_imagenes


def entrenar_modelo(X, y, rutas_imagenes=None):
    """
    Entrena modelo GBDT con cross-validation.
    """
    print(f"\nDataset cargado: {len(X)} muestras")
    print(f"Distribución: {pd.Series(y).value_counts().to_dict()}")
    
    # Convertir estaciones a números para sklearn
    estaciones_unicas = sorted(set(y))
    encoder = {est: idx for idx, est in enumerate(estaciones_unicas)}
    y_encoded = np.array([encoder[e] for e in y])
    
    # Escalar features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Cross-validation estricta (sin augmentation en validación)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # Modelo
    modelo = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        verbose=1
    )
    
    print("\nEjecutando cross-validation...")
    scores = cross_val_score(modelo, X_scaled, y_encoded, cv=skf, scoring='accuracy')
    
    print(f"\nAccuracy CV (promedio): {scores.mean()*100:.1f}% (+/- {scores.std()*2*100:.1f}%)")
    
    # Entrenar en todo el dataset
    print("\nEntrenando modelo final...")
    modelo.fit(X_scaled, y_encoded)
    
    # Accuracy final
    accuracy_final = modelo.score(X_scaled, y_encoded)
    print(f"Accuracy final: {accuracy_final*100:.1f}%")
    
    return modelo, scaler, encoder, estaciones_unicas, scores.mean()


def guardar_modelo(modelo, scaler, encoder, estaciones, accuracy_cv, ruta_salida):
    """
    Guarda modelo, scaler y metadata.
    """
    ruta_dir = Path(ruta_salida).parent
    ruta_dir.mkdir(parents=True, exist_ok=True)
    
    # Guardar modelo y scaler
    datos_modelo = {
        "modelo": modelo,
        "scaler": scaler,
        "encoder": encoder,
        "estaciones": estaciones
    }
    
    joblib.dump(datos_modelo, ruta_salida)
    
    # Guardar metadata
    metadata = {
        "version": "2.0",
        "sistema": "robusto",
        "features": [
            "median_a",
            "median_b", 
            "median_l",
            "median_chroma",
            "p75_chroma",
            "varianza_l",
            "contraste_absoluto"
        ],
        "estaciones": estaciones,
        "encoder": encoder,
        "accuracy_cv": float(accuracy_cv),
        "n_estimators": 100,
        "learning_rate": 0.1,
        "max_depth": 5
    }
    
    ruta_metadata = ruta_salida.replace(".pkl", "_metadata.json")
    with open(ruta_metadata, "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nModelo guardado en: {ruta_salida}")
    print(f"Metadata guardada en: {ruta_metadata}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Entrenar modelo robusto de colorimetría")
    parser.add_argument(
        "--dataset",
        type=str,
        default="ml/datasets/colorimetria",
        help="Ruta al dataset (carpeta con subcarpetas por estación)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="ml/modelos/modelo_robusto.pkl",
        help="Ruta de salida para el modelo"
    )
    
    args = parser.parse_args()
    
    # Rutas absolutas
    script_dir = Path(__file__).parent.parent.parent
    dataset_path = script_dir / args.dataset
    output_path = script_dir / args.output
    
    print(f"Dataset: {dataset_path}")
    print(f"Salida: {output_path}")
    
    # Cargar dataset
    X, y, rutas = cargar_dataset(str(dataset_path))
    
    if len(X) == 0:
        print("Error: No se cargaron imágenes")
        sys.exit(1)
    
    # Entrenar
    modelo, scaler, encoder, estaciones, accuracy_cv = entrenar_modelo(X, y, rutas)
    
    # Guardar
    guardar_modelo(modelo, scaler, encoder, estaciones, accuracy_cv, str(output_path))
    
    print("\nEntrenamiento completado")
