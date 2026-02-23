# 🎨 ColorMetría - Análisis de Colorimetría Personal

Sistema inteligente de análisis de colorimetría que analiza tu rostro, tono de piel, color de cabello y ojos para brindarte recomendaciones personalizadas de colores y estilos de ropa.

## ✨ Características

- 📸 **Análisis Facial**: Detecta automáticamente tu rostro y analiza sus características
- 🎨 **Colorimetría Personal**: Identifica tu estación de color (Primavera, Verano, Otoño, Invierno)
- 👗 **Recomendaciones de Ropa**: Sugiere tipos de prendas según tu tipo de cuerpo
- 💇 **Estilos de Cabello**: Recomendaciones personalizadas según tu forma de rostro
- 🌈 **Paleta de Colores**: Visualiza los colores que mejor te favorecen

## 🛠️ Tecnologías

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

## 🚀 Instalación

### Requisitos Previos
- Python 3.10 o superior
- Node.js 18 o superior
- npm o yarn

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📖 Uso

1. Abre la aplicación en tu navegador (http://localhost:5173)
2. Permite el acceso a la cámara o sube una foto
3. La aplicación analizará tu rostro automáticamente
4. Recibe tus recomendaciones personalizadas de colores y estilos

## 🎯 Estaciones de Color

### Primavera (Cálido y Brillante)
Tonos cálidos con subtono dorado. Colores vivos y frescos.

### Verano (Frío y Suave)
Tonos fríos con subtono rosado. Colores suaves y apagados.

### Otoño (Cálido y Profundo)
Tonos cálidos con subtono dorado. Colores terrosos y ricos.

### Invierno (Frío y Brillante)
Tonos fríos con subtono azulado. Colores intensos y contrastantes.

## 👨‍💻 Desarrollo

Este proyecto fue creado con amor para ayudar a las personas a descubrir los colores que mejor les favorecen según su colorimetría personal.

## 📄 Licencia

MIT License - Siéntete libre de usar y modificar este proyecto.

