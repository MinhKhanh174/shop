export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())
}

export function isNonEmpty(value) {
  return String(value ?? '').trim().length > 0
}

export function requiredMessage(label) {
  return `Vui lòng nhập ${label}.`
}
