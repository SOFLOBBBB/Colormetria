# Despliegue de ColorMetría (gratuito)

Opciones para montar backend (FastAPI) y frontend (React/Vite) en servidores gratuitos.

---

## Resumen de opciones gratuitas

| Servicio      | Backend (FastAPI) | Frontend (React) | Límites free |
|---------------|-------------------|------------------|--------------|
| **Render**    | Sí (Web Service)  | Sí (Static Site) | Backend: 750 h/mes, se apaga a 15 min sin uso. Frontend ilimitado. |
| **Railway**   | Sí                | Sí (static)      | ~5 USD crédito/mes; luego de pago. |
| **Vercel**    | No (límite 50MB)  | Sí               | Frontend ideal; backend demasiado pesado (OpenCV/MediaPipe). |
| **Netlify**   | No                | Sí               | Frontend ideal. |
| **Fly.io**    | Sí                | Opcional         | 3 VMs free; 256MB puede quedarse corto para MediaPipe. |

**Recomendación:** Backend en **Render** (Docker) + Frontend en **Vercel** o **Netlify**. Todo gratis dentro de los límites.

---

## Parte 1: Backend en Render

### Requisitos previos
- Cuenta en [render.com](https://render.com) (con GitHub).
- Repositorio del proyecto en GitHub.

### Pasos

1. **Conectar el repo**
   - En Render: Dashboard → New → Web Service.
   - Conecta tu cuenta de GitHub y elige el repositorio (ej. `Colormetria`).

2. **Configurar el servicio**
   - **Name:** `colormetria-api` (o el que quieras).
   - **Region:** Oregon (US West) o el más cercano.
   - **Branch:** `main` o la rama que uses.
   - **Root Directory:** `backend`.
   - **Runtime:** Docker.
   - **Instance Type:** Free.

3. **Build**
   - Render detectará el `Dockerfile` dentro de `backend/`.
   - Si no lo encuentra, en Root Directory deja `backend` y asegúrate de que existe `backend/Dockerfile`.

4. **Variables de entorno (opcional)**
   - En la pestaña Environment no es obligatorio añadir nada para que funcione.
   - Si en el futuro usas otra base de datos: `DATABASE_URL`, etc.

5. **Deploy**
   - Create Web Service. La primera vez tarda varios minutos (build de OpenCV/MediaPipe).
   - Al terminar tendrás una URL en Render; el API público puede apuntarse a un dominio propio (p. ej. `https://api.xn--colormetra-s8a.com`).

6. **Importante (plan free)**
   - Tras ~15 minutos sin peticiones, el servicio se duerme.
   - La primera petición después de eso puede tardar 30–60 s (cold start).
   - La base SQLite se guarda en el contenedor; si el servicio se reinicia, se pierde (para producción estable luego se puede usar PostgreSQL en Render).

---

## Parte 2: Frontend en Vercel

### Requisitos
- Cuenta en [vercel.com](https://vercel.com) (con GitHub).
- Repo en GitHub.

### Pasos

1. **Importar proyecto**
   - Vercel → Add New → Project → importa el repo de GitHub.
   - **Framework Preset:** Vite.
   - **Root Directory:** `frontend`.

2. **Variables de entorno**
   - En Settings → Environment Variables añade:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.xn--colormetra-s8a.com` (URL pública del backend; ajusta si usas otra).
   - Aplica a Production, Preview y Development.

3. **Build**
   - Build Command: `npm run build` (por defecto en Vite).
   - Output Directory: `dist`.
   - Deploy. Vercel te dará una URL tipo `https://colormetria.vercel.app`.

4. **CORS**
   - El backend ya tiene `allow_origins=["*"]`. En producción puedes restringir a tu dominio de Vercel si quieres (cambiar en `main.py` o con variable de entorno).

---

## Alternativa: Frontend en Netlify

1. Netlify → Add new site → Import from Git → elige el repo.
2. **Base directory:** `frontend`.
3. **Build command:** `npm run build`.
4. **Publish directory:** `frontend/dist`.
5. **Variables de entorno:** en Site settings → Environment variables:
   - `VITE_API_URL` = `https://api.xn--colormetra-s8a.com`
6. Deploy.

---

## Preparación del proyecto (ya incluida)

- **Backend:** existe `backend/Dockerfile` para Render (o cualquier host que use Docker).
- **Frontend:** la base del API está en `frontend/src/config/api.js` (`API_BASE_URL`): en `vite dev` sin variable usa `http://localhost:8000`; en build de producción sin `VITE_API_URL` usa el dominio API por defecto. En Vercel/Netlify define `VITE_API_URL` para el backend desplegado.

---

## Checklist antes de desplegar

- [ ] Backend en GitHub con `backend/Dockerfile` y `backend/requirements.txt`.
- [ ] Frontend en GitHub; en producción configurar `VITE_API_URL` en Vercel/Netlify.
- [ ] Probar backend local: `cd backend && docker build -t colormetria-api . && docker run -p 8000:8000 colormetria-api`.
- [ ] Probar frontend contra backend desplegado: `VITE_API_URL=https://api.xn--colormetra-s8a.com npm run build && npm run preview`.

---

## Si el backend no entra en Render (límite de memoria)

- **Railway:** mismo Dockerfile; despliegue desde GitHub. Tienes crédito gratis limitado.
- **Fly.io:** crear `Dockerfile` (el mismo) y usar `fly launch` + `fly deploy`; en `fly.toml` puedes subir memoria si pasas a plan de pago.
- **Reducir peso:** no instalar DeepFace en producción; en `requirements.txt` dejar comentado `deepface`.
