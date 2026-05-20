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
        """Elige estación por score (argmax) — evita que la cascada de reglas
        se quede atrapada en primavera por umbrales tempranos altos.

        Mantiene la categoría ``depth`` por L* y devuelve la confianza
        normalizada del score ganador respecto al total.
        """
        depth = "light" if median_l > 70 else ("medium" if median_l > 45 else "dark")

        scores = self._calcular_probabilidades(subtono, contraste, chroma, median_l)
        estacion = max(scores, key=scores.get)
        confianza = float(scores[estacion])

        if confianza < 0.30:
            if subtono == "warm":
                estacion = "primavera" if depth == "light" else "otono"
                confianza = 0.50
            elif subtono == "cool":
                estacion = "invierno" if contraste == "alto" else "verano"
                confianza = 0.50
            else:
                estacion = "verano" if contraste == "bajo" else "otono"
                confianza = 0.45

        return {
            "estacion": estacion,
            "confianza": round(confianza, 4),
            "subtono_detectado": subtono,
            "contraste_detectado": contraste,
            "chroma_detectado": chroma,
            "depth_detectado": depth,
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
        """Scores por estación; normalizado a suma 1.

        Rebalanceado para evitar el sesgo previo donde primavera acumulaba
        contribuciones de varias condiciones simultáneas y siempre ganaba
        para piel cálida con chroma medio. Cada estación recibe puntos sólo
        en sus condiciones distintivas y la asignación es más selectiva.
        """
        scores = {
            "primavera": 0.0,
            "verano": 0.0,
            "otono": 0.0,
            "invierno": 0.0,
        }

        # ── Primavera: warm + light/medium + chroma medio/intenso + contraste bajo/medio
        if subtono == "warm":
            scores["primavera"] += 0.30
        elif subtono == "neutral":
            scores["primavera"] += 0.08
        if median_l > 60 and chroma in ["intenso", "medio"]:
            scores["primavera"] += 0.25
        if contraste == "bajo":
            scores["primavera"] += 0.15
        elif contraste == "medio":
            scores["primavera"] += 0.08

        # ── Otoño: warm + medium/dark depth + chroma suave/medio + contraste medio/alto
        if subtono == "warm":
            scores["otono"] += 0.30
        elif subtono == "neutral":
            scores["otono"] += 0.08
        if median_l < 60 and chroma in ["suave", "medio"]:
            scores["otono"] += 0.25
        elif median_l < 70 and chroma == "suave":
            scores["otono"] += 0.15
        if contraste == "medio":
            scores["otono"] += 0.12
        elif contraste == "alto":
            scores["otono"] += 0.18

        # ── Verano: cool + low/medium contrast + chroma suave/medio
        if subtono == "cool":
            scores["verano"] += 0.30
        elif subtono == "neutral":
            scores["verano"] += 0.10
        if contraste in ["bajo", "medio"] and chroma in ["suave", "medio"]:
            scores["verano"] += 0.25
        if contraste == "bajo":
            scores["verano"] += 0.10
        if median_l > 55 and chroma == "suave":
            scores["verano"] += 0.10

        # ── Invierno: cool + high contrast + chroma intenso
        if subtono == "cool":
            scores["invierno"] += 0.30
        elif subtono == "neutral":
            scores["invierno"] += 0.08
        if contraste == "alto":
            scores["invierno"] += 0.25
        elif contraste == "medio" and chroma == "intenso":
            scores["invierno"] += 0.15
        if chroma == "intenso":
            scores["invierno"] += 0.18
        if median_l < 60 and contraste in ["medio", "alto"]:
            scores["invierno"] += 0.10

        # Normalizar
        total = sum(scores.values())
        if total > 0:
            probabilidades = {k: v / total for k, v in scores.items()}
        else:
            probabilidades = {k: 0.25 for k in scores.keys()}

        return probabilidades
