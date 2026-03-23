# ColorMetría API — OpenCV + MediaPipe (TensorFlow Lite carga libGLESv2 en Linux)
FROM python:3.11-slim-bookworm

WORKDIR /app

# Mesa / GL / EGL / GLES (libGLESv2.so.2) + dependencias X mínimas para OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libgl1-mesa-dri \
    libgl1-mesa-glx \
    libegl1-mesa \
    libgles2-mesa \
    libgbm1 \
    libdrm2 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Render inyecta $PORT
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
