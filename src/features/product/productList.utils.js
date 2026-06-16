import { mapApiProductToCard } from '../../utils/productMapper'

export const PRICE_RANGES = {
  all: { min: null, max: null },
  'under-2000000': { min: null, max: 2000000 },
  '2000000-5000000': { min: 2000000, max: 5000000 },
  '5000000-10000000': { min: 5000000, max: 10000000 },
  'over-10000000': { min: 10000000, max: null },
}

export function dedupeProducts(products) {
  const seen = new Set()

  return products.filter((product) => {
    const key = String(product.id)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function sortProducts(products, sortBy) {
  const next = [...products]

  switch (sortBy) {
    case 'name-asc':
      return next.sort((left, right) => String(left.name ?? '').localeCompare(String(right.name ?? ''), 'vi'))
    case 'name-desc':
      return next.sort((left, right) => String(right.name ?? '').localeCompare(String(left.name ?? ''), 'vi'))
    case 'price-asc':
      return next.sort((left, right) => left.price - right.price)
    case 'price-desc':
      return next.sort((left, right) => right.price - left.price)
    case 'newest':
    default:
      return next.sort(
        (left, right) => Number(String(right.id).replace(/\D/g, '')) - Number(String(left.id).replace(/\D/g, '')),
      )
  }
}

export function matchesPriceRange(product, rangeKey) {
  const range = PRICE_RANGES[rangeKey] ?? PRICE_RANGES.all

  if (range.min !== null && product.price < range.min) return false
  if (range.max !== null && product.price > range.max) return false

  return true
}

export function mapRemoteProduct(product) {
  return mapApiProductToCard(product, {
    label: 'Trả góp 0%',
    perk: 'Trả góp 0%',
  })
}

export function getCollectionMeta(query) {
  return {
    label: query ? `Kết quả tìm kiếm: ${query}` : 'Sản phẩm',
    description: query
      ? `Hiển thị các sản phẩm phù hợp với từ khóa "${query}".`
      : 'Xem toàn bộ sản phẩm, lọc theo thương hiệu, mức giá và sắp xếp theo nhu cầu.',
  }
}

export function buildBrandOptions(products) {
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))]
  return brands.sort((left, right) => left.localeCompare(right))
}

export function getVisibleProducts(products, currentPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const visibleProducts = products.slice(startIndex, startIndex + pageSize)

  return { totalPages, safeCurrentPage, visibleProducts }
}

export function buildPaginationPages(totalPages, safeCurrentPage) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, safeCurrentPage])

  if (safeCurrentPage > 2) pages.add(safeCurrentPage - 1)
  if (safeCurrentPage < totalPages - 1) pages.add(safeCurrentPage + 1)

  return [...pages].sort((left, right) => left - right)
}
