import { mockProducts } from '../data/mockProducts'
import {
  addLocalProduct,
  deleteLocalProduct,
  mergeAdminProducts,
  markProductDeleted,
  readAdminProductStore,
  saveProductOverride,
  removeDeletedProducts,
  updateLocalProduct,
} from './adminProductStorage'
import {
  addDummyJsonProduct,
  deleteDummyJsonProduct,
  fetchDummyJsonProductCategories,
  fetchDummyJsonProductCategoryList,
  fetchDummyJsonProducts,
  updateDummyJsonProduct,
} from './dummyJsonAdminApi'
import {
  formatAdminAvailabilityStatus,
  formatAdminCategoryLabel,
  formatAdminStatus,
} from '../utils/adminDisplayMapper'
import { mapApiCategoriesToCategoryItems } from '../../utils/categoryMapper'

const FALLBACK_CREATED_AT_BASE = Date.parse('2026-06-01T08:00:00.000Z')
const CUSTOM_STATUS_BY_STOCK = {
  active: 'active',
  inactive: 'inactive',
}

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

function normalizeCatalogPrice(value, mode = 'vnd') {
  const price = Number(value)

  if (!Number.isFinite(price)) {
    return 0
  }

  if (mode === 'remote') {
    return Math.round(price * 25000)
  }

  return Math.round(price)
}

export function calculateDiscountedPrice(originalPrice, discountPercentage = 0) {
  const price = Number(originalPrice)
  const discount = Number(discountPercentage)

  if (!Number.isFinite(price)) {
    return 0
  }

  const safeDiscount = Number.isFinite(discount) ? Math.min(100, Math.max(0, discount)) : 0
  return Math.max(0, Math.round(price - price * (safeDiscount / 100)))
}

function deriveOriginalPriceFromCurrentPrice(currentPrice, discountPercentage = 0) {
  const price = Number(currentPrice)
  const discount = Number(discountPercentage)

  if (!Number.isFinite(price)) {
    return 0
  }

  const safeDiscount = Number.isFinite(discount) ? Math.min(100, Math.max(0, discount)) : 0

  if (safeDiscount <= 0) {
    return Math.round(price)
  }

  const divisor = 1 - safeDiscount / 100

  if (divisor <= 0) {
    return Math.round(price)
  }

  return Math.max(0, Math.round(price / divisor))
}

