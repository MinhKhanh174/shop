function pickImage(product) {
  return product?.thumbnail ?? product?.images?.[0] ?? null
}

function findFirst(products, predicate) {
  return products.find(predicate) ?? null
}

function findWatch(products) {
  return (
    findFirst(
      products,
      (product) => product.category === 'mens-watches' || product.category === 'womens-watches',
    ) ?? null
  )
}

export function buildBannerAssets(remoteProducts = []) {
  const products = Array.isArray(remoteProducts) ? remoteProducts : []

  // Get products with images from API
  const productsWithImages = products.filter((product) => pickImage(product))

  // Use first 3 products with images for hero banner
  const heroProducts = productsWithImages.slice(0, 3)

  // Use next 3 products with images for wide banner
  const wideProducts = productsWithImages.slice(3, 6)

  // Use first watch product if available, otherwise use any product
  const watchProduct = findWatch(products) ?? productsWithImages[0] ?? null

  return {
    heroImages: heroProducts.map((product) => pickImage(product)),
    wideImages: wideProducts.map((product) => pickImage(product)),
    watchImage: pickImage(watchProduct),
  }
}
