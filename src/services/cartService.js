import { formatCurrency } from '../utils/currency'
import { getAuthUser } from '../utils/authStorage'
import { getItem, setItem } from '../storage/localStorage.js'
import { fetchSharedCart, saveSharedCart } from './accountDataApi'

const CART_STORAGE_PREFIX = 'techstore_cart'

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeQuantity(value) {
  const quantity = Number(value)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1
  }

  return Math.max(1, Math.round(quantity))
}

function normalizePrice(value, { alreadyConverted = false } = {}) {
  const price = Number(value)
  if (!Number.isFinite(price) || Number.isNaN(price)) {
    return 0
  }

  return alreadyConverted ? Math.round(price) : Math.round(price * 25000)
}

function normalizeStock(value) {
  const stock = Number(value)

  if (!Number.isFinite(stock) || stock <= 0) {
    return null
  }

  return Math.max(1, Math.floor(stock))
}

function mergeStock(leftStock, rightStock) {
  const left = normalizeStock(leftStock)
  const right = normalizeStock(rightStock)

  if (left === null) {
    return right
  }

  if (right === null) {
    return left
  }

  return Math.min(left, right)
}

function getUserScope(user = getAuthUser()) {
  const email = normalizeText(user?.email, '').toLowerCase()
  const id = normalizeText(user?.id, '')
  const username = normalizeText(user?.username, '').toLowerCase()

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

export function getCartStorageKey(user = getAuthUser()) {
  return `${CART_STORAGE_PREFIX}_${getUserScope(user)}`
}

function toCartItem(product, quantity = 1, index = 0) {
  const source = product?.product && typeof product.product === 'object' ? product.product : product
  const alreadyConverted = Boolean(product?.priceText || source?.priceText)
  const normalizedPrice = normalizePrice(source?.price ?? product?.price, { alreadyConverted })
  const name = normalizeText(source?.name ?? source?.title ?? product?.name ?? product?.title, 'Sản phẩm')

  return {
    id: source?.id ?? product?.id ?? `cart-item-${Date.now()}-${index}`,
    name,
    price: normalizedPrice,
    image: source?.image ?? source?.thumbnail ?? source?.images?.[0] ?? product?.image ?? product?.thumbnail ?? null,
    brand: normalizeText(source?.brand ?? product?.brand, ''),
    priceText: normalizeText(product?.priceText, formatCurrency(normalizedPrice)),
    stock: normalizeStock(source?.stock ?? product?.stock),
    quantity: normalizeQuantity(quantity ?? product?.quantity),
    variant: normalizeText(product?.variant, ''),
  }
}

function dedupeCartItems(items) {
  const mergedItems = new Map()

  for (const item of Array.isArray(items) ? items : []) {
    const normalizedItem = item && typeof item === 'object' ? item : null
    if (!normalizedItem) {
      continue
    }

    const key = String(normalizedItem.id)

    if (!mergedItems.has(key)) {
      mergedItems.set(key, normalizedItem)
      continue
    }

    const existingItem = mergedItems.get(key)
    const existingQuantity = normalizeQuantity(existingItem.quantity)
    const incomingQuantity = normalizeQuantity(normalizedItem.quantity)
    const nextStock = mergeStock(existingItem.stock, normalizedItem.stock)

    mergedItems.set(key, {
      ...existingItem,
      ...normalizedItem,
      stock: nextStock,
      // Khi cùng một sản phẩm xuất hiện 2 lần trong các nguồn cache,
      // chỉ giữ số lượng lớn hơn để tránh cộng dồn mỗi lần login/rehydrate.
      quantity: nextStock !== null ? Math.min(Math.max(existingQuantity, incomingQuantity), nextStock) : Math.max(existingQuantity, incomingQuantity),
    })
  }

  return [...mergedItems.values()]
}

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    return []
  }

  return dedupeCartItems(cartItems.map((item, index) => toCartItem(item, item?.quantity, index)))
}

function normalizeCartItemAgainstCatalog(item, catalogProduct = null) {
  const sourceProduct = catalogProduct?.source ?? catalogProduct
  const catalogAlreadyConverted = Boolean(catalogProduct?.priceText || sourceProduct?.priceText)
  const normalizedPrice = normalizePrice(sourceProduct?.price ?? item?.price, { alreadyConverted: catalogAlreadyConverted })
  const stock = normalizeStock(sourceProduct?.stock ?? item?.stock)
  const quantity = normalizeQuantity(item?.quantity)

  return {
    ...item,
    id: sourceProduct?.id ?? item?.id,
    name: normalizeText(sourceProduct?.name ?? sourceProduct?.title ?? item?.name ?? item?.title, 'Sản phẩm'),
    price: normalizedPrice,
    image: sourceProduct?.image ?? sourceProduct?.thumbnail ?? sourceProduct?.images?.[0] ?? item?.image ?? item?.thumbnail ?? null,
    brand: normalizeText(sourceProduct?.brand ?? item?.brand, ''),
    priceText: normalizeText(item?.priceText, formatCurrency(normalizedPrice)),
    stock,
    quantity: stock !== null ? Math.min(quantity, stock) : quantity,
    source: sourceProduct ?? item?.source ?? null,
  }
}

function mergeCartCollections(...collections) {
  return normalizeCartItems(collections.flatMap((items) => (Array.isArray(items) ? items : [])))
}

export function syncCartItemsWithCatalog(cartItems, catalogProducts = []) {
  const normalizedItems = normalizeCartItems(cartItems)
  const catalogById = new Map(
    (Array.isArray(catalogProducts) ? catalogProducts : []).map((product) => [String(product?.id), product]),
  )

  return mergeCartCollections(
    normalizedItems.map((item) => normalizeCartItemAgainstCatalog(item, catalogById.get(String(item.id)))),
  )
}

export function loadCart(user = getAuthUser()) {
  const storedCart = getItem(getCartStorageKey(user), [])
  return normalizeCartItems(storedCart)
}

export async function syncCartFromRemote(user = getAuthUser()) {
  const userEmail = String(user?.email ?? '').trim().toLowerCase()

  if (!userEmail) {
    return loadCart(null)
  }

  const localCart = loadCart(user)
  let remoteCart = null

  try {
    remoteCart = await fetchSharedCart(userEmail)
  } catch (error) {
    console.error('cartService fetchSharedCart failed', error)
  }

  const nextItems = Array.isArray(remoteCart) ? normalizeCartItems(remoteCart) : localCart

  setItem(getCartStorageKey(user), nextItems)

  return nextItems
}

export async function persistCartToBackend(user = getAuthUser(), cart = []) {
  const normalizedCart = normalizeCartItems(cart)
  const userEmail = String(user?.email ?? '').trim().toLowerCase()

  if (!userEmail) {
    return normalizedCart
  }

  await saveSharedCart(userEmail, normalizedCart)
  return normalizedCart
}

export function saveCart(cart, user = getAuthUser()) {
  const normalizedCart = normalizeCartItems(cart)
  const userEmail = String(user?.email ?? '').trim().toLowerCase()

  setItem(getCartStorageKey(user), normalizedCart)

  if (!userEmail) {
    return normalizedCart
  }

  void saveSharedCart(userEmail, normalizedCart).catch((error) => {
    console.error('cartService saveSharedCart failed', error)
  })

  return normalizedCart
}

export function calculateCartTotals(cartItems) {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
}
