import { mapProductsToCards } from '../../utils/productMapper'

export function buildCategoryLabel(categorySlug, categoryItems) {
  const matched = categoryItems.find((item) => item.key === categorySlug)
  if (matched?.sidebarLabel) {
    return matched.sidebarLabel
  }

  return String(categorySlug || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function normalizeToken(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .toUpperCase()
}

export function buildProductCode(product) {
  const sourceSku = String(product?.sku ?? product?.source?.sku ?? '').trim()
  if (sourceSku) {
    return sourceSku
  }

  const brand = normalizeToken(product.brand || product.source?.brand || 'TECHSTORE')
  const name = normalizeToken(product.name || product.source?.title || product.id)

  return `${brand}.${name}`
}

export function resolveGalleryImages(product) {
  const fromSource = Array.isArray(product?.source?.images) ? product.source.images.filter(Boolean) : []
  const fallback = product?.image ? [product.image] : []
  return Array.from(new Set([...fromSource, ...fallback])).slice(0, 6)
}

export function isPhoneAccessoryProduct(item) {
  const text = [
    item?.name,
    item?.brand,
    item?.category,
    item?.source?.title,
    item?.source?.category,
    item?.source?.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return /accessory|phu kien|phụ kiện|cable|charger|case|ốp|op lung|screen|tai nghe|earbuds|earphones|headphones|power bank|pin sac|sạc dự phòng|loa|speaker/.test(
    text,
  )
}

export function buildRelatedProducts(remoteProducts, currentProduct) {
  if (!currentProduct) return []

  const mappedProducts = mapProductsToCards(remoteProducts, { label: 'Trả góp 0%' })
  const currentCategory = String(currentProduct.source?.category ?? '').toLowerCase()
  const currentBrand = String(currentProduct.brand ?? '').toLowerCase()

  const related = mappedProducts
    .filter((item) => String(item.id) !== String(currentProduct.id))
    .filter((item) => {
      const itemBrand = String(item.brand ?? '').toLowerCase()
      const itemCategory = String(item.category ?? '').toLowerCase()

      return itemBrand === currentBrand || itemCategory === currentCategory || isPhoneAccessoryProduct(item)
    })

  const sorted = related.sort((left, right) => {
    const leftBrandMatch = String(left.brand ?? '').toLowerCase() === currentBrand ? 1 : 0
    const rightBrandMatch = String(right.brand ?? '').toLowerCase() === currentBrand ? 1 : 0
    const leftAccessory = isPhoneAccessoryProduct(left) ? 1 : 0
    const rightAccessory = isPhoneAccessoryProduct(right) ? 1 : 0

    return rightBrandMatch + rightAccessory - (leftBrandMatch + leftAccessory)
  })

  return sorted.slice(0, 5)
}
