import { getItem, setItem } from '../../storage/localStorage.js'
import {
  formatAdminAvailabilityStatus,
  formatAdminCategoryLabel,
  formatAdminStatus,
} from '../utils/adminDisplayMapper.js'

const ADMIN_PRODUCTS_KEY = 'techstore_admin_products_v1'
const ADMIN_PRODUCTS_VERSION = 1

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeIdList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  return []
}

function buildFallbackId(prefix = 'adm') {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${timestamp}_${randomPart}`
}

function normalizeCatalogPrice(value, source = 'local', priceMode = '') {
  const price = Number(value)

  if (!Number.isFinite(price)) {
    return 0
  }

  const normalizedPriceMode = normalizeText(priceMode, '')

  if (normalizedPriceMode === 'remote' || (source === 'remote' && normalizedPriceMode !== 'vnd' && price > 0 && price < 1000)) {
    return Math.round(price * 25000)
  }

  return Math.round(price)
}

function calculateDiscountedPrice(originalPrice, discountPercentage = 0) {
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

function normalizeAdminStatus(value, fallback = 'active') {
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

  if (normalized.includes('đang bán') || normalized.includes('dang ban') || normalized.includes('in stock')) {
    return 'active'
  }

  if (
    normalized.includes('ngừng bán') ||
    normalized.includes('ngung ban') ||
    normalized.includes('out of stock') ||
    normalized.includes('inactive')
  ) {
    return 'inactive'
  }

  return normalizeText(fallback, 'active')
}

function resolveCategoryLabel(category) {
  return formatAdminCategoryLabel(category, normalizeText(category, 'Danh mục khác'))
}

function normalizeAdminMeta(item, source, localId, remoteId, createdAt, updatedAt) {
  const rawMeta = item && typeof item.adminMeta === 'object' ? item.adminMeta : {}

  return {
    origin: normalizeText(rawMeta.origin, source),
    localId: normalizeText(rawMeta.localId, localId),
    remoteId: normalizeText(rawMeta.remoteId, remoteId),
    createdAt: normalizeText(rawMeta.createdAt, createdAt),
    updatedAt: normalizeText(rawMeta.updatedAt, updatedAt),
    priceMode: normalizeText(rawMeta.priceMode, ''),
  }
}

function normalizeStoreItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const source = normalizeText(item.source, 'local')
  const localId = normalizeText(item.localId, normalizeText(item.id, ''))
  const remoteId = normalizeText(item.remoteId, '')
  const createdAt = normalizeText(item.createdAt, new Date().toISOString())
  const updatedAt = normalizeText(item.updatedAt, createdAt)
  const category = normalizeText(item.category, 'unknown')
  const name = normalizeText(item.name ?? item.title, 'Sản phẩm chưa đặt tên')
  const image = normalizeText(item.image ?? item.thumbnail ?? item.raw?.thumbnail ?? '', '')
  const sku = normalizeText(item.sku, `ADM-${normalizeText(localId || remoteId || buildFallbackId()).toUpperCase()}`)
  const id = normalizeText(item.id, localId || remoteId || buildFallbackId())
  const adminMeta = normalizeAdminMeta(item, source, localId, remoteId, createdAt, updatedAt)
  const discountPercentage = normalizeNumber(item.discountPercentage ?? item.raw?.discountPercentage, 0)
  const originalPrice = normalizeCatalogPrice(
    item.originalPrice ??
      item.raw?.originalPrice ??
      deriveOriginalPriceFromCurrentPrice(item.price ?? item.raw?.price, discountPercentage),
    source,
    adminMeta.priceMode,
  )
  const price = calculateDiscountedPrice(originalPrice, discountPercentage)

  return {
    id,
    localId,
    remoteId,
    source,
    sku,
    name,
    image,
    category,
    categoryLabel: normalizeText(item.categoryLabel, resolveCategoryLabel(category)),
    brand: normalizeText(item.brand, 'Khác'),
    originalPrice,
    price,
    stock: normalizeNumber(item.stock, 0),
    status: normalizeAdminStatus(item.status ?? item.availabilityStatus),
    availabilityStatus: normalizeText(
      item.availabilityStatus ?? item.status,
      formatAdminAvailabilityStatus(item.availabilityStatus ?? item.status, ''),
    ),
    createdAt,
    updatedAt,
    rating: normalizeNumber(item.rating, 0),
    discountPercentage,
    description: normalizeText(item.description, ''),
    adminMeta,
    raw: item.raw ?? item,
  }
}

function normalizeStoreCollection(items) {
  return Array.isArray(items) ? items.map(normalizeStoreItem).filter(Boolean) : []
}

function normalizeDeletedIds(ids) {
  return normalizeIdList(ids)
}

function readStoreEnvelope() {
  const envelope = getItem(ADMIN_PRODUCTS_KEY, null)

  if (!envelope || typeof envelope !== 'object') {
    return {
      version: ADMIN_PRODUCTS_VERSION,
      items: [],
      overrides: [],
      deletedIds: [],
      updatedAt: '',
    }
  }

  return {
    version: normalizeNumber(envelope.version, ADMIN_PRODUCTS_VERSION),
    items: normalizeStoreCollection(envelope.items),
    overrides: normalizeStoreCollection(envelope.overrides),
    deletedIds: normalizeDeletedIds(envelope.deletedIds),
    updatedAt: normalizeText(envelope.updatedAt, ''),
  }
}

function writeStoreEnvelope(nextStore) {
  const store = nextStore && typeof nextStore === 'object' ? nextStore : {}
  const nextEnvelope = {
    version: ADMIN_PRODUCTS_VERSION,
    items: normalizeStoreCollection(store.items),
    overrides: normalizeStoreCollection(store.overrides),
    deletedIds: normalizeDeletedIds(store.deletedIds),
    updatedAt: new Date().toISOString(),
  }

  setItem(ADMIN_PRODUCTS_KEY, nextEnvelope)
  return nextEnvelope
}

function upsertByKeys(collection, product, keyFields = ['localId', 'remoteId', 'id']) {
  const nextProduct = normalizeStoreItem(product)

  if (!nextProduct) {
    return {
      collection: Array.isArray(collection) ? collection : [],
      product: null,
    }
  }

  const sourceCollection = Array.isArray(collection) ? collection.map(normalizeStoreItem).filter(Boolean) : []
  const keys = keyFields.map((key) => normalizeText(nextProduct[key], '')).filter(Boolean)
  const nextCollection = [nextProduct, ...sourceCollection.filter((item) => !keyFields.some((key) => keys.includes(normalizeText(item[key], ''))))]

  return {
    collection: nextCollection,
    product: nextProduct,
  }
}

function resolveStoreInput(storeOrItems = null) {
  if (Array.isArray(storeOrItems)) {
    return {
      items: storeOrItems,
      overrides: [],
      deletedIds: [],
    }
  }

  if (storeOrItems && typeof storeOrItems === 'object' && ('items' in storeOrItems || 'overrides' in storeOrItems || 'deletedIds' in storeOrItems)) {
    return {
      items: Array.isArray(storeOrItems.items) ? storeOrItems.items : [],
      overrides: Array.isArray(storeOrItems.overrides) ? storeOrItems.overrides : [],
      deletedIds: Array.isArray(storeOrItems.deletedIds) ? storeOrItems.deletedIds : [],
    }
  }

  return readStoreEnvelope()
}

export function getAdminProductsLocalKey() {
  return ADMIN_PRODUCTS_KEY
}

export function readAdminProductStore() {
  return readStoreEnvelope()
}

export function writeAdminProductStore(store) {
  return writeStoreEnvelope(store)
}

export function getAdminLocalProducts() {
  return readStoreEnvelope().items
}

export function saveAdminLocalProducts(items) {
  const currentStore = readStoreEnvelope()
  return writeStoreEnvelope({
    ...currentStore,
    items,
  })
}

export function addLocalProduct(product) {
  const currentStore = readStoreEnvelope()
  const { collection, product: nextProduct } = upsertByKeys(currentStore.items, product, ['localId', 'id'])

  writeStoreEnvelope({
    ...currentStore,
    items: collection,
  })

  return nextProduct
}

export function updateLocalProduct(product) {
  const currentStore = readStoreEnvelope()
  const { collection, product: nextProduct } = upsertByKeys(currentStore.items, product, ['localId', 'id'])

  writeStoreEnvelope({
    ...currentStore,
    items: collection,
  })

  return nextProduct
}

export function deleteLocalProduct(localId) {
  const currentStore = readStoreEnvelope()
  const normalizedLocalId = normalizeText(localId)

  if (!normalizedLocalId) {
    return null
  }

  const nextItems = currentStore.items.filter((item) => {
    const itemIds = [item.localId, item.id].map((value) => normalizeText(value)).filter(Boolean)
    return !itemIds.includes(normalizedLocalId)
  })

  writeStoreEnvelope({
    ...currentStore,
    items: nextItems,
  })

  return normalizedLocalId
}

export function markProductDeleted(id) {
  const currentStore = readStoreEnvelope()
  const normalizedId = normalizeText(id)

  if (!normalizedId) {
    return null
  }

  const nextDeletedIds = Array.from(new Set([...currentStore.deletedIds, normalizedId].filter(Boolean)))

  writeStoreEnvelope({
    ...currentStore,
    deletedIds: nextDeletedIds,
  })

  return normalizedId
}

export function isProductDeleted(product, deletedIds = []) {
  if (!product || typeof product !== 'object') {
    return false
  }

  const deletedSet = new Set(normalizeDeletedIds(deletedIds))
  const ids = [product.id, product.remoteId, product.localId].map((value) => normalizeText(value)).filter(Boolean)

  return ids.some((id) => deletedSet.has(id))
}

export function removeDeletedProducts(products, deletedIds = []) {
  const deletedSet = new Set(normalizeDeletedIds(deletedIds))

  if (!deletedSet.size) {
    return Array.isArray(products) ? products : []
  }

  return (Array.isArray(products) ? products : []).filter((product) => {
    if (!product || typeof product !== 'object') {
      return false
    }

    const ids = [product.id, product.remoteId, product.localId].map((value) => normalizeText(value)).filter(Boolean)
    return !ids.some((id) => deletedSet.has(id))
  })
}

export function saveProductOverride(product) {
  const currentStore = readStoreEnvelope()
  const { collection, product: nextProduct } = upsertByKeys(currentStore.overrides, product, ['remoteId', 'id'])

  writeStoreEnvelope({
    ...currentStore,
    overrides: collection,
  })

  return nextProduct
}

export function upsertAdminLocalProduct(product) {
  return addLocalProduct(product)
}

export function mergeAdminProducts(remoteProducts = [], storeOrItems = []) {
  const remoteItems = Array.isArray(remoteProducts) ? remoteProducts.map(normalizeStoreItem).filter(Boolean) : []
  const store = resolveStoreInput(storeOrItems)
  const localItems = normalizeStoreCollection(store.items)
  const overrideItems = normalizeStoreCollection(store.overrides)
  const deletedIds = normalizeDeletedIds(store.deletedIds)

  const overrideByKey = new Map()

  overrideItems.forEach((item) => {
    const keys = [item.remoteId, item.id].map((value) => normalizeText(value)).filter(Boolean)

    keys.forEach((key) => {
      overrideByKey.set(key, item)
    })
  })

  const localKeys = new Set()

  localItems.forEach((item) => {
    const keys = [item.localId, item.remoteId, item.id].map((value) => normalizeText(value)).filter(Boolean)

    keys.forEach((key) => {
      localKeys.add(key)
    })
  })

  const mergedRemoteItems = remoteItems
    .map((item) => {
      const key = normalizeText(item.remoteId || item.id)
      return overrideByKey.get(key) ?? item
    })
    .filter((item) => {
      const keys = [item.id, item.remoteId].map((value) => normalizeText(value)).filter(Boolean)
      return !keys.some((key) => localKeys.has(key) || deletedIds.includes(key))
    })

  return [...localItems, ...mergedRemoteItems]
}
