import { create } from 'zustand'
import { calculateCartTotals, loadCart, saveCart } from '../services/cartService'
import { formatCurrency } from '../utils/currency'

function normalizePrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return value < 1000 ? Math.round(value * 25000) : Math.round(value)
}

export function normalizeCartProduct(product) {
  const price = normalizePrice(product.price)
  const name = product.name ?? product.title ?? 'Sản phẩm'

  return {
    id: product.id,
    name,
    price,
    image: product.image ?? product.thumbnail ?? product.images?.[0] ?? null,
    brand: product.brand ?? '',
    priceText: product.priceText ?? formatCurrency(price),
  }
}

export const useCartStore = create((set, get) => ({
  cartItems: loadCart(),

  addToCart: (product) => {
    const normalized = normalizeCartProduct(product)

    set((state) => {
      const existing = state.cartItems.find((item) => String(item.id) === String(normalized.id))
      const nextItems = existing
        ? state.cartItems.map((item) =>
            String(item.id) === String(normalized.id)
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...state.cartItems, { ...normalized, quantity: 1 }]

      saveCart(nextItems)
      return { cartItems: nextItems }
    })
  },

  removeFromCart: (id) => {
    set((state) => {
      const nextItems = state.cartItems.filter((item) => String(item.id) !== String(id))
      saveCart(nextItems)
      return { cartItems: nextItems }
    })
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeFromCart(id)
      return
    }

    set((state) => {
      const nextItems = state.cartItems.map((item) =>
        String(item.id) === String(id) ? { ...item, quantity } : item,
      )
      saveCart(nextItems)
      return { cartItems: nextItems }
    })
  },

  getTotalPrice: () => formatCurrency(calculateCartTotals(get().cartItems)),

  getItemCount: () => get().cartItems.reduce((total, item) => total + item.quantity, 0),
}))
