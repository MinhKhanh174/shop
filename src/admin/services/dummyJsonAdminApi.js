import { API_BASE_URL } from '../../config/api'

const DEFAULT_BASE_URL = 'https://dummyjson.com'
const DEFAULT_TIMEOUT_MS = 10000

function isDevMode() {
  return Boolean(import.meta.env.DEV)
}

function getBaseUrl() {
  return String(API_BASE_URL ?? '').trim() || String(import.meta.env.VITE_DUMMYJSON_API_BASE_URL ?? '').trim() || DEFAULT_BASE_URL
}

function appendQueryParams(url, params = {}) {
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && String(item).trim() !== '') {
          url.searchParams.append(key, String(item))
        }
      })
      return
    }

    url.searchParams.set(key, String(value))
  })
}

async function requestJson(path, { method = 'GET', params, body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const url = new URL(path, getBaseUrl())

  if (params) {
    appendQueryParams(url, params)
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      const responseText = await response.text().catch(() => '')
      const error = new Error(`DummyJSON request failed with status ${response.status}`)
      error.kind = 'status'
      error.status = response.status
      error.url = url.toString()
      error.responseText = responseText
      error.logged = true

      if (isDevMode()) {
        console.warn('[AdminDashboard API][status]', {
          url: url.toString(),
          status: response.status,
          statusText: response.statusText,
          responseText: responseText.slice(0, 200),
        })
      }

      throw error
    }

    const responseText = await response.text()

    if (!String(responseText ?? '').trim()) {
      const error = new Error('DummyJSON returned an empty response body')
      error.kind = 'empty'
      error.url = url.toString()
      error.logged = true

      if (isDevMode()) {
        console.warn('[AdminDashboard API][empty]', {
          url: url.toString(),
          method,
        })
      }

      throw error
    }

    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      const error = new Error('DummyJSON response is not valid JSON')
      error.kind = 'parse'
      error.url = url.toString()
      error.cause = parseError
      error.logged = true

      if (isDevMode()) {
        console.warn('[AdminDashboard API][parse]', {
          url: url.toString(),
          method,
          message: parseError instanceof Error ? parseError.message : String(parseError),
        })
      }

      throw error
    }
  } catch (error) {
    const kind = error?.kind || (error?.name === 'AbortError' ? 'network' : 'network')

    if (isDevMode() && !error?.logged) {
      console.warn(`[AdminDashboard API][${kind}]`, {
        url: url.toString(),
        method,
        message: error instanceof Error ? error.message : String(error),
      })
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function fetchDummyJsonProducts(params) {
  return requestJson('/products', { params })
}

export function searchDummyJsonProducts(query, params = {}) {
  return requestJson('/products/search', {
    params: {
      q: query,
      limit: 100,
      ...params,
    },
  })
}

export function fetchDummyJsonProductCategories() {
  return requestJson('/products/categories')
}

export function fetchDummyJsonProductCategoryList() {
  return requestJson('/products/category-list')
}

export function fetchDummyJsonUsers(params) {
  return requestJson('/users', { params })
}

export function searchDummyJsonUsers(query) {
  return requestJson('/users/search', {
    params: {
      q: query,
      limit: 100,
    },
  })
}

export function fetchDummyJsonCarts(params) {
  return requestJson('/carts', { params })
}

export function addDummyJsonProduct(payload) {
  return requestJson('/products/add', {
    method: 'POST',
    body: payload,
  })
}

export function updateDummyJsonProduct(id, payload) {
  return requestJson(`/products/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteDummyJsonProduct(id) {
  return requestJson(`/products/${id}`, {
    method: 'DELETE',
  })
}
