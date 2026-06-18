import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/currency'
import { useCompareStore } from '../../store/useCompareStore'
import { AddToCartButton } from './AddToCartButton'
import { AddToCartSuccessModal } from './AddToCartSuccessModal'
import { ProductQuickViewModal } from './ProductQuickViewModal'

export function ProductCard({ product, compact = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [successPayload, setSuccessPayload] = useState(null)
  const addToCompare = useCompareStore((state) => state.addToCompare)
  const navigate = useNavigate()

  const detailPath = `/products/${product.id}`
  const primaryImage = product.image ?? null
  const secondaryImage = product.secondaryImage ?? product.source?.images?.[1] ?? null
  const hasSecondaryImage = Boolean(primaryImage && secondaryImage)
  const currentImage = hasSecondaryImage && isHovered ? secondaryImage : primaryImage
  const imageStyle = hasSecondaryImage
    ? {
        transition: 'transform 180ms ease, filter 180ms ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }
    : undefined

  const handleCardClick = () => {
    navigate(detailPath)
  }

  const stopCardClick = (event) => {
    event.stopPropagation()
  }

  return (
    <>
      <article
        className={`product-card ${compact ? 'product-card--compact' : ''}`}
        role="link"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleCardClick()
          }
        }}
      >
        <div className="product-card__media">
          <div className={`product-card__art product-card__art--${product.type}`} style={{ background: '#fff' }}>
            {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}

            <div className="product-card__hover-actions" aria-label={`Tác vụ nhanh cho ${product.name}`}>
              <Link
                to={detailPath}
                onClick={stopCardClick}
                className="product-card__hover-action"
                aria-label={`Xem chi tiết ${product.name}`}
              >
                <Search size={16} />
              </Link>
              <button
                type="button"
                onClick={(event) => {
                  stopCardClick(event)
                  addToCompare(product)
                  toast.success(`Đã thêm ${product.name} vào so sánh`)
                }}
                className="product-card__hover-action"
                aria-label={`So sánh ${product.name}`}
              >
                <BarChart3 size={16} />
              </button>
            </div>

            {primaryImage ? (
              <div className="product-card__image-wrap">
                <img
                  className="product-card__image"
                  src={currentImage}
                  alt={product.name}
                  loading="lazy"
                  style={imageStyle}
                />
              </div>
            ) : (
              <div className="product-card__device">
                <div className="product-card__glow" />
                <div className="product-card__screen" />
                <div className="product-card__home-indicator" />
              </div>
            )}
          </div>
        </div>

        <div className="product-card__body">
          <h3>
            <Link to={detailPath} onClick={stopCardClick} className="product-card__title-link">
              {product.name}
            </Link>
          </h3>

          <div className="product-card__price-row">
            <span className="product-card__price">{formatCurrency(product.price)}</span>
            <AddToCartButton
              className="product-card__cta"
              icon={Plus}
              ariaLabel="Xem nhanh sản phẩm"
              onClick={(event) => {
                event.stopPropagation()
                setIsQuickViewOpen(true)
              }}
            >
              <span className="sr-only">Xem nhanh sản phẩm</span>
            </AddToCartButton>
          </div>

          {product.perk ?? product.label ? <p className="product-card__perk">{product.perk ?? product.label}</p> : null}
        </div>
      </article>

      <ProductQuickViewModal
        open={isQuickViewOpen}
        product={product}
        onClose={() => setIsQuickViewOpen(false)}
        onAddedToCart={(payload) => {
          setSuccessPayload(payload)
        }}
      />

      <AddToCartSuccessModal
        open={Boolean(successPayload)}
        item={successPayload}
        cartTotalText={successPayload?.cartTotalText ?? ''}
        cartCountText={successPayload?.cartCountText ?? ''}
        onClose={() => setSuccessPayload(null)}
      />
    </>
  )
}
