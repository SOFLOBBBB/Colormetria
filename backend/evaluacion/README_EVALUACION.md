# Evaluación del Sistema Robusto

## Tests Implementados

### 1. Test de Estabilidad (`test_estabilidad.py`)

**Objetivo**: Validar que las features (a*, b*, L*, chroma, contraste) son estables para la MISMA persona en diferentes iluminaciones.

**Cómo usar**:
```bash
cd backend
python evaluacion/test_estabilidad.py <carpeta_personas> --output resultados_estabilidad.csv
```

**Estructura esperada**:
```
carpeta_personas/
    persona1/
        exterior_sombra.jpg
        exterior_sol.jpg
        interior_calida.jpg
        interior_blanca.jpg
        baja_luz.jpg
    persona2/
        ...
```

**Métricas generadas**:
- Varianza INTRA-persona (promedio): Qué tan variables son las features dentro de la misma persona
- Varianza INTER-persona: Qué tan diferentes son entre personas diferentes
- **Ratio (inter/intra)**: Debe ser > 1 para ser útil (diferencias entre personas > diferencias por iluminación)
- Consistencia de subtono: % de veces que el subtono clasificado es el mismo

**Interpretación**:
- ✅ Ratio > 1: Las features diferencian personas mejor que ruido por iluminación
- ❌ Ratio < 1: Las features cambian más por iluminación que entre personas → problema

### 2. Test ROI Cabello (`test_roi_cabello.py`)

**Objetivo**: Validar si el "ROI cabello" es realmente cabello o fondo/sombras/objetos.

**Cómo usar**:
```bash
cd backend
python evaluacion/test_roi_cabello.py <carpeta_imagenes> --output resultados_roi_cabello.csv
```

**Imágenes de prueba necesarias**:
- Imágenes con pared blanca arriba
- Imágenes con cielo arriba
- Imágenes con gorra/sombrero
- Imágenes con lámpara/luz arriba
- Imágenes con cabello real (control)

**Métricas generadas**:
- Brillo promedio del ROI (si > 200 → probable fondo blanco)
- Varianza de color (si < 100 → probable fondo uniforme)
- Contraste por tipo de fondo
- Flags de sospecha

**Interpretación**:
- ✅ Contraste similar entre fondos: ROI confiable
- ❌ Contraste muy variable: ROI está capturando fondo → necesitas segmentación

## Próximos Tests (Por Implementar)

### 3. Comparación Antes/Después Normalización

**Objetivo**: Validar que la normalización de color mejora la estabilidad sin destruir información.

**Métrica clave**: Varianza de features con/sin normalización en mismo set de imágenes.

### 4. Calibración de Umbrales

**Objetivo**: Ajustar umbrales de subtono/contraste/chroma con datos etiquetados.

**Requerimiento**: Dataset de 300-500 imágenes con etiquetas humanas (warm/cool/neutral, contraste, chroma).

## Criterios de Éxito

### Estabilidad
- Ratio inter/intra > 1.5 para a* y b*
- Consistencia de subtono > 80% para misma persona
- Varianza intra-persona de L* < 10

### ROI Cabello
- < 30% de imágenes con sospecha de fondo blanco
- Desviación estándar de contraste < 20 entre fondos diferentes
- Sin falsos positivos en imágenes con gorra/objetos

### Normalización
- Reducción de varianza intra-persona > 20% vs sin normalización
- Sin degradación de ratio inter/intra

## Logging Detallado

Cada request al endpoint `/analizar` debería loggear (sin datos personales):
- Método usado (robusto/legacy)
- Valores de features (median_a, median_b, median_l, chroma, contraste)
- Flags de no confiable
- Estación final
- Tiempo de procesamiento

Esto permite detectar drift y fallos en producción.
