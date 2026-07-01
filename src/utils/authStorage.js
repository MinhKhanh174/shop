import { getJsonCookie, removeCookie, setJsonCookie } from '../storage/cookieStorage'

const AUTH_TOKEN_KEY = 'techstore_auth_token'
const AUTH_USER_KEY = 'techstore_user'
const AUTH_SESSION_COOKIE_KEY = 'techstore_auth_session'
const REGISTERED_ACCOUNT_KEY = 'techstore_registered_account'
const demoResetPasswordCache = {}

function readJson(key, fallback = null) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.error('authStorage read failed', error)
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('authStorage write failed', error)
  }
}

function removeKey(key) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error('authStorage remove failed', error)
  }
}

function readCookieAuthSession() {
  const cookieSession = getJsonCookie(AUTH_SESSION_COOKIE_KEY, null)

  if (!cookieSession || typeof cookieSession !== 'object') {
    return null
  }

  const user = cookieSession.user && typeof cookieSession.user === 'object' ? cookieSession.user : null
  const authToken = String(cookieSession.authToken ?? '').trim()

  if (!user || !authToken) {
    return null
  }

  return {
    user,
    authToken,
  }
}

function readAuthSession() {
  return readCookieAuthSession()
}

function emitAuthChange(user) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent('techstore:auth-changed', {
      detail: user ?? null,
    }),
  )
}

export function getRegisteredAccount() {
  return readJson(REGISTERED_ACCOUNT_KEY, null)
}

export function saveRegisteredAccount(account) {
  writeJson(REGISTERED_ACCOUNT_KEY, account)
}

export function getDemoResetPassword(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()

  if (!normalizedEmail) {
    return null
  }

  const entry = demoResetPasswordCache[normalizedEmail]

  if (!entry || typeof entry !== 'object') {
    return null
  }

  return {
    email: normalizedEmail,
    password: String(entry.password ?? ''),
    updatedAt: String(entry.updatedAt ?? ''),
  }
}

export function saveDemoResetPassword(email, password) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const normalizedPassword = String(password ?? '').trim()

  if (!normalizedEmail || !normalizedPassword) {
    return
  }

  demoResetPasswordCache[normalizedEmail] = {
    password: normalizedPassword,
    updatedAt: new Date().toISOString(),
  }
}

export function clearDemoResetPassword(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()

  if (!normalizedEmail) {
    return
  }

  if (!demoResetPasswordCache[normalizedEmail]) {
    return
  }

  delete demoResetPasswordCache[normalizedEmail]
}

export function getAuthUser() {
  return readAuthSession()?.user ?? null
}

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  const storedSession = readAuthSession()
  return String(storedSession?.authToken ?? '').trim()
}

export function isRemoteAuthToken(token) {
  const normalizedToken = String(token ?? '').trim()

  if (!normalizedToken) {
    return false
  }

  return normalizedToken.includes('.') && !normalizedToken.startsWith('techstore_')
}

export function hasAuthSession() {
  return Boolean(readAuthSession())
}

export function setAuthSession(user, tokens = {}) {
  const normalizedUser = {
    id: user?.id,
    username: String(user?.username ?? '').trim(),
    firstName: String(user?.firstName ?? '').trim(),
    lastName: String(user?.lastName ?? '').trim(),
    phone: String(user?.phone ?? '').trim(),
    email: String(user?.email ?? '').trim().toLowerCase(),
    avatar: String(user?.avatar ?? user?.image ?? '').trim(),
    company: user?.company ? { ...user.company } : null,
    address: user?.address ? { ...user.address } : null,
    accessToken: String(tokens?.accessToken ?? user?.accessToken ?? '').trim(),
    refreshToken: String(tokens?.refreshToken ?? user?.refreshToken ?? '').trim(),
  }

  const authToken =
    normalizedUser.accessToken ||
    normalizedUser.refreshToken ||
    `techstore_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  const sessionPayload = {
    user: normalizedUser,
    authToken,
    updatedAt: new Date().toISOString(),
  }

  setJsonCookie(AUTH_SESSION_COOKIE_KEY, sessionPayload, {
    maxAge: 60 * 60 * 24 * 7,
  })
  writeJson(AUTH_USER_KEY, normalizedUser)
  writeJson(AUTH_TOKEN_KEY, authToken)
  emitAuthChange(normalizedUser)
}

export function clearAuthSession() {
  removeCookie(AUTH_SESSION_COOKIE_KEY)
  removeKey(AUTH_USER_KEY)
  removeKey(AUTH_TOKEN_KEY)
  emitAuthChange(null)
}

export function buildDisplayName(user) {
  const firstName = String(user?.firstName ?? '').trim()
  const lastName = String(user?.lastName ?? '').trim()
  const fullName = `${lastName} ${firstName}`.trim()

  if (fullName) {
    return fullName
  }

  const email = String(user?.email ?? '').trim()
  return email || 'Khách hàng'
}
