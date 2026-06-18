import { mapProductsToCards } from '../../utils/productMapper'

const COLOR_DEFINITIONS = [
  { key: 'white', label: 'Tráº¯ng', swatch: '#ffffff', border: '#cbd5e1' },
  { key: 'black', label: 'Äen', swatch: '#111111', border: '#111111' },
  { key: 'gray', label: 'XĂ¡m', swatch: '#94a3b8', border: '#94a3b8' },
  { key: 'blue', label: 'Xanh dÆ°Æ¡ng', swatch: '#0ea5e9', border: '#0ea5e9' },
  { key: 'red', label: 'Äá»', swatch: '#ef1f1f', border: '#ef1f1f' },
  { key: 'green', label: 'Xanh lĂ¡', swatch: '#22c55e', border: '#22c55e' },
  { key: 'gold', label: 'VĂ ng', swatch: '#f59e0b', border: '#f59e0b' },
  { key: 'silver', label: 'Báº¡c', swatch: '#d1d5db', border: '#9ca3af' },
  { key: 'pink', label: 'Há»“ng', swatch: '#ec4899', border: '#ec4899' },
  { key: 'purple', label: 'TĂ­m', swatch: '#a855f7', border: '#a855f7' },
]

const COLOR_PATTERNS = [
  { regex: /tráº¯ng|white/i, key: 'white' },
  { regex: /Ä‘en|black/i, key: 'black' },
  { regex: /xĂ¡m|gray|grey/i, key: 'gray' },
  { regex: /xanh dÆ°Æ¡ng|blue|navy|sky/i, key: 'blue' },
  { regex: /Ä‘á»|red/i, key: 'red' },
  { regex: /xanh lĂ¡|green/i, key: 'green' },
  { regex: /vĂ ng|gold/i, key: 'gold' },
  { regex: /báº¡c|silver/i, key: 'silver' },
  { regex: /há»“ng|pink/i, key: 'pink' },
  { regex: /tĂ­m|purple/i, key: 'purple' },
]

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

function collectProductText(product) {
  const specValues = product?.specs ? Object.entries(product.specs).flatMap(([key, value]) => [key, value]) : []
  return [
    product?.name,
    product?.brand,
    product?.category,
    product?.description,
    product?.source?.title,
    product?.source?.description,
    product?.source?.category,
    product?.source?.brand,
    product?.source?.sku,
    ...specValues,
  ]
    .filter(Boolean)
    .join(' ')
}

function uniqueByKey(items) {
  return Array.from(new Map(items.map((item) => [item.key ?? item.label ?? item, item])).values())
}

function normalizeStorageLabel(value) {
  return String(value)
    .replace(/\s+/g, '')
    .toUpperCase()
}

export function extractColorOptions(product) {
  if (!product) return []

  const explicitColors = [
    ...(Array.isArray(product?.source?.colors) ? product.source.colors : []),
    ...(Array.isArray(product?.source?.colorOptions) ? product.source.colorOptions : []),
    ...(Array.isArray(product?.source?.variants) ? product.source.variants : []),
  ]

  const fromExplicit = explicitColors
    .map((entry) => {
      if (typeof entry === 'string') {
        const match = COLOR_DEFINITIONS.find((color) => color.regex.test(entry) || color.label.toLowerCase() === entry.toLowerCase())
        return match ?? null
      }

      if (entry && typeof entry === 'object') {
        const value = String(entry.value ?? entry.key ?? entry.label ?? entry.name ?? '').trim()
        const match = COLOR_DEFINITIONS.find(
          (color) =>
            color.key === value.toLowerCase() ||
            color.label.toLowerCase() === value.toLowerCase() ||
            color.regex.test(value),
        )

        if (match) return match

        if (value) {
          return {
            key: normalizeToken(value),
            label: entry.label ?? entry.name ?? value,
            swatch: entry.swatch ?? entry.color ?? '#ffffff',
            border: entry.border ?? entry.color ?? '#d1d5db',
          }
        }
      }

      return null
    })
    .filter(Boolean)

  if (fromExplicit.length > 0) {
    return uniqueByKey(fromExplicit)
  }

  const text = collectProductText(product)
  const matched = COLOR_PATTERNS.filter((pattern) => pattern.regex.test(text)).map((pattern) =>
    COLOR_DEFINITIONS.find((color) => color.key === pattern.key),
  )

  return uniqueByKey(matched.filter(Boolean))
}

