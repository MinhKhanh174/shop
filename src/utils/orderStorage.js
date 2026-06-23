import { getItem, setItem } from '../storage/localStorage.js'

const ORDERS_KEY = 'techstore_orders'

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase()

  return `DH-${timestamp}-${randomPart}`
}

export function loadOrders() {
  return getItem(ORDERS_KEY, [])
}

export function saveOrder(order) {
  const currentOrders = loadOrders()
  const nextOrder = {
    ...order,
    id: order.id ?? generateOrderId(),
    createdAt: order.createdAt ?? new Date().toISOString(),
  }

  const nextOrders = [nextOrder, ...currentOrders]
  setItem(ORDERS_KEY, nextOrders)

  return nextOrder
}
