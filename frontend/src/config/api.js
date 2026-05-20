/**
 * URL base del backend (único punto de verdad para fetch al API).
 *
 * Resolución (Vite):
 * 1) `import.meta.env.VITE_API_URL` si está definida (p. ej. .env.production, Vercel, Netlify).
 * 2) Si no hay variable: en desarrollo (`vite`) → localhost; en build de producción → dominio API.
 *
 * No usar dominios Render antiguos; producción: https://api.xn--colormetra-s8a.com
 */

/** @param {string | undefined} url */
function normalizeBaseUrl(url) {
  if (url == null || url === '') return ''
  return String(url).replace(/\/+$/, '')
}

/** API pública en producción (fallback si no hay VITE_API_URL en el build). */
export const PRODUCTION_API_BASE_URL = 'https://api.xn--colormetra-s8a.com'

const DEFAULT_LOCAL = 'http://localhost:8000'

const fromEnv = normalizeBaseUrl(import.meta.env.VITE_API_URL)

export const API_BASE_URL =
  fromEnv || (import.meta.env.DEV ? DEFAULT_LOCAL : PRODUCTION_API_BASE_URL)

/** Timeout para POST /analizar (cold start puede tardar hasta ~2 min). */
export const TIMEOUT_ANALIZAR_MS = 120000

/**
 * URL absoluta del backend para un path (p. ej. apiUrl('/analizar')).
 * @param {string} path - con o sin barra inicial
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

/**
 * True si el backend no es localhost (avisos de latencia / cold start).
 */
export function isRemoteBackend() {
  const u = API_BASE_URL.toLowerCase()
  return !u.includes('localhost') && !u.includes('127.0.0.1')
}

/**
 * Pre-warm del backend para reducir cold start de Render free tier.
 * No bloquea: dispara un GET /health y descarta el resultado.
 * Devuelve una promesa que siempre resuelve (no propaga errores de red).
 */
export function warmupBackend() {
  try {
    return fetch(apiUrl('/health'), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      keepalive: true,
    }).then(
      () => true,
      () => false,
    )
  } catch {
    return Promise.resolve(false)
  }
}
