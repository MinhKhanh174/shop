function normalizeBaseUrl(value) {
  const normalized = String(value ?? '').trim()
  return normalized.replace(/\/+$/, '')
}

export const AUTH_API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_AUTH_API_BASE_URL) || '/api'
