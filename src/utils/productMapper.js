const accentPalette = [
  ['#0f172a', '#3b82f6'],
  ['#111827', '#f59e0b'],
  ['#111827', '#14b8a6'],
  ['#c2410c', '#fb923c'],
  ['#0f172a', '#84cc16'],
  ['#2d163e', '#a855f7'],
]

const typeByCategory = {
  smartphones: 'phone',
  tablets: 'tablet',
  'mobile-accessories': 'speaker',
  'mens-watches': 'watch',
  'womens-watches': 'watch',
  laptops: 'laptop',
}

const familyByCategory = {
  smartphones: 'phone',
  tablets: 'tablet',
  laptops: 'laptop',
  headphones: 'audio',
  speakers: 'audio',
  'mobile-accessories': 'accessories',
  'computer-accessories': 'accessories',
  'mens-watches': 'watch',
  'womens-watches': 'watch',
}

const colorPalette = ['white', 'black', 'gray', 'blue', 'red']

const selectedBrands = ['Apple', 'Samsung', 'Oppo', 'Xiaomi']
const techCategories = new Set([
  'smartphones',
  'tablets',
  'laptops',
  'mobile-accessories',
  'mens-watches',
  'womens-watches',
  'headphones',
  'speakers',
  'computer-accessories',
])

function pickAccent(seed) {
  if (!seed) {
    return accentPalette[0]
  }

  const normalized = String(seed).toLowerCase()
  const sum = normalized.split('').reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)

  return accentPalette[sum % accentPalette.length]
}

function pickColorKey(seed) {
  if (!seed) {
    return colorPalette[0]
  }

  const normalized = String(seed).toLowerCase()
  const sum = normalized.split('').reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)

  return colorPalette[sum % colorPalette.length]
}

function formatMoney(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return value < 1000 ? Math.round(value * 25000) : Math.round(value)
}

export function mapApiProductToCard(product, overrides = {}) {
  const accent = overrides.accent ?? pickAccent(product.brand ?? product.category)
  const price = overrides.price ?? formatMoney(product.price)
  const oldPrice =
    overrides.oldPrice ??
    (typeof product.discountPercentage === 'number' && product.discountPercentage > 0
      ? Math.round(price / (1 - product.discountPercentage / 100))
      : undefined)

  return {
    id: overrides.id ?? String(product.id),
    brand: product.brand ?? overrides.brand ?? 'DummyJSON',
    name: product.title ?? overrides.name ?? 'Sản phẩm',
    price,
    oldPrice,
    badge:
      overrides.badge ??
      (typeof product.discountPercentage === 'number' && product.discountPercentage > 0
        ? `-${Math.round(product.discountPercentage)}%`
        : null),
    label: overrides.label ?? 'Trả góp 0%',
    perk:
      overrides.perk ??
      overrides.label ??
      (typeof product.discountPercentage === 'number' && product.discountPercentage > 0
        ? 'Trả góp 0%'
        : ''),
    accent,
    type: overrides.type ?? typeByCategory[product.category] ?? 'phone',
    family: overrides.family ?? familyByCategory[product.category] ?? 'other',
    colorKey: overrides.colorKey ?? pickColorKey(`${product.brand ?? ''}-${product.category ?? ''}-${product.title ?? ''}`),
    image: overrides.image ?? product.thumbnail ?? product.images?.[0] ?? null,
    secondaryImage: overrides.secondaryImage ?? product.images?.[1] ?? null,
    category: product.category,
    stock: product.stock,
    rating: product.rating,
    source: product,
  }
}

export function mapProductsToCards(products, options = {}) {
  return products.map((product) => mapApiProductToCard(product, options))
}

export function filterProductsBySupportedBrand(products) {
  return products.filter((product) => selectedBrands.includes(product.brand))
}

export function filterTechProducts(products) {
  return products.filter((product) => techCategories.has(product.category))
}

export function getRemoteBrands(products) {
  const brands = products
    .map((product) => product.brand)
    .filter(Boolean)

  return selectedBrands.filter((brand) => brands.includes(brand))
}
