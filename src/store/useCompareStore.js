import { create } from 'zustand'
import { getItem, setItem } from '../storage/localStorage'
import { formatCurrency } from '../utils/currency'

const STORAGE_KEY = 'techstore:compare-items'
const MAX_COMPARE_ITEMS = 3

function normalizeCompareProduct(product) {
  const price = typeof product.price === 'number' ? Math.round(product.price) : 0

  return {
    id: product.id,
    name: product.name ?? 'Sản phẩm',
    brand: product.brand ?? '',
    image: product.image ?? product.thumbnail ?? product.images?.[0] ?? null,
    price,
    priceText: product.priceText ?? formatCurrency(price),
  }
}

function loadCompareItems() {
  const stored = getItem(STORAGE_KEY, [])
  return Array.isArray(stored) ? stored : []
}

function saveCompareItems(items) {
  setItem(STORAGE_KEY, items)
}

export const useCompareStore = create((set, get) => ({
  compareItems: loadCompareItems(),
  isTrayCollapsed: false,

  addToCompare: (product) => {
    const normalized = normalizeCompareProduct(product)

    set((state) => {
      const withoutCurrent = state.compareItems.filter((item) => String(item.id) !== String(normalized.id))
      const nextItems = [...withoutCurrent, normalized].slice(-MAX_COMPARE_ITEMS)

      saveCompareItems(nextItems)
      return { compareItems: nextItems, isTrayCollapsed: false }
    })
  },

  removeFromCompare: (id) => {
    set((state) => {
      const nextItems = state.compareItems.filter((item) => String(item.id) !== String(id))
      saveCompareItems(nextItems)
      return { compareItems: nextItems }
    })
  },

  clearCompare: () => {
    saveCompareItems([])
    set({ compareItems: [] })
  },

  toggleTray: () => {
    set((state) => ({ isTrayCollapsed: !state.isTrayCollapsed }))
  },

  setTrayCollapsed: (isTrayCollapsed) => {
    set({ isTrayCollapsed })
  },

  getCompareIds: () => get().compareItems.map((item) => String(item.id)),
}))

export { MAX_COMPARE_ITEMS }
