import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { CategoryProductGrid } from './CategoryProductGrid'

export function ViewedProductsSection({ products = [] }) {
  if (!products.length) {
    return null
  }

  return (
    <section className="category-viewed-products">
      <SectionHeading title="Sản phẩm đã xem" />
      <CategoryProductGrid products={products} />
    </section>
  )
}
