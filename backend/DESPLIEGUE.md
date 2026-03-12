# Despliegue del backend en Render

## Causa del fallo "No open ports" / "Exited with status 1"

El servidor no llegaba a abrir el puerto a tiempo porque en el arranque del modulo `main.py` se ejecutaba:

- Import de `analizadores` (OpenCV, MediaPipe, sklearn, joblib).
- Instanciacion de `DetectorRostro()` y `AnalizadorRobusto()`, cada uno creando un modelo MediaPipe Face Mesh.
- Instanciacion de `ClasificadorRobusto()` y `AnalizadorColores()`.

Esa carga bloqueaba el hilo principal varios segundos (o mas si hay cache de fuentes de matplotlib en la cadena de dependencias). Render espera que el proceso abra el puerto en un tiempo limitado; si no lo hace, mata el proceso.

## Solucion aplicada: arranque liviano y carga diferida

- **Arranque**: `main.py` ya no importa ni instancia analizadores al cargar. Solo se cargan FastAPI, CORS, base de datos y rutas. El endpoint `/health` responde de inmediato y uvicorn puede abrir el puerto en cuanto inicia.
- **Carga diferida**: La primera vez que se llama a `POST /analizar`, se importan e instancian los analizadores y se cachean. Las siguientes peticiones reutilizan la misma instancia.
- **Degradacion**: Si la carga diferida falla (memoria, dependencia rota, etc.), ese error se guarda y las siguientes llamadas a `/analizar` reciben 503 con mensaje claro; el servidor y `/health` siguen operativos.

No se ha cambiado la logica de colorimetria ni los modulos de analizadores; solo cuando y donde se cargan.

## Variables de entorno en Render (opcional)

Si en los logs sigue apareciendo "Matplotlib is building the font cache", puede ser por una dependencia transitiva (p. ej. sklearn/scipy). Puedes reducir impacto anadiendo en Render:

- `MPLBACKEND=Agg` (backend no interactivo; evita ventanas y puede acelerar el primer uso de matplotlib si algo lo importa).

## Verificacion

- `GET /health` debe responder de inmediato con `{"status": "ok"}`.
- La primera peticion a `POST /analizar` puede tardar mas (carga de modelos); las siguientes deben ser normales.
