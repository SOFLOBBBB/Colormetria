"""Clasificación a estación colorimétrica (primavera/verano/otoño/invierno) por subtono, contraste y chroma."""

from typing import Dict, Any, Optional
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np
import joblib
import os


class ClasificadorRobusto:
    """Mapeo features → estación: opcionalmente ML para subtono y reglas para estación."""

    ESTACIONES = ["primavera", "verano", "otono", "invierno"]

    def __init__(self, usar_ml: bool = True, ruta_modelo: Optional[str] = None):
        self.usar_ml = usar_ml
        self.modelo_subtono = None
        self.scaler_subtono = None
        if usar_ml and ruta_modelo and os.path.exists(ruta_modelo):
            try:
                data = joblib.load(ruta_modelo)
                self.modelo_subtono = data.get("modelo")
                self.scaler_subtono = data.get("scaler")
            except Exception:
                self.usar_ml = False
    
    def clasificar(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Devuelve estación, confianza, explicación y probabilidades por estación."""
        # Validar features
        if "subtono" not in features:
            return {
                "estacion": "desconocida",
                "confianza": 0.0,
                "error": "Features incompletos"
            }
        
        subtono = features.get("subtono", "neutral")
        contraste = features.get("contraste", "medio")
        chroma = features.get("chroma", "medio")
        median_l = features.get("median_l", 50.0)
        
        # Opción 1: Usar ML para subtono si está disponible
        if self.usar_ml and self.modelo_subtono:
            subtono_ml = self._clasificar_subtono_ml(features)
            if subtono_ml:
                subtono = subtono_ml
        
        # Mapear features → estación usando reglas
        resultado = self._mapear_a_estacion(subtono, contraste, chroma, median_l)
        
        # Agregar explicación
        resultado["explicacion"] = self._generar_explicacion(
            subtono, contraste, chroma, median_l, resultado["estacion"]
        )
        
        # Agregar probabilidades (si se calculan)
        resultado["probabilidades"] = self._calcular_probabilidades(
            subtono, contraste, chroma, median_l
        )
        
        return resultado
    
    def _clasificar_subtono_ml(self, features: Dict[str, Any]) -> Optional[str]:
        """Subtono por modelo ML si existe."""
        try:
            # Features para ML: median_a, median_b, median_chroma, etc.
            X = np.array([[
                features.get("median_a", 0),
                features.get("median_b", 0),
                features.get("median_chroma", 0),
                features.get("median_l", 50),
                features.get("varianza_l", 0)
            ]])
            
            if self.scaler_subtono:
                X = self.scaler_subtono.transform(X)
            
            return self.modelo_subtono.predict(X)[0]
        except Exception:
            return None
    
    def _mapear_a_estacion(
        self,
        subtono: str,
        contraste: str,
        chroma: str,
        median_l: float,
    ) -> Dict[str, Any]:
        """Reglas: primavera/otoño (cálidos), verano/invierno (fríos); depth por L*."""
        depth = "light" if median_l > 70 else ("medium" if median_l > 45 else "dark")
        
        # Mapeo con prioridad
        estacion = None
        confianza = 0.0
        
        # Primavera: Warm + high chroma + light/medium
        if subtono == "warm" and chroma in ["intenso", "medio"]:
            if contraste in ["bajo", "medio"] and depth in ["light", "medium"]:
                estacion = "primavera"
                confianza = 0.85
            elif depth == "light":
                estacion = "primavera"
                confianza = 0.70
        
        # Otoño: Warm + lower chroma + medium/high depth
        if subtono == "warm" and chroma in ["suave", "medio"]:
            if depth in ["medium", "dark"] or contraste in ["medio", "alto"]:
                if not estacion or confianza < 0.75:
                    estacion = "otono"
                    confianza = 0.80
                elif depth == "dark":
                    estacion = "otono"
                    confianza = 0.85
        
        # Invierno: Cool + high contrast + high chroma
        if subtono == "cool" and contraste == "alto" and chroma in ["intenso", "medio"]:
            if not estacion or confianza < 0.80:
                estacion = "invierno"
                confianza = 0.85
            elif chroma == "intenso":
                estacion = "invierno"
                confianza = 0.90
        
        # Verano: Cool + low contrast + low/medium chroma
        if subtono == "cool" and contraste in ["bajo", "medio"]:
            if chroma in ["suave", "medio"]:
                if not estacion or confianza < 0.80:
                    estacion = "verano"
                    confianza = 0.85
                elif contraste == "bajo" and chroma == "suave":
                    estacion = "verano"
                    confianza = 0.90
        
        # Casos neutrales
        if subtono == "neutral":
            # Usar contraste y chroma para decidir
            if contraste == "alto" and chroma == "intenso":
                estacion = "invierno"
                confianza = 0.65
            elif contraste == "bajo" and chroma == "suave":
                estacion = "verano"
                confianza = 0.65
            elif depth == "light" and chroma in ["intenso", "medio"]:
                estacion = "primavera"
                confianza = 0.60
            elif depth == "dark":
                estacion = "otono"
                confianza = 0.60
        
        # Fallback: elegir por subtono dominante
        if not estacion:
            if subtono == "warm":
                estacion = "primavera" if depth == "light" else "otono"
            elif subtono == "cool":
                estacion = "verano" if contraste == "bajo" else "invierno"
            else:
                estacion = "verano"  # Default más común
            confianza = 0.50
        
        return {
            "estacion": estacion,
            "confianza": confianza,
            "subtono_detectado": subtono,
            "contraste_detectado": contraste,
            "chroma_detectado": chroma,
            "depth_detectado": depth
        }
    
    def _generar_explicacion(
        self,
        subtono: str,
        contraste: str,
        chroma: str,
        median_l: float,
        estacion: str,
    ) -> str:
        """Texto legible de la clasificación."""
        subtono_es = {
            "cool": "frío (matices rosados/azulados)",
            "warm": "cálido (matices dorados/amarillos)",
            "neutral": "neutro (balance entre cálido y frío)"
        }
        
        contraste_es = {
            "bajo": "bajo contraste",
            "medio": "contraste medio",
            "alto": "alto contraste"
        }
        
        chroma_es = {
            "suave": "colores suaves",
            "medio": "colores medianamente intensos",
            "intenso": "colores intensos"
        }
        
        explicacion = (
            f"Tu subtono es {subtono_es.get(subtono, subtono)}, "
            f"con {contraste_es.get(contraste, contraste)} y {chroma_es.get(chroma, chroma)}. "
            f"Esto indica que tu paleta es {estacion.capitalize()}."
        )
        
        return explicacion
    
    def _calcular_probabilidades(
        self,
        subtono: str,
        contraste: str,
        chroma: str,
        median_l: float,
    ) -> Dict[str, float]:
        """Scores por estación con reglas; normalizado a suma 1."""
        scores = {
            "primavera": 0.0,
            "verano": 0.0,
            "otono": 0.0,
            "invierno": 0.0
        }
        
        # Primavera
        if subtono == "warm":
            scores["primavera"] += 0.4
            scores["otono"] += 0.4
        if chroma in ["intenso", "medio"] and median_l > 60:
            scores["primavera"] += 0.3
        if contraste in ["bajo", "medio"]:
            scores["primavera"] += 0.2
        
        # Otoño
        if subtono == "warm":
            scores["otono"] += 0.3
        if chroma in ["suave", "medio"] and median_l < 65:
            scores["otono"] += 0.3
        if contraste in ["medio", "alto"]:
            scores["otono"] += 0.2
        
        # Invierno
        if subtono == "cool":
            scores["invierno"] += 0.3
            scores["verano"] += 0.3
        if contraste == "alto" and chroma in ["intenso", "medio"]:
            scores["invierno"] += 0.4
        if chroma == "intenso":
            scores["invierno"] += 0.2
        
        # Verano
        if subtono == "cool":
            scores["verano"] += 0.3
        if contraste in ["bajo", "medio"] and chroma in ["suave", "medio"]:
            scores["verano"] += 0.4
        if chroma == "suave":
            scores["verano"] += 0.2
        
        # Normalizar a probabilidades
        total = sum(scores.values())
        if total > 0:
            probabilidades = {k: v / total for k, v in scores.items()}
        else:
            probabilidades = {k: 0.25 for k in scores.keys()}
        
        return probabilidades
