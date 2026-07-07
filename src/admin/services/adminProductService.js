import { mockProducts } from '../data/mockProducts'
import {
  fetchDummyJsonProductCategories,
  fetchDummyJsonProducts,
  searchDummyJsonProducts,
} from './dummyJsonAdminApi'

const FALLBACK_CREATED_AT_BASE = Date.parse('2026-06-01T08:00:00.000Z')

const CATEGORY_LABELS = {
  smartphones: 'Điện thoại',
  phone: 'Điện thoại',
  laptops: 'Máy tính xách tay',
  laptop: 'Máy tính xách tay',
  tablets: 'Máy tính bảng',
  tablet: 'Máy tính bảng',
  fragrances: 'Nước hoa',
  fragrance: 'Nước hoa',
  skincare: 'Chăm sóc da',
  groceries: 'Đồ tạp hóa',
  'home-decoration': 'Trang trí nhà cửa',
  furniture: 'Nội thất',
  tops: 'Áo thun',
  'women-dresses': 'Đầm nữ',
  'women-shoes': 'Giày nữ',
  "women's-watches": 'Đồng hồ nữ',
  "men's-shirts": 'Áo sơ mi nam',
  "men's-shoes": 'Giày nam',
  "men's-watches": 'Đồng hồ nam',
  sunglasses: 'Kính mát',
  automotive: 'Phụ kiện ô tô',
  motorcycle: 'Xe máy',
  lighting: 'Đèn chiếu sáng',
  'mobile-accessories': 'Phụ kiện di động',
  'kitchen-accessories': 'Phụ kiện nhà bếp',
  'sports-accessories': 'Phụ kiện thể thao',
  accessory: 'Phụ kiện',
  audio: 'Âm thanh',
}

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getCategoryLabel(category) {
  const normalized = normalizeText(category).toLowerCase()
  return CATEGORY_LABELS[normalized] ?? normalizeText(category, 'Danh mục khác')
}

function buildCreatedAtFromIndex(index) {
  return new Date(FALLBACK_CREATED_AT_BASE - index * 86400000).toISOString()
}

function mapRemoteProduct(product, index = 0) {
  if (!product || typeof product !== 'object') {
    return null
  }

  const stock = normalizeNumber(product.stock, 0)
  const id = normalizeText(product.id, `dj-${index + 1}`)
  const category = normalizeText(product.category, 'unknown')

  return {
    id,
    sku: normalizeText(product.sku, `DJ-${String(id).toUpperCase()}`),
    name: normalizeText(product.title, 'Sản phẩm chưa đặt tên'),
    image: normalizeText(product.thumbnail ?? product.images?.[0], ''),
    category,
    categoryLabel: getCategoryLabel(category),
    brand: normalizeText(product.brand, 'Khác'),
    price: normalizeNumber(product.price, 0),
    stock,
    status: stock > 0 ? 'active' : 'inactive',
    createdAt: normalizeText(product.createdAt, buildCreatedAtFromIndex(index)),
    rating: normalizeNumber(product.rating, 0),
    discountPercentage: normalizeNumber(product.discountPercentage, 0),
    description: normalizeText(product.description, ''),
    raw: product,
  }
}

function mapFallbackProduct(product, index = 0) {
  if (!product || typeof product !== 'object') {
    return null
  }

  const mapped = mapRemoteProduct(
    {
      id: product.id,
      sku: product.sku,
      title: product.name,
      thumbnail: product.image,
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      rating: 4.2 + (index % 5) * 0.1,
      discountPercentage: 5 + (index % 6) * 3,
      description: product.description,
    },
    index,
  )

  return mapped ? { ...mapped, raw: product } : null
}

function cloneFallbackProducts() {
  return mockProducts.map((product, index) => mapFallbackProduct(product, index)).filter(Boolean)
}

async function loadRemoteProducts(query = '') {
  const trimmedQuery = normalizeText(query)

  if (trimmedQuery) {
    const data = await searchDummyJsonProducts(trimmedQuery, { limit: 100 })
    return Array.isArray(data?.products) ? data.products : []
  }

  const data = await fetchDummyJsonProducts({ limit: 100 })
  return Array.isArray(data?.products) ? data.products : []
}

function filterProducts(products, { search = '', category = '', status = '' } = {}) {
  const normalizedSearch = normalizeText(search).toLowerCase()
  const normalizedCategory = normalizeText(category).toLowerCase()
  const normalizedStatus = normalizeText(status).toLowerCase()

  return products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      [product.name, product.sku, product.brand, product.category, product.categoryLabel].some((value) =>
        normalizeText(value).toLowerCase().includes(normalizedSearch),
      )

    const matchesCategory = !normalizedCategory || normalizedCategory === 'all' || normalizeText(product.category).toLowerCase() === normalizedCategory
    const matchesStatus = !normalizedStatus || normalizedStatus === 'all' || normalizeText(product.status).toLowerCase() === normalizedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })
}

export async function getProducts(options = {}) {
  try {
    const remoteProducts = await loadRemoteProducts(options.search)
    const mappedProducts = remoteProducts.map((product, index) => mapRemoteProduct(product, index)).filter(Boolean)
    const finalProducts = mappedProducts.length ? mappedProducts : cloneFallbackProducts()
    return filterProducts(finalProducts, options)
  } catch (error) {
    console.warn('getProducts fallback to mock data', error)
    return filterProducts(cloneFallbackProducts(), options)
  }
}

export async function getProductById(id) {
  const productId = normalizeText(id)

  if (!productId) {
    return null
  }

  try {
    const products = await getProducts()
    return products.find((product) => String(product.id) === productId || String(product.sku) === productId) ?? null
  } catch (error) {
    console.warn('getProductById fallback to mock data', error)
    return cloneFallbackProducts().find((product) => String(product.id) === productId || String(product.sku) === productId) ?? null
  }
}

export async function getProductCategories() {
  try {
    const data = await fetchDummyJsonProductCategories()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('getProductCategories fallback to mock data', error)
    return Array.from(new Set(mockProducts.map((product) => product.category))).filter(Boolean)
  }
}

export function getProductCategoryLabel(category) {
  return getCategoryLabel(category)
}
