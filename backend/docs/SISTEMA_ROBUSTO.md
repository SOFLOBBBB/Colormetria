# Sistema de Colorimetría Robusto - Documentación Técnica

## 🎯 Objetivo

Construir mediciones estables (subtono, contraste, chroma) que sobrevivan a:
- **Luz mala** (mediante normalización de color)
- **Cámara mala** (mediana robusta a outliers)
- **Maquillaje** (ROI precisa excluyendo labios/sombras)

## 📐 Definiciones Operativas

### 1. Subtono (warm/neutral/cool)
**No usamos "se ve cálida". Medimos en CIELAB:**

- **Conversión**: ROI de piel → LAB
- **Métricas**: 
  - `median(a*)`: Verde(-) ↔ Rojo(+)
  - `median(b*)`: Azul(-) ↔ Amarillo(+)

**Reglas prácticas:**
- **Cool**: `b*` bajo o negativo + `a*` moderado/bajo
- **Warm**: `b*` alto (amarillo) y `a*` moderado
- **Neutral**: Valores intermedios con varianza baja

### 2. Contraste (bajo/medio/alto)
**Diferencia de luminancia entre:**
- Piel (mejillas/mandíbula)
- Cabello (zona superior/temporal)

**Métrica**: `contraste = |L*_skin - L*_hair|`

**Categorías:**
- Bajo: < 30
- Medio: 30-60
- Alto: > 60

### 3. Chroma (suave/intenso)
**Intensidad de color en LAB:**

`C* = sqrt(a*^2 + b*^2)` sobre ROI de piel

**Uso**: Mediana y percentiles para evitar brillos

**Categorías:**
- Suave: < 15
- Medio: 15-25
- Intenso: > 25

## 🔧 Pipeline

```
1. Face detection + landmarks (MediaPipe Face Mesh) → 478 landmarks
2. Skin ROI (2 mejillas + mandíbula), excluir labios/ojos/sombras
3. Hair ROI (región superior del rostro)
4. Color constancy (normalización de iluminación)
5. Convertir a LAB
6. Features:
   - subtono: median(a*), median(b*)
   - chroma: median(C*), p75(C*)
   - contraste: |L*_skin - L*_hair|
   - estabilidad: varianza de L*
7. Clasificador simple: subtono → contraste/chroma → estación
```

## 📁 Arquitectura de Módulos

### `normalizador_color.py`
**NormalizadorColor**: Color constancy (Shades of Gray, Gray World, Retinex)

- **Shades of Gray** (recomendado): Usa norma Minkowski para estimar iluminación
- **Gray World**: Asume promedio gris global
- **Retinex**: Simula adaptación visual

**Función**: `detectar_imagen_no_confiable()`
- Detecta varianza alta de L*
- Highlights excesivos (> 5% píxeles > 240)
- Rostro parcial (< 400 landmarks)
- Luminosidad extrema

### `analizador_robusto.py`
**AnalizadorRobusto**: Extrae features medibles y estables

**Métodos principales:**
- `analizar()`: Pipeline completo de análisis
- `_extraer_roi_piel()`: ROI precisa excluyendo labios/sombras
- `_extraer_roi_cabello()`: Región superior del rostro
- `_convertir_a_lab()`: Conversión RGB → CIELAB
- `_calcular_features()`: Subtono, contraste, chroma

**Output:**
```python
{
    "confiable": bool,
    "features": {
        "subtono": "cool|warm|neutral",
        "contraste": "bajo|medio|alto",
        "chroma": "suave|medio|intenso",
        "median_a": float,  # a* en LAB
        "median_b": float,  # b* en LAB
        "median_l": float,  # L* en LAB
        "median_chroma": float,  # C* = sqrt(a*^2 + b*^2)
        "contraste_absoluto": float,
        ...
    }
}
```

### `clasificador_robusto.py`
**ClasificadorRobusto**: Mapea features → estación

**Reglas de mapeo (4 estaciones):**

| Estación | Subtono | Chroma | Contraste | Depth |
|----------|---------|--------|-----------|-------|
| Primavera | Warm | High/Medium | Low/Medium | Light/Medium |
| Otoño | Warm | Low/Medium | Medium/High | Medium/Dark |
| Invierno | Cool | High/Medium | High | Any |
| Verano | Cool | Low/Medium | Low/Medium | Any |

**Output:**
```python
{
    "estacion": "primavera|verano|otono|invierno",
    "confianza": float,  # 0.0 - 1.0
    "explicacion": str,
    "probabilidades": {
        "primavera": float,
        "verano": float,
        "otono": float,
        "invierno": float
    }
}
```

### `detector_rostro.py`
**DetectorRostro**: Detección de landmarks con MediaPipe Face Mesh

- 478 landmarks por rostro
- Bounding box automático
- Validación de detección

## 🚀 Uso Básico

```python
from analizadores import AnalizadorRobusto, ClasificadorRobusto, DetectorRostro
import cv2

# 1. Cargar imagen
imagen_bgr = cv2.imread("test.jpg")
imagen_rgb = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2RGB)

# 2. Detectar rostro
detector = DetectorRostro()
deteccion = detector.detectar(imagen_rgb)
landmarks = deteccion["landmarks"]

# 3. Analizar features
analizador = AnalizadorRobusto(usar_normalizacion=True)
resultado = analizador.analizar(imagen_rgb, landmarks=landmarks)

# 4. Clasificar
clasificador = ClasificadorRobusto(usar_ml=False)
clasificacion = clasificador.clasificar(resultado["features"])

print(f"Estación: {clasificacion['estacion']}")
print(f"Confianza: {clasificacion['confianza']*100:.1f}%")
```

## 🧪 Testing

Ejecutar script de prueba:
```bash
cd backend
python test_analizador_robusto.py <ruta_imagen>
```

## 📊 Próximos Pasos (Plan 7 días)

- ✅ **Día 1-2**: ROI de piel + LAB + features (COMPLETADO)
- ⏳ **Día 3**: Ajustar umbrales con 50 imágenes
- ⏳ **Día 4**: Clasificador ML (LogReg/GBDT) para subtono
- ⏳ **Día 5**: Validación en fotos "difíciles"
- ⏳ **Día 6**: Detección de "imagen no confiable" mejorada (YA IMPLEMENTADA)
- ⏳ **Día 7**: Integración en API + reporte explicable

## 🔍 Diferencias vs Sistema Anterior

| Aspecto | Sistema Anterior | Sistema Robusto |
|---------|------------------|-----------------|
| **Normalización** | ❌ No | ✅ Shades of Gray |
| **Subtono** | Heurístico impreciso | CIELAB median(a*, b*) |
| **ROI Piel** | Incluye labios/sombras | Excluye labios/sombras |
| **Features** | K-Means dominantes | Mediana robusta + LAB |
| **Clasificación** | ML sobrefitting (40.9%) | Reglas + ML híbrido |
| **Confiabilidad** | ❌ No | ✅ Detección de imagen mala |

## ⚠️ Notas Importantes

1. **Color Constancy es crítico**: Sin normalización, el "subtono" será solo un detector de bombillas
2. **Mediana > Promedio**: La mediana es robusta a outliers (highlights, sombras)
3. **ROI precisa**: Excluir labios/ojos/sombras evita confundir maquillaje con tono real
4. **Validación en fotos reales**: Probar con celular, interior, sombras antes de producción