function normalizeProductStatus(value, fallback = '') {
  const displayStatus = formatAdminStatus(value, '')

  if (displayStatus === 'Đang bán') {
    return 'active'
  }

  if (displayStatus === 'Ngừng bán') {
    return 'inactive'
  }

  const normalized = normalizeText(value, '').toLowerCase()

  if (normalized === 'active' || normalized === 'inactive') {
    return normalized
  }

  return normalizeText(fallback)
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeAvailabilityStatus(value, fallback = '') {
  const displayStatus = formatAdminAvailabilityStatus(value, '')

  if (displayStatus && displayStatus !== 'Chưa cập nhật') {
    return displayStatus
  }

  const normalized = normalizeText(value)
  return normalized || normalizeText(fallback)
}

function resolveFinalValue(...values) {
  for (const value of values) {
    const normalized = normalizeText(value, '')

    if (normalized) {
      return normalized
    }
  }

  return ''
}

function normalizeImageList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  return normalizeList(value)
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function getCategoryLabel(category) {
  const normalized = normalizeText(category).toLowerCase()
  return CATEGORY_LABELS[normalized] ?? normalizeText(category, 'Danh mục khác')
}

function resolveCategoryLabel(category) {
  return formatAdminCategoryLabel(category, getCategoryLabel(category))
}

function buildCreatedAtFromIndex(index) {
  return new Date(FALLBACK_CREATED_AT_BASE - index * 86400000).toISOString()
}

function buildLocalProductId() {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `adm_${timestamp}_${randomPart}`
}

function getFirstImage(product) {
  if (!product || typeof product !== 'object') {
    return ''
  }

  if (typeof product.thumbnail === 'string' && product.thumbnail.trim()) {
    return product.thumbnail.trim()
  }

  if (Array.isArray(product.images) && product.images.length) {
    return normalizeText(product.images[0], '')
  }

  return normalizeText(product.image, '')
}

function mapRemoteProduct(product, index = 0, meta = {}) {
  if (!product || typeof product !== 'object') {
    return null
  }

  const stock = normalizeNumber(product.stock, 0)
  const id = normalizeText(product.id, `dj-${index + 1}`)
  const category = normalizeText(product.category, 'unknown')
  const createdAt = normalizeText(product.createdAt, buildCreatedAtFromIndex(index))
  const updatedAt = normalizeText(meta.updatedAt, createdAt)
  const rawImages = Array.isArray(product.images) ? product.images : normalizeList(product.images)
  const tags = Array.isArray(product.tags) ? product.tags : normalizeList(product.tags)
  const discountPercentage = normalizeNumber(product.discountPercentage, 0)
  const originalPrice = normalizeCatalogPrice(
    product.originalPrice ?? product.price,
    normalizeText(meta.priceMode, 'remote'),
  )
  const price = calculateDiscountedPrice(originalPrice, discountPercentage)

  return {
    id,
    localId: normalizeText(meta.localId, ''),
    remoteId: normalizeText(meta.remoteId, ''),
    source: normalizeText(meta.source, 'remote'),
    sku: normalizeText(product.sku, `DJ-${String(id).toUpperCase()}`),
    name: normalizeText(product.title ?? product.name, 'Sản phẩm chưa đặt tên'),
    image: normalizeText(getFirstImage(product), ''),
    category,
    categoryLabel: resolveCategoryLabel(category),
    brand: normalizeText(product.brand, 'Khác'),
    price,
    originalPrice,
    stock,
    status: normalizeProductStatus(product.status ?? product.availabilityStatus, stock > 0 ? CUSTOM_STATUS_BY_STOCK.active : CUSTOM_STATUS_BY_STOCK.inactive),
    createdAt,
    updatedAt,
    rating: normalizeNumber(product.rating, 0),
    discountPercentage,
    description: normalizeText(product.description, ''),
    thumbnail: normalizeText(product.thumbnail ?? getFirstImage(product), ''),
    images: rawImages,
    minimumOrderQuantity: normalizeNumber(product.minimumOrderQuantity, 1),
    availabilityStatus: normalizeProductStatus(
      product.availabilityStatus ?? product.status,
      normalizeProductStatus(product.status, stock > 0 ? 'active' : 'inactive'),
    ),
    tags,
    warrantyInformation: normalizeText(product.warrantyInformation, ''),
    shippingInformation: normalizeText(product.shippingInformation, ''),
    returnPolicy: normalizeText(product.returnPolicy, ''),
    raw: product,
    adminMeta: {
      origin: normalizeText(meta.source, 'remote'),
      localId: normalizeText(meta.localId, ''),
      remoteId: normalizeText(meta.remoteId, ''),
      createdAt,
      updatedAt,
      priceMode: 'vnd',
    },
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
      images: product.image ? [product.image] : [],
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      createdAt: buildCreatedAtFromIndex(index),
      rating: 4.2 + (index % 5) * 0.1,
      discountPercentage: 5 + (index % 6) * 3,
      description: product.description,
      minimumOrderQuantity: 1,
      availabilityStatus: product.stock > 0 ? 'active' : 'inactive',
      tags: [],
    },
    index,
    {
      priceMode: 'vnd',
    },
  )

  if (!mapped) {
    return null
  }

  return {
    ...mapped,
    originalPrice: normalizeCatalogPrice(product.price, 'local', 'vnd'),
    price: normalizeCatalogPrice(product.price, 'local', 'vnd'),
    discountPercentage: 0,
    raw: product,
  }
}

function cloneFallbackProducts() {
  return mockProducts.map((product, index) => mapFallbackProduct(product, index)).filter(Boolean)
}

