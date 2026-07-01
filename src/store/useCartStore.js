import { create } from 'zustand'
import { calculateCartTotals, loadCart, saveCart, syncCartFromRemote, syncCartItemsWithCatalog } from '../services/cartService'
import { formatCurrency } from '../utils/currency'
import { getAuthUser } from '../utils/authStorage'
import { clampQuantity, resolveMaxQuantity } from '../utils/quantity'

const AUTH_CHANGE_EVENT = 'techstore:auth-changed'
let cartHydrationSeq = 0

function normalizePrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.round(value * 25000)
}

export function normalizeCartProduct(product) {
  const alreadyConverted = Boolean(product?.priceText || product?.source?.priceText)
  const price = alreadyConverted ? Math.round(Number(product.price) || 0) : normalizePrice(product.price)
  const name = product.name ?? product.title ?? 'Sản phẩm'
  const stock = resolveMaxQuantity(product.stock ?? product.source?.stock)

  return {
    id: product.id,
    name,
    price,
    image: product.image ?? product.thumbnail ?? product.images?.[0] ?? null,
    brand: product.brand ?? '',
    priceText: product.priceText ?? formatCurrency(price),
    stock,
  }
}

export const useCartStore = create((set, get) => ({
  cartItems: loadCart(getAuthUser()),

  rehydrateCart: async (user = getAuthUser()) => {
    const requestSeq = ++cartHydrationSeq
    const nextItems = await syncCartFromRemote(user)
    if (requestSeq !== cartHydrationSeq) {
      return nextItems
    }

    set({ cartItems: nextItems })
    return nextItems
  },

  addToCart: (product, quantity = 1) => {
    const normalized = normalizeCartProduct(product)
    const safeQuantity = clampQuantity(quantity, normalized.stock)
    const currentUser = getAuthUser()

    set((state) => {
      const existing = state.cartItems.find((item) => String(item.id) === String(normalized.id))
      const nextItems = existing
        ? state.cartItems.map((item) =>
            String(item.id) === String(normalized.id)
              ? {
                  ...item,
                  quantity: clampQuantity(
                    (Number(item.quantity) || 1) + safeQuantity,
                    item.stock ?? normalized.stock,
                  ),
                }
              : item,
          )
        : [...state.cartItems, { ...normalized, quantity: safeQuantity }]

      saveCart(nextItems, currentUser)
      return { cartItems: nextItems }
    })
  },

  removeFromCart: (id) => {
    const currentUser = getAuthUser()

    set((state) => {
      const nextItems = state.cartItems.filter((item) => String(item.id) !== String(id))
      saveCart(nextItems, currentUser)
      return { cartItems: nextItems }
    })
  },

  clearCart: () => {
    const currentUser = getAuthUser()
    saveCart([], currentUser)
    set({ cartItems: [] })
  },

  syncCartWithCatalog: (catalogProducts = []) => {
    set((state) => {
      const nextItems = syncCartItemsWithCatalog(state.cartItems, catalogProducts)
      return { cartItems: nextItems }
    })
  },

  updateQuantity: (id, quantity) => {
    const currentUser = getAuthUser()

    set((state) => {
      const nextItems = state.cartItems.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity: clampQuantity(quantity, item.stock) }
          : item,
      )
      saveCart(nextItems, currentUser)
      return { cartItems: nextItems }
    })
  },

  getTotalPrice: () => formatCurrency(calculateCartTotals(get().cartItems)),

  getItemCount: () => get().cartItems.reduce((total, item) => total + item.quantity, 0),
}))

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CHANGE_EVENT, (event) => {
    void useCartStore.getState().rehydrateCart(event.detail ?? getAuthUser())
  })

  void useCartStore.getState().rehydrateCart(getAuthUser())
}
