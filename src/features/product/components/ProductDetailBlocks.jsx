import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatCurrency'
import { CopyCodeButton } from '../../../shared/ui/CopyCodeButton'
import { CouponConditionModal } from '../../../shared/ui/CouponConditionModal'

export function ProductSummaryStrip({
  product,
  image,
  colorOptions,
  storageOptions,
  selectedColorIndex,
  selectedStorageIndex,
  quantity,
  maxQuantity,
  oldPrice,
  discountPercentage,
  onColorChange,
  onStorageChange,
  onDecrease,
  onIncrease,
  onAddToCart,
}) {
  const canDecrease = quantity > 1
  const canIncrease = maxQuantity === null || quantity < maxQuantity

  return (
    <section className="pd-summary-strip">
      <div className="pd-summary-strip__media">
        {image ? <img src={image} alt={product.name} /> : <div className="pd-summary-strip__placeholder">img</div>}
      </div>

      <div className="pd-summary-strip__info">
        <h3 className="pd-summary-strip__name">{product.name}</h3>
        <div className="pd-summary-strip__price">
          <strong>{product.priceText ?? formatCurrency(product.price)}</strong>
          {oldPrice ? <span className="pd-summary-strip__old">{formatCurrency(oldPrice)}</span> : null}
          {discountPercentage > 0 ? <span className="pd-summary-strip__badge">-{Math.round(discountPercentage)}%</span> : null}
          {oldPrice ? <small>(Tiết kiệm {formatCurrency(Math.max(oldPrice - product.price, 0))})</small> : null}
        </div>
      </div>

      <div className="pd-summary-strip__controls">
        {colorOptions.length > 0 ? (
          <label className="pd-summary-strip__field">
            <select
              value={String(selectedColorIndex)}
              onChange={(event) => onColorChange(Number(event.target.value))}
              aria-label="Màu sắc"
            >
              {colorOptions.map((color, index) => (
                <option key={color.key ?? color.label ?? index} value={index}>
                  {color.label ?? `Màu ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {storageOptions.length > 0 ? (
          <label className="pd-summary-strip__field">
            <select
              value={String(selectedStorageIndex)}
              onChange={(event) => onStorageChange(Number(event.target.value))}
              aria-label="Dung lượng"
            >
              {storageOptions.map((storage, index) => (
                <option key={storage} value={index}>
                  {storage}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="pd-summary-strip__qty">
          <span>Số lượng:</span>
          <div className="pd-qty pd-qty--compact" aria-label="Số lượng sản phẩm">
            <button type="button" onClick={onDecrease} disabled={!canDecrease}>
              <Minus size={14} />
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={onIncrease} disabled={!canIncrease}>
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <button type="button" className="pd-summary-strip__add" onClick={onAddToCart}>
        THÊM VÀO GIỎ
      </button>
    </section>
  )
}

export function ProductBreadcrumb({ items = [] }) {
  if (!items.length) return null

  return (
    <nav className="pd-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="pd-breadcrumb__item">
            {item.to && !isLast ? (
              <Link to={item.to} className="pd-breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'pd-breadcrumb__current' : ''}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight size={14} aria-hidden="true" /> : null}
          </span>
        )
      })}
    </nav>
  )
}

export function CouponCard({ coupon }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <article className="pd-coupon">
      <div className="pd-coupon__body">
        <h3 className="pd-coupon__title">{coupon.title}</h3>
        <p className="pd-coupon__description">{coupon.description}</p>
      </div>

      <div className="pd-coupon__actions">
        <CopyCodeButton value={coupon.code} className="pd-coupon__copy" successMessage={`Đã sao chép mã ${coupon.code}`}>
          Sao chép
        </CopyCodeButton>
        <button type="button" className="pd-coupon__condition" onClick={() => setIsModalOpen(true)}>
          {coupon.condition}
        </button>
      </div>

      <CouponConditionModal coupon={coupon} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </article>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="pd-page pd-page--loading" aria-hidden="true">
      <div className="pd-page__container">
        <div className="pd-skeleton pd-skeleton__breadcrumb" />
        <section className="pd-hero">
          <div className="pd-panel pd-panel--gallery">
            <div className="pd-skeleton pd-skeleton__main-image" />
            <div className="pd-skeleton-row">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="pd-skeleton pd-skeleton__thumb" />
              ))}
            </div>
          </div>

          <div className="pd-panel pd-panel--info">
            <div className="pd-skeleton pd-skeleton__line pd-skeleton__line--sm" />
            <div className="pd-skeleton pd-skeleton__line pd-skeleton__line--lg" />
            <div className="pd-skeleton pd-skeleton__line pd-skeleton__line--md" />
            <div className="pd-skeleton pd-skeleton__line pd-skeleton__line--price" />
            <div className="pd-skeleton pd-skeleton__box" />
            <div className="pd-skeleton pd-skeleton__box pd-skeleton__box--tall" />
            <div className="pd-skeleton pd-skeleton__buttons">
              <div className="pd-skeleton pd-skeleton__button" />
              <div className="pd-skeleton pd-skeleton__button" />
            </div>
          </div>

          <div className="pd-panel pd-panel--sidebar">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="pd-skeleton pd-skeleton__coupon" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
