import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/currency'
import { useCartStore } from '../../store/useCartStore'
import { ROUTES } from '../../config/routes'

export function ProductCard({ product, compact = false }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)
  const navigate = useNavigate()

  const handleAddToCart = () => {
    setIsAdding(true)

    try {
      addToCart(product)
      toast.success(`Đã thêm ${product.name} vào giỏ`)
    } catch {
      toast.error('Không thể thêm vào giỏ. Vui lòng thử lại.')
    } finally {
      setIsAdding(false)
    }
  }

  const detailPath = ROUTES.PRODUCT_DETAIL.replace(':productId', String(product.id))
  const comparePath = `${ROUTES.COMPARE}?ids=${product.id}`
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
            <Link
              to={comparePath}
              onClick={stopCardClick}
              className="product-card__hover-action"
              aria-label={`So sánh ${product.name}`}
            >
              <BarChart3 size={16} />
            </Link>
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
          <button
            type="button"
            className="product-card__cta"
            onClick={(event) => {
              event.stopPropagation()
              handleAddToCart()
            }}
            disabled={isAdding}
            aria-label={isAdding ? 'Đang thêm vào giỏ' : 'Thêm vào giỏ'}
          >
            <Plus size={16} />
            <span className="sr-only">{isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
          </button>
        </div>

        {product.perk ?? product.label ? <p className="product-card__perk">{product.perk ?? product.label}</p> : null}
      </div>
    </article>
  )
}
