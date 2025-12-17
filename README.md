# ColorMetría

Aplicación de análisis de colorimetría personal. Analiza una foto de tu rostro y te dice qué colores te favorecen según tu estación de color (Primavera, Verano, Otoño, Invierno).

## Stack

- **Backend**: Python 3.12, FastAPI, MediaPipe, OpenCV, SQLite
- **Frontend**: React 18, Vite, TailwindCSS

## Instalación

### Backend
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Uso

1. Abre http://localhost:5173
2. Sube una foto de tu rostro (buena iluminación, sin filtros)
3. El sistema analiza tus colores y te da recomendaciones

## Estructura

```
├── backend/
│   ├── analizadores/     # Detección facial y análisis de color
│   ├── recomendaciones/  # Generación de recomendaciones
│   ├── generador/        # Cambio virtual de cabello (SAM + SD)
│   └── database/         # SQLite con SQLAlchemy
└── frontend/
    └── src/components/   # Componentes React
```

## API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/analizar` | POST | Analiza imagen y retorna colorimetría |
| `/cabello/estilos` | GET | Lista estilos de cabello |
| `/outfits/recomendaciones` | GET | Outfits por estación |

## Notas

- La primera vez que uses el generador de cabello, descarga ~4GB de modelos
- Funciona mejor con fotos de frente, luz natural, sin maquillaje pesado
- Probado en macOS con Apple Silicon

## Autor

Proyecto para Módulo 2 - Gestión de las Tecnologías de la Información
