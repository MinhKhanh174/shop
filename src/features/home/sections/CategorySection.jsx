import { useMemo } from 'react'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { mapProductsToCards } from '../../../utils/productMapper'
import { mapApiCategoriesToCategoryItems } from '../../../utils/categoryMapper'

export function CategorySection({ category, remoteProducts, allCategories = [] }) {
  const categoryKey = category.slug || category
  const categoryName = category.name || category

  const subcategories = useMemo(() => {
    const mappedCategories = mapApiCategoriesToCategoryItems(allCategories)
    return mappedCategories.filter((cat) => cat.key === categoryKey)
  }, [allCategories, categoryKey])

  const categoryProducts = useMemo(() => {
    const filtered = remoteProducts.filter((product) => product.category === categoryKey)
    return mapProductsToCards(filtered, {
      type: 'product',
      label: 'Còn hàng',
    })
  }, [remoteProducts, categoryKey])

  return (
    <section className="section" id={`category-${categoryKey}`}>
      <SectionHeading eyebrow={categoryName} title={categoryName.toUpperCase()} subcategories={subcategories} />

      <div className="product-showcase-grid">
        {categoryProducts.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>

      <div className="product-showcase-action">
        <button type="button" className="button button--ghost">
          Xem tất cả
        </button>
      </div>
    </section>
  )
}
