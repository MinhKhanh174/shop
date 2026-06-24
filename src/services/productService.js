import { fetchProductById, fetchProducts, fetchProductsByCategory, searchProducts } from './homeApi.js'
import { formatCurrency } from '../utils/currency.js'

const PRODUCT_SELECT =
  'id,title,sku,price,discountPercentage,brand,category,thumbnail,images,stock,rating,description,dimensions,weight,warrantyInformation,shippingInformation,returnPolicy,minimumOrderQuantity,availabilityStatus'

function normalizePrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.round(value * 25000)
}

function formatMetric(value, unit = '') {
  if (value === null || value === undefined || value === '') {
    return 'Đang cập nhật'
  }

  const numericValue = Number(value)
  if (Number.isFinite(numericValue)) {
    return `${numericValue}${unit}`
  }

  return String(value)
}

function mapApiProduct(product) {
  const price = normalizePrice(product.price)
  const dimensions = product.dimensions ?? {}
  const width = formatMetric(dimensions.width, ' cm')
  const height = formatMetric(dimensions.height, ' cm')
  const depth = formatMetric(dimensions.depth, ' cm')
  const weight = formatMetric(product.weight, ' kg')

  return {
    id: product.id,
    name: product.title ?? 'Sản phẩm',
    brand: product.brand ?? '',
    sku: product.sku ?? '',
    price,
    image: product.thumbnail ?? product.images?.[0] ?? null,
    description: product.description ?? '',
    promotion:
      typeof product.discountPercentage === 'number' && product.discountPercentage > 0
        ? `Giảm ${Math.round(product.discountPercentage)}% khi mua online`
        : 'Ưu đãi đặc biệt khi mua online',
    specs: {
      'Danh mục': product.category ?? 'Đang cập nhật',
      'Chiều rộng': width,
      'Chiều cao': height,
      'Chiều sâu': depth,
      'Cân nặng': weight,
      'Tình trạng': product.availabilityStatus ?? 'Đang cập nhật',
    },
    priceText: formatCurrency(price),
    source: product,
  }
}

async function fetchAllProducts() {
  const [firstPage, secondPage] = await Promise.all([
    fetchProducts({ limit: 100, select: PRODUCT_SELECT }),
    fetchProducts({ skip: 100, limit: 100, select: PRODUCT_SELECT }),
  ])

  const firstPageProducts = Array.isArray(firstPage.data?.products) ? firstPage.data.products : []
  const secondPageProducts = Array.isArray(secondPage.data?.products) ? secondPage.data.products : []
  const merged = [...firstPageProducts, ...secondPageProducts]
  const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values())

  return unique.map(mapApiProduct)
}

export async function getProducts() {
  return fetchAllProducts()
}

export async function searchCatalogProducts(query) {
  const response = await searchProducts(query)
  const results = Array.isArray(response.data?.products) ? response.data.products : []

  return results.map(mapApiProduct)
}

export async function getProductsByCategory(categorySlug) {
  const response = await fetchProductsByCategory(categorySlug, { select: PRODUCT_SELECT })
  const results = Array.isArray(response.data?.products) ? response.data.products : []

  return results.map(mapApiProduct)
}

export async function getProductById(id) {
  const response = await fetchProductById(id)
  const product = response.data

  if (!product || typeof product.id === 'undefined') {
    return null
  }

  return mapApiProduct(product)
}

export async function getCompareProducts(ids) {
  const products = await Promise.all(ids.map((id) => getProductById(id)))
  return products.filter(Boolean)
}
