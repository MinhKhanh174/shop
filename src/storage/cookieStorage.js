function isBrowser() {
  return typeof document !== 'undefined'
}

function getDefaultOptions() {
  return {
    path: '/',
    sameSite: 'Lax',
    secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
  }
}

function encodeCookieValue(value) {
  return encodeURIComponent(String(value ?? ''))
}

function decodeCookieValue(value) {
  try {
    return decodeURIComponent(String(value ?? ''))
  } catch {
    return String(value ?? '')
  }
}

export function getCookie(name, fallback = '') {
  if (!isBrowser()) {
    return fallback
  }

  const normalizedName = `${String(name ?? '').trim()}=`
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const matchedCookie = cookies.find((item) => item.startsWith(normalizedName))

  if (!matchedCookie) {
    return fallback
  }

  return decodeCookieValue(matchedCookie.slice(normalizedName.length))
}

export function setCookie(name, value, options = {}) {
  if (!isBrowser()) {
    return
  }

  const normalizedName = String(name ?? '').trim()
  if (!normalizedName) {
    return
  }

  const mergedOptions = {
    ...getDefaultOptions(),
    ...options,
  }

  const parts = [`${normalizedName}=${encodeCookieValue(value)}`]

  if (Number.isFinite(mergedOptions.maxAge)) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(mergedOptions.maxAge))}`)
  }

  if (mergedOptions.expires instanceof Date) {
    parts.push(`Expires=${mergedOptions.expires.toUTCString()}`)
  }

  parts.push(`Path=${mergedOptions.path}`)
  parts.push(`SameSite=${mergedOptions.sameSite}`)

  if (mergedOptions.secure) {
    parts.push('Secure')
  }

  document.cookie = parts.join('; ')
}

export function removeCookie(name, options = {}) {
  if (!isBrowser()) {
    return
  }

  setCookie(name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  })
}

export function getJsonCookie(name, fallback = null) {
  const rawValue = getCookie(name, '')
  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue)
  } catch (error) {
    console.error('cookieStorage read failed', error)
    return fallback
  }
}

export function setJsonCookie(name, value, options = {}) {
  try {
    setCookie(name, JSON.stringify(value), options)
  } catch (error) {
    console.error('cookieStorage write failed', error)
  }
}
