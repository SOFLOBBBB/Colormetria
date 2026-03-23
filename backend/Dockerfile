# ColorMetría API - imagen con OpenCV y MediaPipe
FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema para OpenCV / MediaPipe (incl. GLESv2 para TFLite / libGLESv2.so.2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgles2-mesa \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
