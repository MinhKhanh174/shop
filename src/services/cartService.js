import { getItem, setItem } from '../storage/localStorage.js'

const CART_KEY = 'techstore_cart'

export function loadCart() {
  return getItem(CART_KEY, [])
}

export function saveCart(cart) {
  setItem(CART_KEY, cart)
}

export function calculateCartTotals(cartItems) {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
}
