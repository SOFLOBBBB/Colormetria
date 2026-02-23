# ¿Merece la pena usar DeepFace en ColorMetría?

## Qué hace el proyecto hoy

- **Detección**: MediaPipe Face Mesh → 478 landmarks + bounding box.
- **Análisis**: ROIs de piel y cabello desde esos landmarks → LAB → subtono, contraste, chroma.
- **Clasificación**: Reglas → estación (primavera/verano/otoño/invierno).
- **Datos de usuario**: `genero` lo envía el cliente (formulario). `forma_rostro` está fijo en "ovalada".

## Qué aporta DeepFace

| Capacidad        | DeepFace | Uso en ColorMetría |
|------------------|----------|--------------------|
| Detección de rostro | Sí (varios backends) | Redundante: MediaPipe ya detecta y da 478 puntos. |
| Landmarks        | No (solo bbox o 5 puntos) | **No sustituye** a MediaPipe para ROIs. |
| **Género**       | Sí (inferido) | Útil: no depender del campo del formulario. |
| **Edad**         | Sí (estimada) | Opcional: recomendaciones por rango de edad. |
| **Emoción**      | Sí | Marginal: mensajes o tono, no afecta a la estación. |
| Raza             | Sí | No necesario para colorimetría. |

## Conclusión

- **Para el núcleo (estación colorimétrica): no hace falta DeepFace.** MediaPipe es suficiente y ya está integrado.
- **Sí puede merecer la pena** si quieres:
  1. **Género inferido**: rellenar o validar `genero` desde la foto y mejorar UX.
  2. **Edad aproximada**: filtrar recomendaciones (ej. estilos por década).
  3. **Emoción**: solo si en el futuro quieres personalizar mensajes o flujo.

## Coste de añadirlo

- **Dependencias**: DeepFace usa TensorFlow/Keras (~500 MB+, más RAM y tiempo de arranque).
- **Recomendación**: dejarlo **opcional**. Si `deepface` no está instalado, el flujo actual sigue igual; si está instalado, se enriquecen las respuestas con atributos faciales.

## Implementación realizada

- **`analizadores/atributos_faciales.py`**: import opcional de `deepface`. Si está instalado, `analizar_atributos(imagen_rgb)` devuelve `{ edad_aprox, genero, emocion }`; si no, devuelve `None`.
- **`main.py`**: tras detectar rostro se llama a `analizar_atributos_faciales(imagen_np)`. Si hay resultado, la respuesta incluye `atributos_faciales` con edad, género y emoción. El parámetro `genero` del API sigue siendo el que se guarda en BD (decisión del usuario).
- **`requirements.txt`**: `deepface` está comentado como opcional. Para activar: `pip install deepface`.

Así se puede probar con `pip install deepface` y en producción desplegar sin DeepFace si no se quiere el coste extra.
