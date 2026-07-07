import { mockUsers } from '../data/mockUsers'
import { fetchDummyJsonUsers, searchDummyJsonUsers } from './dummyJsonAdminApi'

const FALLBACK_CREATED_AT_BASE = Date.parse('2026-06-01T08:00:00.000Z')

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}
function normalizeRole(value) {
  return String(value ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer'
}

function buildDisplayName(user) {
  const fullName = [user?.firstName, user?.lastName].map((item) => normalizeText(item)).filter(Boolean).join(' ')
  return fullName || normalizeText(user?.name, 'Người dùng')
}

function buildCreatedAtFromIndex(index) {
  return new Date(FALLBACK_CREATED_AT_BASE - index * 86400000).toISOString()
}

function getFallbackStatus(user, index) {
  if (normalizeRole(user?.role) === 'admin') {
    return 'active'
  }

  return index % 4 === 0 ? 'inactive' : 'active'
}

function mapRemoteUser(user, index = 0) {
  if (!user || typeof user !== 'object') {
    return null
  }

  const email = normalizeText(user.email).toLowerCase()
  const phone = normalizeText(user.phone)
  const role = normalizeRole(user.role)

  return {
    id: normalizeText(user.id),
    name: buildDisplayName(user),
    email,
    phone,
    role,
    status: getFallbackStatus(user, index),
    createdAt: normalizeText(user.createdAt, buildCreatedAtFromIndex(index)),
    avatar: normalizeText(user.image ?? user.avatar),
    raw: user,
  }
}

function cloneFallbackUsers() {
  return mockUsers.map((user, index) => ({ ...mapRemoteUser(user, index), raw: user }))
}

async function loadRemoteUsers(query = '') {
  const trimmedQuery = normalizeText(query)

  if (trimmedQuery) {
    const data = await searchDummyJsonUsers(trimmedQuery)
    return Array.isArray(data?.users) ? data.users : []
  }

  const data = await fetchDummyJsonUsers({ limit: 100 })
  return Array.isArray(data?.users) ? data.users : []
}

export async function getUsers({ search = '' } = {}) {
  try {
    const remoteUsers = await loadRemoteUsers(search)
    const mappedUsers = remoteUsers.map((user, index) => mapRemoteUser(user, index)).filter(Boolean)

    if (!mappedUsers.length) {
      return cloneFallbackUsers()
    }

    return mappedUsers
  } catch (error) {
    console.warn('getUsers fallback to mock data', error)
    return cloneFallbackUsers()
  }
}

export async function getUserById(id) {
  const userId = normalizeText(id)

  if (!userId) {
    return null
  }

  try {
    const users = await getUsers()
    return users.find((user) => String(user.id) === userId) ?? null
  } catch (error) {
    console.warn('getUserById fallback to mock data', error)
    return cloneFallbackUsers().find((user) => String(user.id) === userId) ?? null
  }
}
