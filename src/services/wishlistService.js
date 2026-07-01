import { getItem, removeItem, setItem } from '../storage/localStorage.js'
import { getAuthUser } from '../utils/authStorage'
import { mapApiProductToCard } from '../utils/productMapper.js'
import { fetchSharedWishlist, saveSharedWishlist } from './accountDataApi'

const WISHLIST_KEY_PREFIX = 'techstore_wishlist_'
const PENDING_WISHLIST_KEY = 'techstore_wishlist_pending'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizePrice(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return numericValue < 1000 ? Math.round(numericValue * 25000) : Math.round(numericValue)
}

function getUserScope(user) {
  const email = normalizeText(user?.email).toLowerCase()
  const id = normalizeText(user?.id)
  const username = normalizeText(user?.username).toLowerCase()

  if (email) {
    return email
  }

  if (id) {
    return `id_${id}`
  }

  if (username) {
    return username
  }

  return 'guest'
}

export function getWishlistStorageKey(user = getAuthUser()) {
  return `${WISHLIST_KEY_PREFIX}${getUserScope(user)}`
}

export function getPendingWishlistStorageKey() {
  return PENDING_WISHLIST_KEY
}

export function normalizeWishlistProduct(product, index = 0) {
  if (!product || typeof product !== 'object') {
    return null
  }

  const source = product.source && typeof product.source === 'object' ? product.source : product
  const id = normalizeText(product.id ?? source.id ?? `wishlist-${Date.now()}-${index}`)

  if (!id) {
    return null
  }

  const normalizedName = normalizeText(product.name ?? product.title ?? source.title ?? source.name)
  const normalizedBrand = normalizeText(product.brand ?? source.brand)
  const normalizedCategory = normalizeText(product.category ?? source.category)
  const normalizedType = normalizeText(product.type)
  const normalizedFamily = normalizeText(product.family)
  const normalizedColorKey = normalizeText(product.colorKey)
  const normalizedBadge = normalizeText(product.badge)
  const normalizedLabel = normalizeText(product.label)
  const normalizedPerk = normalizeText(product.perk)
  const normalizedAccent = normalizeText(product.accent)
  const normalizedImage = normalizeText(product.image ?? product.thumbnail ?? source.thumbnail ?? source.images?.[0])
  const normalizedSecondaryImage = normalizeText(product.secondaryImage ?? source.images?.[1])
  const normalizedOldPrice = Number.isFinite(Number(product.oldPrice)) ? Math.round(Number(product.oldPrice)) : undefined
  const normalizedPrice = normalizePrice(product.price ?? source.price)

  const card = mapApiProductToCard(source, {
    id,
    ...(normalizedName ? { name: normalizedName } : {}),
    ...(normalizedBrand ? { brand: normalizedBrand } : {}),
    ...(normalizedCategory ? { category: normalizedCategory } : {}),
    price: normalizedPrice,
    ...(typeof normalizedOldPrice === 'number' ? { oldPrice: normalizedOldPrice } : {}),
    ...(normalizedBadge ? { badge: normalizedBadge } : {}),
    ...(normalizedLabel ? { label: normalizedLabel } : {}),
    ...(normalizedPerk ? { perk: normalizedPerk } : {}),
    ...(normalizedAccent ? { accent: normalizedAccent } : {}),
    ...(normalizedType ? { type: normalizedType } : {}),
    ...(normalizedFamily ? { family: normalizedFamily } : {}),
    ...(normalizedColorKey ? { colorKey: normalizedColorKey } : {}),
    ...(normalizedImage ? { image: normalizedImage } : {}),
    ...(normalizedSecondaryImage ? { secondaryImage: normalizedSecondaryImage } : {}),
  })

  return {
    ...card,
    favoritedAt: product.favoritedAt ?? new Date().toISOString(),
  }
}

function dedupeWishlistItems(items) {
  const seen = new Set()

  return items.filter((item) => {
    const key = String(item?.id ?? '').trim()
    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function normalizeWishlistItems(items) {
  return dedupeWishlistItems(
    Array.isArray(items)
      ? items
          .map((item, index) => normalizeWishlistProduct(item, index))
          .filter(Boolean)
      : [],
  )
}

export function loadWishlist(user = getAuthUser()) {
  if (!user) {
    return normalizeWishlistItems(getItem(getPendingWishlistStorageKey(), []))
  }

  const storedItems = getItem(getWishlistStorageKey(user), [])
  return normalizeWishlistItems(storedItems)
}

export function saveWishlist(items, user = getAuthUser()) {
  const normalizedItems = normalizeWishlistItems(items)
  const userEmail = String(user?.email ?? '').trim().toLowerCase()

  if (!userEmail) {
    setItem(getPendingWishlistStorageKey(), normalizedItems)
    return normalizedItems
  }

  setItem(getWishlistStorageKey(user), normalizedItems)
  void saveSharedWishlist(userEmail, normalizedItems).catch((error) => {
    console.error('wishlistService saveSharedWishlist failed', error)
  })

  return normalizedItems
}

export function queuePendingWishlistProduct(product) {
  const pendingItems = getItem(getPendingWishlistStorageKey(), [])
  const normalizedProduct = normalizeWishlistProduct(product)

  if (!normalizedProduct) {
    return normalizeWishlistItems(pendingItems)
  }

  const nextItems = normalizeWishlistItems([normalizedProduct, ...pendingItems])
  setItem(getPendingWishlistStorageKey(), nextItems)
  return nextItems
}

export function consumePendingWishlistProducts() {
  const pendingItems = normalizeWishlistItems(getItem(getPendingWishlistStorageKey(), []))
  removeItem(getPendingWishlistStorageKey())
  return pendingItems
}

export async function resolveWishlistForUser(user = getAuthUser()) {
  if (!user) {
    return loadWishlist(null)
  }

  const userEmail = String(user?.email ?? '').trim().toLowerCase()
  const currentItems = loadWishlist(user)
  let remoteItems = null

  if (userEmail) {
    try {
      remoteItems = await fetchSharedWishlist(userEmail)
    } catch (error) {
      console.error('wishlistService fetchSharedWishlist failed', error)
    }
  }

  const nextItems = Array.isArray(remoteItems) ? normalizeWishlistItems(remoteItems) : currentItems
  setItem(getWishlistStorageKey(user), nextItems)

  return nextItems
}

export async function persistWishlistToBackend(user = getAuthUser(), items = []) {
  const normalizedItems = normalizeWishlistItems(items)
  const userEmail = String(user?.email ?? '').trim().toLowerCase()

  if (!userEmail) {
    return normalizedItems
  }

  await saveSharedWishlist(userEmail, normalizedItems)
  return normalizedItems
}
