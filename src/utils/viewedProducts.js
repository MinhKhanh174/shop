import { getItem, setItem } from '../storage/localStorage'

export const VIEWED_PRODUCTS_KEY = 'techstore:viewed-products'
export const VIEWED_PRODUCTS_LIMIT = 8

export function getViewedProductIds() {
  const ids = getItem(VIEWED_PRODUCTS_KEY, [])

  return Array.isArray(ids) ? ids.map((id) => String(id)).filter(Boolean) : []
}

export function saveViewedProductId(productId) {
  if (typeof productId === 'undefined' || productId === null) {
    return
  }

  const currentIds = getViewedProductIds()
  const nextIds = [String(productId), ...currentIds.filter((id) => id !== String(productId))].slice(
    0,
    VIEWED_PRODUCTS_LIMIT,
  )

  setItem(VIEWED_PRODUCTS_KEY, nextIds)
}

export function getViewedProducts(catalogProducts = [], limit = VIEWED_PRODUCTS_LIMIT) {
  const viewedIds = getViewedProductIds()
  const productById = new Map(catalogProducts.map((product) => [String(product.id), product]))

  return viewedIds.map((id) => productById.get(id)).filter(Boolean).slice(0, limit)
}
