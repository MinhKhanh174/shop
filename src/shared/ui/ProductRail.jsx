import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from './ProductCard'

export function ProductRail({ title, products = [], itemsPerPage = 3, className = '' }) {
  const [pageIndex, setPageIndex] = useState(0)

  const pageCount = Math.max(1, Math.ceil(products.length / itemsPerPage))
  const currentPage = Math.min(pageIndex, pageCount - 1)
  const visibleProducts = useMemo(
    () => products.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage),
    [currentPage, itemsPerPage, products],
  )

  if (!products.length) {
    return null
  }

  const goPrev = () => {
    setPageIndex((current) => (current - 1 + pageCount) % pageCount)
  }

  const goNext = () => {
    setPageIndex((current) => (current + 1) % pageCount)
  }

  return (
    <section className={`product-rail ${className}`.trim()}>
      {title ? <h2 className="product-rail__title">{title}</h2> : null}
      <div className="product-rail__viewport">
        {pageCount > 1 ? (
          <button type="button" className="product-rail__arrow product-rail__arrow--left" onClick={goPrev} aria-label="Xem sản phẩm trước">
            <ChevronRight size={18} className="product-rail__nav-icon product-rail__nav-icon--left" />
          </button>
        ) : null}

        <div className="product-rail__grid">
          {visibleProducts.map((product) => (
            <div key={product.id} className="product-rail__card">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>

        {pageCount > 1 ? (
          <button type="button" className="product-rail__arrow product-rail__arrow--right" onClick={goNext} aria-label="Xem sản phẩm tiếp theo">
            <ChevronRight size={18} />
          </button>
        ) : null}
      </div>
    </section>
  )
}
