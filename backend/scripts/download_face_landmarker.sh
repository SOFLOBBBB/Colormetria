#!/usr/bin/env bash
# Descarga el modelo Face Landmarker para evitar fallo en el primer arranque (Render, etc.).
# Uso: bash backend/scripts/download_face_landmarker.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT}/modelos/face_landmarker.task"
mkdir -p "${ROOT}/modelos"
URL="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
if [[ -f "$DEST" ]] && [[ $(stat -f%z "$DEST" 2>/dev/null || stat -c%s "$DEST" 2>/dev/null) -gt 10000 ]]; then
  echo "Modelo ya presente: $DEST"
  exit 0
fi
echo "Descargando face_landmarker.task..."
curl -fsSL "$URL" -o "$DEST.part"
mv "$DEST.part" "$DEST"
echo "Listo: $DEST"
