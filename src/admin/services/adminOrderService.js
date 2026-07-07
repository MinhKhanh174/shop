import { mockOrders } from '../data/mockOrders'
import { getUsers } from './adminUserService'
import { fetchDummyJsonCarts } from './dummyJsonAdminApi'

const FALLBACK_CREATED_AT_BASE = Date.parse('2026-07-01T12:00:00.000Z')

const PAYMENT_METHODS = ['cod', 'bank_transfer', 'momo', 'card']
const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled']

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function buildCreatedAtFromIndex(index) {
  return new Date(FALLBACK_CREATED_AT_BASE - index * 6 * 60 * 60 * 1000).toISOString()
}

function pickPaymentMethod(index) {
  return PAYMENT_METHODS[index % PAYMENT_METHODS.length]
}

function pickOrderStatus(cart, index) {
  const cartId = normalizeNumber(cart?.id, index + 1)

  if (cartId % 11 === 0) {
    return 'cancelled'
  }

  if (cartId % 7 === 0) {
    return 'completed'
  }

  if (cartId % 5 === 0) {
    return 'shipping'
  }

  if (cartId % 3 === 0) {
    return 'confirmed'
  }

  return ORDER_STATUSES[index % 3]
}

function pickPaymentStatus(orderStatus, index) {
  if (orderStatus === 'cancelled') {
    return 'unpaid'
  }

  return index % 4 === 1 ? 'unpaid' : 'paid'
}

function mapCustomerName(user, index, fallbackId) {
  if (!user) {
    return `Khách hàng ${fallbackId ?? index + 1}`
  }

  return normalizeText(user.name, `Khách hàng ${fallbackId ?? index + 1}`)
}

function mapCustomerPhone(user, index) {
  if (user?.phone) {
    return normalizeText(user.phone)
  }

  const base = 900000000 + index * 137
  return `0${String(base).slice(-9)}`
}

function mapRemoteCartToOrder(cart, index = 0, users = []) {
  if (!cart || typeof cart !== 'object') {
    return null
  }

  const userId = normalizeNumber(cart.userId, 0)
  const matchedUser = users.find((user) => normalizeNumber(user.id, -1) === userId) ?? null
  const orderStatus = pickOrderStatus(cart, index)
  const paymentMethod = pickPaymentMethod(index)

  return {
    id: `cart-${normalizeText(cart.id, index + 1)}`,
    orderNumber: `TS-${String(normalizeText(cart.id, index + 1)).padStart(6, '0')}`,
    customerName: mapCustomerName(matchedUser, index, cart.id),
    customerPhone: mapCustomerPhone(matchedUser, index),
    itemsCount: normalizeNumber(cart.totalQuantity, normalizeNumber(cart.totalProducts, 0)),
    total: normalizeNumber(cart.total, 0),
    paymentMethod,
    paymentStatus: pickPaymentStatus(orderStatus, index),
    orderStatus,
    createdAt: buildCreatedAtFromIndex(index),
    raw: cart,
  }
}

function mapFallbackOrder(order, index = 0) {
  if (!order || typeof order !== 'object') {
    return null
  }

  const legacyStatusMap = {
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'shipping',
    shipped: 'shipping',
    delivered: 'completed',
    cancelled: 'cancelled',
  }

  const orderStatus = legacyStatusMap[normalizeText(order.orderStatus).toLowerCase()] ?? 'pending'
  const paymentStatus = normalizeText(order.paymentStatus).toLowerCase() === 'refunded' ? 'unpaid' : normalizeText(order.paymentStatus).toLowerCase() === 'pending' ? 'unpaid' : 'paid'

  return {
    id: normalizeText(order.id, `legacy-${index + 1}`),
    orderNumber: normalizeText(order.orderNumber, `TS-LEGACY-${String(index + 1).padStart(3, '0')}`),
    customerName: normalizeText(order.customerName, `Khách hàng ${index + 1}`),
    customerPhone: normalizeText(order.customerPhone, `09010010${String(index + 1).padStart(2, '0')}`),
    itemsCount: normalizeNumber(order.itemsCount, 0),
    total: normalizeNumber(order.total, 0),
    paymentMethod: ['cod', 'bank_transfer', 'momo', 'card'].includes(normalizeText(order.paymentMethod).toLowerCase())
      ? normalizeText(order.paymentMethod).toLowerCase()
      : 'cod',
    paymentStatus,
    orderStatus,
    createdAt: normalizeText(order.createdAt, buildCreatedAtFromIndex(index)),
    raw: order,
  }
}

function cloneFallbackOrders() {
  return mockOrders.map((order, index) => mapFallbackOrder(order, index)).filter(Boolean)
}

async function loadRemoteCarts() {
  const data = await fetchDummyJsonCarts({ limit: 100 })
  return Array.isArray(data?.carts) ? data.carts : []
}

export async function getOrders() {
  try {
    const [carts, users] = await Promise.all([loadRemoteCarts(), getUsers()])
    const mappedOrders = carts.map((cart, index) => mapRemoteCartToOrder(cart, index, users)).filter(Boolean)

    if (!mappedOrders.length) {
      return cloneFallbackOrders()
    }

    return mappedOrders
  } catch (error) {
    console.warn('getOrders fallback to mock data', error)
    return cloneFallbackOrders()
  }
}

export async function getOrderById(id) {
  const orderId = normalizeText(id)

  if (!orderId) {
    return null
  }

  try {
    const orders = await getOrders()
    return orders.find((order) => String(order.id) === orderId || String(order.orderNumber) === orderId) ?? null
  } catch (error) {
    console.warn('getOrderById fallback to mock data', error)
    return cloneFallbackOrders().find((order) => String(order.id) === orderId || String(order.orderNumber) === orderId) ?? null
  }
}
