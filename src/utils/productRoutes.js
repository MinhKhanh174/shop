import { ROUTES } from '../constants/routes'

export function normalizeProductSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getProductSlug(product) {
  if (!product) {
    return ''
  }

  const sourceSlug = product.slug ?? product.source?.slug ?? product.handle ?? product.source?.handle
  if (sourceSlug) {
    return normalizeProductSlug(sourceSlug)
  }

  const candidate = product.name ?? product.title ?? product.source?.title ?? product.source?.name ?? product.id
  return normalizeProductSlug(candidate)
}

export function getProductDetailPath(product) {
  const slug = getProductSlug(product)
  return slug ? ROUTES.PRODUCTS + `/${encodeURIComponent(slug)}` : ROUTES.PRODUCTS
}

export function findProductBySlug(products, slug) {
  const normalizedSlug = normalizeProductSlug(slug)
  if (!normalizedSlug) {
    return null
  }

  return (Array.isArray(products) ? products : []).find((product) => {
    const productSlug = getProductSlug(product)
    return normalizeProductSlug(productSlug) === normalizedSlug || String(product.id) === String(slug)
  }) ?? null
}
