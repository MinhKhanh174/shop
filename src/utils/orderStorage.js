import { getItem, setItem } from '../storage/localStorage.js'
import { buildCheckoutOrder, createCheckoutOrder } from './orderFactory.js'

const ORDERS_KEY = 'techstore_orders'

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase()

  return `DH-${timestamp}-${randomPart}`
}

export function loadOrders() {
  const orders = getItem(ORDERS_KEY, [])
  return Array.isArray(orders) ? orders.map((order) => buildCheckoutOrder(order)) : []
}

export function saveOrder(order) {
  const currentOrders = loadOrders()
  const nextOrder = createCheckoutOrder({
    ...order,
    id: order.id ?? generateOrderId(),
    createdAt: order.createdAt ?? new Date().toISOString(),
  })

  const nextOrders = [nextOrder, ...currentOrders]
  setItem(ORDERS_KEY, nextOrders)

  return nextOrder
}

export function saveTempOrder(order) {
  return saveOrder(order)
}
