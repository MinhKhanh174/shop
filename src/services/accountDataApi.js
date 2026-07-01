import axios from 'axios'
import { AUTH_API_BASE_URL } from '../config/authApi'

const accountDataClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 10000,
})

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

async function request(path, config = {}) {
  const response = await accountDataClient.request({
    url: path,
    headers: {
      Accept: 'application/json',
      ...config.headers,
    },
    ...config,
  })

  return response.data
}

export async function fetchSharedCart(email) {
  const data = await request('/account/cart', {
    method: 'GET',
    params: {
      email: normalizeEmail(email),
    },
  })

  return Array.isArray(data?.items) ? data.items : []
}

export async function saveSharedCart(email, items) {
  const data = await request('/account/cart', {
    method: 'POST',
    data: {
      email: normalizeEmail(email),
      items: Array.isArray(items) ? items : [],
    },
  })

  return Array.isArray(data?.items) ? data.items : []
}

export async function fetchSharedWishlist(email) {
  const data = await request('/account/wishlist', {
    method: 'GET',
    params: {
      email: normalizeEmail(email),
    },
  })

  return Array.isArray(data?.items) ? data.items : []
}

export async function saveSharedWishlist(email, items) {
  const data = await request('/account/wishlist', {
    method: 'POST',
    data: {
      email: normalizeEmail(email),
      items: Array.isArray(items) ? items : [],
    },
  })

  return Array.isArray(data?.items) ? data.items : []
}

export async function fetchSharedAddresses(email) {
  const data = await request('/account/addresses', {
    method: 'GET',
    params: {
      email: normalizeEmail(email),
    },
  })

  return Array.isArray(data?.items) ? data.items : []
}

export async function saveSharedAddresses(email, items) {
  const data = await request('/account/addresses', {
    method: 'POST',
    data: {
      email: normalizeEmail(email),
      items: Array.isArray(items) ? items : [],
    },
  })

  return Array.isArray(data?.items) ? data.items : []
}
