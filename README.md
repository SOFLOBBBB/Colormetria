# ColorMetría - Análisis de colorimetría personal

Sistema de análisis de colorimetría que analiza rostro, tono de piel, color de cabello y ojos para ofrecer recomendaciones personalizadas de colores y estilos.

## Características

- Análisis facial: detección de rostro y análisis de características
- Colorimetría: identificación de estación de color (Primavera, Verano, Otoño, Invierno)
- Recomendaciones de ropa según tipo de cuerpo
- Estilos de cabello según forma de rostro
- Paleta de colores que favorecen al usuario

## Tecnologías

### Backend
- Python 3.10+
- FastAPI
- OpenCV
- MediaPipe
- NumPy
- Pillow

### Frontend
- React 18
- Vite
- TailwindCSS
- Framer Motion
- React Webcam

## Instalación

### Requisitos
- Python 3.10 o superior
- Node.js 18 o superior
- npm o yarn

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
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

1. Abre la aplicación en http://localhost:5173
2. Permite el acceso a la cámara o sube una foto
3. La aplicación analiza el rostro automáticamente
4. Recibe recomendaciones de colores y estilos

## Estaciones de color

- **Primavera**: tonos cálidos con subtono dorado. Colores vivos y frescos.
- **Verano**: tonos fríos con subtono rosado. Colores suaves y apagados.
- **Otoño**: tonos cálidos con subtono dorado. Colores terrosos y ricos.
- **Invierno**: tonos fríos con subtono azulado. Colores intensos y contrastantes.

## Licencia

MIT License.
