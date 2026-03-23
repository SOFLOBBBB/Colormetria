/**
 * Configuración centralizada del backend (API).
 *
 * - `VITE_API_URL` en Vercel/Netlify/CI define la URL en producción.
 * - En `vite dev` sin env: usa localhost.
 * - En `vite build` sin env: usa el dominio de producción por defecto.
 */

/** @param {string | undefined} url */
function normalizeBaseUrl(url) {
  if (url == null || url === '') return ''
  return String(url).replace(/\/+$/, '')
}

const DEFAULT_LOCAL = 'http://localhost:8000'
const DEFAULT_PRODUCTION = 'https://api.xn--colormetra-s8a.com'

const fromEnv = normalizeBaseUrl(import.meta.env.VITE_API_URL)

export const API_BASE_URL =
  fromEnv || (import.meta.env.DEV ? DEFAULT_LOCAL : DEFAULT_PRODUCTION)

/** Timeout para POST /analizar (cold start puede tardar hasta ~2 min). */
export const TIMEOUT_ANALIZAR_MS = 120000

/**
 * Construye URL absoluta para un path del backend (ej. `/analizar`).
 * @param {string} path - path con o sin barra inicial
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

/**
 * True si el backend no es localhost (mostrar avisos de latencia/cold start).
 */
export function isRemoteBackend() {
  const u = API_BASE_URL.toLowerCase()
  return !u.includes('localhost') && !u.includes('127.0.0.1')
}
