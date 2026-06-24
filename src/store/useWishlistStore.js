import { create } from 'zustand'
import { getAuthUser } from '../utils/authStorage'
import { normalizeWishlistProduct, queuePendingWishlistProduct, resolveWishlistForUser, saveWishlist } from '../services/wishlistService'

const AUTH_CHANGE_EVENT = 'techstore:auth-changed'

export const useWishlistStore = create((set, get) => ({
  wishlistItems: resolveWishlistForUser(getAuthUser()),

  rehydrateWishlist: (user = getAuthUser()) => {
    const nextItems = resolveWishlistForUser(user)
    set({ wishlistItems: nextItems })
    return nextItems
  },

  toggleFavorite: (product) => {
    const currentUser = getAuthUser()
    if (!currentUser) {
      return false
    }

    const normalizedProduct = normalizeWishlistProduct(product)
    if (!normalizedProduct) {
      return false
    }

    let wasAdded = false

    set((state) => {
      const exists = state.wishlistItems.some((item) => String(item.id) === String(normalizedProduct.id))
      const nextItems = exists
        ? state.wishlistItems.filter((item) => String(item.id) !== String(normalizedProduct.id))
        : [normalizedProduct, ...state.wishlistItems]

      wasAdded = !exists
      saveWishlist(nextItems, currentUser)

      return { wishlistItems: nextItems }
    })

    return wasAdded
  },

  isFavorite: (productId) => get().wishlistItems.some((item) => String(item.id) === String(productId)),

  queuePendingFavorite: (product) => queuePendingWishlistProduct(product),
}))

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CHANGE_EVENT, (event) => {
    void useWishlistStore.getState().rehydrateWishlist(event.detail ?? getAuthUser())
  })
}
