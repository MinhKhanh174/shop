const DEFAULT_DELAY_MS = 800

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function getMailMode() {
  return normalizeText(import.meta.env.VITE_ORDER_MAIL_MODE, 'mock').toLowerCase()
}

function getDelayMs() {
  const parsed = Number(import.meta.env.VITE_ORDER_MAIL_DELAY_MS)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DELAY_MS
}

function getMailApiUrl() {
  const configuredUrl = normalizeText(import.meta.env.VITE_ORDER_MAIL_API_URL)
  return configuredUrl || '/api/orders/send-mail'
}

function extractBackendErrorMessage(data) {
  if (!data || typeof data !== 'object') {
    return ''
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim()
  }

  if (data.errors && typeof data.errors === 'object') {
    const firstFieldErrors = Object.values(data.errors).find((value) => Array.isArray(value) && value.length > 0)
    if (firstFieldErrors?.[0]) {
      return String(firstFieldErrors[0]).trim()
    }
  }

  return ''
}

function buildOrderEmailPayload(order) {
  return {
    orderId: normalizeText(order?.id),
    customerName: normalizeText(order?.customer?.fullName, 'Khach hang'),
    customerEmail: normalizeText(order?.customer?.email).toLowerCase(),
    phone: normalizeText(order?.customer?.phone),
    address: normalizeText(order?.address || order?.customer?.address),
    paymentMethod: normalizeText(order?.paymentMethod),
    subtotal: Number(order?.subtotal) || 0,
    shippingFee: Number(order?.shippingFee) || 0,
    discount: Number(order?.discount) || 0,
    grandTotal: Number(order?.grandTotal) || 0,
    items: Array.isArray(order?.items)
      ? order.items.map((item) => ({
          id: item?.id ?? '',
          name: normalizeText(item?.name, 'San pham'),
          quantity: Number(item?.quantity) || 1,
          price: Number(item?.price) || 0,
        }))
      : [],
    createdAt: normalizeText(order?.createdAt),
    status: normalizeText(order?.status, 'pending'),
  }
}

async function sendMockOrderEmail(payload) {
  await sleep(getDelayMs())

  if (getMailMode() === 'fail') {
    throw new Error('Mock mail delivery failed')
  }

  return {
    ok: true,
    provider: 'mock',
    messageId: `mock-mail-${payload.orderId || Date.now()}`,
  }
}

async function sendBackendOrderEmail(order) {
  const endpoint = getMailApiUrl()

  if (!endpoint) {
    throw new Error('VITE_ORDER_MAIL_API_URL is not configured')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ order }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const backendMessage = extractBackendErrorMessage(data)
    const statusText = response.status ? `HTTP ${response.status}` : ''
    const detail = backendMessage || 'Backend mail request failed'
    throw new Error([detail, statusText].filter(Boolean).join(' - '))
  }

  return data ?? { ok: true, provider: 'smtp' }
}

export async function sendOrderEmail(order) {
  const payload = buildOrderEmailPayload(order)

  if (!payload.customerEmail) {
    throw new Error('Order is missing customer email')
  }

  if (getMailMode() === 'backend') {
    return sendBackendOrderEmail(order)
  }

  return sendMockOrderEmail(payload)
}
