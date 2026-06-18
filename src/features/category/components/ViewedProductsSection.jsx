import { ProductRail } from '../../../shared/ui/ProductRail'
import { ProductCard } from '../../../shared/ui/ProductCard'

export function ViewedProductsSection({
  products = [],
  title = 'Sản phẩm đã xem',
  className = 'category-viewed-products',
  itemsPerPage = 4,
  variant = 'rail',
}) {
  if (!products.length) {
    return null
  }

  if (variant === 'grid') {
    return (
      <section className={`pd-related ${className}`.trim()}>
        {title ? <h2 className="pd-related__title">{title}</h2> : null}
        <div className="category-product-grid category-product-grid--detail pd-viewed-products__grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </section>
    )
  }

  return <ProductRail title={title} products={products} className={className} itemsPerPage={itemsPerPage} />
}
