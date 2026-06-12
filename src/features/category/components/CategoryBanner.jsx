import { ArrowRight, Tag } from 'lucide-react'

export function CategoryBanner({ label, description, productCount, brandCount }) {
  return (
    <section className="category-banner">
      <div className="category-banner__copy">
        <span className="category-banner__eyebrow">
          <Tag size={14} />
          Danh mục sản phẩm
        </span>
        <h1>{label}</h1>
        <p>{description}</p>
      </div>

      <div className="category-banner__stats" aria-label="Thông tin danh mục">
        <div className="category-banner__stat">
          <strong>{productCount}</strong>
          <span>Sản phẩm</span>
        </div>
        <div className="category-banner__stat">
          <strong>{brandCount}</strong>
          <span>Thương hiệu</span>
        </div>
        <div className="category-banner__cta">
          <span>Xem chi tiết danh mục</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </section>
  )
}
