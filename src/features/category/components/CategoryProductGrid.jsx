import { ProductCard } from '../../../shared/ui/ProductCard'

export function CategoryProductGrid({ products = [] }) {
  return (
    <div className="category-product-grid" aria-label="Danh sách sản phẩm">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact />
      ))}
    </div>
  )
}
