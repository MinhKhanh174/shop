function normalizeFlag(value) {
  return String(value ?? '').trim().toLowerCase()
}

// Demo credentials are for local/demo only. Do not enable in production.
export const DEMO_AUTH_ENABLED = (() => {
  const rawValue = normalizeFlag(import.meta.env.VITE_DEMO_AUTH_ENABLED)

  if (rawValue === 'true') {
    return true
  }

  if (rawValue === 'false') {
    return false
  }

  return true
})()
