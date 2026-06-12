import { ProductCard } from '../../shared/ui/ProductCard'
import { SectionHeading } from '../../shared/ui/SectionHeading'

export function RelatedProductsSection({ title = 'Sản phẩm thường mua cùng', products = [] }) {
  if (!products.length) {
    return null
  }

  return (
    <section className="space-y-4">
      <SectionHeading title={title} />
      <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  )
}
