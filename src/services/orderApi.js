import { API_BASE_URL } from '../config/api'
import { loadOrders as loadLocalOrders, saveOrder as saveLocalOrder } from '../utils/orderStorage.js'

function getRemoteOrdersUrl(path = '') {
  const baseUrl = String(API_BASE_URL ?? '').trim().replace(/\/+$/, '')
  if (!baseUrl) {
    return ''
  }

  return `${baseUrl}/orders${path}`
}

async function tryParseJson(response) {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function loadOrders() {
  const remoteUrl = getRemoteOrdersUrl()
  if (remoteUrl) {
    try {
      const response = await fetch(remoteUrl, {
        headers: { Accept: 'application/json' },
      })

      if (response.ok) {
        const data = await tryParseJson(response)
        if (Array.isArray(data)) {
          return data
        }
        if (Array.isArray(data?.orders)) {
          return data.orders
        }
      }
    } catch (error) {
      console.error('orderApi loadOrders failed', error)
    }
  }

  return loadLocalOrders()
}

export async function getOrderById(orderId) {
  const normalizedOrderId = String(orderId ?? '').trim()
  if (!normalizedOrderId) {
    return null
  }

  const remoteUrl = getRemoteOrdersUrl(`/${encodeURIComponent(normalizedOrderId)}`)
  if (remoteUrl) {
    try {
      const response = await fetch(remoteUrl, {
        headers: { Accept: 'application/json' },
      })

      if (response.ok) {
        const data = await tryParseJson(response)
        if (data && typeof data === 'object') {
          return data
        }
      }
    } catch (error) {
      console.error('orderApi getOrderById failed', error)
    }
  }

  return loadLocalOrders().find((order) => String(order.id) === normalizedOrderId) ?? null
}

export async function saveOrder(order) {
  const remoteUrl = getRemoteOrdersUrl()
  const nextOrder = saveLocalOrder(order)

  if (remoteUrl) {
    try {
      const response = await fetch(remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(nextOrder),
      })

      if (response.ok) {
        const data = await tryParseJson(response)
        if (data && typeof data === 'object') {
          return data
        }
      }
    } catch (error) {
      console.error('orderApi saveOrder failed', error)
    }
  }

  return nextOrder
}