export function extractStorageOptions(product) {
  if (!product) return []

  const explicitStorage = [
    product?.source?.storage,
    product?.source?.storages,
    product?.source?.capacity,
    product?.source?.capacities,
    product?.source?.variant,
    product?.source?.variants,
  ]

  const fromExplicit = explicitStorage
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .flatMap((entry) => {
      if (typeof entry === 'string') {
        return [entry]
      }

      if (entry && typeof entry === 'object') {
        const value = String(entry.value ?? entry.label ?? entry.name ?? entry.storage ?? entry.capacity ?? '').trim()
        return value ? [value] : []
      }

      return []
    })
    .map((value) => normalizeStorageLabel(value))
    .filter(Boolean)

  if (fromExplicit.length > 0) {
    return Array.from(new Set(fromExplicit))
  }

  const text = collectProductText(product)
  const matches = Array.from(text.matchAll(/(\d+(?:[.,]\d+)?)\s?(TB|GB)/gi), (match) =>
    normalizeStorageLabel(`${match[1]}${match[2]}`),
  )

  return Array.from(new Set(matches))
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

  return /accessory|phu kien|phá»¥ kiá»‡n|cable|charger|case|á»‘p|op lung|screen|tai nghe|earbuds|earphones|headphones|power bank|pin sac|sáº¡c dá»± phĂ²ng|loa|speaker/.test(
    text,
  )
}

function normalizeRelationValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function collectReferenceSignals(referenceItems) {
  const items = Array.isArray(referenceItems) ? referenceItems : [referenceItems]
  const brands = new Set()
  const categories = new Set()
  const ids = new Set()

  items.forEach((item) => {
    if (!item) return

    const id = String(item.id ?? '').trim()
    const brand = normalizeRelationValue(item.brand ?? item.source?.brand)
    const category = normalizeRelationValue(item.category ?? item.source?.category)

    if (id) ids.add(id)
    if (brand) brands.add(brand)
    if (category) categories.add(category)
  })

  return { brands, categories, ids }
}

export function buildRelatedProductsByReference(remoteProducts, referenceItems, limit = 5) {
  const { brands, categories, ids } = collectReferenceSignals(referenceItems)
  if (!brands.size && !categories.size) return []

  const mappedProducts = mapProductsToCards(remoteProducts, { label: 'Tráº£ gĂ³p 0%' })

  const related = mappedProducts.filter((item) => {
    if (ids.has(String(item.id))) {
      return false
    }

    const itemBrand = normalizeRelationValue(item.brand)
    const itemCategory = normalizeRelationValue(item.category)

    return brands.has(itemBrand) || categories.has(itemCategory)
  })

  const sorted = related.sort((left, right) => {
    const leftBrandMatch = brands.has(normalizeRelationValue(left.brand)) ? 1 : 0
    const rightBrandMatch = brands.has(normalizeRelationValue(right.brand)) ? 1 : 0
    const leftCategoryMatch = categories.has(normalizeRelationValue(left.category)) ? 1 : 0
    const rightCategoryMatch = categories.has(normalizeRelationValue(right.category)) ? 1 : 0

    return rightBrandMatch + rightCategoryMatch - (leftBrandMatch + leftCategoryMatch)
  })

  return sorted.slice(0, limit)
}

export function buildRelatedProducts(remoteProducts, currentProduct) {
  if (!currentProduct) return []

  return buildRelatedProductsByReference(remoteProducts, currentProduct, 5)
}
