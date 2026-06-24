const AUTH_TOKEN_KEY = 'techstore_auth_token'
const AUTH_USER_KEY = 'techstore_user'
const REGISTERED_ACCOUNT_KEY = 'techstore_registered_account'

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

export function getAuthUser() {
  return readJson(AUTH_USER_KEY, null)
}

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  const storedUser = getAuthUser()
  const storedToken = String(window.localStorage.getItem(AUTH_TOKEN_KEY) ?? '').trim()

  return String(storedUser?.accessToken ?? storedUser?.refreshToken ?? storedToken ?? '').trim()
}

export function isRemoteAuthToken(token) {
  const normalizedToken = String(token ?? '').trim()

  if (!normalizedToken) {
    return false
  }

  return normalizedToken.includes('.') && !normalizedToken.startsWith('techstore_')
}

export function hasAuthSession() {
  const storedUser = getAuthUser()

  return Boolean(
    storedUser &&
      (storedUser.accessToken ||
        storedUser.refreshToken ||
        (typeof window !== 'undefined' && window.localStorage.getItem(AUTH_TOKEN_KEY))),
  )
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

  writeJson(AUTH_USER_KEY, normalizedUser)

  const authToken =
    normalizedUser.accessToken ||
    normalizedUser.refreshToken ||
    `techstore_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  writeJson(AUTH_TOKEN_KEY, authToken)
  emitAuthChange(normalizedUser)
}

export function clearAuthSession() {
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
