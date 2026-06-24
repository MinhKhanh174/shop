import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const USERS_BASE_URL = String(API_BASE_URL ?? '').trim() || 'https://dummyjson.com'

const usersClient = axios.create({
  baseURL: USERS_BASE_URL,
  timeout: 10000,
})

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function deriveUsernameFromEmail(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    return ''
  }

  return normalized.split('@')[0]
}

function mapRemoteUser(user) {
  if (!user || typeof user !== 'object') {
    return null
  }

  return {
    id: user.id,
    username: String(user.username ?? deriveUsernameFromEmail(user.email) ?? '').trim(),
    firstName: String(user.firstName ?? '').trim(),
    lastName: String(user.lastName ?? '').trim(),
    phone: String(user.phone ?? '').trim(),
    email: normalizeEmail(user.email),
    avatar: String(user.image ?? user.avatar ?? '').trim(),
    company: user.company ? { ...user.company } : null,
    address: user.address ? { ...user.address } : null,
    accessToken: String(user.accessToken ?? '').trim(),
    refreshToken: String(user.refreshToken ?? '').trim(),
    raw: user,
  }
}

async function request(path, config = {}) {
  const response = await usersClient.request({
    url: path,
    headers: {
      Accept: 'application/json',
      ...config.headers,
    },
    ...config,
  })

  return response.data
}

export async function searchUsers(query) {
  const trimmed = String(query ?? '').trim()
  if (!trimmed) {
    return []
  }

  const data = await request('/users/search', {
    method: 'GET',
    params: { q: trimmed },
  })

  return Array.isArray(data?.users) ? data.users.map(mapRemoteUser).filter(Boolean) : []
}

export async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return null
  }

  const matches = await searchUsers(normalizedEmail)
  const exactMatch = matches.find((user) => user.email === normalizedEmail)
  if (exactMatch) {
    return exactMatch
  }

  const username = deriveUsernameFromEmail(normalizedEmail)
  const usernameMatches = await searchUsers(username)
  return usernameMatches.find((user) => user.email === normalizedEmail || user.username === username) ?? null
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const normalizedPassword = String(password ?? '').trim()

  const matchedUser = await getUserByEmail(normalizedEmail)
  if (!matchedUser) {
    return null
  }

  const authResponse = await request('/auth/login', {
    method: 'POST',
    data: {
      username: matchedUser.username || deriveUsernameFromEmail(normalizedEmail),
      password: normalizedPassword,
      expiresInMins: 60,
    },
  })

  return mapRemoteUser({
    ...matchedUser.raw,
    ...authResponse,
    email: matchedUser.email,
    firstName: authResponse?.firstName ?? matchedUser.firstName,
    lastName: authResponse?.lastName ?? matchedUser.lastName,
    username: authResponse?.username ?? matchedUser.username,
    phone: authResponse?.phone ?? matchedUser.phone,
    image: authResponse?.image ?? matchedUser.avatar,
  })
}

export async function addUser(user) {
  const payload = {
    firstName: String(user?.firstName ?? '').trim(),
    lastName: String(user?.lastName ?? '').trim(),
    phone: String(user?.phone ?? '').trim(),
    email: normalizeEmail(user?.email),
    username: String(user?.username ?? deriveUsernameFromEmail(user?.email)).trim(),
    password: String(user?.password ?? '').trim(),
    image: String(user?.avatar ?? user?.image ?? '').trim() || undefined,
  }

  const data = await request('/users/add', {
    method: 'POST',
    data: payload,
  })

  return mapRemoteUser(data)
}

export async function getCurrentUser(accessToken) {
  const token = String(accessToken ?? '').trim()
  if (!token) {
    return null
  }

  const data = await request('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  })

  return mapRemoteUser(data)
}
