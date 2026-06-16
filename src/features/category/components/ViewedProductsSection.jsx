import { ProductRail } from '../../../shared/ui/ProductRail'

export function ViewedProductsSection({ products = [] }) {
  if (!products.length) {
    return null
  }

  return (
    <ProductRail title="Sản phẩm đã xem" products={products} className="category-viewed-products" />
  )
}
