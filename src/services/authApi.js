import axios from 'axios'
import { AUTH_API_BASE_URL } from '../config/authApi'

const authClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 10000,
})

function normalizeRole(value) {
  return String(value ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer'
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeAuthUser(user) {
  if (!user || typeof user !== 'object') {
    return null
  }

  return {
    id: user.id,
    name: String(user.name ?? '').trim(),
    username: String(user.username ?? '').trim(),
    firstName: String(user.firstName ?? '').trim(),
    lastName: String(user.lastName ?? '').trim(),
    phone: String(user.phone ?? '').trim(),
    email: normalizeEmail(user.email),
    avatar: String(user.avatar ?? user.image ?? '').trim(),
    role: normalizeRole(user.role),
    company: user.company ? { ...user.company } : null,
    address: user.address ? { ...user.address } : null,
    accessToken: String(user.accessToken ?? '').trim(),
    refreshToken: String(user.refreshToken ?? '').trim(),
    raw: user,
  }
}

function normalizeLoginResponse(data) {
  if (!data || typeof data !== 'object') {
    return null
  }

  const user = normalizeAuthUser(data.user ?? data.data?.user ?? null)
  const accessToken = String(data.accessToken ?? data.access_token ?? data.token ?? '').trim()
  const refreshToken = String(data.refreshToken ?? data.refresh_token ?? '').trim()
  const cart = Array.isArray(data.cart) ? data.cart : []
  const wishlist = Array.isArray(data.wishlist) ? data.wishlist : []

  if (!user && !accessToken) {
    return null
  }

  return {
    ok: data.ok,
    message: String(data.message ?? '').trim(),
    tokenType: String(data.token_type ?? data.tokenType ?? '').trim(),
    accessToken,
    refreshToken,
    user,
    cart,
    wishlist,
    raw: data,
  }
}

function getErrorMessage(error, fallback = 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.') {
  const responseData = error?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    const trimmed = responseData.trim()
    const lower = trimmed.toLowerCase()

    if (!trimmed.startsWith('<') && !lower.includes('cannot post') && !lower.includes('not found')) {
      return trimmed
    }
  }

  if (responseData && typeof responseData === 'object') {
    const message = responseData.message || responseData.error || responseData.detail
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }

    if (Array.isArray(responseData.errors)) {
      const firstError = responseData.errors.find((item) => typeof item === 'string' && item.trim())
      if (firstError) {
        return firstError.trim()
      }
    }

    if (responseData.errors && typeof responseData.errors === 'object') {
      for (const value of Object.values(responseData.errors)) {
        if (Array.isArray(value)) {
          const firstError = value.find((item) => typeof item === 'string' && item.trim())
          if (firstError) {
            return firstError.trim()
          }
        }

        if (typeof value === 'string' && value.trim()) {
          return value.trim()
        }
      }
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    const message = error.message.trim()
    const lower = message.toLowerCase()
    if (!message.startsWith('<') && !lower.includes('cannot post') && !lower.includes('not found')) {
      return message
    }
  }

  return fallback
}

async function request(path, config = {}) {
  try {
    const response = await authClient.request({
      url: path,
      method: config.method ?? 'POST',
      headers: {
        Accept: 'application/json',
        ...config.headers,
      },
      ...config,
    })

    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}

export async function requestPasswordReset(email) {
  return forgotPassword(email)
}

export async function registerDemoAccount(account) {
  return request('/auth/register', {
    method: 'POST',
    data: {
      email: normalizeEmail(account?.email),
      password: String(account?.password ?? ''),
      firstName: String(account?.firstName ?? ''),
      lastName: String(account?.lastName ?? ''),
      phone: String(account?.phone ?? ''),
      username: String(account?.username ?? ''),
      name: String(account?.name ?? ''),
    },
  })
}

export async function login(email, password) {
  const response = await request('/auth/login', {
    method: 'POST',
    data: {
      email: normalizeEmail(email),
      password: String(password ?? ''),
    },
  })

  const normalized = normalizeLoginResponse(response)
  if (!normalized) {
    return {
      ok: true,
      message: 'Đăng nhập thành công.',
      tokenType: '',
      accessToken: '',
      refreshToken: '',
      user: null,
      raw: response,
    }
  }

  return normalized
}

export async function forgotPassword(email) {
  const normalizedEmail = normalizeEmail(email)

  return request('/auth/forgot-password', {
    method: 'POST',
    data: {
      email: normalizedEmail,
    },
  })
}

export async function resetPassword({ token, email, password, passwordConfirmation }) {
  return request('/auth/reset-password', {
    method: 'POST',
    data: {
      token: String(token ?? '').trim(),
      email: normalizeEmail(email),
      password: String(password ?? ''),
      password_confirmation: String(passwordConfirmation ?? ''),
    },
  })
}

export async function changePassword({ email, currentPassword, newPassword, confirmPassword }) {
  return request('/auth/change-password', {
    method: 'POST',
    data: {
      email: normalizeEmail(email),
      currentPassword: String(currentPassword ?? ''),
      newPassword: String(newPassword ?? ''),
      confirmPassword: String(confirmPassword ?? ''),
    },
  })
}
