import { API_BASE_URL } from '../config/api'
import { formatCurrency } from '../utils/currency'
import { getAuthUser } from '../utils/authStorage'
import { getItem, removeItem, setItem } from '../storage/localStorage.js'

const CART_STORAGE_PREFIX = 'techstore_cart'
const CART_REMOTE_ID_PREFIX = 'techstore_cart_remote_id'
const DEFAULT_API_BASE_URL = 'https://dummyjson.com'

function getRemoteBaseUrl() {
  return String(API_BASE_URL ?? '').trim().replace(/\/+$/, '') || DEFAULT_API_BASE_URL
}

function hasRemoteApi() {
  return Boolean(getRemoteBaseUrl())
}

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

function getRemoteCartIdKey(user = getAuthUser()) {
  return `${CART_REMOTE_ID_PREFIX}_${getUserScope(user)}`
}

function readRemoteCartId(user = getAuthUser()) {
  return normalizeText(getItem(getRemoteCartIdKey(user), ''), '')
}

function writeRemoteCartId(user, cartId) {
  const normalizedCartId = normalizeText(cartId, '')
  const key = getRemoteCartIdKey(user)

  if (normalizedCartId) {
    setItem(key, normalizedCartId)
  } else {
    removeItem(key)
  }
}

function buildRemoteUrl(path = '') {
  const baseUrl = getRemoteBaseUrl()
  return `${baseUrl}${path}`
}

async function tryParseJson(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
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

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    return []
  }

  return cartItems.map((item, index) => toCartItem(item, item?.quantity, index))
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

export function syncCartItemsWithCatalog(cartItems, catalogProducts = []) {
  const normalizedItems = normalizeCartItems(cartItems)
  const catalogById = new Map(
    (Array.isArray(catalogProducts) ? catalogProducts : []).map((product) => [String(product?.id), product]),
  )

  return normalizedItems.map((item) => normalizeCartItemAgainstCatalog(item, catalogById.get(String(item.id))))
}

function getProductsPayload(cartItems) {
  return cartItems.map((item) => ({
    id: item.id,
    quantity: normalizeQuantity(item.quantity),
  }))
}

function getRemoteCartPaths(userId) {
  const normalizedUserId = encodeURIComponent(String(userId))
  return [`/carts/user/${normalizedUserId}`, `/users/${normalizedUserId}/carts`]
}

async function requestJson(path, config = {}) {
  const response = await fetch(buildRemoteUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(config.headers ?? {}),
    },
    ...config,
  })

  const data = await tryParseJson(response)
  return { response, data }
}

function extractRemoteCart(data) {
  if (!data) {
    return null
  }

  if (Array.isArray(data)) {
    return data[0] ?? null
  }

  if (Array.isArray(data.carts)) {
    return data.carts[0] ?? null
  }

  if (data.cart && typeof data.cart === 'object') {
    return data.cart
  }

  if (data.id && Array.isArray(data.products)) {
    return data
  }

  return null
}

async function fetchRemoteCart(userId) {
  for (const path of getRemoteCartPaths(userId)) {
    try {
      const { response, data } = await requestJson(path)
      if (!response.ok) {
        continue
      }

      const remoteCart = extractRemoteCart(data)
      if (remoteCart) {
        return remoteCart
      }
    } catch (error) {
      console.error('cartService fetchRemoteCart failed', error)
    }
  }

  return null
}

function resolveRemoteCartId(remoteCart) {
  return normalizeText(remoteCart?.id ?? remoteCart?.cartId ?? '', '')
}

async function persistRemoteCart(user, cartItems) {
  const userId = user?.id
  if (!userId || !hasRemoteApi()) {
    return null
  }

  try {
    if (cartItems.length === 0) {
      const existingCartId = readRemoteCartId(user) || resolveRemoteCartId(await fetchRemoteCart(userId))
      if (!existingCartId) {
        return null
      }

      const { response } = await requestJson(`/carts/${encodeURIComponent(existingCartId)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        writeRemoteCartId(user, '')
      }

      return null
    }

    const existingCartId = readRemoteCartId(user) || resolveRemoteCartId(await fetchRemoteCart(userId))
    const payload = {
      userId,
      products: getProductsPayload(cartItems),
    }

    if (existingCartId) {
      const { response, data } = await requestJson(`/carts/${encodeURIComponent(existingCartId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const nextCartId = resolveRemoteCartId(data) || existingCartId
        writeRemoteCartId(user, nextCartId)
        return data
      }
    } else {
      const { response, data } = await requestJson('/carts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        writeRemoteCartId(user, resolveRemoteCartId(data))
        return data
      }
    }
  } catch (error) {
    console.error('cartService persistRemoteCart failed', error)
  }

  return null
}

export function loadCart(user = getAuthUser()) {
  const storedCart = getItem(getCartStorageKey(user), [])
  return normalizeCartItems(storedCart)
}

export async function syncCartFromRemote(user = getAuthUser()) {
  const localCart = loadCart(user)
  const userId = user?.id

  if (!userId || !hasRemoteApi()) {
    return localCart
  }

  const remoteCart = await fetchRemoteCart(userId)
  if (!remoteCart) {
    return localCart
  }

  const remoteItems = normalizeCartItems(remoteCart.products ?? [])
  setItem(getCartStorageKey(user), remoteItems)
  writeRemoteCartId(user, resolveRemoteCartId(remoteCart))
  return remoteItems
}

export function saveCart(cart, user = getAuthUser()) {
  const normalizedCart = normalizeCartItems(cart)
  setItem(getCartStorageKey(user), normalizedCart)
  void persistRemoteCart(user, normalizedCart)
  return normalizedCart
}

export function calculateCartTotals(cartItems) {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
}