async function loadRemoteProducts() {
  const pageSize = 100
  const allProducts = []
  let skip = 0
  let total = Infinity

  while (allProducts.length < total) {
    const data = await fetchDummyJsonProducts({ limit: pageSize, skip })
    const products = Array.isArray(data?.products) ? data.products : []
    allProducts.push(...products)

    const responseTotal = normalizeNumber(data?.total, allProducts.length)
    const responseLimit = normalizeNumber(data?.limit, pageSize)
    const responseSkip = normalizeNumber(data?.skip, skip)

    total = Number.isFinite(responseTotal) && responseTotal > 0 ? responseTotal : allProducts.length
    skip = responseSkip + (responseLimit > 0 ? responseLimit : pageSize)

    if (!products.length || allProducts.length >= total) {
      break
    }
  }

  return allProducts
}

function mergeCategorySources(categoryObjects, categoryList) {
  const categoriesBySlug = new Map()

  const addCategory = (category) => {
    const slug = normalizeText(category?.slug ?? category?.key ?? category, '')
    if (!slug || categoriesBySlug.has(slug)) {
      return
    }

    categoriesBySlug.set(slug, category)
  }

  ;(Array.isArray(categoryObjects) ? categoryObjects : []).forEach(addCategory)
  ;(Array.isArray(categoryList) ? categoryList : []).forEach((category) => {
    if (typeof category === 'string') {
      addCategory({
        slug: category,
        name: category,
      })
      return
    }

    addCategory(category)
  })

  return Array.from(categoriesBySlug.values())
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

function buildEditableProductShape(baseProduct = {}, payload = {}, response = {}) {
  const baseRaw = baseProduct.raw && typeof baseProduct.raw === 'object' ? baseProduct.raw : {}
  const nextRaw = {
    ...baseRaw,
    ...(response && typeof response === 'object' ? response : {}),
    ...payload,
  }
  const createdAt = normalizeText(response.createdAt ?? payload.createdAt ?? baseProduct.createdAt ?? nextRaw.createdAt, new Date().toISOString())
  const updatedAt = normalizeText(response.updatedAt ?? payload.updatedAt ?? baseProduct.updatedAt ?? nextRaw.updatedAt, createdAt)
  const title = resolveFinalValue(payload.title, response.title, baseProduct.name, baseRaw.title, baseRaw.name) || 'Sản phẩm chưa đặt tên'
  const description = resolveFinalValue(payload.description, response.description, baseProduct.description, baseRaw.description)
  const category = resolveFinalValue(payload.category, response.category, baseProduct.category, baseRaw.category, 'unknown') || 'unknown'
  const brand = resolveFinalValue(payload.brand, response.brand, baseProduct.brand, baseRaw.brand, 'Khác') || 'Khác'
  const sku = resolveFinalValue(payload.sku, response.sku, baseProduct.sku, baseRaw.sku)
  const thumbnail = resolveFinalValue(payload.thumbnail, response.thumbnail, baseProduct.thumbnail, baseProduct.image, baseRaw.thumbnail, baseRaw.image)
  const images = normalizeImageList(payload.images ?? response.images ?? baseRaw.images ?? baseProduct.images ?? [])
  const tags = normalizeImageList(payload.tags ?? response.tags ?? baseRaw.tags ?? baseProduct.tags ?? [])
  const normalizedDiscountPercentage = normalizeNumber(
    payload.discountPercentage ?? response.discountPercentage ?? baseProduct.discountPercentage ?? baseRaw.discountPercentage,
    normalizeNumber(baseProduct.discountPercentage ?? baseRaw.discountPercentage, 0),
  )
  const originalPrice = normalizeCatalogPrice(
    payload.originalPrice ??
      response.originalPrice ??
      baseProduct.originalPrice ??
      baseRaw.originalPrice ??
      deriveOriginalPriceFromCurrentPrice(payload.price ?? response.price ?? baseProduct.price ?? baseRaw.price, normalizedDiscountPercentage),
    normalizeText(baseProduct.source, 'remote'),
  )
  const price = calculateDiscountedPrice(originalPrice, normalizedDiscountPercentage)

  nextRaw.originalPrice = originalPrice
  nextRaw.price = price

  return {
    id: normalizeText(response.id ?? payload.id ?? baseProduct.remoteId ?? baseProduct.id, baseProduct.id || buildLocalProductId()),
    sku: sku || baseProduct.sku || '',
    title,
    thumbnail,
    images,
    category,
    brand,
    originalPrice,
    price,
    stock: normalizeNumber(payload.stock ?? response.stock ?? baseProduct.stock, normalizeNumber(baseProduct.stock, 0)),
    status: normalizeProductStatus(
      resolveFinalValue(payload.status, payload.availabilityStatus, response.status, response.availabilityStatus, baseProduct.status, baseRaw.status, baseRaw.availabilityStatus) ||
        baseProduct.status ||
        baseRaw.status ||
        'active',
      normalizeProductStatus(baseProduct.status, baseRaw.status ?? 'active'),
    ),
    rating: normalizeNumber(payload.rating ?? response.rating ?? baseProduct.rating, normalizeNumber(baseProduct.rating, 0)),
    discountPercentage: normalizedDiscountPercentage,
    description,
    minimumOrderQuantity: normalizeNumber(
      payload.minimumOrderQuantity ?? response.minimumOrderQuantity ?? baseRaw.minimumOrderQuantity,
      normalizeNumber(baseRaw.minimumOrderQuantity, 1),
    ),
    availabilityStatus: normalizeAvailabilityStatus(
      resolveFinalValue(payload.availabilityStatus, payload.status, response.availabilityStatus, response.status, baseRaw.availabilityStatus, baseProduct.availabilityStatus),
      baseRaw.availabilityStatus ?? baseProduct.availabilityStatus ?? '',
    ),
    warrantyInformation: normalizeText(payload.warrantyInformation ?? response.warrantyInformation ?? baseRaw.warrantyInformation, ''),
    shippingInformation: normalizeText(payload.shippingInformation ?? response.shippingInformation ?? baseRaw.shippingInformation, ''),
    returnPolicy: normalizeText(payload.returnPolicy ?? response.returnPolicy ?? baseRaw.returnPolicy, ''),
    tags,
    createdAt,
    updatedAt,
    raw: nextRaw,
    adminMeta: {
      origin: normalizeText(baseProduct.adminMeta?.origin ?? baseProduct.source, baseProduct.source ?? 'remote'),
      localId: normalizeText(baseProduct.adminMeta?.localId ?? baseProduct.localId, baseProduct.localId ?? ''),
      remoteId: normalizeText(baseProduct.adminMeta?.remoteId ?? baseProduct.remoteId, baseProduct.remoteId ?? ''),
      createdAt,
      updatedAt,
      priceMode: normalizeText(baseProduct.adminMeta?.priceMode, 'vnd'),
    },
  }
}

function normalizeProductSnapshot(baseProduct = {}, payload = {}, response = {}, meta = {}) {
  const shape = buildEditableProductShape(baseProduct, payload, response)
  return {
    id: shape.id,
    localId: normalizeText(meta.localId, baseProduct.localId ?? ''),
    remoteId: normalizeText(meta.remoteId, baseProduct.remoteId ?? ''),
    source: normalizeText(meta.source, baseProduct.source ?? 'remote'),
    sku: shape.sku,
    name: shape.title,
    image: shape.thumbnail || baseProduct.image || '',
    category: shape.category,
    categoryLabel: resolveCategoryLabel(shape.category),
    brand: shape.brand,
    price: shape.price,
    originalPrice: shape.originalPrice,
    stock: shape.stock,
    status: shape.status,
    createdAt: normalizeText(meta.createdAt, shape.createdAt),
    updatedAt: normalizeText(meta.updatedAt, shape.updatedAt),
    rating: shape.rating,
    discountPercentage: shape.discountPercentage,
    description: shape.description,
    thumbnail: shape.thumbnail,
    images: shape.images,
    minimumOrderQuantity: shape.minimumOrderQuantity,
    availabilityStatus: shape.availabilityStatus,
    warrantyInformation: shape.warrantyInformation,
    shippingInformation: shape.shippingInformation,
    returnPolicy: shape.returnPolicy,
    tags: shape.tags,
    raw: shape.raw ?? response ?? payload,
    adminMeta: {
      origin: normalizeText(meta.source, baseProduct.source ?? 'remote'),
      localId: normalizeText(meta.localId, baseProduct.localId ?? ''),
      remoteId: normalizeText(meta.remoteId, baseProduct.remoteId ?? ''),
      createdAt: normalizeText(meta.createdAt, shape.createdAt),
      updatedAt: normalizeText(meta.updatedAt, shape.updatedAt),
      priceMode: normalizeText(meta.priceMode, 'vnd'),
    },
  }
}

function normalizeAddedProductResponse(response, payload = {}) {
  const localId = normalizeText(payload.localId ?? response?.localId, buildLocalProductId())
  const remoteId = normalizeText(response?.id ?? response?.remoteId ?? payload.remoteId, '')
  const createdAt = normalizeText(response?.createdAt ?? response?.meta?.createdAt ?? payload.createdAt, new Date().toISOString())
  const updatedAt = normalizeText(response?.updatedAt ?? response?.meta?.updatedAt ?? payload.updatedAt, createdAt)
  const baseProduct = {
    id: localId,
    localId,
    remoteId,
    source: 'local',
    sku: payload.sku,
    name: payload.title,
    image: payload.thumbnail,
    category: payload.category,
    brand: payload.brand,
    price: payload.price,
    stock: payload.stock,
    status: payload.status,
    createdAt,
    updatedAt,
    rating: payload.rating,
    discountPercentage: payload.discountPercentage,
    description: payload.description,
    thumbnail: payload.thumbnail,
    images: payload.images,
    minimumOrderQuantity: payload.minimumOrderQuantity,
    availabilityStatus: payload.availabilityStatus,
    warrantyInformation: payload.warrantyInformation,
    shippingInformation: payload.shippingInformation,
    returnPolicy: payload.returnPolicy,
    tags: payload.tags,
    raw: {
      ...payload,
      id: remoteId || localId,
      createdAt,
      updatedAt,
    },
  }

  return normalizeProductSnapshot(baseProduct, payload, response, {
    source: 'local',
    localId,
    remoteId,
    createdAt,
    updatedAt,
  })
}

function normalizeUpdatedProductResponse(product, response, payload = {}) {
  const source = normalizeText(product?.source, 'remote')

  if (source === 'local') {
    const localId = normalizeText(product?.localId ?? product?.id, buildLocalProductId())
    const remoteId = normalizeText(product?.remoteId, '')
    const responseLike = {
      ...(product?.raw && typeof product.raw === 'object' ? product.raw : {}),
      ...payload,
      ...(response && typeof response === 'object' ? response : {}),
      id: localId,
      localId,
      remoteId,
    }
    const baseProduct = {
      ...product,
      id: localId,
      localId,
      remoteId,
      source: 'local',
    }

    return normalizeProductSnapshot(baseProduct, payload, responseLike, {
      source: 'local',
      localId,
      remoteId,
      createdAt: normalizeText(response?.createdAt ?? product?.createdAt, product?.createdAt ?? new Date().toISOString()),
      updatedAt: normalizeText(response?.updatedAt ?? payload.updatedAt, new Date().toISOString()),
    })
  }

  const remoteId = normalizeText(product?.remoteId ?? product?.id, normalizeText(response?.id ?? payload.id, ''))
  const localId = normalizeText(product?.localId, '')
  const baseProduct = {
    ...product,
    id: remoteId || product?.id,
    localId,
    remoteId,
    source: 'remote',
  }

  return normalizeProductSnapshot(baseProduct, payload, response, {
    source: 'remote',
    localId,
    remoteId,
    createdAt: normalizeText(response?.createdAt ?? product?.createdAt, product?.createdAt ?? new Date().toISOString()),
    updatedAt: normalizeText(response?.updatedAt ?? payload.updatedAt, new Date().toISOString()),
  })
}

export async function getProducts(options = {}) {
  try {
    const store = readAdminProductStore()
    const remoteProducts = await loadRemoteProducts()
    const mappedProducts = remoteProducts
      .map((product, index) => mapRemoteProduct(product, index, { priceMode: 'remote' }))
      .filter(Boolean)
    const finalProducts = removeDeletedProducts(
      mergeAdminProducts(mappedProducts.length ? mappedProducts : cloneFallbackProducts(), store),
      store.deletedIds,
    )

    return filterProducts(finalProducts, options)
  } catch (error) {
    console.warn('getProducts fallback to mock data', error)
    const store = readAdminProductStore()
    return filterProducts(removeDeletedProducts(mergeAdminProducts(cloneFallbackProducts(), store), store.deletedIds), options)
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
    const [categoryObjectsResponse, categoryListResponse] = await Promise.all([
      fetchDummyJsonProductCategories(),
      fetchDummyJsonProductCategoryList(),
    ])

    const mergedCategories = mergeCategorySources(
      Array.isArray(categoryObjectsResponse) ? categoryObjectsResponse : [],
      Array.isArray(categoryListResponse) ? categoryListResponse : [],
    )

    return mapApiCategoriesToCategoryItems(mergedCategories).map((item) => ({
      ...item,
      sidebarLabel: formatAdminCategoryLabel(item.key ?? item.sidebarLabel, item.sidebarLabel),
      stripLabel: formatAdminCategoryLabel(item.key ?? item.stripLabel, item.stripLabel),
    }))
  } catch (error) {
    console.warn('getProductCategories fallback to mock data', error)
    const fallbackCategories = Array.from(new Set(mockProducts.map((product) => product.category))).filter(Boolean).map((category) => ({
      slug: category,
      name: category,
    }))

    return mapApiCategoriesToCategoryItems(fallbackCategories).map((item) => ({
      ...item,
      sidebarLabel: formatAdminCategoryLabel(item.key ?? item.sidebarLabel, item.sidebarLabel),
      stripLabel: formatAdminCategoryLabel(item.key ?? item.stripLabel, item.stripLabel),
    }))
  }
}

export function getProductCategoryLabel(category) {
  return resolveCategoryLabel(category)
}

export async function addProduct(payload = {}) {
  try {
    const response = await addDummyJsonProduct(payload)
    const normalized = normalizeAddedProductResponse(response, payload)

    if (!normalized) {
      throw new Error('Không thể chuẩn hóa sản phẩm vừa thêm.')
    }

    addLocalProduct(normalized)
    return normalized
  } catch (error) {
    console.warn('addProduct failed', error)
    throw error
  }
}

export async function updateProduct(product, payload = {}) {
  const sourceProduct = product && typeof product === 'object' ? product : null

  if (!sourceProduct) {
    throw new Error('Không tìm thấy sản phẩm cần cập nhật.')
  }

  if (normalizeText(sourceProduct.source, 'remote') === 'local') {
    const updatedSnapshot = normalizeUpdatedProductResponse(sourceProduct, sourceProduct.raw ?? sourceProduct, payload)

    if (!updatedSnapshot) {
      throw new Error('Không thể chuẩn hóa sản phẩm sau khi cập nhật.')
    }

    updateLocalProduct(updatedSnapshot)
    return updatedSnapshot
  }

  const remoteId = normalizeText(sourceProduct.remoteId || sourceProduct.id, '')

  if (!remoteId) {
    throw new Error('Sản phẩm này chưa có mã để cập nhật trên DummyJSON.')
  }

  const response = await updateDummyJsonProduct(remoteId, payload)
  const normalized = normalizeUpdatedProductResponse(sourceProduct, response, payload)

  if (!normalized) {
    throw new Error('Không thể chuẩn hóa sản phẩm vừa cập nhật.')
  }

  saveProductOverride(normalized)
  return normalized
}

export async function deleteProduct(product) {
  const sourceProduct = product && typeof product === 'object' ? product : null

  if (!sourceProduct) {
    throw new Error('Không tìm thấy sản phẩm cần xóa.')
  }

  const source = normalizeText(sourceProduct.source, 'remote')

  if (source === 'local') {
    const localId = normalizeText(sourceProduct.localId || sourceProduct.id)

    if (!localId) {
      throw new Error('Sản phẩm này chưa có mã local để xóa.')
    }

    deleteLocalProduct(localId)
    return sourceProduct
  }

  const remoteId = normalizeText(sourceProduct.remoteId || sourceProduct.id)

  if (!remoteId) {
    throw new Error('Sản phẩm này chưa có mã để xóa trên DummyJSON.')
  }

  await deleteDummyJsonProduct(remoteId)
  markProductDeleted(remoteId)
  return sourceProduct
}
