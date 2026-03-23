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
    libglvnd0 \
    && rm -rf /var/lib/apt/lists/* \
    && ldconfig \
    && set -eux; \
    for d in x86_64-linux-gnu aarch64-linux-gnu; do \
      if [ -f "/usr/lib/${d}/mesa/libGLESv2.so.2" ] && [ ! -e "/usr/lib/${d}/libGLESv2.so.2" ]; then \
        ln -sf "mesa/libGLESv2.so.2" "/usr/lib/${d}/libGLESv2.so.2"; \
      fi; \
    done

# Fallar el build si Mesa no instaló GLES (evita desplegar imágenes rotas)
RUN test -f /usr/lib/x86_64-linux-gnu/mesa/libGLESv2.so.2 \
    || (echo "ERROR: falta /usr/lib/x86_64-linux-gnu/mesa/libGLESv2.so.2" && exit 1)

# Refuerzo para dlopen(libGLESv2.so.2); env_grafico.py añade rutas si hace falta (p. ej. aarch64)
ENV LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/mesa:/usr/lib/x86_64-linux-gnu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Render inyecta $PORT
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
