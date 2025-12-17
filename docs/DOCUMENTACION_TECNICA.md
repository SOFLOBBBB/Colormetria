# 📚 Documentación Técnica - ColorMetría

## Índice
1. [Metodología de Desarrollo](#1-metodología-de-desarrollo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estándares, Normas y Algoritmos](#3-estándares-normas-y-algoritmos)
4. [Base de Datos](#4-base-de-datos)
5. [Lenguajes y Herramientas](#5-lenguajes-y-herramientas)
6. [Algoritmos Implementados](#6-algoritmos-implementados)

---

## 1. Metodología de Desarrollo

### 1.1 Metodología Seleccionada: SCRUM

Se utiliza la metodología ágil **SCRUM** para el desarrollo del proyecto, permitiendo iteraciones rápidas y entregas incrementales.

#### Roles del Equipo
- **Product Owner**: Define los requisitos y prioridades del producto
- **Scrum Master**: Facilita el proceso y elimina impedimentos
- **Development Team**: Desarrolla las funcionalidades

#### Sprints Planificados

| Sprint | Duración | Entregables |
|--------|----------|-------------|
| Sprint 1 | 2 semanas | Configuración del entorno, estructura del proyecto, detección facial básica |
| Sprint 2 | 2 semanas | Análisis de colores (piel, ojos, cabello), clasificador de estaciones |
| Sprint 3 | 2 semanas | API REST completa, sistema de recomendaciones |
| Sprint 4 | 2 semanas | Frontend React, integración cámara/upload |
| Sprint 5 | 2 semanas | Base de datos, historial, pruebas y documentación |

#### Artefactos SCRUM
- **Product Backlog**: Lista priorizada de funcionalidades
- **Sprint Backlog**: Tareas del sprint actual
- **Incremento**: Producto funcional al final de cada sprint

#### Ceremonias
- **Sprint Planning**: Planificación al inicio de cada sprint
- **Daily Standup**: Reuniones diarias de 15 minutos
- **Sprint Review**: Demostración del incremento
- **Sprint Retrospective**: Mejora continua del proceso

### 1.2 Modelo de Desarrollo: Iterativo-Incremental

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Análisis   │───▶│   Diseño    │───▶│ Desarrollo  │───▶│   Pruebas   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                                         │
       └─────────────────────────────────────────────────────────┘
                        (Iteración siguiente)
```

---

## 2. Arquitectura del Sistema

### 2.1 Patrón Arquitectónico: Cliente-Servidor (3 capas)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                      │
│                         (Frontend React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Captura  │  │ Análisis │  │ Paletas  │  │ Recomendaciones  │ │
│  │ Imagen   │  │ Colores  │  │ Colores  │  │ Ropa/Cabello     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE NEGOCIO                           │
│                        (Backend FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Detector    │  │  Analizador  │  │    Clasificador      │   │
│  │  Rostro      │  │  Colores     │  │    Estación          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Generador   │  │ Recomendador │  │   Recomendador       │   │
│  │  Paletas     │  │ Ropa         │  │   Cabello            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE DATOS                             │
│                     (SQLite + Archivos)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Usuarios   │  │  Análisis    │  │   Configuración      │   │
│  │   (SQLite)   │  │  Historial   │  │   Sistema            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Diagrama de Componentes

```
                    ┌─────────────────┐
                    │    Usuario      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   React App     │
                    │  (Puerto 5173)  │
                    └────────┬────────┘
                             │ API REST
                    ┌────────▼────────┐
                    │   FastAPI       │
                    │  (Puerto 8000)  │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  MediaPipe  │   │   OpenCV    │   │  Scikit-    │
    │ Face Mesh   │   │   Pillow    │   │  Learn      │
    └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 3. Estándares, Normas y Algoritmos

### 3.1 Estándares de Código

| Estándar | Descripción | Aplicación |
|----------|-------------|------------|
| **PEP 8** | Guía de estilo para Python | Backend |
| **PEP 257** | Convenciones de docstrings | Documentación de funciones |
| **ESLint** | Linting para JavaScript | Frontend React |
| **Airbnb Style Guide** | Guía de estilo JS/React | Componentes |

### 3.2 Normas Aplicadas

| Norma | Descripción |
|-------|-------------|
| **ISO/IEC 25010** | Modelo de calidad del software |
| **ISO/IEC 12207** | Procesos del ciclo de vida del software |
| **REST** | Arquitectura para APIs web |
| **OpenAPI 3.0** | Especificación de API (Swagger) |

### 3.3 Estándares de Color

| Estándar | Uso |
|----------|-----|
| **RGB** | Modelo de color para procesamiento |
| **HSV** | Análisis de tonalidad y saturación |
| **LAB (CIELAB)** | Análisis de subtono de piel |
| **Hexadecimal** | Representación para web |

### 3.4 Protocolos de Comunicación

| Protocolo | Uso |
|-----------|-----|
| **HTTP/HTTPS** | Comunicación cliente-servidor |
| **WebSocket** | Streaming de video (futuro) |
| **JSON** | Formato de intercambio de datos |

---

## 4. Base de Datos

### 4.1 Sistema de Gestión: SQLite

**Justificación de elección:**
- Base de datos relacional ligera
- No requiere servidor separado
- Ideal para aplicaciones de escritorio/local
- Fácil migración a PostgreSQL/MySQL si escala

### 4.2 Modelo Entidad-Relación

```
┌─────────────────┐       ┌─────────────────────┐
│    USUARIOS     │       │      ANALISIS       │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──────<│ id (PK)             │
│ nombre          │       │ usuario_id (FK)     │
│ email           │       │ fecha               │
│ genero          │       │ estacion            │
│ fecha_registro  │       │ subtono             │
└─────────────────┘       │ contraste           │
                          │ forma_rostro        │
                          │ color_piel_hex      │
                          │ color_ojos_hex      │
                          │ color_cabello_hex   │
                          │ imagen_path         │
                          │ confianza           │
                          └─────────────────────┘
                                    │
                                    │
                          ┌─────────▼───────────┐
                          │   RECOMENDACIONES   │
                          ├─────────────────────┤
                          │ id (PK)             │
                          │ analisis_id (FK)    │
                          │ tipo                │
                          │ contenido (JSON)    │
                          │ fecha               │
                          └─────────────────────┘
```

### 4.3 Diccionario de Datos

#### Tabla: USUARIOS
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | INTEGER | Identificador único | PRIMARY KEY, AUTOINCREMENT |
| nombre | VARCHAR(100) | Nombre del usuario | NOT NULL |
| email | VARCHAR(150) | Correo electrónico | UNIQUE |
| genero | VARCHAR(20) | Género (femenino/masculino) | NOT NULL |
| fecha_registro | DATETIME | Fecha de registro | DEFAULT CURRENT_TIMESTAMP |

#### Tabla: ANALISIS
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | INTEGER | Identificador único | PRIMARY KEY, AUTOINCREMENT |
| usuario_id | INTEGER | Referencia al usuario | FOREIGN KEY |
| fecha | DATETIME | Fecha del análisis | DEFAULT CURRENT_TIMESTAMP |
| estacion | VARCHAR(20) | Estación de color | NOT NULL |
| subtono | VARCHAR(20) | Subtono de piel | NOT NULL |
| contraste | VARCHAR(20) | Nivel de contraste | NOT NULL |
| forma_rostro | VARCHAR(20) | Forma del rostro | NOT NULL |
| color_piel_hex | VARCHAR(7) | Color de piel en hex | NOT NULL |
| color_ojos_hex | VARCHAR(7) | Color de ojos en hex | NOT NULL |
| color_cabello_hex | VARCHAR(7) | Color de cabello en hex | NOT NULL |
| imagen_path | VARCHAR(255) | Ruta de la imagen | NULL |
| confianza | FLOAT | Porcentaje de confianza | NOT NULL |

#### Tabla: RECOMENDACIONES
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | INTEGER | Identificador único | PRIMARY KEY, AUTOINCREMENT |
| analisis_id | INTEGER | Referencia al análisis | FOREIGN KEY |
| tipo | VARCHAR(50) | Tipo (paleta/ropa/cabello) | NOT NULL |
| contenido | TEXT | Contenido JSON | NOT NULL |
| fecha | DATETIME | Fecha de creación | DEFAULT CURRENT_TIMESTAMP |

---

## 5. Lenguajes y Herramientas

### 5.1 Lenguajes de Programación

| Lenguaje | Versión | Uso | Justificación |
|----------|---------|-----|---------------|
| **Python** | 3.10+ | Backend, ML, procesamiento de imágenes | Amplio ecosistema de ML/CV, sintaxis clara |
| **JavaScript** | ES2020+ | Frontend, interactividad | Estándar web, ecosistema React |
| **SQL** | SQLite | Consultas de base de datos | Estándar para BD relacionales |
| **CSS** | CSS3 + Tailwind | Estilos | Utility-first, productividad |

### 5.2 Frameworks y Librerías

#### Backend
| Herramienta | Versión | Función |
|-------------|---------|---------|
| **FastAPI** | 0.104.1 | Framework web asíncrono |
| **MediaPipe** | 0.10.8 | Detección facial (468 landmarks) |
| **OpenCV** | 4.8.1 | Procesamiento de imágenes |
| **Pillow** | 10.1.0 | Manipulación de imágenes |
| **NumPy** | 1.26.2 | Operaciones numéricas |
| **Scikit-learn** | 1.3.2 | Algoritmos de ML (K-means) |
| **SQLAlchemy** | 2.0+ | ORM para base de datos |

#### Frontend
| Herramienta | Versión | Función |
|-------------|---------|---------|
| **React** | 18.2.0 | Biblioteca UI |
| **Vite** | 5.0.0 | Build tool |
| **TailwindCSS** | 3.3.5 | Framework CSS |
| **Framer Motion** | 10.16.5 | Animaciones |
| **React Webcam** | 7.2.0 | Captura de cámara |
| **Axios** | 1.6.2 | Cliente HTTP |

### 5.3 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Git** | Control de versiones |
| **VS Code / Cursor** | IDE de desarrollo |
| **Postman** | Pruebas de API |
| **npm** | Gestor de paquetes JS |
| **pip** | Gestor de paquetes Python |

---

## 6. Algoritmos Implementados

### 6.1 Detección Facial - MediaPipe Face Mesh

**Descripción:** Algoritmo de deep learning para detectar 468 puntos faciales en tiempo real.

**Complejidad:** O(n) donde n es el número de píxeles de la imagen

**Funcionamiento:**
1. Detección inicial del rostro usando BlazeFace
2. Estimación de 468 landmarks usando modelo de regresión
3. Refinamiento de landmarks para iris (10 puntos adicionales)

```python
# Pseudocódigo
def detectar_rostro(imagen):
    # 1. Pre-procesamiento
    imagen_rgb = convertir_a_rgb(imagen)
    
    # 2. Detección con MediaPipe
    resultados = face_mesh.process(imagen_rgb)
    
    # 3. Extracción de landmarks
    landmarks = []
    for punto in resultados.landmarks:
        x = punto.x * ancho_imagen
        y = punto.y * alto_imagen
        landmarks.append((x, y))
    
    return landmarks
```

### 6.2 Análisis de Colores - K-Means Clustering

**Descripción:** Algoritmo de aprendizaje no supervisado para encontrar colores dominantes.

**Complejidad:** O(n * k * i) donde:
- n = número de píxeles
- k = número de clusters
- i = iteraciones

**Funcionamiento:**
1. Extraer píxeles de regiones de interés
2. Aplicar K-means para agrupar colores similares
3. Identificar el cluster más representativo

```python
# Pseudocódigo
def encontrar_color_dominante(pixeles, k=3):
    # 1. Inicializar centroides aleatorios
    centroides = inicializar_random(k)
    
    # 2. Iterar hasta convergencia
    while no_converge:
        # Asignar cada pixel al centroide más cercano
        clusters = asignar_clusters(pixeles, centroides)
        
        # Recalcular centroides
        centroides = calcular_medias(clusters)
    
    # 3. Retornar color del cluster más grande
    cluster_mayor = max(clusters, key=len)
    return media(cluster_mayor)
```

### 6.3 Clasificación de Estación - Sistema de Puntuación

**Descripción:** Algoritmo basado en reglas para clasificar la estación de color.

**Complejidad:** O(1) - tiempo constante

**Funcionamiento:**
1. Evaluar subtono (cálido/frío/neutro)
2. Evaluar nivel de contraste
3. Evaluar luminosidad de piel, ojos y cabello
4. Calcular puntaje para cada estación
5. Seleccionar estación con mayor puntaje

```python
# Pseudocódigo
def clasificar_estacion(colores):
    puntajes = {
        'primavera': calcular_puntaje_primavera(colores),
        'verano': calcular_puntaje_verano(colores),
        'otono': calcular_puntaje_otono(colores),
        'invierno': calcular_puntaje_invierno(colores)
    }
    
    estacion_ganadora = max(puntajes, key=puntajes.get)
    confianza = puntajes[estacion_ganadora] / sum(puntajes.values())
    
    return estacion_ganadora, confianza
```

### 6.4 Determinación de Subtono - Análisis LAB

**Descripción:** Uso del espacio de color CIELAB para determinar subtonos de piel.

**Fundamento científico:**
- Canal L*: Luminosidad (0-100)
- Canal a*: Verde (-) a Rojo (+)
- Canal b*: Azul (-) a Amarillo (+)

```python
# Pseudocódigo
def determinar_subtono(color_rgb):
    # Convertir a espacio LAB
    lab = rgb_to_lab(color_rgb)
    l, a, b = lab
    
    # Calcular índice de calidez
    # b positivo = más amarillo (cálido)
    # a positivo = más rojo/rosa (puede ser frío)
    indice_calidez = b - (a * 0.5)
    
    if indice_calidez > 8:
        return "cálido"
    elif indice_calidez < -5:
        return "frío"
    else:
        return "neutro"
```

### 6.5 Determinación de Forma de Rostro - Análisis de Proporciones

**Descripción:** Algoritmo geométrico basado en proporciones faciales.

**Mediciones:**
- Ancho de frente
- Ancho de pómulos
- Ancho de mandíbula
- Alto del rostro

```python
# Pseudocódigo
def determinar_forma_rostro(landmarks):
    # Calcular medidas
    ancho_frente = distancia(frente_izq, frente_der)
    ancho_pomulos = distancia(pomulo_izq, pomulo_der)
    ancho_mandibula = distancia(mandibula_izq, mandibula_der)
    alto_rostro = distancia(frente_centro, menton)
    
    # Calcular proporción
    proporcion = ancho_pomulos / alto_rostro
    
    # Clasificar
    if proporcion > 0.85:
        if ancho_mandibula / ancho_pomulos > 0.9:
            return "cuadrado"
        return "redondo"
    elif proporcion < 0.65:
        return "alargado"
    elif ancho_frente > ancho_mandibula * 1.2:
        return "corazon"
    elif ancho_pomulos > max(ancho_frente, ancho_mandibula) * 1.1:
        return "diamante"
    else:
        return "ovalado"
```

---

## 7. Métricas de Calidad

### 7.1 Métricas de Código
- **Cobertura de pruebas**: Objetivo > 80%
- **Complejidad ciclomática**: < 10 por función
- **Duplicación de código**: < 5%

### 7.2 Métricas de Rendimiento
- **Tiempo de análisis**: < 3 segundos
- **Tiempo de respuesta API**: < 500ms
- **Tamaño de bundle frontend**: < 500KB

---

*Documento generado para el proyecto ColorMetría - Sistema de Análisis de Colorimetría Personal*

