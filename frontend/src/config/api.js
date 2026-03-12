/**
 * URL base del backend. En local usa localhost:8000; en produccion VITE_API_URL.
 */
export const urlApi =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

/** Timeout para peticiones al backend (Render cold start puede tardar hasta 2 min). */
export const TIMEOUT_ANALIZAR_MS = 120000
