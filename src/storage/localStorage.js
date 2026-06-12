export function getItem(key, fallback = null) {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch (error) {
    console.error('localStorage read failed', error)
    return fallback
  }
}

export function setItem(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('localStorage save failed', error)
  }
}

export function removeItem(key) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error('localStorage remove failed', error)
  }
}
